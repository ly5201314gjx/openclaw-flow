#!/usr/bin/env node

/**
 * 系统健康监控工作流 - 真实可用模板
 * 监控服务器/设备状态，异常时自动报警
 */

const fs = require('fs');
const path = require('path');

console.log('🖥️  系统健康监控工作流模板');
console.log('='.repeat(60));

const workflow = {
  id: 'system_monitor_' + Date.now(),
  name: '智能系统监控报警系统',
  description: '监控CPU、内存、磁盘、网络等关键指标，异常时多渠道报警',
  schedule: '*/5 * * * *', // 每5分钟执行一次
  monitoring_targets: [
    'CPU使用率 > 80%',
    '内存使用率 > 85%',
    '磁盘使用率 > 90%',
    '网络连接数异常',
    '服务进程状态'
  ],
  triggers: [
    '监控系统状态，异常时报警',
    '每5分钟检查一次服务器健康',
    '磁盘空间不足时立即通知'
  ],
  real_commands: [
    'openclaw-flow process "监控系统CPU和内存使用率"',
    'openclaw-flow process "磁盘空间不足90%时报警"',
    'openclaw-flow process "创建系统健康监控工作流"'
  ],
  workflow_steps: [
    {
      step: 1,
      action: '收集系统指标',
      skill: 'system-monitor',
      command: 'system-monitor collect_all',
      params: {
        metrics: ['cpu', 'memory', 'disk', 'network', 'process'],
        interval: 60
      }
    },
    {
      step: 2,
      action: '检查CPU使用率',
      condition: 'cpu_usage > 80',
      if_true: {
        action: '记录CPU警报',
        skill: 'file-storage',
        params: {
          path: '/logs/alerts/cpu_alert_{{timestamp}}.json',
          content: 'CPU使用率过高: {{cpu_usage}}%'
        }
      }
    },
    {
      step: 3,
      action: '检查内存使用率',
      condition: 'memory_usage > 85',
      if_true: {
        action: '发送紧急通知',
        skill: 'telegram-message',
        params: {
          message: '🚨 内存使用率过高: {{memory_usage}}%!',
          to: 'admin',
          priority: 'high'
        }
      }
    },
    {
      step: 4,
      action: '检查磁盘空间',
      condition: 'disk_usage > 90',
      if_true: {
        action: '清理临时文件',
        skill: 'file-processor',
        params: {
          action: 'cleanup',
          path: '/tmp',
          older_than_days: 7,
          max_files: 100
        }
      }
    },
    {
      step: 5,
      action: '检查关键服务',
      skill: 'system-monitor',
      command: 'system-monitor check_service',
      params: {
        services: ['openclaw', 'nginx', 'postgres', 'redis'],
        timeout: 10
      }
    },
    {
      step: 6,
      action: '生成健康报告',
      skill: 'template-engine',
      command: 'template-engine render health_report',
      params: {
        template: 'system_health_report.md',
        data: '{{all_metrics}}',
        format: 'markdown'
      }
    },
    {
      step: 7,
      action: '发送每日报告',
      skill: 'telegram-message',
      command: 'telegram-message send "系统健康日报"',
      params: {
        message: '📊 系统健康日报已生成',
        to: 'admin',
        attach_file: '{{report_file}}'
      },
      schedule: '0 9 * * *' // 每天上午9点发送日报
    }
  ],
  installation_requirements: [
    '系统监控: clawhub install system-monitor',
    '文件处理: clawhub install file-processor',
    '通知: clawhub install telegram-message',
    '模板引擎: clawhub install template-engine (可选)'
  ],
  alert_channels: [
    'Telegram - 即时通知',
    'Email - 正式报告',
    'Webhook - 集成第三方',
    'Log file - 历史记录'
  ],
  quick_test: 'openclaw-flow process "检查当前系统状态" --dry-run',
  benefits: [
    '实时监控，及时发现异常',
    '智能阈值，减少误报',
    '自动修复，降低人工干预',
    '多级警报，紧急情况立即响应',
    '历史记录，便于问题排查'
  ]
};

// 保存模板
const templatesDir = path.join(__dirname, '..', 'workflow-templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

const templateFile = path.join(templatesDir, 'system-monitor-real.json');
fs.writeFileSync(templateFile, JSON.stringify(workflow, null, 2));

console.log('\n🎯 模板详情:');
console.log(`📋 名称: ${workflow.name}`);
console.log(`📝 描述: ${workflow.description}`);
console.log(`⏰ 调度: ${workflow.schedule} (每5分钟)`);
console.log(`📊 监控目标: ${workflow.monitoring_targets.length}个关键指标`);
console.log(`📡 报警渠道: ${workflow.alert_channels.join(', ')}`);
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
  if (step.condition) {
    console.log(`   ${step.step}. ${step.action} [条件: ${step.condition}]`);
  } else {
    console.log(`   ${step.step}. ${step.action} [${step.skill}]`);
  }
});

