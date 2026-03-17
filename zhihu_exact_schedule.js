#!/usr/bin/env node

/**
 * 知乎热榜精确调度工作流
 * 使用明确的Cron表达式：每天上午10点
 */

const fs = require('fs');
const path = require('path');

// 创建工作流定义
const workflow = {
  id: 'zhihu_hot_daily_' + Date.now(),
  name: '知乎热榜每日收集',
  description: '每天上午10点收集知乎热榜前20话题，保存并通知',
  schedule: '0 10 * * *', // 每天上午10点
  nodes: [
    {
      id: 'node_zhihu',
      skill: 'zhihu-hot',
      action: 'get_hot_list',
      params: {
        limit: 20,
        category: 'all'
      }
    },
    {
      id: 'node_save',
      skill: 'file-storage',
      action: 'save',
      params: {
        path: '/data/zhihu_hot/zhihu_hot_' + new Date().toISOString().split('T')[0] + '.json',
        content: '{{node_zhihu.result}}'
      }
    },
    {
      id: 'node_notify',
      skill: 'telegram-message',
      action: 'send',
      params: {
        message: '📰 知乎热榜已更新！前20话题已保存。',
        to: 'user'
      }
    }
  ]
};

// 保存工作流定义
const workflowsDir = path.join(__dirname, 'workflows');
if (!fs.existsSync(workflowsDir)) {
  fs.mkdirSync(workflowsDir, { recursive: true });
}

const workflowFile = path.join(workflowsDir, `zhihu_hot_daily_${Date.now()}.json`);
fs.writeFileSync(workflowFile, JSON.stringify(workflow, null, 2));

console.log('📰 知乎热榜精确调度工作流');
console.log('='.repeat(60));
console.log('\n🎯 工作流配置：');
console.log(`📋 ID: ${workflow.id}`);
console.log(`📝 名称: ${workflow.name}`);
console.log(`⏰ 调度: ${workflow.schedule} (每天上午10点)`);
console.log(`📁 保存: ${workflowFile}`);
console.log('');

console.log('🔗 技能链：');
workflow.nodes.forEach((node, index) => {
  console.log(`   ${index + 1}. ${node.skill} → ${node.action}`);
});

console.log('\n📊 节点详情：');
workflow.nodes.forEach((node, index) => {
  console.log(`\n   🔸 节点 ${index + 1}: ${node.skill}`);
  console.log(`      动作: ${node.action}`);
  console.log(`      参数: ${JSON.stringify(node.params, null, 6).replace(/\n/g, '\n      ')}`);
});

console.log('\n🚀 立即执行命令：');
console.log('   # 使用OpenClaw Flow执行');
console.log(`   openclaw-flow process "知乎热榜前20，保存文件，Telegram通知"`);
console.log('');
console.log('   # 手动创建Cron任务');
console.log('   0 10 * * * cd /path/to/openclaw-flow && node cli.js process "知乎热榜"');
console.log('');
console.log('   # 测试单次执行');
console.log('   openclaw-flow process "获取知乎当前热榜"');

// 创建执行脚本
const execScript = `#!/bin/bash
# 知乎热榜每日收集脚本
# 自动生成 by OpenClaw Flow

echo "📰 开始知乎热榜收集 $(date)"
cd ${__dirname}

# 执行收集
node cli.js process "收集知乎热榜前20话题"

echo "✅ 收集完成 $(date)"
`;

const scriptPath = path.join(__dirname, 'zhihu_hot_daily.sh');
fs.writeFileSync(scriptPath, execScript);
fs.chmodSync(scriptPath, '755');

console.log(`\n📜 执行脚本已创建: ${scriptPath}`);
console.log(`💡 可以添加到Cron: 0 10 * * * ${scriptPath}`);

console.log('\n🎉 工作流创建完成！');
console.log('💪 老大，知乎热榜自动化收集系统已就绪！');