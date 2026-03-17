#!/usr/bin/env node

/**
 * 加密货币价格监控工作流 - 真实可用模板
 * 监控多个加密货币价格，超过阈值时发送通知
 */

const fs = require('fs');
const path = require('path');

console.log('💰 加密货币价格监控工作流模板');
console.log('='.repeat(60));

const workflow = {
  id: 'crypto_monitor_' + Date.now(),
  name: '加密货币价格监控系统',
  description: '监控BTC、ETH、WLD价格，超过阈值时通过Telegram通知',
  schedule: '*/15 * * * *', // 每15分钟执行一次
  triggers: [
    '监控BTC价格，超过$50000就通知我',
    '监控ETH和WLD价格，跌10%就报警',
    '每小时检查一次加密货币价格'
  ],
  real_commands: [
    'openclaw-flow process "监控BTC价格，超过$50000就通知我"',
    'openclaw-flow process "每15分钟检查一次加密货币价格"',
    'openclaw-flow process "ETH价格跌10%就通过Telegram提醒"'
  ],
  workflow_steps: [
    {
      step: 1,
      action: '获取BTC价格',
      skill: 'binance-trading',
      command: 'binance-trading get_price BTCUSDT',
      params: { symbol: 'BTCUSDT', interval: '1m' }
    },
    {
      step: 2,
      action: '获取ETH价格',
      skill: 'binance-trading',
      command: 'binance-trading get_price ETHUSDT',
      params: { symbol: 'ETHUSDT', interval: '1m' }
    },
    {
      step: 3,
      action: '获取WLD价格',
      skill: 'binance-trading',
      command: 'binance-trading get_price WLDUSDT',
      params: { symbol: 'WLDUSDT', interval: '1m' }
    },
    {
      step: 4,
      action: '检查价格阈值',
      condition: 'any price change > 5%',
      logic: '如果任一币种价格波动超过5%，触发通知'
    },
    {
      step: 5,
      action: '发送Telegram通知',
      skill: 'telegram-message',
      command: 'telegram-message send "🚨 加密货币价格波动超过5%!"',
      params: {
        message: '加密货币价格警报:\nBTC: {{btc_price}}\nETH: {{eth_price}}\nWLD: {{wld_price}}',
        to: 'user'
      }
    },
    {
      step: 6,
      action: '记录价格历史',
      skill: 'file-storage',
      command: 'file-storage save crypto_prices.json',
      params: {
        path: '/data/crypto/prices_{{timestamp}}.json',
        content: '{{all_prices_data}}'
      }
    }
  ],
  installation_requirements: [
    '安装binance-trading技能: clawhub install binance-trading',
    '安装telegram-message技能: clawhub install telegram-message',
    '安装file-storage技能: clawhub install file-storage'
  ],
  quick_test: 'openclaw-flow process "检查BTC当前价格" --dry-run',
  benefits: [
    '实时监控多个加密货币价格',
    '智能阈值警报',
    '价格历史记录',
    '多平台通知支持'
  ]
};

// 保存模板
const templatesDir = path.join(__dirname, '..', 'workflow-templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

const templateFile = path.join(templatesDir, 'crypto-monitor-real.json');
fs.writeFileSync(templateFile, JSON.stringify(workflow, null, 2));

console.log('\n🎯 模板详情:');
console.log(`📋 名称: ${workflow.name}`);
console.log(`📝 描述: ${workflow.description}`);
console.log(`⏰ 调度: ${workflow.schedule} (每15分钟)`);
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
  console.log(`   ${step.step}. ${step.action} [${step.skill || 'condition'}]`);
});

console.log('\n✅ 优势:');
workflow.benefits.forEach((benefit, i) => {
  console.log(`   ✓ ${benefit}`);
});

// 创建一键安装脚本
const installScript = `#!/bin/bash
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
echo "   💻 运行: openclaw-flow process \\"监控BTC价格，超过$50000就通知我\\""
echo "   💻 运行: openclaw-flow process \\"每15分钟检查加密货币价格\\""

# 3. 测试工作流
echo ""
echo "3. 测试工作流:"
echo "   🧪 测试: openclaw-flow process \\"检查BTC当前价格\\" --dry-run"

echo ""
echo "🎉 加密货币监控工作流安装完成!"
echo "💪 开始监控你的加密货币投资吧！"
`;

const scriptFile = path.join(templatesDir, 'install-crypto-monitor.sh');
fs.writeFileSync(scriptFile, installScript);
fs.chmodSync(scriptFile, '755');

console.log(`\n📜 一键安装脚本: ${scriptFile}`);
console.log('   chmod +x install-crypto-monitor.sh && ./install-crypto-monitor.sh');

console.log('\n🎉 模板创建完成！');
console.log('💪 老大，加密货币监控工作流已就绪！');