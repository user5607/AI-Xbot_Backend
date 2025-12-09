const express = require('express');
const router = express.Router();
const { connectDB } = require('../config/db');
const { hashPassword } = require('../utils/password');

// 添加用户接口
router.post('/add', async (req, res) => {
  try {
    const db = await connectDB();
    const { role, username, password, realName, school, studentId, teacherId, childName } = req.body;
    
    // 验证必填字段
    if (!role || !username || !password || !realName) {
      return res.status(400).json({ 
        success: false, 
        message: '请填写完整的用户信息' 
      });
    }
    
    // 检查用户名是否已存在
    db.get(
      'SELECT * FROM users WHERE role = ? AND username = ?',
      [role, username],
      (err, existingUser) => {
        if (err) {
          console.error('数据库查询错误:', err);
          return res.status(500).json({ 
            success: false, 
            message: '服务器错误' 
          });
        }
        
        if (existingUser) {
          return res.status(400).json({ 
            success: false, 
            message: '该用户名已存在' 
          });
        }
        
        // 插入新用户
        db.run(
          `INSERT INTO users 
           (role, username, password, real_name, school, student_id, teacher_id, child_name) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [role, username, password, realName, school, studentId, teacherId, childName],
          function(err) {
            if (err) {
              console.error('插入用户错误:', err);
              return res.status(500).json({ 
                success: false, 
                message: '服务器错误' 
              });
            }
            
            res.json({
              success: true,
              message: '用户添加成功',
              userId: this.lastID
            });
          }
        );
      }
    );
    
  } catch (error) {
    console.error('添加用户错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

// 获取用户列表接口
router.get('/list/:role', async (req, res) => {
  try {
    const role = req.params.role;
    const db = await connectDB();
    
    db.all(
      'SELECT id, role, username, real_name, school, student_id, teacher_id, child_name, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      [role],
      (err, users) => {
        if (err) {
          console.error('查询用户列表错误:', err);
          return res.status(500).json({ 
            success: false, 
            message: '服务器错误' 
          });
        }
        
        res.json({
          success: true,
          users: users
        });
      }
    );
    
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

module.exports = router;