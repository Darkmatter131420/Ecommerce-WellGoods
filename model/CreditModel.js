const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const User = require('./UserModel'); // 导入用户模型

const creditSchema = new mongoose.Schema({
  _id: { type: Number }, // 自增ID
  user_id: {
    type: Number,
    required: [true, '用户ID不能为空'],
    ref: 'User', // 关联用户模型 
    validate: {
      validator: async function(userId) {
        const user = await User.findById(userId).catch(() => null);
        return !!user;
      }, 
      message: '用户ID {VALUE} 不存在'
    }
  },
  "password": {
    type: String,
    required: [true, '密码不能为空']
  },
  "balance": {
    type: Number,
    default: 0,
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: '余额不能小于0' 
    } 
  }
})

// 添加自增插件配置
creditSchema.plugin(AutoIncrement, {
  inc_field: '_id',
  id: 'Credit',
  start_seq: 2, 
  inc_amount: 1 
})

// 添加虚拟字段
creditSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id', 
})
const Credit = mongoose.model('Credit', creditSchema, 'credits');

module.exports = Credit;