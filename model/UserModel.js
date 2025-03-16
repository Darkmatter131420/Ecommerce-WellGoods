// UserModel.js
const mongoose = require('../config/db.config.js');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
  _id: { type: Number }, // 自增ID将由插件处理
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, '密码不能为空']
  },
  permission: {
    type: Number,
    enum: {
      values: [0, 1],
      message: '权限值只能是0或1'
    },
    default: 0
  },
  name: {
    type: String,
    default: '用户'
  },
  sex: {
    type: Number,
    enum: {
      values: [0, 1],
      message: '性别值只能是0或1'
    }
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{11}$/.test(v);
      },
      message: '手机号必须为11位数字'
    }
  },
  address: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  }
});

// 添加自增插件配置
userSchema.plugin(AutoIncrement, {
  inc_field: '_id',
  id: 'User',
  start_seq: 2,
  inc_amount: 1
})

// 自定义验证（可选扩展）
userSchema.pre('save', function(next) {
  // 可以添加其他自定义验证逻辑
  next();
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;