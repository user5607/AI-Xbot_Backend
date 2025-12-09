const { Pool } = require('pg');
require('dotenv').config();
// 引入hashPassword工具函数
const { hashPassword } = require('../utils/password');

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 初始化表结构
async function initTables() {
  try {
    // 创建users表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        role TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        real_name TEXT,
        school TEXT,
        student_id TEXT,
        teacher_id TEXT,
        parent_id TEXT,
        child_name TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role, username)
      )
    `);
    
    console.log('成功创建users表');
    
    // 异步插入示例数据
    await insertSampleData();
  } catch (error) {
    console.error('初始化数据库失败:', error);
  }
}

// 异步插入示例数据
async function insertSampleData() {
  const sampleUsers = [
    // 学生用户 - 按照要求修改为安生学校，王宇，学号202501001
    { role: 'student', username: 'student1', password: '123456', real_name: '王宇', school: '安生学校', student_id: '202501001' },
    // 教师用户 - 按照要求修改为王宇，工号001
    { role: 'teacher', username: '001', password: '123456', real_name: '王宇', school: '安生学校', teacher_id: '001' },
    // 家长用户 - 按照要求修改为孩子姓名王宇，账号202501001
    { role: 'parent', username: '202501001', password: '123456', real_name: '王父', parent_id: 'P001', child_name: '王宇' }
  ];

  try {
    // 先对所有用户密码进行哈希处理
    for (const user of sampleUsers) {
      user.password = await hashPassword(user.password);
      console.log(`已哈希用户密码: ${user.username}`);
    }
    
    // 插入数据
    for (const user of sampleUsers) {
      await pool.query(`
        INSERT INTO users 
        (role, username, password, real_name, school, student_id, teacher_id, parent_id, child_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (role, username) DO NOTHING
      `, [
        user.role,
        user.username,
        user.password,
        user.real_name,
        user.school,
        user.student_id || null,
        user.teacher_id || null,
        user.parent_id || null,
        user.child_name || null
      ]);
    }
    
    console.log('成功插入示例数据');
  } catch (error) {
    console.error('插入示例数据失败:', error);
  }
}

// 导出初始化函数
module.exports = { initTables };

// 如果直接运行该文件，则初始化数据库
if (require.main === module) {
  initTables().then(() => {
    console.log('数据库初始化完成');
    pool.end();
  }).catch(err => {
    console.error('数据库初始化失败:', err);
    pool.end();
  });
}