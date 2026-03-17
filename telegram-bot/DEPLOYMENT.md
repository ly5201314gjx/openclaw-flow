# 🚀 OpenClaw Flow Telegram Bot 部署指南

## 📋 概述

本文档指导如何部署和运行 OpenClaw Flow Telegram Bot，这是一个智能对话界面，允许用户通过自然语言创建和管理自动化工作流。

## 🎯 功能特性

- 🤖 自然语言创建工作流
- 📱 Telegram内完整管理
- ⚡ 实时状态监控
- 🔄 智能对话交互
- 🎨 可视化界面

## 🔧 系统要求

### 最低要求
- Node.js 16.0+
- npm 8.0+
- 500MB 磁盘空间
- 1GB 内存

### 推荐配置
- Node.js 18.0+
- npm 9.0+
- 1GB 磁盘空间
- 2GB 内存
- Redis (可选，用于状态缓存)

## 📦 快速开始

### 1. 获取 Telegram Bot Token

1. 在 Telegram 中搜索 @BotFather
2. 发送 `/newbot` 创建新 Bot
3. 按照提示设置 Bot 名称和用户名
4. 保存生成的 Bot Token

### 2. 克隆项目

```bash
git clone https://github.com/ly5201314gjx/openclaw-flow.git
cd openclaw-flow/telegram-bot
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境变量

```bash
# 复制环境配置模板
cp .env.example .env

# 编辑 .env 文件，填入你的配置
nano .env
```

### 5. 启动 Bot

```bash
# 开发模式（带热重载）
npm run dev

# 生产模式
npm start
```

## 🔧 详细配置

### Telegram Bot 配置

#### 必需配置
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
BOT_USERNAME=your_bot_username
```

#### 可选配置
```env
# 管理员通知
ADMIN_CHAT_ID=123456789

# Webhook 模式（生产环境推荐）
WEBHOOK_URL=https://your-domain.com/webhook
```

### 服务器配置

#### 基本配置
```env
PORT=3000
NODE_ENV=production
```

#### 高级配置
```env
# 连接限制
MAX_CONCURRENT_USERS=100
MESSAGE_TIMEOUT_MS=10000
```

### OpenClaw Flow 集成

#### 选项1：使用全局安装
```env
OPENCLAW_FLOW_PATH=/usr/local/bin/openclaw-flow
```

#### 选项2：使用本地模块
```env
OPENCLAW_FLOW_MODULE_PATH=../openclaw-flow
```

#### 选项3：使用模拟模式（测试用）
```env
SIMULATION_MODE=true
```

### 数据库配置

#### SQLite（默认，无需配置）
数据库文件自动创建在 `./data/bot.db`

#### Redis（推荐生产环境）
```env
REDIS_URL=redis://localhost:6379
```

## 🚀 部署到生产环境

### 方案1：使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start bot.js --name "openclaw-flow-bot"

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs openclaw-flow-bot

# 监控
pm2 monit
```

### 方案2：使用 Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建数据目录
RUN mkdir -p data logs

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "bot.js"]
```

#### 构建和运行
```bash
# 构建镜像
docker build -t openclaw-flow-bot .

# 运行容器
docker run -d \
  --name openclaw-flow-bot \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  --env-file .env \
  openclaw-flow-bot
```

### 方案3：使用 Railway（最简单）

1. 在 Railway.app 创建新项目
2. 连接 GitHub 仓库
3. 设置环境变量
4. 自动部署完成

## 🌐 Webhook 模式配置

### 为什么使用 Webhook？
- 更高的可靠性
- 更好的性能
- 支持 HTTPS
- 适合生产环境

### 配置步骤

#### 1. 设置 Webhook URL
```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

#### 2. 验证 Webhook
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

#### 3. 删除 Webhook（如果需要）
```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook
```

### Nginx 反向代理配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        return 200 'OpenClaw Flow Bot is running!';
        add_header Content-Type text/plain;
    }
}
```

## 🔒 安全配置

### 1. 限制访问
```env
# 只允许特定用户
ALLOWED_USER_IDS=123456789,987654321
```

### 2. API 密钥保护
```env
API_SECRET=your_secure_secret_here
```

### 3. 请求频率限制
```env
DAILY_WORKFLOW_CREATION_LIMIT=10
MAX_WORKFLOWS_PER_USER=20
```

### 4. HTTPS 强制
```javascript
// 在 Express 配置中添加
app.use(helmet());
app.use(rateLimit());
```

