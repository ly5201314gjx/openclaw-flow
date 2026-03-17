#!/bin/bash
# 简易文件备份脚本
# 完整功能需使用OpenClaw Flow

echo "💾 文件备份系统"
echo "========================"

BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

echo ""
echo "📅 备份时间: $(date)"
echo "💾 备份目录: $BACKUP_DIR"

# 备份workspace目录
echo ""
echo "1. 备份workspace目录..."
if [ -d "$HOME/workspace" ]; then
  tar -czf "$BACKUP_DIR/workspace_$(date +%H%M).tar.gz" -C "$HOME" workspace --exclude=node_modules --exclude=.git
  echo "   ✅ workspace备份完成"
else
  echo "   ⚠️  workspace目录不存在"
fi

# 备份.openclaw配置
echo ""
echo "2. 备份.openclaw配置..."
if [ -d "$HOME/.openclaw" ]; then
  tar -czf "$BACKUP_DIR/openclaw_$(date +%H%M).tar.gz" -C "$HOME" .openclaw
  echo "   ✅ .openclaw备份完成"
else
  echo "   ⚠️  .openclaw目录不存在"
fi

# 生成报告
echo ""
echo "3. 生成备份报告..."
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
cat > "$BACKUP_DIR/backup_report_$(date +%H%M).md" << EOF
# 文件备份报告
## 备份时间: $(date)

### 📊 备份概况
- 备份目录: $BACKUP_DIR
- 总大小: $BACKUP_SIZE
- 包含内容:
  - workspace目录
  - .openclaw配置

### 🚀 使用OpenClaw Flow增强功能
运行以下命令启用高级备份功能:

```bash
# 创建完整备份工作流
openclaw-flow process "每天凌晨2点备份workspace目录"

# 添加云存储备份
openclaw-flow process "备份到云存储并发送通知"

# 智能清理旧备份
openclaw-flow process "自动清理30天前备份"
```

### 📋 所需技能
- file-processor: 文件压缩和处理
- system-monitor: 磁盘空间检查
- telegram-message: 备份通知
- cloud-storage: 云存储上传

EOF

echo ""
echo "✅ 备份完成!"
echo "📁 备份位置: $BACKUP_DIR"
echo "📄 报告文件: $BACKUP_DIR/backup_report_*.md"
echo "🚀 使用OpenClaw Flow: openclaw-flow process \"创建文件备份工作流\""
