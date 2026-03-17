#!/bin/bash
# 多平台内容收集工作流脚本

echo "📰 多平台内容收集系统"
echo "========================"

# 创建数据目录
DATA_DIR="/data/hot-content/$(date +%Y%m%d)"
mkdir -p "$DATA_DIR"

echo ""
echo "📅 收集时间: $(date)"
echo "💾 数据目录: $DATA_DIR"

# 1. 收集B站热榜
echo ""
echo "1. 收集B站热门视频..."
curl -s -X GET \
  -H "User-Agent: Mozilla/5.0" \
  -H "Referer: https://www.bilibili.com" \
  "https://api.bilibili.com/x/web-interface/popular" \
  -o "$DATA_DIR/bilibili_hot_$(date +%H%M).json"

# 2. 收集知乎热榜 (示例)
echo "2. 收集知乎热榜..."
cat > "$DATA_DIR/zhihu_hot_$(date +%H%M).json" << EOF
{
  "platform": "zhihu",
  "timestamp": "$(date -Iseconds)",
  "note": "使用OpenClaw Flow可获取真实数据: openclaw-flow process '知乎热榜'"
}
EOF

# 3. 生成报告
echo "3. 生成汇总报告..."
cat > "$DATA_DIR/daily_report_$(date +%H%M).md" << EOF
# 每日热点内容报告
## 时间: $(date)

### 📊 收集概况
- 收集时间: $(date)
- 数据目录: $DATA_DIR
- 包含平台: 哔哩哔哩、知乎

### 🚀 使用OpenClaw Flow获取更多
运行以下命令获取完整数据:

```bash
# 获取知乎热榜
openclaw-flow process "知乎热榜"

# 获取B站热榜
openclaw-flow process "哔哩哔哩热榜"

# 定时收集
openclaw-flow process "每天9点收集多平台热榜"
```

### 💡 提示
确保已安装所需技能:
- web-fetch (网页获取)
- file-storage (文件存储)
- telegram-message (通知)

EOF

echo ""
echo "✅ 内容收集完成!"
echo "📁 查看报告: cat $DATA_DIR/daily_report_*.md"
echo "🚀 使用OpenClaw Flow: openclaw-flow process \"收集热点内容\""
