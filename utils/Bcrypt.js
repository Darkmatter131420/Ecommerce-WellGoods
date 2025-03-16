// 加密
const bcrypt = require('bcryptjs');

const Bcrypt = {
  saltRounds: 10, // 加密强度
  encrypt: async (password) => {
    const salt = await bcrypt.genSalt(Bcrypt.saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }, 
  decrypt: async (password, hash) => {
    const result = await bcrypt.compare(password, hash);
    return result; 
  }
}


module.exports = Bcrypt;