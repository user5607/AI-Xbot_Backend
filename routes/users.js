const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { hashPassword } = require('../utils/password');

// 添加用户接口
router.post('/add', async (req, res) => {
  try {
    const { role, username, password, realName, school, studentId, teacherId, childName } = req.body;
    
    // 验证必填字段
    if (!role || !username || !password || !realName) {
      return res.status(400).json({ 
        success: false, 
        message: '请填写完整的用户信息' 
      });
    }
    
    // 检查用户名是否已存在
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE role = $1 AND username = $2',
      [role, username]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: '该用户名已存在' 
      });
    }
    
    // 插入新用户
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users 
       (role, username, password, real_name, school, student_id, teacher_id, child_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [role, username, hashedPassword, realName, school, studentId, teacherId, childName]
    );
    
    res.json({
      success: true,
      message: '用户添加成功',
      userId: result.rows[0].id
    });
    
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
    
    const result = await pool.query(
      'SELECT id, role, username, real_name, school, student_id, teacher_id, child_name, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      [role]
    );
    
    res.json({
      success: true,
      users: result.rows
    });
    
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

module.exports = router;