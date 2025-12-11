// 密码加密工具 - 用于生成bcrypt加密后的密码
// 可以直接在Node.js环境中运行

// 导入bcryptjs库
import bcrypt from 'bcryptjs';

// 要加密的密码列表
const passwordsToHash = ['123456', 'password', 'admin123'];

// 批量加密密码
async function hashAllPasswords() {
    console.log('密码加密工具');
    console.log('================');
    
    for (const plainPassword of passwordsToHash) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);
            console.log(`\n明文密码: ${plainPassword}`);
            console.log(`加密后密码: ${hashedPassword}`);
            console.log('验证: ' + await bcrypt.compare(plainPassword, hashedPassword));
        } catch (error) {
            console.error(`加密密码 ${plainPassword} 时出错:`, error);
        }
    }
    
    console.log('\n================');
    console.log('使用说明:');
    console.log('1. 复制加密后的密码到数据库的encrypted_pwd字段');
    console.log('2. 确保数据库中的role字段与角色匹配');
    console.log('3. 确保学生、教师、家长角色的专用字段已正确填写');
}

// 运行加密工具
hashAllPasswords();

// 使用方法:
// 1. 在命令行中运行: node 密码加密工具.js
// 2. 复制输出的加密后密码到数据库中
// 3. 也可以修改passwordsToHash数组来加密其他密码