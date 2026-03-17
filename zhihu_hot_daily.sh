#!/bin/bash
# 知乎热榜每日收集脚本
# 自动生成 by OpenClaw Flow

echo "📰 开始知乎热榜收集 $(date)"
cd /root/.openclaw/workspace/copilot

# 执行收集
node cli.js process "收集知乎热榜前20话题"

echo "✅ 收集完成 $(date)"
