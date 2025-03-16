// productRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true});
const ProductController = require('../controller/ProductController');
const { authMiddleware, adminMiddleware } = require('./userMiddleWare');

// 公共接口
router.get('/:id', ProductController.getDetails);
router.post('/search', ProductController.search);

// 需要登录验证的接口
router.use(authMiddleware);
router.route('/')
  .post(ProductController.create)
  .get(ProductController.list);

router.route('/:id')
  .put(ProductController.update)
  .delete(ProductController.delete);


// 管理员
router.use(adminMiddleware);


module.exports = router;