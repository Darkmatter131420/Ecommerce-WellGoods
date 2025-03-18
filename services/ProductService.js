const Product = require('../model/ProductModel');
const User = require('../model/UserModel');

class ProductService {
  /**
   * 创建商品（自动绑定当前用户为商家）
   * @param {Object} productData - 商品数据
   * @param {Object} currentUser - 当前用户
   */
  static async createProduct(productData, currentUser) {

    
    if (productData === null || productData === undefined) {
      throw new Error('商品数据不能为空'); 
    }

    const newProduct = new Product({
      ...productData,
      merchant_id: currentUser._id // 强制绑定当前用户
    });

    return await newProduct.save();
  }

  /**
   * 更新商品信息
   * @param {Number} productId - 商品ID
   * @param {Object} updateData - 更新数据
   * @param {Object} currentUser - 当前用户
   */
  static async updateProduct(productId, updateData, currentUser) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('商品不存在');

    // 管理员或商品所有者验证
    if (currentUser.permission !== 1 && product.merchant_id.toString() !== currentUser._id.toString()) {
      throw new Error('无权限修改该商品');
    }

    return await Product.findByIdAndUpdate(
      productId,
      { ...updateData, update_time: Date.now() }, // 强制更新修改时间
      { new: true, runValidators: true }
    );
  }

  /**
   * 删除商品
   * @param {Number} productId - 商品ID
   * @param {Object} currentUser - 当前用户
   */
  static async deleteProduct(productId, currentUser) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('商品不存在');

    // 权限验证
    if (currentUser.permission !== 1 && product.merchant_id.toString() !== currentUser._id.toString()) {
      throw new Error('无权限删除该商品');
    }

    return await Product.findByIdAndDelete(productId);
  }

  /**
   * 获取商品详细信息（包含商家信息）
   * @param {Number} productId - 商品ID
   */
  static async getProductDetails(productId) {
    const product = await Product.findById(productId)
      .populate('merchant', 'name') // 只需要 name 字段
      .lean(); // 直接返回纯对象
    
    if (!product) throw new Error('商品不存在');
    
    return product;
}

  /**
   * 分页获取商品列表
   * @param {Object} currentUser - 当前用户
   * @param {Object} query - 查询参数
   * @param {number} query.page - 页码
   * @param {number} query.limit - 每页数量
   */
  static async getAllProducts(currentUser, query = {}) {
    const { page = 1, limit = 10, status } = query;
    const filter = {};

    // 普通用户只能查看自己的商品
    if (currentUser.permission !== 1) {
      filter.merchant_id = currentUser._id;
    }

    // 状态筛选
    if (status !== undefined) {
      filter.status = status;
    }

    const [results, total] = await Promise.all([
      Product.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('merchant', 'name')
        .sort({ create_time: -1 })
        .lean(),
      Product.countDocuments(filter)
    ]);

    return {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: results
    };
  }

  static async searchProducts(body) {
    const { 
      page = 1, 
      limit = 10, 
      keyword, 
      minPrice, 
      maxPrice, 
      categories,
      status,  // 新增状态字段
      community, // 新增社团字段
      ...filters 
    } = body;
    const filter = { ...filters };
  
    // 模糊搜索条件（替代文本搜索）
    if (keyword) {
      const searchRegex = new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { community: searchRegex } // 社团字段搜索
      ];
    }
  
    // 价格范围过滤（保持不变）
    if (minPrice || maxPrice) {
      filter.price = {
        $gte: parseFloat(minPrice || 0),
        $lte: parseFloat(maxPrice || Number.MAX_SAFE_INTEGER)
      };
    }
  
    // 分类筛选（优化数组查询）
    if (categories) {
      const categoryList = Array.isArray(categories) ? categories : [categories];
      filter.category = { $in: categoryList.map(c => new RegExp(c, 'i')) };
    }

    // 状态筛选
    if (status) {
      filter.status = status;
    }

    // 社团筛选
    if (community) {
      filter.community = community;
    }
  
    const [results, total] = await Promise.all([
      Product.find(filter, null)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('merchant', 'name')
        .sort({ create_time: -1 })
        .lean(),
      Product.countDocuments(filter)
    ]);
  
    return {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: results
    };
  }
}

module.exports = ProductService;