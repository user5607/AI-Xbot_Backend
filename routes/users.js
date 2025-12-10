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
    
    // 检查用户名是否已存在 - 使用SQLite语法
    const checkResult = await db.execute(
      'SELECT * FROM users WHERE role = ? AND username = ?',
      [role, username]
    );
    
    if (checkResult.results.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '该用户名已存在' 
      }), { status: 400 });
    }
    
    // 插入新用户 - 使用SQLite语法
    const hashedPassword = await hashPassword(password);
    const result = await db.execute(
      `INSERT INTO users 
       (role, username, password, real_name, school, student_id, teacher_id, child_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [role, username, hashedPassword, realName, school, studentId, teacherId, childName]
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
    
    const result = await db.execute(
      'SELECT id, role, username, real_name, school, student_id, teacher_id, child_name, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      [role]
    );
    
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