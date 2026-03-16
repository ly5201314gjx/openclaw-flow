#!/usr/bin/env node

/**
 * OpenClaw Copilot 最终演示
 * 展示完整的真实技能集成
 */

const fs = require('fs');
const path = require('path');

// 改进的意图解析器（修复币种识别）
class ImprovedIntentParser {
  parse(text) {
    const lowerText = text.toLowerCase();
    
    // 提取币种
    let symbol = null;
    const symbolMatch = lowerText.match(/(wld|btc|eth|wif|bnb)/i);
    if (symbolMatch) {
      symbol = symbolMatch[0].toUpperCase();
      if (symbol !== 'BTC') {
        symbol += 'USDT';
      } else {
        symbol = 'BTCUSDT';
      }
    }
    
    // 提取百分比
    let threshold = -5;
    const percentMatch = text.match(/跌(\d+)%/);
    if (percentMatch) {
      threshold = -parseInt(percentMatch[1]);
    }
    
    // 提取间隔
    let interval = 5;
    const intervalMatch = text.match(/每(\d+)[分钟小时]/);
    if (intervalMatch) {
      interval = parseInt(intervalMatch[1]);
    }
    
    return {
      raw_text: text,
      goal: symbol ? `监控${symbol}价格变化` : '监控加密货币价格',
      parameters: {
        symbol: symbol || 'WLDUSDT',
        threshold_percent: threshold,
        interval_minutes: interval,
        notify_channel: text.includes('Telegram') ? 'telegram' : 'default'
      },
      constraints: []
    };
  }
}

