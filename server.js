// Cloudflare Workers 兼容版本
import { connectDB } from './config/db';
import { initTables } from './config/initDB';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';

// CORS配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 路由处理函数
async function handleRequest(request, env, ctx) {
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  // 初始化数据库
  ctx.waitUntil(connectDB(env.DB));
  ctx.waitUntil(initTables(env.DB));

  // 解析URL
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  // 解析请求体
  let body = {};
  if (method !== 'GET' && request.headers.get('Content-Type')?.includes('application/json')) {
    try {
      body = await request.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: '无效的JSON格式' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // 创建请求对象
  const req = {
    method,
    url: request.url,
    headers: request.headers,
    body,
    query: Object.fromEntries(url.searchParams),
    env
  };

  // 创建响应对象
  const res = {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: {}
  };

  // 路由处理
  try {
    // 健康检查接口
    if (pathname === '/api/health' && method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 认证路由
    if (pathname.startsWith('/api/auth')) {
      const authResponse = await authRoutes(req, res);
      if (authResponse) return authResponse;
    }

    // 用户路由
    if (pathname.startsWith('/api/users')) {
      const usersResponse = await usersRoutes(req, res);
      if (usersResponse) return usersResponse;
    }

    // 默认404响应
    return new Response(JSON.stringify({ error: '未找到路由' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Cloudflare Workers 导出
export default {
  fetch: handleRequest
};