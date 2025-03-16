// UserService.js
const bcrypt = require('../utils/Bcrypt');
const UserModel = require('../model/UserModel');

class UserService {
  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   */
  static async register(userData) {

    // 检查用户名唯一性
    const existUser = await UserModel.findOne({ username: userData.username });
    if (existUser) throw new Error('用户名已存在');
    console.log(userData)

    // 密码加密处理
    const hashedPassword = await bcrypt.encrypt(userData.password);
    
    return await UserModel.create({ 
      ...userData,
      password: hashedPassword 
    });
  }

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   */
  static async login(username, password) {
    const user = await UserModel.findOne({ username });
    if (!user) throw new Error('用户不存在');
    
    const isMatch = await bcrypt.decrypt(password, user.password);
    if (!isMatch) throw new Error('密码错误');
    
    return user;
  }

  /**
   * 修改用户信息
   * @param {number} userId - 目标用户ID
   * @param {Object} updateData - 更新数据
   * @param {Object} currentUser - 当前操作者
   */
  static async updateUser(userId, updateData, currentUser) {
    // 禁止修改字段检测
    if (updateData._id || updateData.username) {
      throw new Error('禁止修改用户ID或用户名');
    }

    // 权限修改验证
    if (updateData.permission !== undefined && currentUser.permission !== 1) {
      throw new Error('需要管理员权限修改权限等级');
    }
    
    // 普通用户只能修改自己
    if (currentUser.permission !== 1 && currentUser._id.toString() !== userId.toString()) {
      throw new Error('无权修改其他用户信息');
    }

    // 密码单独处理
    if (updateData.password) {
      updateData.password = await bcrypt.encrypt(updateData.password);
    }

    return await UserModel.findByIdAndUpdate(userId, updateData, { 
      new: true,
      runValidators: true 
    });
  }

  /**
   * 添加用户（管理员专属）
   * @param {Object} userData - 用户数据
   * @param {Object} currentUser - 当前操作者
   */
  static async addUser(userData, currentUser) {
    if (currentUser.permission !== 1) throw new Error('需要管理员权限');
    
    if (userData.password) {
      userData.password = await bcrypt.encrypt(userData.password);
    }
    
    return await UserModel.create(userData);
  }

  /**
   * 删除用户（管理员专属）
   * @param {number} userId - 用户ID
   * @param {Object} currentUser - 当前操作者
   */
  static async deleteUser(userId, currentUser) {
    if (currentUser.permission !== 1) throw new Error('需要管理员权限');
    return await UserModel.findByIdAndDelete(userId);
  }

  /**
   * 分页查询所有用户（管理员专属）
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @param {Object} currentUser - 当前操作者
   */
  static async getAllUsers(page = 1, limit = 10, currentUser) {
    if (currentUser.permission !== 1) throw new Error('需要管理员权限');
    
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      UserModel.find().skip(skip).limit(limit).select('-password'),
      UserModel.countDocuments()
    ]);
    
    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * 查询用户详细信息
   * @param {number} userId - 用户ID
   */
  static async getUserDetails(userId) {
    return await UserModel.findById(userId).select('-password');
  }
}

module.exports = UserService;