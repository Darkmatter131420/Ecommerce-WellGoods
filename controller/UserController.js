// UserController.js
const UserService = require('../services/UserService');
const Token = require('../utils/Token');
const { validationResult } = require('express-validator');

class UserController {
  /**
   * 用户注册
   */
  static async register(req, res) {
    try {
      // 参数验证
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      console.log(req.body)
      const user = await UserService.register(req.body);
      res.status(200).json({
        code: 200,
        data: user,
        message: '注册成功'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message
      });
    }
  }

  /**
   * 用户登录（返回Token）
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log(req.body)
      const user = await UserService.login(username, password);
      
      // 生成有效期为12小时的Token
      const token = Token.encrypt(
        { id: user._id, permission: user.permission },
        '12h'
      );

      res.json({
        code: 200,
        data: {
          user: await UserService.getUserDetails(user._id),
          token
        },
        message: '登录成功'
      });
    } catch (error) {
      res.status(401).json({
        code: 401,
        message: error.message
      });
    }
  }

  /**
   * 修改用户信息
   */
  static async updateUser(req, res) {
    try {
      const user = await UserService.updateUser(
        req.params.id,
        req.body,
        req.authUser // 从中间件获取的当前用户
      );
      
      res.json({
        code: 200,
        data: user,
        message: '修改成功'
      });
    } catch (error) {
      res.status(403).json({
        code: 403,
        message: error.message
      });
    }
  }

  /**
   * 添加用户（管理员）
   */
  static async addUser(req, res) {
    try {
      const user = await UserService.addUser(req.body, req.authUser);
      res.status(201).json({
        code: 201,
        data: user,
        message: '用户添加成功'
      });
    } catch (error) {
      res.status(403).json({
        code: 403,
        message: error.message
      });
    }
  }

  /**
   * 删除用户（管理员）
   */
  static async deleteUser(req, res) {
    try {
      await UserService.deleteUser(req.params.id, req.authUser);
      res.json({
        code: 200,
        message: '用户删除成功'
      });
    } catch (error) {
      res.status(403).json({
        code: 403,
        message: error.message
      });
    }
  }

  /**
   * 分页获取用户列表（管理员）
   */
  static async getAllUsers(req, res) {
    try {
      const result = await UserService.getAllUsers(
        parseInt(req.query.page) || 1,
        parseInt(req.query.limit) || 10,
        req.authUser
      );
      
      res.json({
        code: 200,
        data: result
      });
    } catch (error) {
      res.status(403).json({
        code: 403,
        message: error.message
      });
    }
  }

  /**
   * 获取用户详细信息
   */
  static async getUserDetails(req, res) {
    try {
      const user = await UserService.getUserDetails(req.params.id);
      res.json({
        code: 200,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }
  }
}

module.exports = UserController;