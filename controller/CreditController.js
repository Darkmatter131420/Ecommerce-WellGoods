const CreditService = require('../services/CreditService');

class CreditController {
  /**
   * 创建银行账户
   * POST /api/credits
   */
  static async create(req, res) {
    try {
      const credit = await CreditService.createCredit(req.body, req.authUser);
      res.status(200).json({
        code: 201,
        message: '账户创建成功',
        data: {
          id: credit._id,
          balance: credit.balance
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message
      });
    }
  }

  /**
   * 获取当前用户所有账户
   * GET /api/credits
   */
  static async getAll(req, res) {
    try {
      const result = await CreditService.getByUserId(req.authUser);
      res.status(result.code || 200).json(result);
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取账户失败'
      });
    }
  }

  /**
   * 更新指定账户
   * PATCH /api/credits/:id
   */
  static async update(req, res) {
    try {
      const updated = await CreditService.update(
        req.params.id,
        req.authUser,
        req.body
      );
      
      res.json({
        code: 200,
        message: '账户更新成功',
        data: {
          id: updated._id,
          balance: updated.balance
        }
      });
    } catch (error) {
      const statusCode = error.message.includes('无权') ? 403 : 400;
      res.status(statusCode).json({
        code: statusCode,
        message: error.message
      });
    }
  }

  /**
   * 删除指定账户
   * DELETE /api/credits/:id
   */
  static async delete(req, res) {
    try {
      await CreditService.delete(req.params.id, req.authUser);
      res.status(200).json({
        code: 200,
        message: '账户删除成功'
      });
    } catch (error) {
      const statusCode = error.message.includes('无权') ? 403 : 400;
      res.status(statusCode).json({
        code: statusCode,
        message: error.message
      });
    }
  }

  /**
   * 调整账户余额（管理员权限）
   * POST /api/credits/:id/adjust-balance
   */
  static async adjustBalance(req, res) {
    try {
      const {credit, is} = await CreditService.adjustBalance(
        req.body.password,
        req.params.id,
        req.body.amount
      );
      
      res.json({
        code: 200,
        message: is > 0 ? '充值成功！' : '支付成功！',
        data: {
          id: credit._id,
          newBalance: credit.balance
        }
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message
      });
    }
  }
}

// 路由配置示例
module.exports = CreditController;