#!/bin/bash

# OpenClaw Copilot 安装脚本
# 一键安装和配置

set -e

echo "🚀 OpenClaw Copilot 安装脚本"
echo "────────────────────────────────────"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Node.js
echo -e "\n🔍 检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "   ✅ Node.js ${NODE_VERSION}"
else
    echo -e "   ${RED}❌ Node.js 未安装${NC}"
    echo "   请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查npm
echo -e "\n🔍 检查 npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "   ✅ npm ${NPM_VERSION}"
else
    echo -e "   ${RED}❌ npm 未安装${NC}"
    exit 1
fi

# 检查OpenClaw
echo -e "\n🔍 检查 OpenClaw..."
if command -v openclaw &> /dev/null; then
    OPENCLAW_VERSION=$(openclaw --version 2>/dev/null || echo "未知")
    echo -e "   ✅ OpenClaw ${OPENCLAW_VERSION}"
else
    echo -e "   ${YELLOW}⚠️  OpenClaw 未安装${NC}"
    read -p "   是否安装OpenClaw？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   正在安装 OpenClaw..."
        npm install -g openclaw
    else
        echo "   请手动安装: npm install -g openclaw"
        exit 1
    fi
fi

# 安装依赖
echo -e "\n📦 安装 OpenClaw Copilot..."
npm install -g .

# 创建配置目录
echo -e "\n📁 创建配置目录..."
mkdir -p ~/.openclaw-copilot/{config,workflows,logs}
mkdir -p ~/.openclaw/workspace/copilot

# 检查必要技能
echo -e "\n🔧 检查 OpenClaw 技能..."
REQUIRED_SKILLS=("binance-trading" "telegram-message" "cron")
MISSING_SKILLS=()

for skill in "${REQUIRED_SKILLS[@]}"; do
    SKILL_PATH="$HOME/.openclaw/workspace/skills/$skill"
    if [ -d "$SKILL_PATH" ]; then
        echo -e "   ✅ $skill"
    else
        echo -e "   ${YELLOW}⚠️  $skill (未安装)${NC}"
        MISSING_SKILLS+=("$skill")
    fi
done

# 提示安装缺失技能
if [ ${#MISSING_SKILLS[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}📝 建议安装以下技能:${NC}"
    for skill in "${MISSING_SKILLS[@]}"; do
        echo "   clawhub install $skill"
    done
    
    read -p "   是否现在安装？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for skill in "${MISSING_SKILLS[@]}"; do
            echo "   正在安装 $skill..."
            clawhub install "$skill" || echo "   安装 $skill 失败，请手动安装"
        done
    fi
fi

# 创建示例配置文件
echo -e "\n📝 创建示例配置..."
cat > ~/.openclaw-copilot/config/default.json << EOF
{
  "version": "1.0",
  "settings": {
    "default_mode": "real",
    "auto_confirm": false,
    "timeout_seconds": 300,
    "log_level": "info"
  },
  "channels": {
    "telegram": "auto",
    "wechat": "disabled",
    "feishu": "disabled"
  },
  "skills": {
    "preferred": ["binance-trading", "telegram-message", "cron"],
    "blacklist": []
  }
}
EOF

# 创建示例工作流
echo -e "\n📋 创建示例工作流..."
cat > ~/.openclaw-copilot/workflows/example-price-monitor.json << EOF
{
  "name": "示例：价格监控",
  "description": "监控WLD价格，下跌5%时提醒",
  "trigger": "手动或定时",
  "workflow": "监控WLD价格，跌5%就通过Telegram提醒我"
}
EOF

# 测试安装
echo -e "\n🧪 测试安装..."
if openclaw-copilot --version &> /dev/null; then
    echo -e "   ✅ OpenClaw Copilot 安装成功！"
    echo -e "   版本: $(openclaw-copilot --version)"
else
    echo -e "   ${RED}❌ 安装测试失败${NC}"
    exit 1
fi

# 运行演示
echo -e "\n🎬 运行演示..."
openclaw-copilot demo

# 完成
echo -e "\n${GREEN}🎉 安装完成！${NC}"
echo -e "\n📚 使用指南："
echo -e "   1. 基本使用: ${YELLOW}openclaw-copilot process \"你的请求\"${NC}"
echo -e "   2. 模拟执行: ${YELLOW}openclaw-copilot process \"请求\" --dry-run${NC}"
echo -e "   3. 查看状态: ${YELLOW}openclaw-copilot status${NC}"
echo -e "   4. 批量处理: ${YELLOW}openclaw-copilot batch requests.txt${NC}"
echo -e "\n🔧 配置目录: ${YELLOW}~/.openclaw-copilot/${NC}"
echo -e "📁 工作目录: ${YELLOW}~/.openclaw/workspace/copilot/${NC}"
echo -e "\n💡 示例请求："
echo -e "   • 监控WLD价格，跌5%就通过Telegram提醒我"
echo -e "   • 每天给我知乎热榜前10个话题"
echo -e "   • 每小时检查BTC价格变化"
echo -e "\n🚀 开始使用吧！"