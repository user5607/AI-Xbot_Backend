const { Pool } = require('pg');
require('dotenv').config();

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 连接到数据库
async function connectDB() {
  try {
    await pool.connect();
    console.log('成功连接到PostgreSQL数据库');
    return pool;
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

// 关闭数据库连接
async function closeDB() {
  try {
    await pool.end();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
  }
}

module.exports = { connectDB, closeDB, pool };