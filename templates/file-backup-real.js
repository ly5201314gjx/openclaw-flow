#!/usr/bin/env node

/**
 * 文件备份自动化工作流 - 真实可用模板
 * 定时备份重要文件到本地和云存储
 */

const fs = require('fs');
const path = require('path');

console.log('💾 文件备份自动化工作流模板');
console.log('='.repeat(60));

const workflow = {
  id: 'file_backup_' + Date.now(),
  name: '智能文件备份系统',
  description: '定时备份重要目录，支持本地、云存储和多版本管理',
  schedule: '0 2 * * *', // 每天凌晨2点执行
  backup_targets: [
    '~/workspace - 工作目录',
    '~/.openclaw - 配置和技能',
    '/etc/important - 系统配置'
  ],
  triggers: [
    '每天凌晨2点备份workspace目录',
    '每周日备份整个.openclaw配置',
    '文件变化时自动备份'
  ],
  real_commands: [
    'openclaw-flow process "备份workspace目录到云存储"',
    'openclaw-flow process "每天凌晨2点自动备份"',
    'openclaw-flow process "创建文件备份工作流"'
  ],
  workflow_steps: [
    {
      step: 1,
      action: '检查磁盘空间',
      skill: 'system-monitor',
      command: 'system-monitor check_disk /',
      params: { threshold: 85 },
      note: '确保有足够空间进行备份'
    },
    {
      step: 2,
      action: '创建备份目录',
      skill: 'file-processor',
      command: 'file-processor create_dir /backups/{{date}}',
      params: { path: '/backups/{{date}}', recursive: true }
    },
    {
      step: 3,
      action: '压缩workspace目录',
      skill: 'file-processor',
      command: 'file-processor compress ~/workspace',
      params: {
        source: '~/workspace',
        target: '/backups/{{date}}/workspace_{{timestamp}}.zip',
        exclude: ['node_modules', '.git', '*.log']
      }
    },
    {
      step: 4,
      action: '备份.openclaw配置',
      skill: 'file-processor',
      command: 'file-processor copy ~/.openclaw',
      params: {
        source: '~/.openclaw',
        target: '/backups/{{date}}/openclaw_config.tar.gz',
        compress: true
      }
    },
    {
      step: 5,
      action: '上传到云存储',
      skill: 'cloud-storage',
      command: 'cloud-storage upload /backups/{{date}}',
      params: {
        provider: 's3', // 或 oss, cos, google-drive等
        bucket: 'your-backup-bucket',
        local_path: '/backups/{{date}}',
        remote_path: 'backups/{{date}}'
      },
      note: '需要配置云存储凭证'
    },
    {
      step: 6,
      action: '清理旧备份',
      skill: 'file-processor',
      command: 'file-processor cleanup /backups',
      params: {
        path: '/backups',
        keep_days: 30,
        pattern: '*.zip,*.tar.gz'
      }
    },
    {
      step: 7,
      action: '发送备份报告',
      skill: 'telegram-message',
      command: 'telegram-message send "备份完成报告"',
      params: {
        message: '✅ 文件备份已完成!\n📅 时间: {{timestamp}}\n💾 大小: {{size}}\n📁 位置: {{location}}',
        to: 'user'
      }
    }
  ],
  installation_requirements: [
    '文件处理: clawhub install file-processor',
    '系统监控: clawhub install system-monitor',
    '通知: clawhub install telegram-message',
    '云存储: 根据需要安装相应技能'
  ],
  quick_test: 'openclaw-flow process "测试文件备份" --dry-run',
  benefits: [
    '定时自动备份，无需人工干预',
    '支持多目标目录备份',
    '云存储同步，数据更安全',
    '智能清理，避免磁盘满',
    '备份报告，随时掌握状态'
  ]
};

