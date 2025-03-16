const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const User = require('./UserModel'); // 导入用户模型

const productSchema = new mongoose.Schema({
  _id: { type: Number }, // 自增ID
  name: {
    type: String,
    required: [true, '商品名称不能为空'],
    trim: true,
    maxlength: [255, '商品名称最长255个字符']
  },
  description: {
    type: String,
    default: null,
    trim: true
  },
  price: {
    type: mongoose.Types.Decimal128,
    required: [true, '商品价格不能为空'],
    min: [0, '价格不能小于0'],
    get: value => parseFloat(value.toString()) // 转换为数字
  },
  category: {
    type: [{
      type: String,
      trim: true,
      lowercase: true // 自动转为小写
    }],
    required: [true, '至少需要一个商品分类'],
    validate: {
      validator: v => v.length > 0,
      message: '至少需要一个商品分类'
    }
  },
  merchant_id: {
    type: Number,
    required: [true, '商家ID不能为空'],
    ref: 'User', // 关联用户模型
    validate: {
      validator: async function(merchantId) {
        const user = await User.findById(merchantId).catch(() => null);
        return !!user;
      },
      message: '商家ID {VALUE} 不存在'
    }
  },
  picture: {
    type: [{
        type: String,
        trim: true,
      }],
    default: null,
    trim: true
  },
  create_time: {
    type: Date,
    default: Date.now
  },
  update_time: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { 
    createdAt: 'create_time',
    updatedAt: 'update_time' 
  },
  toJSON: { 
    virtuals: true,
    getters: true // 序列化时包含getter
  }
});

// 配置自增插件
productSchema.plugin(AutoIncrement, {
    inc_field: '_id',
    id: 'Product',
    start_seq: 2,
    inc_amount: 1
});

// 更新时自动修改时间戳
productSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.update_time = Date.now();
  }
  next();
});

// 添加虚拟字段（可选）
productSchema.virtual('merchant', {
  ref: 'User',
  localField: 'merchant_id',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name'}
});

module.exports = mongoose.model('Product', productSchema, 'products');