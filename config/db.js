// Cloudflare D1 数据库连接配置

// 连接到数据库 - 直接返回数据库实例，避免不必要的测试查询
async function connectDB(db) {
  try {
    // Cloudflare Workers环境下，db实例直接可用，无需额外测试
    console.log('成功获取Cloudflare D1数据库实例');
    return db;
  } catch (error) {
    console.error('获取数据库实例失败:', error);
    throw error;
  }
}

// 导出数据库函数
export { connectDB };