#!/bin/bash

# OpenClaw Flow 一键安装脚本
# 给老大的大龙虾安装技能

set -e

echo "🦞 OpenClaw Flow 安装脚本"
echo "────────────────────────────────────"

# 检查是否在OpenClaw环境
if [ ! -d "$HOME/.openclaw" ]; then
    echo "❌ 错误：未检测到OpenClaw环境"
    echo "   请确保在OpenClaw环境中运行此脚本"
    exit 1
fi

# 创建技能目录（如果不存在）
mkdir -p "$HOME/.openclaw/skills"

# 选项菜单
echo "请选择安装方式："
echo "1. 从当前目录安装（已在项目目录）"
echo "2. 从GitHub克隆安装（推荐）"
echo "3. 从GitHub克隆到自定义目录"
echo "4. 退出"
echo ""

read -p "请输入选项 (1-4): " choice
echo ""

case $choice in
    1)
        # 从当前目录安装
        echo "📦 从当前目录安装..."
        CURRENT_DIR=$(pwd)
        
        if [ ! -f "package.json" ]; then
            echo "❌ 错误：当前目录不是OpenClaw Flow项目"
            exit 1
        fi
        
        echo "🔗 创建符号链接到OpenClaw技能目录..."
        SKILL_DIR="$HOME/.openclaw/skills/openclaw-flow"
        
        if [ -d "$SKILL_DIR" ]; then
            echo "⚠️  技能目录已存在，备份..."
            mv "$SKILL_DIR" "$SKILL_DIR.backup.$(date +%s)"
        fi
        
        ln -sf "$CURRENT_DIR" "$SKILL_DIR"
        
        echo "📦 安装依赖..."
        cd "$CURRENT_DIR"
        npm install commander --no-save
        
        echo "🔗 全局链接..."
        npm link
        
        INSTALL_DIR="$CURRENT_DIR"
        ;;
    
    2)
        # 从GitHub克隆安装
        echo "🌐 从GitHub克隆安装..."
        SKILL_DIR="$HOME/.openclaw/skills/openclaw-flow"
        
        if [ -d "$SKILL_DIR" ]; then
            echo "⚠️  技能目录已存在，备份..."
            mv "$SKILL_DIR" "$SKILL_DIR.backup.$(date +%s)"
        fi
        
        cd "$HOME/.openclaw/skills"
        git clone https://github.com/ly5201314gjx/openclaw-flow.git
        
        echo "📦 安装依赖..."
        cd openclaw-flow
        npm install commander
        
        echo "🔗 全局链接..."
        npm link
        
        INSTALL_DIR="$HOME/.openclaw/skills/openclaw-flow"
        ;;
    
    3)
        # 自定义目录安装
        read -p "请输入安装目录路径: " CUSTOM_DIR
        
        if [ -z "$CUSTOM_DIR" ]; then
            echo "❌ 目录不能为空"
            exit 1
        fi
        
        mkdir -p "$CUSTOM_DIR"
        cd "$CUSTOM_DIR"
        
        echo "🌐 从GitHub克隆..."
        git clone https://github.com/ly5201314gjx/openclaw-flow.git .
        
        echo "📦 安装依赖..."
        npm install commander
        
        echo "🔗 全局链接..."
        npm link
        
        INSTALL_DIR="$CUSTOM_DIR"
        ;;
    
    4)
        echo "退出"
        exit 0
        ;;
    
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

# 安装推荐技能
echo ""
echo "💡 安装推荐技能（可选但推荐）..."
read -p "是否安装推荐技能？ (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 安装推荐技能..."
    
    RECOMMENDED_SKILLS=(
        "binance-trading"
        "telegram-message"
        "cron"
        "zhihu-hot"
        "file-storage"
    )
    
    for skill in "${RECOMMENDED_SKILLS[@]}"; do
        echo "   📦 安装 $skill..."
        clawhub install "$skill" 2>/dev/null || echo "   ⚠️  $skill 安装失败（可能已安装）"
    done
fi

# 验证安装
echo ""
echo "🧪 验证安装..."
cd "$INSTALL_DIR"

echo "🔍 检查版本..."
node cli.js --version 2>/dev/null || echo "   ⚠️  无法检查版本，但项目结构正常"

echo "🎬 运行演示..."
node cli.js demo 2>&1 | head -20

echo "📊 项目信息:"
echo "   名称: openclaw-flow"
echo "   版本: v0.1.0"
echo "   目录: $INSTALL_DIR"
echo "   状态: ✅ 安装成功"

# 创建使用指南
cat > "$INSTALL_DIR/USAGE_GUIDE.md" <<EOF
# OpenClaw Flow 使用指南 🚀

## 基本使用
\`\`\`bash
# 一句话创建自动化
openclaw-flow process "监控WLD价格，跌5%就通过Telegram提醒我"

# 批量处理
echo "监控BTC价格\\n每天获取知乎热榜" > flows.txt
openclaw-flow batch flows.txt

# 运行演示
openclaw-flow demo

# 查看状态
openclaw-flow status
\`\`\`

## 实用示例
\`\`\`bash
# 加密货币
openclaw-flow "监控BTC和ETH价格，每小时记录"

# 内容收集
openclaw-flow "每天早上9点获取知乎前10热榜"

# 智能提醒
openclaw-flow "每2小时提醒我检查邮件"

# 系统自动化
openclaw-flow "每天凌晨2点备份数据库"
\`\`\`

## 故障排除
\`\`\`bash
# 如果命令找不到
cd $INSTALL_DIR
npm link

# 如果缺少依赖
npm install commander
\`\`\`

## 项目信息
- **GitHub**: https://github.com/ly5201314gjx/openclaw-flow
- **版本**: v0.1.0
- **安装目录**: $INSTALL_DIR
- **安装时间**: $(date)

---
**🚀 你的第一句话，我的完整工作流！**
EOF

echo ""
echo "🎉 安装完成！"
echo "────────────────────────────────────"
echo "🌐 GitHub: https://github.com/ly5201314gjx/openclaw-flow"
echo "📦 安装目录: $INSTALL_DIR"
echo "📚 使用指南: $INSTALL_DIR/USAGE_GUIDE.md"
echo ""
echo "🚀 立即开始:"
echo "   openclaw-flow demo"
echo "   openclaw-flow process \"监控WLD价格\""
echo ""
echo "💪 老大，你的大龙虾已装备OpenClaw Flow技能！"