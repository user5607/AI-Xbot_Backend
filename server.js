require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB, closeDB } = require('./config/db');
const { initTables } = require('./config/initDB');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
const corsOptions = {
  origin: 'https://aixbot-gyzc.netlify.app',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 启动服务器
app.listen(PORT, async () => {
  try {
    await connectDB();
    await initTables(); // 初始化数据库表
    console.log(`服务器运行在 http://localhost:${PORT}`);
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
});

// 优雅关闭
process.on('SIGINT', async () => {
  await closeDB();
  console.log('服务器已关闭');
  process.exit(0);
});