## 📊 监控和维护

### 日志管理

#### 查看日志
```bash
# 实时查看日志
tail -f logs/combined.log

# 查看错误日志
tail -f logs/error.log

# 使用 PM2 查看
pm2 logs openclaw-flow-bot
```

#### 日志轮转
```bash
# 安装 logrotate
sudo apt-get install logrotate

# 创建配置文件 /etc/logrotate.d/openclaw-flow-bot
/path/to/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

### 健康检查

#### 手动检查
```bash
curl http://localhost:3000/health
```

#### 自动监控
```bash
# 使用 uptime-kuma 或其他监控工具
# 设置每分钟检查一次
```

### 备份策略

#### 数据库备份
```bash
# SQLite 备份
sqlite3 data/bot.db ".backup backup/bot-$(date +%Y%m%d).db"

# 使用 cron 定时备份
0 2 * * * /usr/bin/sqlite3 /app/data/bot.db ".backup /app/backup/bot-$(date +\%Y\%m\%d).db"
```

#### 用户数据备份
```bash
# 备份整个数据目录
tar -czf backup/data-$(date +%Y%m%d).tar.gz data/
```

## 🔧 故障排除

### 常见问题

#### 1. Bot 不响应消息
```bash
# 检查 Bot Token
echo $TELEGRAM_BOT_TOKEN

# 检查网络连接
curl https://api.telegram.org

# 检查日志
tail -f logs/combined.log
```

#### 2. 数据库错误
```bash
# 检查数据库文件权限
ls -la data/

# 修复 SQLite 数据库
sqlite3 data/bot.db "VACUUM;"
```

#### 3. 内存泄漏
```bash
# 查看内存使用
pm2 monit

# 重启应用
pm2 restart openclaw-flow-bot
```

#### 4. 工作流创建失败
```bash
# 检查 OpenClaw Flow 配置
which openclaw-flow

# 测试 OpenClaw Flow
openclaw-flow --version
```

### 调试模式

启用调试模式获取详细信息：
```env
DEBUG=true
LOG_LEVEL=debug
```

## 📈 性能优化

### 1. 启用缓存
```env
REDIS_URL=redis://localhost:6379
CACHE_EXPIRY_SECONDS=300
```

### 2. 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_user_id ON workflows(user_id);
CREATE INDEX idx_status ON workflows(status);

-- 定期清理旧数据
DELETE FROM workflows WHERE created_at < datetime('now', '-30 days');
```

### 3. 代码优化
```javascript
// 启用连接池
const pool = new pg.Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 4. 负载均衡
```bash
# 使用 PM2 集群模式
pm2 start bot.js -i max --name "openclaw-flow-bot"
```

## 🔄 更新和维护

### 更新应用
```bash
# 拉取最新代码
git pull origin main

# 更新依赖
npm install

# 重启应用
pm2 restart openclaw-flow-bot
```

### 数据库迁移
```bash
# 运行迁移脚本
node scripts/migrate.js

# 备份后迁移
cp data/bot.db data/bot.db.backup
node scripts/migrate.js
```

### 监控指标
```bash
# 查看统计信息
node scripts/stats.js

# 导出数据
node scripts/export.js --format=csv
```

## 🤝 贡献指南

### 开发环境设置
```bash
# 克隆仓库
git clone https://github.com/ly5201314gjx/openclaw-flow.git

# 安装开发依赖
npm install

# 运行测试
npm test

# 启动开发服务器
npm run dev
```

### 代码规范
- 使用 ESLint 检查代码
- 编写单元测试
- 提交前运行测试
- 遵循现有代码风格

### 提交 Pull Request
1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 推送分支
5. 创建 Pull Request

## 📞 支持

### 获取帮助
- 查看 [GitHub Issues](https://github.com/ly5201314gjx/openclaw-flow/issues)
- 加入 [Telegram 群组](https://t.me/openclaw_cn)
- 阅读 [完整文档](https://github.com/ly5201314gjx/openclaw-flow)

### 报告问题
```bash
# 提供详细信息
1. 错误日志
2. 复现步骤
3. 环境信息
4. 预期行为
```

### 功能请求
在 GitHub Issues 中描述：
- 功能描述
- 使用场景
- 预期效果

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件。

## 🙏 致谢

感谢所有贡献者和用户的支持！

---

**🚀 现在你的 OpenClaw Flow Telegram Bot 已经准备好，开始自动化之旅吧！**