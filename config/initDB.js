// Cloudflare D1 数据库初始化配置

// 初始化表结构 - 只保留必要的表创建功能
async function initTables(db) {
  try {
    // 创建users表 - 使用SQLite语法，确保包含所有必需字段
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school TEXT NOT NULL,
        name TEXT NOT NULL,
        encrypted_pwd TEXT NOT NULL,
        role TEXT NOT NULL, -- 角色字段：student/teacher/parent
        student TEXT, -- 学号字段
        teacher_id TEXT, -- 工号字段
        child_name TEXT -- 孩子姓名字段（家长用户使用）
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