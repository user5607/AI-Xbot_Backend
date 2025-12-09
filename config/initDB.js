const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
// 引入hashPassword工具函数
const { hashPassword } = require('../utils/password');

// 数据库文件路径
const dbPath = path.resolve(__dirname, '../../数据库/users.db');

// 确保数据库目录存在
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('创建数据库目录:', dbDir);
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('无法创建数据库:', err.message);
    return;
  }
  console.log('成功创建/连接到SQLite数据库');
  initTables();
});

// 初始化表结构
function initTables() {
  // 创建users表
  db.run(`
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
  `, (err) => {
    if (err) {
      console.error('创建users表失败:', err.message);
      return;
    }
    console.log('成功创建users表');
    
    // 异步插入示例数据
    insertSampleData();
  });
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
    
    // 使用事务插入数据
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO users 
        (role, username, password, real_name, school, student_id, teacher_id, parent_id, child_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      sampleUsers.forEach(user => {
        stmt.run([
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
      });
      
      stmt.finalize();
      
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('插入数据失败:', err.message);
          db.run('ROLLBACK');
        } else {
          console.log('示例数据插入成功');
          // 查询插入的数据以验证
          db.all('SELECT id, role, username, real_name, school FROM users', (err, rows) => {
            if (err) {
              console.error('查询数据失败:', err.message);
            } else {
              console.log('数据库中的用户信息:');
              rows.forEach(row => {
                console.log(row);
              });
            }
            // 关闭数据库连接
            db.close();
            console.log('数据库初始化完成');
          });
        }
      });
    });
  } catch (error) {
    console.error('初始化数据库失败:', error);
    db.run('ROLLBACK');
    db.close();
  }
}