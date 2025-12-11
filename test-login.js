// 登录功能测试脚本
const fetch = require('node-fetch');

// 测试参数
const testParams = [
  {
    role: 'student',
    username: 'test_student',
    password: 'test_password'
  },
  {
    role: 'teacher',
    username: 'test_teacher',
    password: 'test_password'
  },
  {
    role: 'parent',
    username: 'test_parent',
    password: 'test_password'
  }
];

// 测试登录功能
async function testLogin() {
  console.log('开始测试登录功能...');
  
  for (const params of testParams) {
    try {
      console.log(`\n测试 ${params.role} 登录...`);
      
      const response = await fetch('http://localhost:8787/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://aixbot.pages.dev'
        },
        body: JSON.stringify(params)
      });
      
      const result = await response.json();
      console.log(`状态码: ${response.status}`);
      console.log(`响应: ${JSON.stringify(result, null, 2)}`);
      
      if (result.success) {
        // 验证返回的用户信息是否包含所有必需字段
        const requiredFields = ['id', 'role', 'name', 'school'];
        const userInfo = result.user;
        
        console.log('\n验证用户信息字段...');
        let allFieldsPresent = true;
        
        // 检查所有必需字段
        for (const field of requiredFields) {
          if (userInfo[field] === undefined || userInfo[field] === null) {
            console.log(`❌ 缺少字段: ${field}`);
            allFieldsPresent = false;
          } else {
            console.log(`✅ 包含字段: ${field}`);
          }
        }
        
        // 检查角色特定字段
        if (params.role === 'student' && userInfo.studentId) {
          console.log(`✅ 包含学生特定字段: studentId`);
        } else if (params.role === 'teacher' && userInfo.teacherId) {
          console.log(`✅ 包含教师特定字段: teacherId`);
        } else if (params.role === 'parent' && userInfo.childName) {
          console.log(`✅ 包含家长特定字段: childName`);
        }
        
        if (allFieldsPresent) {
          console.log('\n✅ 所有必需字段验证通过');
        } else {
          console.log('\n❌ 缺少部分必需字段');
        }
      }
    } catch (error) {
      console.error(`测试失败: ${error.message}`);
    }
  }
}

// 运行测试
testLogin().catch(console.error);