console.log('\n✅ 优势:');
workflow.benefits.forEach((benefit, i) => {
  console.log(`   ✓ ${benefit}`);
});

// 创建简单监控脚本
const monitorScript = `#!/bin/bash
# 简易系统监控脚本
# 完整功能需使用OpenClaw Flow

echo "🖥️  系统健康监控"
echo "========================"

echo ""
echo "📅 监控时间: \$(date)"
echo "🖥️  主机名: \$(hostname)"

# 收集系统指标
echo ""
echo "📊 收集系统指标..."

# CPU使用率
CPU_USAGE=\$(top -bn1 | grep "Cpu(s)" | awk '{print \$2}' | cut -d'%' -f1)
echo "   CPU使用率: \${CPU_USAGE}%"

# 内存使用率
MEM_TOTAL=\$(free -m | awk 'NR==2{print \$2}')
MEM_USED=\$(free -m | awk 'NR==2{print \$3}')
MEM_PERCENT=\$((MEM_USED * 100 / MEM_TOTAL))
echo "   内存使用率: \${MEM_PERCENT}% (\${MEM_USED}M/\${MEM_TOTAL}M)"

# 磁盘使用率
DISK_USAGE=\$(df -h / | awk 'NR==2{print \$5}' | tr -d '%')
echo "   磁盘使用率: \${DISK_USAGE}%"

# 生成报告
LOG_DIR="/logs/system-monitor/\$(date +%Y%m%d)"
mkdir -p "\$LOG_DIR"

REPORT_FILE="\$LOG_DIR/system_report_\$(date +%H%M).md"
cat > "\$REPORT_FILE" << EOF
# 系统健康报告
## 报告时间: \$(date)

### 📊 系统指标
- **CPU使用率**: \${CPU_USAGE}%
- **内存使用率**: \${MEM_PERCENT}%
- **磁盘使用率**: \${DISK_USAGE}%
- **负载**: \$(uptime | awk -F'load average:' '{print \$2}')

### ⚠️  健康状态
EOF

# 检查健康状态
ALERTS=""
if [ "\$CPU_USAGE" -gt 80 ]; then
  ALERTS="\${ALERTS}- 🚨 CPU使用率过高: \${CPU_USAGE}%\\n"
fi
if [ "\$MEM_PERCENT" -gt 85 ]; then
  ALERTS="\${ALERTS}- 🚨 内存使用率过高: \${MEM_PERCENT}%\\n"
fi
if [ "\$DISK_USAGE" -gt 90 ]; then
  ALERTS="\${ALERTS}- 🚨 磁盘空间不足: \${DISK_USAGE}%\\n"
fi

if [ -n "\$ALERTS" ]; then
  cat >> "\$REPORT_FILE" << EOF
发现以下问题:

\${ALERTS}

建议立即检查!
EOF
else
  cat >> "\$REPORT_FILE" << EOF
✅ 所有指标正常

系统运行健康，无需干预。
EOF
fi

cat >> "\$REPORT_FILE" << EOF

### 🚀 使用OpenClaw Flow增强监控
运行以下命令启用智能监控:

\`\`\`bash
# 创建监控工作流
openclaw-flow process "监控系统状态，异常时报警"

# 定时检查
openclaw-flow process "每5分钟检查一次系统健康"

# 添加通知
openclaw-flow process "CPU超过80%时发送Telegram通知"
\`\`\`

### 📋 所需技能
- system-monitor: 系统指标收集
- file-processor: 日志管理
- telegram-message: 报警通知
- cron: 定时执行

EOF

echo ""
echo "✅ 监控完成!"
echo "📄 报告文件: \$REPORT_FILE"

if [ -n "\$ALERTS" ]; then
  echo ""
  echo "⚠️  发现系统问题，请检查!"
fi

echo ""
echo "🚀 使用OpenClaw Flow: openclaw-flow process \\"创建系统监控工作流\\""
`;

const scriptFile = path.join(templatesDir, 'simple-monitor.sh');
fs.writeFileSync(scriptFile, monitorScript);
fs.chmodSync(scriptFile, '755');

console.log(`\n📜 监控脚本: ${scriptFile}`);
console.log(`\n🎉 模板创建完成！`);
console.log(`💪 老大，智能系统监控系统已就绪！`);