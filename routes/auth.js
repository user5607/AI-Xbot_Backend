const express = require('express');
const router = express.Router();
const { connectDB } = require('../config/db');
// 引入密码验证工具
const { verifyPassword } = require('../utils/password');

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { role, username, password } = req.body;
    
    // 添加调试日志
    console.log('收到登录请求:', { role, username });
    
    if (!role || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '请填写完整的登录信息' 
      });
    }
    
    const db = await connectDB();
    
    // 查询用户信息 - 学生特殊处理，允许通过学号或用户名登录
    let query = '';
    let params = [];
    
    if (role === 'student') {
      // 对于学生，可以通过username或student_id查找
      query = 'SELECT * FROM users WHERE role = ? AND (username = ? OR student_id = ?) AND is_active = 1';
      params = [role, username, username];
    } else {
      // 其他角色继续使用原来的查询
      query = 'SELECT * FROM users WHERE role = ? AND username = ? AND is_active = 1';
      params = [role, username];
    }
    
    // 执行查询
    db.get(query, params, async (err, user) => {
      if (err) {
        console.error('数据库查询错误:', err);
        return res.status(500).json({ 
          success: false, 
          message: '服务器错误' 
        });
      }
      
      if (!user) {
        console.log('用户不存在或未激活');
        return res.status(401).json({ 
          success: false, 
          message: '用户名或密码错误' 
        });
      }
      
      // 验证密码（使用bcryptjs进行密码验证）
      console.log('找到用户，开始验证密码...');
      try {
        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ 
            success: false, 
            message: '用户名或密码错误' 
          });
        }
      } catch (verifyError) {
        console.error('密码验证错误:', verifyError);
        return res.status(500).json({ 
          success: false, 
          message: '服务器错误' 
        });
      }
      
      // 返回用户信息（不包含密码）
      const userInfo = {
        id: user.id,
        role: user.role,
        username: user.username,
        realName: user.real_name,
        school: user.school,
        studentId: user.student_id,
        teacherId: user.teacher_id,
        childName: user.child_name
      };
      
      console.log('登录成功，用户信息:', userInfo);
      
      // 简化版：实际应该生成JWT令牌
      res.json({
        success: true,
        message: '登录成功',
        user: userInfo
      });
    });
    
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

module.exports = router;