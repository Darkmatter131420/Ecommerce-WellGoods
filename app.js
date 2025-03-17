var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productRoutes = require('./routes/products');
var minioRoutes = require('./routes/minio.js')

const UserController = require('./controller/UserController');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use("/user", usersRouter);
app.use("/product", productRoutes);
app.use(minioRoutes)

// 注册登录
app.post('/register', UserController.register);
app.post('/login', UserController.login);

// 统一错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  });
module.exports = app;
