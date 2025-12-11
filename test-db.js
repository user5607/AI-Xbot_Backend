// 本地测试数据库连接和初始化
import { connectDB } from './config/db.js';
import { initTables } from './config/initDB.js';

// 模拟Cloudflare D1数据库环境
class MockDB {
  constructor() {
    this.tables = {};
    this.data = {};
  }

  async execute(sql, params = []) {
    console.log('MockDB.execute:', sql, params);
    
    // 模拟CREATE TABLE
    if (sql.startsWith('CREATE TABLE')) {
      return { success: true, results: [] };
    }
    
    // 模拟SELECT COUNT
    if (sql.startsWith('SELECT COUNT(*)')) {
      return { success: true, results: [{ count: 0 }] };
    }
    
    // 模拟SELECT 1
    if (sql === 'SELECT 1') {
      return { success: true, results: [{ 1: 1 }] };
    }
    
    // 模拟INSERT
    if (sql.startsWith('INSERT INTO')) {
      return { success: true, results: [] };
    }
    
    return { success: true, results: [] };
  }
}

// 运行测试
async function runTest() {
  try {
    console.log('开始测试数据库连接和初始化...');
    
    // 创建模拟数据库
    const mockDB = new MockDB();
    
    // 测试连接
    console.log('测试连接...');
    await connectDB(mockDB);
    
    // 测试初始化
    console.log('测试初始化...');
    await initTables(mockDB);
    
    console.log('测试成功！数据库连接和初始化过程没有错误。');
  } catch (error) {
    console.error('测试失败:', error);
    console.error('错误堆栈:', error.stack);
  }
}

// 执行测试
runTest();