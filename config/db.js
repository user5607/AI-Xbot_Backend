// Cloudflare D1 数据库连接配置

// 连接到数据库
async function connectDB(db) {
  try {
    // 测试数据库连接
    await db.execute('SELECT 1');
    console.log('成功连接到Cloudflare D1数据库');
    return db;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

// 导出数据库函数
export { connectDB };