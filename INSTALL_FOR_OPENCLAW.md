# 🚀 OpenClaw Flow 安装指南（给大龙虾用）

## 方法1：从GitHub直接安装（推荐）

```bash
# 1. 克隆仓库到OpenClaw技能目录
cd ~/.openclaw/skills
git clone https://github.com/ly5201314gjx/openclaw-flow.git

# 2. 进入技能目录
cd openclaw-flow

# 3. 安装依赖
npm install

# 4. 全局链接（让系统可以找到命令）
npm link

# 5. 测试安装
openclaw-flow --version
```

## 方法2：从npm安装（如果已发布）

```bash
# 直接安装
npm install -g openclaw-flow

# 测试
openclaw-flow demo
```

## 方法3：从本地目录安装（当前项目）

```bash
# 进入项目目录
cd ~/.openclaw/workspace/copilot

# 全局链接
npm link

# 测试
openclaw-flow process "监控WLD价格"
```

## 🔧 安装后配置

### 安装推荐技能
```bash
# OpenClaw Flow依赖这些技能才能发挥最大威力
clawhub install binance-trading
clawhub install telegram-message
clawhub install cron
clawhub install zhihu-hot
clawhub install file-storage
```

### 验证安装
```bash
# 检查版本
openclaw-flow --version

# 运行演示
openclaw-flow demo

# 查看系统状态
openclaw-flow status

# 测试简单请求
openclaw-flow process "检查BTC价格"
```

## 🎯 立即开始使用

### 基础使用
```bash
# 一句话创建自动化工作流
openclaw-flow process "监控WLD价格，跌5%就通过Telegram提醒我"

# 批量处理
echo "监控BTC价格\n每天获取知乎热榜" > my_flows.txt
openclaw-flow batch my_flows.txt

# 预览模式（不实际执行）
openclaw-flow process "备份重要文件" --dry-run
```

### 实用示例
```bash
# 加密货币监控
openclaw-flow "监控BTC和ETH价格，每小时记录一次"

# 内容收集
openclaw-flow "每天早上9点获取知乎前10热榜话题"

# 智能提醒
openclaw-flow "每2小时提醒我检查邮件"

# 系统自动化
openclaw-flow "每天凌晨2点备份数据库"

# 价格警报
openclaw-flow "WLD价格超过8美元时通知我"
```

## 🔍 故障排除

### 问题1：命令找不到
```bash
# 重新链接
cd /path/to/openclaw-flow
npm link

# 或者添加到PATH
export PATH=$PATH:/path/to/openclaw-flow/bin
```

### 问题2：缺少依赖
```bash
# 安装依赖
npm install commander
```

### 问题3：技能未找到
```bash
# 安装必要的OpenClaw技能
clawhub install binance-trading
clawhub install telegram-message
```

### 问题4：权限问题
```bash
# 使用sudo（如果需要）
sudo npm link
# 或者
sudo npm install -g openclaw-flow
```

## 📁 项目结构说明

```
openclaw-flow/
├── cli.js              # 命令行接口
├── index.js            # 主模块
├── package.json        # npm配置
├── SKILL.md            # 技能文档
├── src/                # 源代码
│   ├── core/          # 核心引擎
│   ├── adapters/      # 技能适配器
│   └── utils/         # 工具函数
├── test/              # 测试文件
└── README.md          # 完整文档
```

## 🚀 高级使用

### 自定义配置
```javascript
// 在代码中使用
const { OpenClawFlow, createFlow } = require('openclaw-flow');

const flow = createFlow({
  dryRun: false,        // 是否模拟执行
  verbose: true,        // 详细日志
  autoConfirm: false    // 自动确认执行
});

const result = await flow.process("你的请求");
```

### 扩展技能
```javascript
// 在src/adapters/real-skill-adapter.js中添加新技能
'new-skill': {
  execute: async (params) => {
    // 执行逻辑
  },
  validate: (params) => {
    // 参数验证
  }
}
```

## 💡 使用技巧

1. **越具体越好** - "监控WLD价格" 比 "监控价格" 更好
2. **包含条件** - "如果价格跌5%就提醒我"
3. **指定频率** - "每小时检查一次" 或 "每天上午9点"
4. **指定目标** - "通过Telegram通知我" 或 "保存到文件"
5. **逐步测试** - 先用`--dry-run`预览，再实际执行

## 📈 性能优化

```bash
# 启用缓存
export OPENCLAW_FLOW_CACHE=true

# 设置日志级别
export OPENCLAW_FLOW_LOG_LEVEL=info

# 限制并发数
export OPENCLAW_FLOW_MAX_CONCURRENT=3
```

## 🔄 更新技能

```bash
# 从GitHub更新
cd ~/.openclaw/skills/openclaw-flow
git pull
npm install
npm link

# 从npm更新
npm update -g openclaw-flow
```

## 🎊 安装完成！

安装成功后，你就可以：
1. 🚀 用一句话创建复杂工作流
2. 🔥 自动匹配最佳技能组合
3. ⚡ 零配置立即使用
4. 📊 获得完整执行报告

**现在开始你的自动化之旅吧！** 🎉

---

**💪 一句话总结：**
> "安装OpenClaw Flow，让你的第一句话变成完整的自动化工作流！"