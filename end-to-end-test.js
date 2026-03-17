#!/usr/bin/env node

/**
 * OpenClaw Copilot 端到端测试
 * 从自然语言到工作流执行的完整流程
 */

const fs = require('fs');
const path = require('path');

// 导入原型系统
const { 
  IntentParser, 
  SkillMatcher, 
  ParameterInferrer, 
  WorkflowGenerator,
  skillCatalog 
} = require('./prototype');

// 导入执行引擎
const { WorkflowExecutor } = require('./workflow-engine');

async function testEndToEnd(userInput) {
  console.log(`\n🚀 端到端测试: "${userInput}"`);
  console.log('─'.repeat(60));
  
  // ========== Phase 1: 意图解析 ==========
  console.log('\n🔍 Phase 1: 意图解析');
  const parser = new IntentParser();
  const intent = parser.parse(userInput);
  console.log(`   目标: ${intent.goal}`);
  console.log(`   类型: ${intent.intent_types.join(', ')}`);
  console.log(`   参数:`, JSON.stringify(intent.parameters, null, 2));
  
  // ========== Phase 2: 技能匹配 ==========
  console.log('\n🔗 Phase 2: 技能匹配');
  const matcher = new SkillMatcher();
  const skillChain = matcher.match(intent);
  console.log(`   匹配技能链: ${skillChain.join(' → ')}`);
  
  // ========== Phase 3: 参数推断 ==========
  console.log('\n⚙️  Phase 3: 参数推断');
  const inferrer = new ParameterInferrer();
  const skillParams = inferrer.inferParameters(intent, skillChain);
  console.log(`   推断参数:`);
  for (const [skill, params] of Object.entries(skillParams)) {
    console.log(`     ${skill}:`, JSON.stringify(params, null, 2));
  }
  
  // ========== Phase 4: 工作流生成 ==========
  console.log('\n📋 Phase 4: 工作流生成');
  const generator = new WorkflowGenerator();
  const workflow = generator.generate(intent, skillChain, skillParams);
  console.log(`   生成工作流: ${workflow.name}`);
  console.log(`   包含 ${workflow.nodes.length} 个节点`);
  
  // 优化工作流结构（修复依赖）
  const optimizedWorkflow = optimizeWorkflow(workflow);
  
  // ========== Phase 5: 工作流执行 ==========
  console.log('\n⚡ Phase 5: 工作流执行');
  const executor = new WorkflowExecutor({
    dryRun: true,
    verbose: false
  });
  
  const startTime = Date.now();
  const result = await executor.execute(optimizedWorkflow);
  const duration = Date.now() - startTime;
  
  console.log(`   执行耗时: ${duration}ms`);
  console.log(`   执行状态: ${result.success ? '✅ 成功' : '❌ 失败'}`);
  console.log(`   成功节点: ${Object.values(result.results).filter(r => r.success).length}`);
  
  if (!result.success && result.error) {
    console.log(`   错误信息: ${result.error}`);
  }
  
  // ========== 保存完整结果 ==========
  const testResult = {
    timestamp: new Date().toISOString(),
    user_input: userInput,
    intent,
    skill_chain: skillChain,
    skill_params: skillParams,
    workflow: optimizedWorkflow,
    execution_result: result,
    duration_ms: duration
  };
  
  const { getCopilotDir } = require('./src/utils/paths');
  const resultsDir = path.join(getCopilotDir(), 'e2e-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const resultFile = path.join(resultsDir, `e2e_${Date.now()}.json`);
  fs.writeFileSync(resultFile, JSON.stringify(testResult, null, 2));
  
  console.log(`\n💾 完整结果保存到: ${resultFile}`);
  
  return testResult;
}

// 优化工作流结构
function optimizeWorkflow(workflow) {
  const optimized = { ...workflow };
  
  // 重新组织节点：技能节点在前，condition节点作为独立逻辑
  const skillNodes = [];
  const conditionNodes = [];
  
  optimized.nodes.forEach(node => {
    if (node.type === 'condition') {
      conditionNodes.push(node);
    } else if (node.skill) {
      skillNodes.push(node);
    }
  });
  
  // 为技能节点设置简单线性依赖
  skillNodes.forEach((node, index) => {
    node.id = `skill_${index}`;
    node.depends_on = index > 0 ? [`skill_${index - 1}`] : [];
  });
  
  // 将condition节点转换为条件逻辑（不直接执行）
  // 在实际实现中，这应该由执行引擎处理
  optimized.conditions = conditionNodes;
  optimized.nodes = skillNodes;
  
  return optimized;
}

// 改进的测试用例
const testCases = [
  {
    input: "监控WLDUSDT价格，跌5%就通过Telegram提醒我",
    expected: ['binance-trading', 'telegram-message', 'cron']
  },
  {
    input: "每天给我知乎热榜前5个话题，保存到文件",
    expected: ['zhihu-hot', 'file-storage', 'cron']
  },
  {
    input: "每小时检查BTC价格，发送到Telegram",
    expected: ['binance-trading', 'telegram-message', 'cron']
  }
];

async function runAllTests() {
  console.log('🧪 OpenClaw Copilot 端到端测试套件');
  console.log('========================================\n');
  
  const allResults = [];
  
  for (const testCase of testCases) {
    try {
      const result = await testEndToEnd(testCase.input);
      allResults.push(result);
      
      // 检查是否匹配预期技能
      const matchedSkills = result.skill_chain;
      const expectedSkills = testCase.expected;
      
      const matchScore = calculateMatchScore(matchedSkills, expectedSkills);
      
      console.log(`\n📊 匹配度评估: ${matchScore.score}/100`);
      if (matchScore.missing.length > 0) {
        console.log(`   缺少技能: ${matchScore.missing.join(', ')}`);
      }
      if (matchScore.extra.length > 0) {
        console.log(`   多余技能: ${matchScore.extra.join(', ')}`);
      }
      
    } catch (error) {
      console.error(`\n💥 测试失败: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(60));
  }
  
  // 生成测试报告
  generateTestReport(allResults);
}

// 计算技能匹配度
function calculateMatchScore(actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  
  const missing = expected.filter(skill => !actualSet.has(skill));
  const extra = actual.filter(skill => !expectedSet.has(skill));
  const correct = actual.filter(skill => expectedSet.has(skill));
  
  const score = Math.round((correct.length / expected.length) * 100);
  
  return {
    score,
    missing,
    extra,
    correct
  };
}

// 生成测试报告
function generateTestReport(results) {
  console.log('\n📈 测试报告汇总');
  console.log('────────────────────────────────────');
  
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.execution_result.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration_ms, 0) / totalTests;
  
  console.log(`   总测试数: ${totalTests}`);
  console.log(`   成功测试: ${successfulTests}`);
  console.log(`   平均耗时: ${avgDuration.toFixed(0)}ms`);
  
  // 技能使用频率统计
  const skillUsage = {};
  results.forEach(result => {
    result.skill_chain.forEach(skill => {
      skillUsage[skill] = (skillUsage[skill] || 0) + 1;
    });
  });
  
  console.log('\n🔧 技能使用频率:');
  Object.entries(skillUsage)
    .sort((a, b) => b[1] - a[1])
    .forEach(([skill, count]) => {
      console.log(`   ${skill}: ${count}次`);
    });
  
  // 保存汇总报告
  const report = {
    generated_at: new Date().toISOString(),
    summary: {
      total_tests: totalTests,
      successful_tests: successfulTests,
      success_rate: (successfulTests / totalTests * 100).toFixed(1) + '%',
      average_duration_ms: avgDuration
    },
    skill_usage: skillUsage,
    results: results.map(r => ({
      input: r.user_input,
      success: r.execution_result.success,
      duration_ms: r.duration_ms,
      skills_used: r.skill_chain
    }))
  };
  
  const reportDir = path.join(getCopilotDir(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportFile = path.join(reportDir, `test_report_${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log(`\n📋 详细报告保存到: ${reportFile}`);
}

// 执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testEndToEnd,
  optimizeWorkflow
};