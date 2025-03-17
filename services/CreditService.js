const Credit = require('../model/CreditModel');
const bcrypt = require('../utils/Bcrypt');

class CreditService {
  /**
   * 创建银行账户
   * @param {Object} currentUser 认证用户信息
   * @param {Object} creditData 银行账户数据
   */
  static async createCredit(creditData, currentUser) {
    // 密码加密处理
    const hashedPassword = await bcrypt.encrypt(creditData.password);
    const credit = new Credit({
      ...creditData,
      user_id: currentUser._id,
      password: hashedPassword
    });
    
    try {
      await credit.save();
      return credit;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * 获取用户银行账户
   * @param {Object} currentUser 认证用户信息 
   */
  static async getByUserId(currentUser) {

    // 获取用户名下全部银行账户
    const credits = await Credit.find({ user_id: currentUser._id });
    if (!credits || credits.length === 0) {
      throw new Error('用户没有银行账户');
    }

    // 以Json格式返回
    const creditList = credits.map(credit => ({
      id: credit._id,
      balance: credit.balance,  
    }))
    return {
        code: 200,
        message: '获取银行账户成功',
        data: creditList
    };

  }

  /**
   * 更新银行账户信息
   * @param {Object} currentUser 认证用户信息
   * @param {Number} creditId 账户ID
   * @param {Object} updateData 更新数据
   */
  static async update(creditId, currentUser, updateData) {
    var credit = await Credit.findById(creditId);
        if (!credit) throw new Error('银行账户不存在');
    
    // 修复后
    if (currentUser._id.toString() !== credit.user_id.toString()) {
        throw new Error('无权修改该银行账户');
    }

    // 处理密码加密
    if (updateData.password) {
      updateData.password = await bcrypt.encrypt(updateData.password);
    }

    return await Credit.findByIdAndUpdate(
        creditId,
        { $set: updateData },
        { new: true, runValidators: true }
    );
  }

  /**
   * 删除银行账户
   * @param {Number} creditId 账户ID
   * @param {Object} currentUser 认证用户信息
   */
  static async delete(creditId, currentUser) {
    // 获取银行账户
    const credit = await Credit.findById(creditId);
    // 权限校验
    if (currentUser._id!== credit.user_id) {
      throw new Error('无权删除该银行账户');
    }
    const deleted = await Credit.findOneAndDelete({ _id: creditId });
    if (!deleted) throw new Error('银行账户不存在');
    return deleted;
  }

  /**
   * 调整账户余额
   * @param {Number} creditId 账户ID
   * @param {Number} amount 调整金额（正数为增加，负数为减少）
   */
  static async adjustBalance(pwd, creditId, amount) {
    const credit = await Credit.findById(creditId);
    if (!credit) throw new Error('银行账户不存在');

    // 验证密码
    const isMatch = await bcrypt.decrypt(pwd, credit.password);
    if (!isMatch) throw new Error('密码错误');

    credit.balance += amount;
    if (credit.balance < 0) throw new Error('余额不足');

    var is = 1;
    if (amount <= 0) {
      is = -1;
    }

    await credit.save();
    return {credit, is};
  }
}

module.exports = CreditService;