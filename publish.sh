#!/bin/bash

# OpenClaw Flow 一键发布脚本
# 将项目发布到GitHub和npm

set -e

echo "🚀 OpenClaw Flow 发布脚本"
echo "────────────────────────────────────"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Git状态
echo -e "\n🔍 检查Git状态..."
if [ -d ".git" ]; then
    # 检查是否有未提交的更改
    if [[ -n $(git status --porcelain) ]]; then
        echo -e "${YELLOW}⚠️  有未提交的更改${NC}"
        git status --short
        read -p "是否提交更改？ (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Prepare for v0.1.0 release"
        fi
    else
        echo -e "${GREEN}✅ Git仓库状态良好${NC}"
    fi
    
    # 检查当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "当前分支: ${CURRENT_BRANCH}"
    
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo -e "${YELLOW}⚠️  不在main分支，建议切换到main分支发布${NC}"
    fi
else
    echo -e "${RED}❌ 不是Git仓库${NC}"
    exit 1
fi

# 检查npm配置
echo -e "\n🔍 检查npm配置..."
if command -v npm &> /dev/null; then
    NPM_USER=$(npm whoami 2>/dev/null || echo "未登录")
    echo -e "npm用户: ${NPM_USER}"
    
    if [ "$NPM_USER" = "未登录" ]; then
        echo -e "${YELLOW}⚠️  未登录npm，需要登录才能发布${NC}"
        echo -e "   运行: npm login"
        echo -e "   用户名: openclaw"
        echo -e "   邮箱: team@openclaw.ai"
        exit 1
    fi
else
    echo -e "${RED}❌ npm未安装${NC}"
    exit 1
fi

# 检查包版本
echo -e "\n🔍 检查包版本..."
PACKAGE_VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")
echo -e "包名称: ${PACKAGE_NAME}"
echo -e "版本号: v${PACKAGE_VERSION}"

# 检查是否已存在此版本
if npm view "$PACKAGE_NAME" versions 2>/dev/null | grep -q "\"$PACKAGE_VERSION\""; then
    echo -e "${RED}❌ 版本 v${PACKAGE_VERSION} 已存在于npm${NC}"
    read -p "是否继续？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 运行测试
echo -e "\n🧪 运行测试..."
if [ -f "test/simple.js" ]; then
    node test/simple.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 测试通过${NC}"
    else
        echo -e "${RED}❌ 测试失败${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  未找到测试文件，跳过测试${NC}"
fi

# 预览发布内容
echo -e "\n📋 发布内容预览:"
echo -e "────────────────────────────────────"
echo -e "文件数量: $(find . -type f -not -path './.git/*' | wc -l)"
echo -e "代码行数: $(find . -name '*.js' -not -path './.git/*' -not -path './node_modules/*' | xargs wc -l | tail -1 | awk '{print $1}')"
echo -e "文档行数: $(find . -name '*.md' -not -path './.git/*' | xargs wc -l | tail -1 | awk '{print $1}')"
echo -e "────────────────────────────────────"

# 确认发布
echo -e "\n⚠️  发布确认"
echo -e "────────────────────────────────────"
echo -e "将发布: ${PACKAGE_NAME} v${PACKAGE_VERSION}"
echo -e "到: npm registry (公开包)"
echo -e ""
echo -e "重要文件:"
echo -e "  ✅ package.json"
echo -e "  ✅ README.md"
echo -e "  ✅ LICENSE"
echo -e "  ✅ cli.js"
echo -e "  ✅ src/ (核心代码)"
echo -e ""
echo -e "发布后不可撤回，请确认内容正确！"

read -p "是否确认发布？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "发布取消"
    exit 0
fi

# 创建Git标签
echo -e "\n🏷️  创建Git标签..."
git tag -a "v${PACKAGE_VERSION}" -m "Release v${PACKAGE_VERSION}: Your First Sentence, My Full Workflow"

# 发布到npm
echo -e "\n📦 发布到npm..."
npm publish --access public

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ npm发布成功！${NC}"
    echo -e ""
    echo -e "包地址: https://www.npmjs.com/package/${PACKAGE_NAME}"
    echo -e "安装命令: npm install -g ${PACKAGE_NAME}"
else
    echo -e "${RED}❌ npm发布失败${NC}"
    exit 1
fi

# 推送标签到远程仓库（如果配置了远程仓库）
if git remote | grep -q "origin"; then
    echo -e "\n🌐 推送标签到GitHub..."
    read -p "是否推送标签到GitHub？ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin "v${PACKAGE_VERSION}"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 标签推送成功${NC}"
        else
            echo -e "${YELLOW}⚠️  标签推送失败，可能需要先推送代码${NC}"
        fi
    fi
fi

# 生成成功消息
echo -e "\n🎉 发布成功！"
echo -e "────────────────────────────────────"
echo -e "${GREEN}OpenClaw Flow v${PACKAGE_VERSION} 已发布${NC}"
echo -e ""
echo -e "📦 安装:"
echo -e "   npm install -g ${PACKAGE_NAME}"
echo -e ""
echo -e "🚀 使用:"
echo -e "   ${PACKAGE_NAME} process \"Monitor WLD price, alert on Telegram if drops 5%\""
echo -e "   ${PACKAGE_NAME} demo"
echo -e ""
echo -e "📚 文档:"
echo -e "   https://github.com/openclaw/${PACKAGE_NAME}#readme"
echo -e ""
echo -e "🐛 反馈:"
echo -e "   https://github.com/openclaw/${PACKAGE_NAME}/issues"
echo -e ""
echo -e "💡 下一步:"
echo -e "   1. 在GitHub创建仓库"
echo -e "   2. 推送代码: git push -u origin main"
echo -e "   3. 创建Release页面"
echo -e "   4. 开始推广！"
echo -e ""
echo -e "🎯 宣传文案:"
echo -e "   \"Just launched: ${PACKAGE_NAME} - Your First Sentence, My Full Workflow!\""
echo -e "   \"Turn natural language into complete automation workflows.\""
echo -e "   \"Zero config. Real execution. 100% OpenClaw.\""
echo -e ""
echo -e "🚀 开始你的自动化之旅！"