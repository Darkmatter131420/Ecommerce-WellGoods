// ProductController.js
const ProductService = require('../services/ProductService');

class ProductController {
  /**
   * 创建商品
   */
  static async create(req, res) {
    try {
      const product = await ProductService.createProduct(req.body, req.authUser);
      res.status(201).json({
        code: 201,
        data: product,
        message: '商品创建成功'
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message
      });
    }
  }

  /**
   * 更新商品
   */
  static async update(req, res) {
    try {
      const product = await ProductService.updateProduct(
        req.params.id,
        req.body,
        req.authUser
      );
      res.json({
        code: 200,
        data: product,
        message: '商品更新成功'
      });
    } catch (error) {
      res.status(403).json({
        code: 403,
        message: error.message
      });
    }
  }

  /**
   * 删除商品
   */
  static async delete(req, res) {
    try {
      await ProductService.deleteProduct(req.params.id, req.authUser);
      res.json({
        code: 200,
        message: '商品删除成功'
      });
    } catch (error) {
      res.status(403).json({
        code: 403,
        message: error.message
      });
    }
  }

  /**
   * 获取商品详情
   */
  static async getDetails(req, res) {
    try {
      console.log("req.params.id: ", req.params.id);
      const product = await ProductService.getProductDetails(req.params.id);
      res.json({
        code: 200,
        data: product
      });
    } catch (error) {
      res.status(404).json({
        code: 404,
        message: error.message
      });
    }
  }

  /**
   * 分页获取商品列表
   */
  static async list(req, res) {
    try {
      const result = await ProductService.getAllProducts(req.authUser, req.query);
      res.json({
        code: 200,
        ...result
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message
      });
    }
  }

  /**
   * 条件搜索商品
   */
  /**
   * 搜索商品（使用请求体）
   */
  static async search(req, res) {
    try {
      // 添加参数验证
      if (!req.body) {
        return res.status(400).json({
          code: 400,
          message: '请求体不能为空'
        });
      }

      const result = await ProductService.searchProducts(req.body);
      res.json({
        code: 200,
        ...result
      });
    } catch (error) {
      res.status(400).json({
        code: 400,
        message: error.message
      });
    }
  }
}

module.exports = ProductController;