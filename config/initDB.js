// Cloudflare D1 数据库初始化配置

// 初始化表结构 - 只保留必要的表创建功能，去掉示例数据插入
async function initTables(db) {
  try {
    // 简化版CREATE TABLE语句，确保兼容
    await db.execute(
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, school TEXT, name TEXT, encrypted_pwd TEXT, role TEXT, student_id TEXT, teacher_id TEXT, child_name TEXT)"
    );
    
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