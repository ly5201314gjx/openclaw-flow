/**
 * 工作流执行引擎
 * 执行生成的工作流
 */

const fs = require('fs');
const path = require('path');

class WorkflowExecutor {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      verbose: true,
      ...options
    };
    
    this.stats = {
      executed: 0,
      succeeded: 0,
      failed: 0,
      totalDuration: 0
    };
    
    this.results = new Map();
  }
  
  async execute(workflow) {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}`;
    
    console.log(`🚀 开始执行工作流: ${workflow.name}`);
    console.log(`📋 工作流ID: ${executionId}`);
    console.log(`📝 描述: ${workflow.description}`);
    console.log('─'.repeat(60));
    
    const executionResult = {
      id: executionId,
      workflow: workflow,
      nodes: {},
      success: false,
      startTime,
      endTime: null,
      duration: 0,
      error: null
    };
    
    try {
      // 按顺序执行节点
      for (const node of workflow.nodes) {
        const nodeResult = await this.executeNode(node, executionId);
        executionResult.nodes[node.id] = nodeResult;
        
        // 如果节点失败且不是条件节点，停止执行
        if (!nodeResult.success && node.type !== 'condition') {
          console.log(`❌ 节点 ${node.id} 执行失败，停止工作流`);
          break;
        }
      }
      
      // 计算执行结果
      const succeededNodes = Object.values(executionResult.nodes)
        .filter(r => r.success).length;
      
      executionResult.success = succeededNodes === workflow.nodes.length;
      executionResult.endTime = Date.now();
      executionResult.duration = executionResult.endTime - startTime;
      
      // 更新统计
      this.stats.executed++;
      this.stats.totalDuration += executionResult.duration;
      if (executionResult.success) {
        this.stats.succeeded++;
      } else {
        this.stats.failed++;
      }
      
      // 保存执行结果
      this.saveExecutionResult(executionResult);
      
      console.log(`\n🎉 工作流执行${executionResult.success ? '成功' : '失败'}！`);
      console.log(`⏱️  耗时: ${executionResult.duration}ms`);
      console.log(`📊 成功节点: ${succeededNodes}/${workflow.nodes.length}`);
      
      return executionResult;
      
    } catch (error) {
      console.error(`💥 工作流执行异常: ${error.message}`);
      
      executionResult.success = false;
      executionResult.error = error.message;
      executionResult.endTime = Date.now();
      executionResult.duration = executionResult.endTime - startTime;
      
      this.stats.executed++;
      this.stats.failed++;
      
      this.saveExecutionResult(executionResult);
      
      return executionResult;
    }
  }
  
  async executeNode(node, executionId) {
    console.log(`\n📌 执行节点 ${node.id}: ${node.skill}`);
    console.log(`   📍 动作: ${node.action}`);
    
    const nodeStartTime = Date.now();
    const nodeResult = {
      node,
      success: false,
      startTime: nodeStartTime,
      endTime: null,
      duration: null,
      data: null,
      error: null
    };
    
    try {
      if (this.options.dryRun) {
        // 模拟执行模式
        console.log(`   ⚠️  模拟执行: ${JSON.stringify(node.parameters, null, 2)}`);
        
        nodeResult.data = {
          simulated: true,
          message: '模拟执行成功',
          execution_id: executionId
        };
        
        await this.sleep(100); // 模拟执行时间
        
      } else {
        // 真实执行模式
        // 这里应该调用真实的技能适配器
        console.log(`   🔧 执行真实技能: ${JSON.stringify(node.parameters, null, 2)}`);
        
        // 模拟真实执行
        const skillResult = await this.executeRealSkill(node);
        nodeResult.data = skillResult;
      }
      
      nodeResult.success = true;
      console.log(`   ✅ 执行成功`);
      
    } catch (error) {
      console.log(`   ❌ 执行失败: ${error.message}`);
      nodeResult.error = error.message;
      nodeResult.success = false;
    }
    
    nodeResult.endTime = Date.now();
    nodeResult.duration = nodeResult.endTime - nodeStartTime;
    
    return nodeResult;
  }
  
  async executeRealSkill(node) {
    // 这里应该调用真实的技能适配器
    // 目前使用模拟实现
    
    const skillActions = {
      'binance-trading': () => this.simulateBinanceTrading(node.parameters),
      'telegram-message': () => this.simulateTelegramMessage(node.parameters),
      'cron': () => this.simulateCron(node.parameters),
      'zhihu-hot': () => this.simulateZhihuHot(node.parameters),
      'file-storage': () => this.simulateFileStorage(node.parameters)
    };
    
    const action = skillActions[node.skill];
    if (action) {
      return await action();
    }
    
    // 未知技能，模拟成功
    return {
      success: true,
      simulated: true,
      skill: node.skill,
      action: node.action,
      parameters: node.parameters,
      executed_at: new Date().toISOString()
    };
  }
  
  // 模拟技能执行
  simulateBinanceTrading(params) {
    return {
      success: true,
      type: 'binance_monitor',
      symbol: params.symbol,
      check_interval: params.check_interval || 5,
      threshold_percent: params.threshold_percent,
      started_at: new Date().toISOString()
    };
  }
  
  simulateTelegramMessage(params) {
    return {
      success: true,
      type: 'telegram_message',
      to: params.to,
      message: params.message,
      sent_at: new Date().toISOString(),
      simulated: true
    };
  }
  
  simulateCron(params) {
    return {
      success: true,
      type: 'cron_schedule',
      schedule: params.schedule,
      created_at: new Date().toISOString(),
      next_run: this.calculateNextRun(params.schedule)
    };
  }
  
  simulateZhihuHot(params) {
    const topics = Array.from({ length: params.limit || 10 }, (_, i) => ({
      rank: i + 1,
      title: `知乎热榜话题 ${i + 1}`,
      hot_value: Math.floor(Math.random() * 1000000)
    }));
    
    return {
      success: true,
      type: 'zhihu_hot',
      limit: params.limit,
      topics_count: topics.length,
      fetched_at: new Date().toISOString(),
      topics
    };
  }
  
  simulateFileStorage(params) {
    return {
      success: true,
      type: 'file_storage',
      path: params.path,
      size: params.content?.length || 0,
      saved_at: new Date().toISOString()
    };
  }
  
  // 计算下次运行时间
  calculateNextRun(schedule) {
    const now = new Date();
    // 简单逻辑：如果schedule是每分钟，则下一分钟
    if (schedule.startsWith('*/')) {
      const minutes = parseInt(schedule.split('/')[1]);
      now.setMinutes(now.getMinutes() + minutes);
    } else if (schedule.includes('0 */')) {
      // 每小时
      const hours = parseInt(schedule.split('/')[2]);
      now.setHours(now.getHours() + hours);
    }
    
    return now.toISOString();
  }
  
  // 保存执行结果
  saveExecutionResult(executionResult) {
    const resultsDir = '/root/.openclaw/workspace/copilot/execution-results';
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const filename = `result_${executionResult.id}_${executionResult.success ? 'success' : 'failed'}.json`;
    const filepath = path.join(resultsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(executionResult, null, 2));
    console.log(`💾 执行结果保存到: ${filepath}`);
  }
  
  // 获取统计信息
  getStats() {
    return {
      ...this.stats,
      avgDuration: this.stats.executed > 0 
        ? Math.round(this.stats.totalDuration / this.stats.executed)
        : 0,
      successRate: this.stats.executed > 0
        ? (this.stats.succeeded / this.stats.executed) * 100
        : 0
    };
  }
  
  // 辅助方法
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = WorkflowExecutor;