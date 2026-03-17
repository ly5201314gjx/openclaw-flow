#!/bin/bash
# 加密货币监控工作流一键安装脚本

echo "💰 安装加密货币价格监控工作流..."
echo "========================================"

# 1. 安装所需技能
echo ""
echo "1. 安装所需技能:"
for skill in binance-trading telegram-message file-storage; do
  echo "   📦 安装 $skill..."
  clawhub install $skill 2>/dev/null || echo "   ⚠️  $skill 安装失败 (可能已安装)"
done

# 2. 创建监控工作流
echo ""
echo "2. 创建工作流:"
echo "   💻 运行: openclaw-flow process \"监控BTC价格，超过$50000就通知我\""
echo "   💻 运行: openclaw-flow process \"每15分钟检查加密货币价格\""

# 3. 测试工作流
echo ""
echo "3. 测试工作流:"
echo "   🧪 测试: openclaw-flow process \"检查BTC当前价格\" --dry-run"

echo ""
echo "🎉 加密货币监控工作流安装完成!"
echo "💪 开始监控你的加密货币投资吧！"
