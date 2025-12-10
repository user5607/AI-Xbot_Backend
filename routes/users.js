// Cloudflare Workers 兼容版本
import { hashPassword } from '../utils/password';

// 添加用户接口
export async function addUserHandler(req, res) {
  try {
    const { role, username, password, realName, school, studentId, teacherId, childName } = req.body;
    const db = req.env.DB;
    
    // 验证必填字段
    if (!role || !username || !password || !realName) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '请填写完整的用户信息' 
      }), { status: 400 });
    }
    
    // 检查用户名是否已存在 - 根据角色使用不同的检查条件
    let checkQuery = '';
    let checkParams = [];
    
    if (role === 'student') {
      checkQuery = 'SELECT * FROM user WHERE role = ? AND (name = ? OR student_id = ?)';
      checkParams = [role, username, username];
    } else if (role === 'teacher') {
      checkQuery = 'SELECT * FROM user WHERE role = ? AND (name = ? OR teacher_id = ?)';
      checkParams = [role, username, username];
    } else {
      checkQuery = 'SELECT * FROM user WHERE role = ? AND name = ?';
      checkParams = [role, username];
    }
    
    const checkResult = await db.execute(checkQuery, checkParams);
    
    if (checkResult.results.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '该用户名已存在' 
      }), { status: 400 });
    }
    
    // 插入新用户 - 使用SQLite语法
    const hashedPassword = await hashPassword(password);
    const result = await db.execute(
      `INSERT INTO user 
       (role, name, encrypted_pwd, school, student_id, teacher_id, child_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [role, realName, hashedPassword, school, studentId, teacherId, childName]
    );
    
    return new Response(JSON.stringify({
      success: true,
      message: '用户添加成功',
      userId: result.results[0].id
    }), { status: 200 });
    
  } catch (error) {
    console.error('添加用户错误:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '服务器错误' 
    }), { status: 500 });
  }
}

// 获取用户列表接口
export async function getUserListHandler(req, res) {
  try {
    const url = new URL(req.url);
    const role = url.pathname.split('/').pop(); // 获取最后一个路径参数
    const db = req.env.DB;
    
    let query = '';
    let params = [];
    
    if (role && role !== 'all') {
      // 根据角色获取用户
      query = 'SELECT id, role, name, school, student_id, teacher_id, child_name FROM user WHERE role = ? ORDER BY id DESC';
      params = [role];
    } else {
      // 获取所有用户
      query = 'SELECT id, role, name, school, student_id, teacher_id, child_name FROM user ORDER BY id DESC';
    }
    
    const result = await db.execute(query, params);
    
    return new Response(JSON.stringify({
      success: true,
      users: result.results
    }), { status: 200 });
    
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '服务器错误' 
    }), { status: 500 });
  }
}

// 路由处理函数
export default async function usersRoutes(req, res) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = req.method;
  
  // 添加用户接口
  if (pathname === '/api/users/add' && method === 'POST') {
    return addUserHandler(req, res);
  }
  
  // 获取用户列表接口
  if (pathname.startsWith('/api/users/list/') && method === 'GET') {
    return getUserListHandler(req, res);
  }
  
  return null;
}