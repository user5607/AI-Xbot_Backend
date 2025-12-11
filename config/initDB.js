// Cloudflare D1 数据库初始化配置

// 初始化表结构 - 只保留必要的表创建功能，去掉示例数据插入
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
    return true;
  } catch (error) {
    console.error('初始化数据库失败:', error);
    console.error('错误详情:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// 导出初始化函数
export { initTables };