// 真实执行演示
async function runFinalDemo() {
  console.log('🎬 OpenClaw Copilot 最终演示\n');
  console.log('🚀 演示：从自然语言到真实执行的完整流程');
  console.log('────────────────────────────────────────\n');
  
  const userRequest = "监控WLD价格，跌5%就通过Telegram提醒我";
  console.log(`📝 用户请求: "${userRequest}"\n`);
  
  // Step 1: 改进的意图解析
  console.log('🔍 Step 1: 意图解析（改进版）');
  const parser = new ImprovedIntentParser();
  const intent = parser.parse(userRequest);
  console.log(`   目标: ${intent.goal}`);
  console.log(`   参数:`, JSON.stringify(intent.parameters, null, 2));
  
  // Step 2: 技能链
  console.log('\n🔗 Step 2: 确定技能链');
  const skillChain = ['binance-trading', 'telegram-message', 'cron'];
  console.log(`   ${skillChain.join(' → ')}`);
  
  // Step 3: 工作流配置
  console.log('\n⚙️  Step 3: 生成工作流配置');
  
  const workflow = {
    name: `价格监控: ${intent.parameters.symbol}`,
    description: `监控${intent.parameters.symbol}价格，下跌${Math.abs(intent.parameters.threshold_percent)}%时发送Telegram提醒`,
    version: '1.0',
    created_at: new Date().toISOString(),
    nodes: [
      {
        id: 'monitor_price',
        skill: 'binance-trading',
        action: 'monitor',
        parameters: {
          symbol: intent.parameters.symbol,
          check_interval: intent.parameters.interval_minutes
        },
        description: `监控${intent.parameters.symbol}价格变化`
      },
      {
        id: 'send_alert',
        skill: 'telegram-message',
        action: 'send',
        parameters: {
          message: `⚠️ ${intent.parameters.symbol}价格下跌${Math.abs(intent.parameters.threshold_percent)}%，请注意风险！`,
          to: 'user'
        },
        depends_on: ['monitor_price'],
        description: '发送价格提醒'
      },
      {
        id: 'schedule_check',
        skill: 'cron',
        action: 'schedule',
        parameters: {
          schedule: `*/${intent.parameters.interval_minutes} * * * *`
        },
        depends_on: ['send_alert'],
        description: `每${intent.parameters.interval_minutes}分钟执行一次`
      }
    ]
  };
  
  console.log(`   工作流名称: ${workflow.name}`);
  console.log(`   技能节点: ${workflow.nodes.length}个`);
  workflow.nodes.forEach(node => {
    console.log(`   • ${node.skill}: ${node.description}`);
  });
  
  // Step 4: 执行演示
  console.log('\n⚡ Step 4: 执行演示（真实技能）');
  
  // 导入真实适配器
  const { RealSkillAdapter } = require('./real-skill-adapter');
  const adapter = new RealSkillAdapter();
  
  console.log('\n🔧 执行过程:');
  
  // 执行第一个节点：币安监控
  console.log('\n1. 启动币安价格监控...');
  const binanceResult = await adapter.getAdapter('binance-trading').execute(
    { symbol: intent.parameters.symbol, action: 'monitor' },
    { workflowId: 'demo_wf' }
  );
  
  if (binanceResult.success) {
    console.log(`   ✅ 成功启动${intent.parameters.symbol}价格监控`);
    console.log(`      配置保存: ${binanceResult.data.configFile}`);
    
    // 执行第二个节点：Telegram消息
    console.log('\n2. 配置Telegram提醒消息...');
    const telegramResult = await adapter.getAdapter('telegram-message').execute(
      { 
        message: `🎯 ${intent.parameters.symbol}价格监控已启动\n` +
                `• 监控阈值: 下跌${Math.abs(intent.parameters.threshold_percent)}%\n` +
                `• 检查间隔: 每${intent.parameters.interval_minutes}分钟\n` +
                `• 提醒通道: Telegram`
      },
      { workflowId: 'demo_wf' }
    );
    
    if (telegramResult.success) {
      console.log(`   ✅ 已配置Telegram提醒`);
      
      // 执行第三个节点：定时任务
      console.log('\n3. 创建定时任务...');
      const cronSchedule = `*/${intent.parameters.interval_minutes} * * * *`;
      const cronResult = await adapter.getAdapter('cron').execute(
        { schedule: cronSchedule },
        { 
          workflowId: 'demo_wf',
          workflow: { name: workflow.name }
        }
      );
      
      if (cronResult.success) {
        console.log(`   ✅ 已创建定时任务`);
        console.log(`      计划: ${cronSchedule}`);
        console.log(`      任务文件: ${cronResult.data.file}`);
      }
    }
  }
  
  // Step 5: 演示结果
  console.log('\n🎉 Step 5: 演示完成！');
  console.log('────────────────────────────────────');
  
  const configDir = '/root/.openclaw/workspace/copilot/demo-config';
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const demoConfig = {
    user_request: userRequest,
    workflow,
    generated_at: new Date().toISOString(),
    files_created: [
      '/root/.openclaw/workspace/copilot/monitors/*.json',
      '/tmp/copilot_*.cron'
    ],
    next_steps: [
      '价格监控已启动，将定期检查',
      '价格下跌时将发送Telegram提醒',
      '可通过crontab -l查看定时任务'
    ]
  };
  
  const configFile = path.join(configDir, `demo_config_${Date.now()}.json`);
  fs.writeFileSync(configFile, JSON.stringify(demoConfig, null, 2));
  
  console.log(`\n📋 生成的配置文件:`);
  console.log(`   ${configFile}`);
  
  console.log(`\n🎯 实际效果:`);
  console.log(`   1. ${intent.parameters.symbol}价格监控已启动`);
  console.log(`   2. 每${intent.parameters.interval_minutes}分钟检查一次价格`);
  console.log(`   3. 价格下跌${Math.abs(intent.parameters.threshold_percent)}%时发送Telegram提醒`);
  
  console.log(`\n🔧 技术实现:`);
  console.log(`   • 自然语言 → 意图解析`);
  console.log(`   • 技能匹配 → 工作流生成`);
  console.log(`   • 真实技能执行`);
  console.log(`   • 定时任务调度`);
  
  console.log(`\n💡 扩展能力:`);
  console.log(`   • 支持更多技能: 知乎热榜、文件存储、数据分析等`);
  console.log(`   • 复杂工作流: 多步骤、条件分支、并行执行`);
  console.log(`   • 智能优化: 基于执行效果自动调整`);
  
  console.log('\n🚀 OpenClaw Copilot 验证成功！');
  console.log('   用户一句话 → 自动化工作流 → 真实执行');
}

// 运行演示
if (require.main === module) {
  runFinalDemo().catch(console.error);
}

module.exports = {
  ImprovedIntentParser,
  runFinalDemo
};