// 保存模板
const templatesDir = path.join(__dirname, '..', 'workflow-templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

const templateFile = path.join(templatesDir, 'file-backup-real.json');
fs.writeFileSync(templateFile, JSON.stringify(workflow, null, 2));

console.log('\n🎯 模板详情:');
console.log(`📋 名称: ${workflow.name}`);
console.log(`📝 描述: ${workflow.description}`);
console.log(`⏰ 调度: ${workflow.schedule} (每天凌晨2点)`);
console.log(`💾 备份目标: ${workflow.backup_targets.length}个目录`);
console.log(`💾 保存: ${templateFile}`);
console.log('');

console.log('🚀 立即使用命令:');
workflow.real_commands.forEach((cmd, i) => {
  console.log(`   ${i + 1}. ${cmd}`);
});

console.log('\n🔧 安装要求:');
workflow.installation_requirements.forEach((req, i) => {
  console.log(`   ${i + 1}. ${req}`);
});

console.log('\n💡 工作流步骤:');
workflow.workflow_steps.forEach(step => {
  console.log(`   ${step.step}. ${step.action} [${step.skill}]`);
  if (step.note) {
    console.log(`      💡 ${step.note}`);
  }
});

console.log('\n✅ 优势:');
workflow.benefits.forEach((benefit, i) => {
  console.log(`   ✓ ${benefit}`);
});

// 创建简单备份脚本
const backupScript = `#!/bin/bash
# 简易文件备份脚本
# 完整功能需使用OpenClaw Flow

echo "💾 文件备份系统"
echo "========================"

BACKUP_DIR="/backups/\$(date +%Y%m%d)"
mkdir -p "\$BACKUP_DIR"

echo ""
echo "📅 备份时间: \$(date)"
echo "💾 备份目录: \$BACKUP_DIR"

# 备份workspace目录
echo ""
echo "1. 备份workspace目录..."
if [ -d "\$HOME/workspace" ]; then
  tar -czf "\$BACKUP_DIR/workspace_\$(date +%H%M).tar.gz" -C "\$HOME" workspace --exclude=node_modules --exclude=.git
  echo "   ✅ workspace备份完成"
else
  echo "   ⚠️  workspace目录不存在"
fi

# 备份.openclaw配置
echo ""
echo "2. 备份.openclaw配置..."
if [ -d "\$HOME/.openclaw" ]; then
  tar -czf "\$BACKUP_DIR/openclaw_\$(date +%H%M).tar.gz" -C "\$HOME" .openclaw
  echo "   ✅ .openclaw备份完成"
else
  echo "   ⚠️  .openclaw目录不存在"
fi

# 生成报告
echo ""
echo "3. 生成备份报告..."
BACKUP_SIZE=\$(du -sh "\$BACKUP_DIR" | cut -f1)
cat > "\$BACKUP_DIR/backup_report_\$(date +%H%M).md" << EOF
# 文件备份报告
## 备份时间: \$(date)

### 📊 备份概况
- 备份目录: \$BACKUP_DIR
- 总大小: \$BACKUP_SIZE
- 包含内容:
  - workspace目录
  - .openclaw配置

### 🚀 使用OpenClaw Flow增强功能
运行以下命令启用高级备份功能:

\`\`\`bash
# 创建完整备份工作流
openclaw-flow process "每天凌晨2点备份workspace目录"

# 添加云存储备份
openclaw-flow process "备份到云存储并发送通知"

# 智能清理旧备份
openclaw-flow process "自动清理30天前备份"
\`\`\`

### 📋 所需技能
- file-processor: 文件压缩和处理
- system-monitor: 磁盘空间检查
- telegram-message: 备份通知
- cloud-storage: 云存储上传

EOF

echo ""
echo "✅ 备份完成!"
echo "📁 备份位置: \$BACKUP_DIR"
echo "📄 报告文件: \$BACKUP_DIR/backup_report_*.md"
echo "🚀 使用OpenClaw Flow: openclaw-flow process \\"创建文件备份工作流\\""
`;

const scriptFile = path.join(templatesDir, 'simple-backup.sh');
fs.writeFileSync(scriptFile, backupScript);
fs.chmodSync(scriptFile, '755');

console.log(`\n📜 备份脚本: ${scriptFile}`);
console.log(`\n🎉 模板创建完成！`);
console.log(`💪 老大，智能文件备份系统已就绪！`);