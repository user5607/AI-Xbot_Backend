// Cloudflare D1 数据库初始化配置
import { hashPassword } from '../utils/password';

// 初始化表结构
async function initTables(db) {
  try {
    // 创建users表 - 使用SQLite语法
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    await insertSampleData(db);
  } catch (error) {
    console.error('初始化数据库失败:', error);
  }
}

// 异步插入示例数据
async function insertSampleData(db) {
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
    
    // 插入数据 - 使用SQLite语法
    for (const user of sampleUsers) {
      await db.execute(`
        INSERT INTO users 
        (role, username, password, real_name, school, student_id, teacher_id, parent_id, child_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
export { initTables };