const express = require('express');
const { authMiddleware, adminMiddleware } = require('./userMiddleWare');
const UserController = require('../controller/UserController');

const router = express.Router();

// 需要认证的接口
router.use(authMiddleware).route('/:id')
  .get(UserController.getUserDetails)
  .put(UserController.updateUser);

// 管理员专属接口
router.use(adminMiddleware).route('/')
  .post(UserController.addUser)
  .get(UserController.getAllUsers);

router.use(adminMiddleware).delete('/:id', UserController.deleteUser);

module.exports = router;