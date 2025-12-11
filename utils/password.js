import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hashedPassword) {
  try {
    if (!password || !hashedPassword) {
      console.error('密码或哈希密码为空:', { password, hashedPassword });
      return false;
    }
    const result = await bcrypt.compare(password, hashedPassword);
    console.log('密码验证结果:', result);
    return result;
  } catch (error) {
    console.error('密码验证错误:', error);
    return false;
  }
}