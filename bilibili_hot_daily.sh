#!/bin/bash
# 哔哩哔哩热榜每日收集脚本
# 自动生成 by OpenClaw Flow

echo "📺 开始哔哩哔哩热榜收集 $(date)"
cd "$HOME/.openclaw/workspace/copilot"  # or export OPENCLAW_FLOW_DIR

# 使用OpenClaw Flow执行
echo "🚀 通过OpenClaw Flow执行B站热榜收集..."
node cli.js process "获取哔哩哔哩当前热榜前20视频"

# 或者直接调用API
echo "🌐 备选方案：直接调用API..."
curl -s "https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all" \
  -H "User-Agent: Mozilla/5.0" \
  -o "bilibili_hot_$(date +%Y%m%d).json"

echo "✅ 收集完成 $(date)"
echo "💾 结果保存在: bilibili_hot_*.json"
