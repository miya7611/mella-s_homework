# 孩子作业管理系统 - 部署指南

## 目录
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [生产环境部署](#生产环境部署)
  - [方式一：单服务器部署](#方式一单服务器部署)
  - [方式二： Serverless 部署](#方式二-serverless-部署)
- [配置说明](#配置说明)
- [数据备份](#数据备份)
- [常见问题](#常见问题)
- [维护指南](#维护指南)

- [安全建议](#安全建议)

---

## 环境要求

### 开发环境
- Node.js 18+
- npm 9+ 或 pnpm 8+
- Git

- 现代浏览器（Chrome、Firefox, Safari、 Edge）

### 生产环境
- Node.js 18+
- 内存: 最低 512MB
- 存储: 最低 1GB
- 网络: 稳定的网络连接

---

## 快速开始

### 1. 克隆项目

\`\`\bash
git clone https://github.com/miya7611/mella-s_homework.git
cd mella-s_homework
\`\`\`\### 2. 安装依赖

\`\`\bash
# 安装所有依赖
npm install
\`\`\`\### 3. 启动开发服务器

\`\`\bash
# 同时启动前端和后端
npm run dev

# 或者分别启动
npm run dev:frontend  # 前端: http://localhost:5173
npm run dev:backend   # 后端: http://localhost:3000
\`\`\`\### 4. 访问应用

打开浏览器访问 http://localhost:5173

**默认账号:**
- 家长账号: `parent` / `parent123` (用户名/密码)
- 孩子账号: 需要家长登录后创建

---

## 生产环境部署

### 方式一： 单服务器部署

推荐用于初期使用，成本约 50-100 元/月。

#### 1. 服务器准备

**推荐配置:**
- CPU: 2核
- 内存: 4GB
- 存储: 40GB SSD
- 系统: Ubuntu 22.04
- 云服务商: 阿里云、 腾讯云、 华为云等

#### 2. 安装 Node.js

\`\`\bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.nvm/nvm.sh

nvm install 18
nvm use 18
\`\`\`\#### 3. 克隆并构建项目

\`\`\bash
# 克隆项目
git clone https://github.com/miya7611/mella-s_homework.git
cd mella-s_homework

# 安装依赖
npm install

# 构建前端
cd frontend
npm run build
cd ..

# 构建后端
cd backend
npm run build
cd ..
\`\`\`\#### 4. 配置环境变量

\`\`\bash
# 创建后端环境变量
cd backend
cat > .env << EOF
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-me-in-production
DATABASE_PATH=/var/lib/homework/data.sqlite
EOF
\`\`\`\#### 5. 使用 PM2 管理进程

\`\`\bash
# 安装 PM2
npm install -g pm2

# 创建生态系统配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'homework-backend',
    script: './backend/dist/index.js',
    instances: 1,
    env: {
    NODE_ENV: 'production',
    PORT: '3000',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    DATABASE_PATH: '/var/lib/homework/data.sqlite'
  }
}
EOF

# 启动应用
pm2 start ecosystem.config.js
\`\`\`\#### 6. 配置 Nginx 反向代理

\`\`\bash
# 安装 Nginx
sudo apt update
sudo apt install nginx

# 创建 Nginx 配置
sudo cat > /etc/nginx/sites-available/homework << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 重定向 HTTP 到 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    # SSL 证书（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 前端静态文件
    location / {
        root /var/www/homework/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/homework /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
\`\`\`\#### 7. 配置 SSL 证书（推荐）

\`\`\bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
\`\`\`\---

### 方式二: Serverless 部署

适用于零成本起步，自动扩展。

#### 前端部署到 Vercel

\`\`\bash
# 安装 Vercel CLI
npm i -g vercel

# 部署前端
cd frontend
vercel
\`\`\`\**配置环境变量:**
在 Vercel Dashboard 中设置:
- `VITE_API_URL`: 后端 API 地址

#### 后端部署到 Vercel Serverless

\`\`\bash
# 创建 vercel.json
cd backend
cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
    "src": "/(.*)",
    "dest": "dist/index.js"
    }
  ]
}
EOF

# 部署
vercel
\`\`\`\**数据库选项:**
- Turso (免费额度: 9GB)
- PlanetScale (免费额度: 5GB)
- 或者使用本地 SQLite 文件（需要持久化存储）

---

## 配置说明

### 环境变量

#### 后端环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| NODE_ENV | 否 | development | 运行环境 |
| PORT | 否 | 3000 | 服务端口 |
| JWT_SECRET | **是** | - | JWT 密钥（生产环境必须修改） |
| DATABASE_PATH | 否 | ./data/database.sqlite | 数据库路径 |

#### 前端环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| VITE_API_URL | 否 | http://localhost:3000 | 后端 API 地址 |

### JWT 密钥生成

\`\`\bash
# 生成安全的随机密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
\`\`\`\---

## 数据备份

### 自动备份脚本

\`\`\bash
# 创建备份脚本
cat > /usr/local/bin/backup-homework.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/homework"
DATE=$(date +%Y%m%d_%H%M%S)
DB_FILE="/var/lib/homework/data.sqlite"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_DIR/database_$DATE.sqlite"

    # 保留最近 7 天的备份
    find $BACKUP_DIR -name "database_*.sqlite" -mtime +7 -delete

    echo "Backup completed: database_$DATE.sqlite"
else
    echo "Database file not found"
fi
EOF

chmod +x /usr/local/bin/backup-homework.sh

# 添加到 crontab（每天凌晨 2 点执行)
crontab -e
# 添加以下行
0 2 * * * /usr/local/bin/backup-homework.sh >> /var/log/homework-backup.log 2>&1
\`\`\`\### 手动备份

\`\`\bash
# 手动执行备份
/usr/local/bin/backup-homework.sh

# 或直接复制数据库文件
cp /var/lib/homework/data.sqlite ~/backup_$(date +%Y%m%d).sqlite
\`\`\`\---

## 常见问题

### 1. 緻加第一个家长账号

**问题:** 如何创建第一个家长账号？

**解决方案:**
```bash
# 方法一： 通过 API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"parent","password":"your-password","role":"parent"}'

# 方法二: 直接操作数据库
# 使用 sqlite 巻加用户
sqlite3 /var/lib/homework/data.sqlite
INSERT INTO users (username, password, role, level, total_points)
VALUES ('parent', '$2b$12$hash', 'parent', 1, 0);
```

密码需要使用 bcrypt 加密。

### 2. 忘记密码

**问题:** 忘记密码怎么办？

**解决方案:**
```bash
# 重置密码（需要重新生成 bcrypt hash）
# 使用 Node.js 生成新密码 hash
node -e "console.log(require('bcrypt').hashSync('new-password', 10))"

# 更新数据库
sqlite3 /var/lib/homework/data.sqlite
UPDATE users SET password = '$2b$12$newhash' WHERE username = 'parent';
```

### 3. 数据库损坏

**问题:** 数据库损坏如何恢复？

**解决方案:**
```bash
# 从备份恢复
cp /var/backups/homework/database_20260313_020000.sqlite /var/lib/homework/data.sqlite

```

### 4. 緻加孩子账号
**问题:** 如何添加孩子账号？

**解决方案:**
1. 家长登录后，访问"孩子管理"页面
2. 点击"添加孩子"按钮
3. 填写孩子信息并保存

4. 将登录信息告知孩子

### 5. OCR 识别不准确
**问题:** OCR 识别结果不准确

**解决方案:**
- 磉保图片清晰、文字清楚
- 光线充足
- 避免手写模糊
- 手动修正识别结果

- 首次使用需要下载语言包（约 10MB）

---

## 维护指南

### 日常维护

1. **监控日志**
   ```bash
   # 查看应用日志
   pm2 logs homework-backend

   # 查看 Nginx 日志
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

2. **监控磁盘空间**
   ```bash
   # 检查磁盘使用
   df -h

   # 检查数据库大小
   ls -lh /var/lib/homework/data.sqlite
   ```

3. **监控内存使用**
   ```bash
   # 检查内存使用
   free -m

   # 检查 Node.js 内存
   pm2 monit
   ```

### 定期维护
1. **每周任务:**
   - 检查备份是否正常
   - 检查日志文件大小
   - 检查 SSL 证书有效期
   - 清理过期日志

2. **每月任务:**
   - 检查系统更新
   - 检查依赖包安全更新
   - 检查数据库完整性
   - 评估性能优化需求

3. **季度任务:**
   - 宣传检查安全更新
   - 宣传检查依赖更新
   - 性能压测和   - 宽数据归档

### 升级指南
1. **备份数据**
   ```bash
   # 手动备份
   /usr/local/bin/backup-homework.sh
   ```

2. **拉取更新**
   ```bash
   git pull origin master
   npm install
   npm run build
   ```
3. **重启服务**
   ```bash
   pm2 restart homework-backend
   sudo systemctl reload nginx
   ```

4. **验证升级**
   - 检查主要功能
   - 检查用户数据
   - 检查统计数据
   - 监控错误日志

---

## 安全建议

### 1. JWT 密钥安全
- 使用强随机密钥（至少 64 字节)
- 定期更换密钥
- 不要在代码中硬编码密钥
- 不同环境使用不同密钥

### 2. 密码策略
- 家长密码: 最少 8 位，包含数字和字母
- 孩子密码: 可以简单（4 位数字)
- 定期提醒家长更新密码
- 不要使用常见密码

### 3. 数据安全
- 定期备份数据
- 不要在公网暴露数据库文件
- 使用 HTTPS 传输数据
- 限制 API 访问频率

### 4. 网络安全
- 配置防火墙规则
- 只开放必要端口
- 使用 HTTPS
- 配置 CORS 策略

### 5. 应用安全
- 定期更新依赖
- 关注安全公告
- 实施输入验证
- 防止 SQL 注入
- 防止 XSS 攻击

---

## 联系方式

如有问题或建议， 请通过以下方式联系:
- GitHub Issues: https://github.com/miya7611/mella-s_homework/issues
- 查看项目文档: `docs/` 目录

---

**部署愉快！** 🎉
