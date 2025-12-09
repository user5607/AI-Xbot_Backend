const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');

// 创建Express应用
const app = express();
const PORT = 3000;

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体

// 路由配置
app.use('/api/auth', authRoutes);

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await connectDB();
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();