// Cloudflare Workers 兼容版本
import { verifyPassword } from '../utils/password';

// 登录接口
export async function loginHandler(req, res) {
  try {
    const { role, username, password } = req.body;
    const db = req.env.DB;
    
    // 添加调试日志
    console.log('收到登录请求:', { role, username });
    
    if (!role || !username || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '请填写完整的登录信息' 
      }), { status: 400 });
    }
    
    // 查询用户信息 - 根据角色使用不同的查询条件
    let query = '';
    let params = [];
    
    if (role === 'student') {
      // 对于学生，可以通过name或student_id查找
      query = 'SELECT * FROM user WHERE role = ? AND (name = ? OR student_id = ?)';
      params = [role, username, username];
    } else if (role === 'teacher') {
      // 对于教师，可以通过name或teacher_id查找
      query = 'SELECT * FROM user WHERE role = ? AND (name = ? OR teacher_id = ?)';
      params = [role, username, username];
    } else if (role === 'parent') {
      // 对于家长，可以通过name或child_name查找
      query = 'SELECT * FROM user WHERE role = ? AND (name = ? OR child_name = ?)';
      params = [role, username, username];
    } else {
      // 其他角色默认通过name查找
      query = 'SELECT * FROM user WHERE role = ? AND name = ?';
      params = [role, username];
    }
    
    // 执行查询
    const result = await db.execute(query, params);
    const user = result.results[0];
    
    if (!user) {
      console.log('用户不存在');
      return new Response(JSON.stringify({ 
        success: false, 
        message: '用户名或密码错误' 
      }), { status: 401 });
    }
    
    // 验证密码（使用bcryptjs进行密码验证）
    console.log('找到用户，开始验证密码...');
    try {
      const isMatch = await verifyPassword(password, user.encrypted_pwd);
      if (!isMatch) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: '用户名或密码错误' 
        }), { status: 401 });
      }
    } catch (verifyError) {
      console.error('密码验证错误:', verifyError);
      return new Response(JSON.stringify({ 
        success: false, 
        message: '服务器错误' 
      }), { status: 500 });
    }
    
    // 返回用户信息（不包含密码）
    const userInfo = {
      id: user.id,
      role: user.role,
      name: user.name,
      school: user.school,
      studentId: user.student_id,
      teacherId: user.teacher_id,
      childName: user.child_name
    };
    
    console.log('登录成功，用户信息:', userInfo);
    
    // 简化版：实际应该生成JWT令牌
    return new Response(JSON.stringify({ 
      success: true, 
      message: '登录成功', 
      user: userInfo
    }), { status: 200 });
    
  } catch (error) {
    console.error('登录错误:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '服务器错误' 
    }), { status: 500 });
  }
}

// 路由处理函数
export default async function authRoutes(req, res) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = req.method;
  
  // 登录接口
  if (pathname === '/api/auth/login' && method === 'POST') {
    return loginHandler(req, res);
  }
  
  return null;
}