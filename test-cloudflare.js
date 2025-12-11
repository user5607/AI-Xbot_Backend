// Cloudflare Workers 环境测试
import { loginHandler } from './routes/auth';
import { hashPassword } from './utils/password';

// 模拟数据库连接
class MockDB {
  constructor() {
    this.users = [];
  }
  
  async execute(query, params) {
    console.log('模拟数据库查询:', query, params);
    
    // 模拟创建表
    if (query.includes('CREATE TABLE IF NOT EXISTS users')) {
      return { results: [] };
    }
    
    // 模拟插入数据
    if (query.includes('INSERT INTO users')) {
      const user = {
        id: this.users.length + 1,
        role: params[0],
        school: params[1],
        name: params[2],
        encrypted_pwd: params[3],
        student_id: params[4],
        teacher_id: params[5],
        child_name: params[6]
      };
      this.users.push(user);
      return { results: [{ id: user.id }] };
    }
    
    // 模拟查询用户
    if (query.includes('SELECT * FROM users WHERE role = ? AND (name = ? OR student_id = ?)')) {
      const [role, name, studentId] = params;
      const user = this.users.find(u => u.role === role && (u.name === name || u.student_id === studentId));
      return { results: user ? [user] : [] };
    }
    
    // 模拟其他查询
    return { results: [] };
  }
}

// 创建模拟请求对象
async function createMockRequest(role, username, password) {
  return {
    method: 'POST',
    url: 'http://localhost:8787/api/auth/login',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      role,
      username,
      password
    },
    env: {
      DB: new MockDB()
    }
  };
}

// 初始化测试数据
async function initTestData(mockDB) {
  const sampleUsers = [
    { role: 'student', school: '安生学校', name: '王宇', password: '123456', student_id: '202501001' },
    { role: 'teacher', school: '安生学校', name: '王宇', password: '123456', teacher_id: '001' },
    { role: 'parent', school: '安生学校', name: '王父', password: '123456', child_name: '王宇' }
  ];
  
  // 插入测试数据
  for (const user of sampleUsers) {
    user.encrypted_pwd = await hashPassword(user.password);
    await mockDB.execute(
      `INSERT INTO users 
       (role, school, name, encrypted_pwd, student_id, teacher_id, child_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.role,
        user.school,
        user.name,
        user.encrypted_pwd,
        user.student_id || null,
        user.teacher_id || null,
        user.child_name || null
      ]
    );
  }
}

// 运行测试
async function runTest() {
  console.log('开始测试登录功能...');
  
  // 创建模拟数据库
  const mockDB = new MockDB();
  
  // 初始化测试数据
  await initTestData(mockDB);
  
  // 测试学生登录
  console.log('\n测试学生登录:');
  const studentRequest = await createMockRequest('student', '202501001', '123456');
  const studentResponse = await loginHandler(studentRequest);
  const studentData = await studentResponse.json();
  console.log('学生登录结果:', studentData);
  
  // 测试教师登录
  console.log('\n测试教师登录:');
  const teacherRequest = await createMockRequest('teacher', '001', '123456');
  const teacherResponse = await loginHandler(teacherRequest);
  const teacherData = await teacherResponse.json();
  console.log('教师登录结果:', teacherData);
  
  // 测试家长登录
  console.log('\n测试家长登录:');
  const parentRequest = await createMockRequest('parent', '王父', '123456');
  const parentResponse = await loginHandler(parentRequest);
  const parentData = await parentResponse.json();
  console.log('家长登录结果:', parentData);
  
  console.log('\n测试完成');
}

runTest().catch(error => {
  console.error('测试失败:', error);
});