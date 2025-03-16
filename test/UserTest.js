const UserController = require('../controller/UserController'); // 导入待测函数
const register = UserController.register; // 提取待测函数


describe('register 函数测试', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('参数验证失败', async () => {
    // 模拟参数验证失败的情况
    const errors = { errors: ['参数错误'] };

    await register({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: errors.errors });
  });

  test('注册成功', async () => {
    // 模拟注册成功的情况
    const user = {
         name: 'test',
         username: 'test',
         password: 'test',
         sex: 0,
         phone: '12345678901',
         };
    jest.spyOn(UserService, 'register').mockResolvedValueOnce(user);

    await register({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      code: 201,
      data: user,
      message: '注册成功,请登录'
    });
  });

  test('注册失败', async () => {
    // 模拟注册失败的情况
    const error = new Error('注册失败');
    jest.spyOn(UserService, 'egister').mockRejectedValueOnce(error);

    await register({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      code: 400,
      message: error.message
    });
  });
});
