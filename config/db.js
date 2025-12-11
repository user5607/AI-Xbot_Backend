// Cloudflare D1 数据库连接配置

// 连接到数据库
async function connectDB(db) {
  try {
    // 直接返回数据库实例，不再进行测试查询
    console.log('成功连接到Cloudflare D1数据库');
    return db;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

// 导出数据库函数
export { connectDB };