// 连接数据库
const mongoose = require("mongoose")

mongoose.connect('mongodb://localhost:27017/ecommerce')
    .then(()=>{
        console.log('连接成功')
    })
    .catch((err)=>{
        console.log('连接失败', err)
    })
    
module.exports = mongoose;
