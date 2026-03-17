#!/usr/bin/env node

/**
 * 知乎热榜收集工作流 - 定制版
 * 每天上午10点执行，保存到文件并发送到Telegram
 */

const { createCopilot } = require('./index');

console.log('📰 创建知乎热榜收集工作流（定制版）');
console.log('='.repeat(60));

const flow = createCopilot({
  dryRun: false,
  verbose: true,
  autoConfirm: true
});

async function createZhihuWorkflow() {
  console.log('\n🎯 工作流需求：');
  console.log('   1. 收集知乎热榜（前20条）');
  console.log('   2. 每天上午10点自动执行');
  console.log('   3. 保存结果到文件');
  console.log('   4. 发送摘要到Telegram');
  console.log('');
  
  // 更精确的请求
  const request = "收集知乎前20个热榜话题，每天上午10点执行，保存到zhihu_hot_today.json文件，并发送摘要到Telegram";
  
  console.log(`📝 请求: "${request}"`);
  console.log('-'.repeat(50));
  
  const result = await flow.process(request);
  
  console.log('\n🎉 工作流详情：');
  console.log(`📋 名称: ${result.workflow.name}`);
  console.log(`🔗 技能链: ${result.skillChain.join(' → ')}`);
  console.log(`⏰ 定时: 每天上午10点`);
  console.log(`💾 保存: zhihu_hot_today.json`);
  console.log(`📱 通知: Telegram`);
  console.log(`⚡ 状态: ${result.result.success ? '✅ 成功' : '❌ 失败'}`);
  
  if (result.result.success) {
    console.log('\n💡 工作流已部署：');
    console.log('   1. 知乎热榜收集器 - 每天10:00自动运行');
    console.log('   2. 数据处理器 - 提取前20热门话题');
    console.log('   3. 文件保存器 - 保存到JSON文件');
    console.log('   4. 通知发送器 - Telegram摘要推送');
    console.log('   5. 定时调度器 - Cron任务管理');
    
    console.log('\n📊 执行详情：');
    console.log(`   工作流ID: ${result.workflow.id}`);
    console.log(`   节点数量: ${result.workflow.nodes.length}`);
    console.log(`   执行时间: ${result.result.durationMs}ms`);
    
    // 显示保存的文件路径
    const execResults = require('./execution-results/result_' + result.workflow.id + '_success.json');
    console.log(`   结果文件: ${execResults.filePath || 'execution-results/' + result.workflow.id + '_success.json'}`);
  }
  
  // 创建手动执行脚本
  console.log('\n🚀 手动执行命令：');
  console.log('   # 立即执行一次');
  console.log('   openclaw-flow process "获取知乎当前热榜前20话题"');
  console.log('');
  console.log('   # 查看已创建的工作流');
  console.log('   ls -la execution-results/*.json | grep zhihu');
  console.log('');
  console.log('   # 测试简化版本');
  console.log('   openclaw-flow process "知乎热榜"');
  
  return result;
}

// 运行
createZhihuWorkflow().catch(error => {
  console.error('❌ 创建失败:', error.message);
  console.log('\n💡 备用方案：');
  console.log('   1. 安装zhihu-hot技能: clawhub install zhihu-hot');
  console.log('   2. 简化请求: openclaw-flow process "知乎热榜"');
});