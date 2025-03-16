const Token = require('../utils/Token');
const UserService = require('../services/UserService');

// 身份验证中间件
exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('缺少授权凭证');

    const token = authHeader.split(' ')[1];
    const decoded = Token.decrypt(token);

    if (!decoded.token) throw new Error('无效的Token');
    req.authUser = await UserService.getUserDetails(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      message: error.message
    });
  }
};

// 管理员权限验证中间件
exports.adminMiddleware = (req, res, next) => {
  if (req.authUser?.permission !== 1) {
    return res.status(403).json({
      code: 403,
      message: '需要管理员权限'
    });
  }
  next();
};