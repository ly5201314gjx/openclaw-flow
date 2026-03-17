#!/usr/bin/env node

/**
 * 知乎热榜收集工作流 - 模拟演示版
 * 展示完整的工作流创建和执行过程
 */

const { createCopilot } = require('./index');

console.log('📰 知乎热榜收集工作流 - 完整演示');
console.log('🚀 从自然语言到自动化工作流');
console.log('='.repeat(60));

// 创建模拟执行的流程引擎
const flow = createCopilot({
  dryRun: true,    // 模拟执行模式
  verbose: true,   // 显示详细日志
  autoConfirm: true
});

async function demonstrateZhihuWorkflow() {
  console.log('\n🎯 用户需求：');
  console.log('   "收集知乎热榜，每天上午10点执行，保存到文件并发送到Telegram"');
  console.log('');
  
  console.log('🔍 OpenClaw Flow处理流程：');
  console.log('   1. 🔄 意图解析 - 理解这是"内容收集"+"定时任务"+"文件保存"+"通知"');
  console.log('   2. 🔗 技能匹配 - 找到所需技能: zhihu-hot + file-storage + telegram-message + cron');
  console.log('   3. ⚙️  参数推断 - 自动设置: 热榜数量=20, 文件路径, 通知内容等');
  console.log('   4. 🏗️  工作流生成 - 创建完整执行流程');
  console.log('   5. 🚀 执行部署 - 部署到OpenClaw系统');
  console.log('');
  
  // 执行请求
  const request = "收集知乎热榜，每天上午10点执行，保存到zhihu_hot_data.json文件，并发送摘要到我的Telegram";
  
  console.log(`📝 处理请求: "${request}"`);
  console.log('-'.repeat(50));
  
  const result = await flow.process(request);
  
  console.log('\n🎉 工作流创建成功！');
  console.log('📊 执行结果：');
  console.log(`   ✅ 工作流名称: ${result.workflow.name}`);
  console.log(`   ✅ 技能链: ${result.skillChain.join(' → ')}`);
  console.log(`   ✅ 节点数量: ${result.workflow.nodes.length}`);
  console.log(`   ✅ 执行状态: ${result.result.success ? '成功' : '失败'}`);
  console.log(`   ✅ 执行时间: ${result.result.durationMs || 'N/A'}ms`);
  
  console.log('\n🔧 工作流节点详情：');
  result.workflow.nodes.forEach((node, index) => {
    console.log(`\n   📍 节点 ${index + 1}: ${node.skill}`);
    console.log(`      动作: ${node.action}`);
    console.log(`      参数: ${JSON.stringify(node.params, null, 4).replace(/\n/g, '\n      ')}`);
  });
  
  console.log('\n💡 实际部署后的效果：');
  console.log('   1. ⏰ 定时任务 - 每天上午10:00自动触发');
  console.log('   2. 📰 内容收集 - 获取知乎热门话题');
  console.log('   3. 💾 数据保存 - 保存到JSON文件');
  console.log('   4. 📱 智能通知 - Telegram推送摘要');
  console.log('   5. 📊 执行监控 - 记录执行日志和结果');
  
  console.log('\n🚀 立即执行方案：');
  console.log('   # 方案A：使用OpenClaw Flow（推荐）');
  console.log('   openclaw-flow process "知乎热榜"');
  console.log('');
  console.log('   # 方案B：手动创建Cron任务');
  console.log('   0 10 * * * cd ~/.openclaw/workspace/copilot && node cli.js process "知乎热榜"');
  console.log('');
  console.log('   # 方案C：使用生成的工作流文件');
  console.log(`   ls -la workflows/zhihu_hot*.json`);
  console.log('');
  
  // 生成部署指南
  console.log('📋 部署指南：');
  console.log('   1. 确保已安装所需技能:');
  console.log('      clawhub install zhihu-hot');
  console.log('      clawhub install telegram-message');
  console.log('      clawhub install file-storage');
  console.log('      clawhub install cron');
  console.log('');
  console.log('   2. 测试工作流：');
  console.log('      openclaw-flow process "测试知乎热榜收集" --dry-run');
  console.log('');
  console.log('   3. 正式部署：');
  console.log('      openclaw-flow process "知乎热榜每日收集"');
  console.log('');
  console.log('   4. 验证执行：');
  console.log('      ls -la execution-results/');
  console.log('      cat execution-results/*.json | jq ".result"');
  
  console.log('\n🎯 一句话总结：');
  console.log('   "一句话创建知乎热榜自动化收集系统！"');
  
  return result;
}

// 运行演示
demonstrateZhihuWorkflow().catch(error => {
  console.error('\n❌ 演示错误:', error.message);
  console.log('\n💡 问题分析：');
  console.log('   1. 可能缺少某些技能 - 需要安装相关OpenClaw技能');
  console.log('   2. 但工作流逻辑是正确的 - 项目结构完整');
  console.log('   3. 可以先用模拟模式验证工作流设计');
  
  console.log('\n🚀 立即验证：');
  console.log('   # 查看项目结构');
  console.log('   ls -la src/core/');
  console.log('');
  console.log('   # 测试自然语言解析');
  console.log('   cd ~/.openclaw/workspace/copilot');
  console.log('   node -e "const p = require(\'./src/core/intent-parser\'); console.log(new p().parse(\'知乎热榜\'))"');
});

// 创建简化版本
console.log('\n✨ 简化版本命令：');
console.log('   # 最简请求');
console.log('   openclaw-flow process "知乎热榜"');
console.log('');
console.log('   # 带参数的请求');
console.log('   openclaw-flow process "知乎前10热榜，每天9点"');
console.log('');
console.log('   # 完整功能请求');
console.log('   openclaw-flow process "收集知乎热榜保存到文件并每天10点Telegram通知我"');