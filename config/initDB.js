// Cloudflare D1 数据库初始化配置
import { hashPassword } from '../utils/password.js';


// 初始化表结构
async function initTables(db) {
  try {
    // 创建users表 - 使用SQLite语法，在原有结构基础上添加必要字段
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school TEXT,
        name TEXT,
        encrypted_pwd TEXT,
        role TEXT, -- 添加角色字段：student/teacher/parent
        student_id TEXT, -- 添加学号字段
        teacher_id TEXT, -- 添加工号字段
        child_name TEXT -- 添加孩子姓名字段（家长用户使用）
      )
    `);
    
    console.log('成功创建users表');
    
    // 异步插入示例数据
    await insertSampleData(db);
    return true;
  } catch (error) {
    console.error('初始化数据库失败:', error);
    throw error; // 重新抛出错误，让上层能够捕获
  }
}

// 异步插入示例数据
async function insertSampleData(db) {
  // 根据需求插入示例数据
  const sampleUsers = [
    // 学生用户 - 按照要求修改为安生学校，王宇，学号202501001
    { role: 'student', school: '安生学校', name: '王宇', password: '123456', student_id: '202501001' },
    // 教师用户 - 按照要求修改为王宇，工号001
    { role: 'teacher', school: '安生学校', name: '王宇', password: '123456', teacher_id: '001' },
    // 家长用户 - 按照要求修改为孩子姓名王宇，账号202501001
    { role: 'parent', school: '安生学校', name: '王父', password: '123456', child_name: '王宇' }
  ];

  try {
    // 先检查是否已有数据，避免重复插入
    const existingData = await db.execute('SELECT COUNT(*) AS count FROM users WHERE role = ? AND student_id = ?', ['student', '202501001']);
    if (existingData.results[0].count > 0) {
      console.log('示例数据已存在，跳过插入');
      return;
    }

    // 先对所有用户密码进行哈希处理
    for (const user of sampleUsers) {
      user.encrypted_pwd = await hashPassword(user.password);
      console.log(`已哈希用户密码: ${user.name}`);
    }
    
    // 插入数据 - 使用SQLite语法
    for (const user of sampleUsers) {
      await db.execute(`
        INSERT INTO users 
        (role, school, name, encrypted_pwd, student_id, teacher_id, child_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        user.role,
        user.school,
        user.name,
        user.encrypted_pwd,
        user.student_id || null,
        user.teacher_id || null,
        user.child_name || null
      ]);
    }
    
    console.log('成功插入示例数据');
  } catch (error) {
    console.error('插入示例数据失败:', error);
    throw error; // 重新抛出错误，让上层能够捕获
  }
}

// 导出初始化函数
export { initTables };