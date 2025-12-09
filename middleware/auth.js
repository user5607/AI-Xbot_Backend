function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  
  // 简化版：实际项目中应该使用JWT验证
  if (!token) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }
  
  // 这里简化处理，实际应该验证token有效性
  next();
}

module.exports = { verifyToken };