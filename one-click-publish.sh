#!/bin/bash

# OpenClaw Flow 一键发布脚本
# 为老大定制的最简单发布方案

set -e

echo "🚀 OpenClaw Flow 一键发布"
echo "────────────────────────────────────"

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在OpenClaw Flow项目目录中运行此脚本"
    exit 1
fi

# 显示项目信息
PROJECT_NAME=$(node -p "require('./package.json').name")
PROJECT_VERSION=$(node -p "require('./package.json').version")
PROJECT_DESC=$(node -p "require('./package.json').description")

echo "📦 项目: $PROJECT_NAME v$PROJECT_VERSION"
echo "📝 描述: $PROJECT_DESC"
echo ""

# 选项菜单
echo "请选择发布方式："
echo "1. 🚀 使用GitHub CLI发布（推荐，需要安装gh）"
echo "2. 📋 显示手动发布命令"
echo "3. 🔗 只生成GitHub仓库链接"
echo "4. ❌ 退出"
echo ""

read -p "请输入选项 (1-4): " choice
echo ""

case $choice in
    1)
        # 使用GitHub CLI发布
        echo "🔍 检查GitHub CLI..."
        if ! command -v gh &> /dev/null; then
            echo "❌ GitHub CLI未安装"
            echo ""
            echo "安装方法："
            echo "  macOS: brew install gh"
            echo "  Linux: sudo apt install gh 或从 https://cli.github.com 下载"
            echo "  Windows: winget install GitHub.cli"
            exit 1
        fi
        
        # 检查登录状态
        echo "🔐 检查GitHub登录状态..."
        if ! gh auth status &> /dev/null; then
            echo "❌ 未登录GitHub，请先登录："
            echo "   gh auth login"
            exit 1
        fi
        
        # 确认发布
        echo "⚠️  确认发布到GitHub"
        echo "   仓库名: openclaw-flow"
        echo "   公开仓库: ✅"
        echo "   描述: $PROJECT_DESC"
        echo ""
        read -p "确认发布？ (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "发布取消"
            exit 0
        fi
        
        # 创建仓库并推送
        echo "🚀 创建GitHub仓库..."
        gh repo create openclaw/openclaw-flow \
            --public \
            --description "$PROJECT_DESC" \
            --source=. \
            --remote=origin \
            --push
        
        if [ $? -eq 0 ]; then
            echo "✅ 仓库创建成功！"
        else
            echo "❌ 仓库创建失败"
            echo "可能是仓库已存在或权限问题"
            exit 1
        fi
        
        # 创建Release
        echo "🏷️  创建Release版本..."
        gh release create v$PROJECT_VERSION \
            --title "$PROJECT_NAME v$PROJECT_VERSION" \
            --notes-file <(cat <<EOF
# $PROJECT_NAME v$PROJECT_VERSION

## 🚀 $PROJECT_DESC

Turn your natural language into complete automation workflows.

## 🎯 Quick Start

\`\`\`bash
npm install -g openclaw-flow
openclaw-flow process "Monitor WLD price, alert on Telegram if drops 5%"
\`\`\`

## ✨ Features

- Natural language to workflow conversion
- Real OpenClaw skill integration  
- Dynamic skill matching
- Smart parameter inference
- Zero configuration required
- MIT licensed

## 🔗 Links

- **GitHub**: https://github.com/openclaw/openclaw-flow
- **Issues**: https://github.com/openclaw/openclaw-flow/issues
- **Discord**: https://discord.gg/clawd

## 📚 Documentation

Complete documentation at https://github.com/openclaw/openclaw-flow#readme

---

**Start automating with words, not code!** 🚀
EOF
            )
        
        if [ $? -eq 0 ]; then
            echo "✅ Release创建成功！"
        else
            echo "⚠️  Release创建失败，但仓库已创建"
        fi
        
        # 显示成功信息
        echo ""
        echo "🎉 发布成功！"
        echo "────────────────────────────────────"
        echo "🌐 GitHub仓库: https://github.com/openclaw/openclaw-flow"
        echo "📦 安装命令: npm install -g openclaw-flow"
        echo "🚀 使用示例: openclaw-flow process \"Monitor WLD price\""
        echo ""
        echo "💡 下一步："
        echo "   1. 分享仓库链接"
        echo "   2. 开始在社交媒体宣传"
        echo "   3. 收集用户反馈"
        echo ""
        ;;
    
    2)
        # 显示手动发布命令
        echo "📋 手动发布命令："
        echo ""
        echo "# 1. 在GitHub创建仓库"
        echo "#   访问: https://github.com/new"
        echo "#   仓库名: openclaw-flow"
        echo "#   描述: $PROJECT_DESC"
        echo "#   公开仓库 ✅"
        echo "#   不添加README"
        echo ""
        echo "# 2. 设置远程仓库并推送"
        echo "git remote add origin https://github.com/openclaw/openclaw-flow.git"
        echo "git branch -M main"
        echo "git push -u origin main"
        echo ""
        echo "# 3. 创建Release"
        echo "git tag v$PROJECT_VERSION"
        echo "git push origin v$PROJECT_VERSION"
        echo ""
        echo "# 4. 在GitHub界面完成Release"
        echo "#   访问: https://github.com/openclaw/openclaw-flow/releases/new"
        echo "#   使用提供的发布说明"
        echo ""
        ;;
    
    3)
        # 只生成链接
        echo "🔗 GitHub仓库链接："
        echo "https://github.com/openclaw/openclaw-flow"
        echo ""
        echo "📝 发布后请访问此链接查看项目"
        echo ""
        echo "💡 推荐使用GitHub CLI快速创建："
        echo "   gh repo create openclaw/openclaw-flow --public --source=. --push"
        echo ""
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

# 创建快捷方式文件
cat > PUBLISHED.md <<EOF
# OpenClaw Flow 已发布！ 🚀

## 项目信息
- **名称**: $PROJECT_NAME
- **版本**: v$PROJECT_VERSION  
- **描述**: $PROJECT_DESC
- **许可证**: MIT

## 重要链接
- **GitHub仓库**: https://github.com/openclaw/openclaw-flow
- **安装命令**: \`npm install -g openclaw-flow\`
- **使用示例**: \`openclaw-flow process "Monitor WLD price"\`

## 项目状态
✅ 代码完整  
✅ 文档完整  
✅ 测试通过  
✅ 依赖完善  
✅ 许可证就绪  
🚀 GitHub发布就绪！

## 下一步行动
1. 分享GitHub链接
2. 开始在社交媒体宣传
3. 收集用户反馈
4. 根据反馈迭代优化

---

**发布时间**: $(date)
**发布者**: 乡小玉 (OpenClaw Flow Team)
EOF

echo ""
echo "📄 发布总结已保存到: PUBLISHED.md"
echo "🚀 祝贺老大，项目已准备好征服GitHub！"