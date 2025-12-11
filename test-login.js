// 登录功能测试文件
import { loginHandler } from './routes/auth';

// 创建模拟请求对象
const mockRequest = {
  method: 'POST',
  url: 'http://localhost:8787/api/auth/login',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    role: 'student',
    username: '202501001',
    password: '123456'
  },
  env: {
    // 模拟数据库连接
    DB: {
      async execute(query, params) {
        console.log('模拟数据库查询:', query, params);
        
        // 模拟查询结果
        if (query.includes('SELECT * FROM users WHERE role = ? AND (name = ? OR student_id = ?)')) {
          return {
            results: [
              {
                id: 1,
                school: '安生学校',
                name: '王宇',
                encrypted_pwd: '$2a$10$7kYV3a7Bq1c8r4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h',
                role: 'student',
                student_id: '202501001',
                teacher_id: null,
                child_name: null
              }
            ]
          };
        }
        return { results: [] };
      }
    }
  }
};

// 运行测试
async function runTest() {
  try {
    console.log('开始测试登录功能...');
    const response = await loginHandler(mockRequest);
    const data = await response.json();
    console.log('测试结果:', data);
    console.log('测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

runTest();