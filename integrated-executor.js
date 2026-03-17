#!/usr/bin/env node

/**
 * OpenClaw Copilot 整合执行引擎
 * 整合：意图解析 + 技能匹配 + 真实执行
 */

const fs = require('fs');
const path = require('path');

// 导入所有模块
const { IntentParser, SkillMatcher, ParameterInferrer, WorkflowGenerator } = require('./prototype');
const { createIntegratedWorkflowExecutor } = require('./real-skill-adapter');

class OpenClawCopilot {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      verbose: true,
      autoConfirm: false,
      ...options
    };
    
    this.components = {
      parser: new IntentParser(),
      matcher: new SkillMatcher(),
      inferrer: new ParameterInferrer(),
      generator: new WorkflowGenerator()
    };
    
    // 使用真实技能执行器
    const ExecutorClass = createIntegratedWorkflowExecutor();
    this.executor = new ExecutorClass({
      dryRun: this.options.dryRun,
      verbose: this.options.verbose
    });
    
    console.log('🚀 OpenClaw Copilot 已初始化');
    console.log(`   模式: ${this.options.dryRun ? '模拟执行' : '真实执行'}`);
  }
  
  // 完整流程：从自然语言到执行
  async processUserRequest(userInput, userOptions = {}) {
    console.log(`\n🎯 处理用户请求: "${userInput}"`);
    console.log('─'.repeat(60));
    
    const startTime = Date.now();
    const result = {
      user_input: userInput,
      steps: {},
      success: false,
      duration_ms: 0
    };
    
    try {
      // Step 1: 意图解析
      console.log('\n🔍 Step 1: 意图解析');
      const intent = this.components.parser.parse(userInput);
      result.steps.intent = intent;
      console.log(`   目标: ${intent.goal}`);
      console.log(`   类型: ${intent.intent_types.join(', ')}`);
      
      // Step 2: 技能匹配
      console.log('\n🔗 Step 2: 技能匹配');
      const skillChain = this.components.matcher.match(intent);
      result.steps.skill_chain = skillChain;
      console.log(`   匹配技能: ${skillChain.join(' → ')}`);
      
      if (skillChain.length === 0) {
        throw new Error('未找到匹配的技能');
      }
      
      // Step 3: 参数推断
      console.log('\n⚙️  Step 3: 参数推断');
      const skillParams = this.components.inferrer.inferParameters(intent, skillChain);
      result.steps.skill_params = skillParams;
      
      console.log(`   推断参数:`);
      for (const [skill, params] of Object.entries(skillParams)) {
        console.log(`     ${skill}:`, JSON.stringify(params, null, 2));
      }
      
      // Step 4: 生成工作流
      console.log('\n📋 Step 4: 工作流生成');
      const workflow = this.components.generator.generate(intent, skillChain, skillParams);
      result.steps.workflow = workflow;
      console.log(`   工作流名称: ${workflow.name}`);
      console.log(`   包含 ${workflow.nodes.length} 个节点`);
      
      // 优化工作流（修复依赖等）
      const optimizedWorkflow = this.optimizeWorkflow(workflow);
      
      // 显示工作流预览
      this.previewWorkflow(optimizedWorkflow);
      
      // 用户确认（如果不是自动确认）
      if (!this.options.autoConfirm && !this.options.dryRun) {
        const shouldContinue = await this.promptConfirmation();
        if (!shouldContinue) {
          console.log('❌ 用户取消执行');
          result.cancelled = true;
          return result;
        }
      }
      
      // Step 5: 执行工作流
      console.log('\n⚡ Step 5: 工作流执行');
      const executionResult = await this.executor.execute(optimizedWorkflow);
      result.steps.execution = executionResult;
      result.success = executionResult.success;
      
      console.log(`\n📊 执行结果:`);
      console.log(`   状态: ${executionResult.success ? '✅ 成功' : '❌ 失败'}`);
      console.log(`   耗时: ${executionResult.duration || 0}ms`);
      console.log(`   成功节点: ${Object.values(executionResult.results || {}).filter(r => r?.success).length}`);
      
      if (executionResult.error) {
        console.log(`   错误: ${executionResult.error}`);
      }
      
      // 保存完整结果
      result.duration_ms = Date.now() - startTime;
      result.final_result = executionResult;
      
      this.saveCompleteResult(result);
      
      return result;
      
    } catch (error) {
      console.error(`\n💥 处理失败: ${error.message}`);
      result.error = error.message;
      result.success = false;
      result.duration_ms = Date.now() - startTime;
      
      this.saveErrorResult(result);
      
      return result;
    }
  }
  
  // 优化工作流
  optimizeWorkflow(workflow) {
    const optimized = JSON.parse(JSON.stringify(workflow));
    
    // 移除无效节点
    optimized.nodes = optimized.nodes.filter(node => 
      node && node.skill && node.skill !== 'undefined'
    );
    
    // 重新设置ID和依赖
    optimized.nodes.forEach((node, index) => {
      node.id = `node_${index}`;
      node.depends_on = index > 0 ? [`node_${index - 1}`] : [];
      
      // 改进币种识别
      if (node.skill === 'binance-trading' && node.parameters?.symbol) {
        const symbol = node.parameters.symbol.toUpperCase();
        if (symbol === 'WLD') {
          node.parameters.symbol = 'WLDUSDT';
          console.log(`   🔄 优化: WLD → WLDUSDT`);
        } else if (symbol === 'BTC') {
          node.parameters.symbol = 'BTCUSDT';
          console.log(`   🔄 优化: BTC → BTCUSDT`);
        }
      }
      
      // 改进消息内容
      if (node.skill === 'telegram-message' && node.parameters?.message) {
        const message = node.parameters.message;
        if (message === '系统提醒') {
          // 根据上下文生成更有意义的消息
          const context = workflow.intent;
          if (context.goal.includes('监控') && context.parameters?.symbol) {
            node.parameters.message = `${context.parameters.symbol}价格监控已启动，将及时通知价格变化`;
          } else if (context.goal.includes('收集')) {
            node.parameters.message = `数据收集任务已启动，将定期发送结果`;
          }
          console.log(`   🔄 优化消息内容`);
        }
      }
    });
    
    return optimized;
  }
  
  // 预览工作流
  previewWorkflow(workflow) {
    console.log(`\n📋 工作流预览:`);
    console.log(`   名称: ${workflow.name}`);
    console.log(`   描述: ${workflow.description}`);
    console.log(`   技能链:`);
    
    workflow.nodes.forEach((node, index) => {
      const skill = node.skill || '未知';
      const action = node.action || '执行';
      const params = node.parameters ? Object.entries(node.parameters)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ') : '无参数';
      
      console.log(`   ${index + 1}. ${skill} - ${action}`);
      console.log(`      参数: ${params}`);
    });
    
    if (this.options.dryRun) {
      console.log(`\n⚠️  模拟执行模式 - 不会实际执行技能`);
    }
  }
  
  // 用户确认提示（简化版）
  async promptConfirmation() {
    console.log(`\n❓ 确认执行此工作流？`);
    console.log(`   [Y] 确认执行`);
    console.log(`   [N] 取消`);
    
    // 在实际实现中，这里应该等待用户输入
    // 这里简化为自动确认（用于测试）
    console.log(`   （测试模式：自动确认）`);
    await this.sleep(1000);
    
    return true;
  }
  
  // 保存完整结果
  saveCompleteResult(result) {
    const resultsDir = path.join(getCopilotDir(), 'execution-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `result_${timestamp}_${result.success ? 'success' : 'failed'}.json`;
    const filepath = path.join(resultsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    console.log(`\n💾 完整结果保存到: ${filepath}`);
  }
  
  // 保存错误结果
  saveErrorResult(result) {
    const errorsDir = path.join(getCopilotDir(), 'errors');
    if (!fs.existsSync(errorsDir)) {
      fs.mkdirSync(errorsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `error_${timestamp}.json`;
    const filepath = path.join(errorsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(result, null, 2));
    console.log(`💾 错误详情保存到: ${filepath}`);
  }
  
  // 辅助方法
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // 批量处理
  async processBatch(requests, options = {}) {
    console.log(`\n🔧 批量处理 ${requests.length} 个请求`);
    
    const results = [];
    for (let i = 0; i < requests.length; i++) {
      console.log(`\n📝 处理请求 ${i + 1}/${requests.length}: "${requests[i]}"`);
      
      const result = await this.processUserRequest(requests[i], options);
      results.push(result);
      
      // 短暂延迟
      await this.sleep(500);
    }
    
    // 生成批量报告
    this.generateBatchReport(results);
    
    return results;
  }
  
  // 生成批量报告
  generateBatchReport(results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success && !r.cancelled).length;
    const cancelled = results.filter(r => r.cancelled).length;
    const totalDuration = results.reduce((sum, r) => sum + (r.duration_ms || 0), 0);
    
    console.log(`\n📈 批量处理报告:`);
    console.log(`   总请求数: ${results.length}`);
    console.log(`   成功: ${successful}`);
    console.log(`   失败: ${failed}`);
    console.log(`   取消: ${cancelled}`);
    console.log(`   总耗时: ${totalDuration}ms`);
    console.log(`   平均耗时: ${Math.round(totalDuration / results.length)}ms`);
    
    // 技能使用统计
    const skillUsage = {};
    results.forEach(result => {
      const skills = result.steps?.skill_chain || [];
      skills.forEach(skill => {
        skillUsage[skill] = (skillUsage[skill] || 0) + 1;
      });
    });
    
    console.log(`\n🔧 技能使用统计:`);
    Object.entries(skillUsage)
      .sort((a, b) => b[1] - a[1])
      .forEach(([skill, count]) => {
        console.log(`   ${skill}: ${count}次`);
      });
  }
}

// ==================== CLI接口 ====================
async function main() {
  const args = process.argv.slice(2);
  
  const copilot = new OpenClawCopilot({
    dryRun: args.includes('--dry-run'),
    autoConfirm: args.includes('--auto-confirm')
  });
  
  if (args.length === 0 || args.includes('interactive')) {
    // 交互模式
    console.log('🚀 OpenClaw Copilot 交互模式');
    console.log('────────────────────────────────────');
    
    // 示例请求
    const exampleRequests = [
      "监控WLD价格，跌5%就通过Telegram提醒我",
      "每天给我知乎热榜前10个话题",
      "每小时检查BTC价格变化"
    ];
    
    console.log('📋 示例请求:');
    exampleRequests.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req}`);
    });
    
    console.log('\n🔧 使用方式:');
    console.log('   node integrated-executor.js "你的请求"');
    console.log('   node integrated-executor.js --dry-run "你的请求"  # 模拟执行');
    console.log('   node integrated-executor.js batch                # 批量测试');
    
  } else if (args[0] === 'batch') {
    // 批量测试
    const testRequests = [
      "监控WLDUSDT价格，跌3%就提醒",
      "获取知乎热榜前5个话题并保存",
      "创建BTC价格监控，每10分钟检查"
    ];
    
    await copilot.processBatch(testRequests, {
      dryRun: args.includes('--dry-run')
    });
    
  } else {
    // 处理单个请求
    const userInput = args.join(' ');
    await copilot.processUserRequest(userInput);
  }
}

// 执行主程序
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  OpenClawCopilot
};tch(console.error);
}

module.exports = {
  OpenClawCopilot
};