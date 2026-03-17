#!/usr/bin/env node

/**
 * OpenClaw Copilot 完整测试套件
 * 测试所有核心功能和集成
 */

const fs = require('fs');
const path = require('path');
const { OpenClawCopilot } = require('../index');

class TestSuite {
  constructor() {
    this.tests = [];
    this.results = [];
    this.copilot = new OpenClawCopilot({ dryRun: true, verbose: false });
  }
  
  addTest(name, testFn) {
    this.tests.push({ name, fn: testFn });
  }
  
  async runAll() {
    console.log('🧪 OpenClaw Copilot 完整测试套件\n');
    console.log(`📊 运行 ${this.tests.length} 个测试\n`);
    
    let passed = 0;
    let failed = 0;
    
    for (const test of this.tests) {
      console.log(`🔍 测试: ${test.name}`);
      console.log('─'.repeat(50));
      
      try {
        const result = await test.fn();
        if (result.success) {
          console.log(`✅ 通过: ${result.message || '测试成功'}`);
          passed++;
        } else {
          console.log(`❌ 失败: ${result.message || '测试失败'}`);
          failed++;
        }
        
        this.results.push({
          name: test.name,
          success: result.success,
          message: result.message,
          data: result.data
        });
        
      } catch (error) {
        console.log(`💥 异常: ${error.message}`);
        failed++;
        
        this.results.push({
          name: test.name,
          success: false,
          message: `异常: ${error.message}`,
          error: error.stack
        });
      }
      
      console.log('');
    }
    
    // 生成报告
    this.generateReport(passed, failed);
    
    return { passed, failed, results: this.results };
  }
  
  generateReport(passed, failed) {
    console.log('📈 测试报告');
    console.log('────────────────────────────────────');
    console.log(`   总计: ${this.tests.length} 个测试`);
    console.log(`   通过: ${passed}`);
    console.log(`   失败: ${failed}`);
    console.log(`   通过率: ${((passed / this.tests.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n🔍 失败详情:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   • ${r.name}: ${r.message}`);
        });
    }
    
    // 保存详细报告
    const { getCopilotDir } = require('../src/utils/paths');
    const reportDir = path.join(getCopilotDir(), 'test-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `test_report_${timestamp}.json`);
    
    const fullReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.tests.length,
        passed,
        failed,
        success_rate: (passed / this.tests.length) * 100
      },
      details: this.results,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(fullReport, null, 2));
    console.log(`\n💾 详细报告已保存: ${reportFile}`);
  }
}

// 创建测试套件
async function main() {
  const suite = new TestSuite();
  
  // 测试1: 意图解析
  suite.addTest('意图解析器 - 价格监控', async () => {
    const parser = require('../src/core/intent-parser');
    const ip = new parser();
    
    const intent = ip.parse('监控WLD价格，跌5%就通过Telegram提醒我');
    
    if (!intent.intent_types.includes('price_monitor')) {
      return { success: false, message: '未识别价格监控意图' };
    }
    
    if (!intent.intent_types.includes('notification')) {
      return { success: false, message: '未识别通知意图' };
    }
    
    if (intent.parameters.symbol !== 'WLDUSDT') {
      return { success: false, message: '币种识别错误' };
    }
    
    return { 
      success: true, 
      message: '意图解析正确',
      data: intent
    };
  });
  
  // 测试2: 技能匹配
  suite.addTest('技能匹配器 - 价格监控工作流', async () => {
    const matcher = require('../src/core/skill-matcher');
    const sm = new matcher();
    
    const intent = {
      intent_types: ['price_monitor', 'notification'],
      parameters: { symbol: 'WLDUSDT', threshold_percent: -5 },
      constraints: []
    };
    
    const skills = sm.match(intent);
    
    const expectedSkills = ['binance-trading', 'telegram-message', 'cron'];
    const missing = expectedSkills.filter(skill => !skills.includes(skill));
    
    if (missing.length > 0) {
      return { 
        success: false, 
        message: `缺少技能: ${missing.join(', ')}` 
      };
    }
    
    return { 
      success: true, 
      message: `匹配技能: ${skills.join(' → ')}`,
      data: skills
    };
  });
  
  // 测试3: 工作流生成
  suite.addTest('工作流生成器 - 生成有效工作流', async () => {
    const generator = require('../src/core/workflow-generator');
    const wg = new generator();
    
    const intent = {
      raw_text: '监控WLD价格，跌5%就通过Telegram提醒我',
      goal: '监控WLDUSDT价格变化',
      intent_types: ['price_monitor', 'notification'],
      parameters: { symbol: 'WLDUSDT', threshold_percent: -5 },
      constraints: []
    };
    
    const skillChain = ['binance-trading', 'telegram-message', 'cron'];
    const skillParams = {
      'binance-trading': { symbol: 'WLDUSDT', interval: 5 },
      'telegram-message': { message: '测试消息', to: 'user' },
      'cron': { schedule: '*/5 * * * *' }
    };
    
    const workflow = wg.generate(intent, skillChain, skillParams);
    
    if (!workflow.name || !workflow.nodes || workflow.nodes.length === 0) {
      return { success: false, message: '工作流生成失败' };
    }
    
    // 检查节点
    const nodeSkills = workflow.nodes.map(node => node.skill);
    const missingSkills = skillChain.filter(skill => !nodeSkills.includes(skill));
    
    if (missingSkills.length > 0) {
      return { 
        success: false, 
        message: `工作流缺少节点: ${missingSkills.join(', ')}` 
      };
    }
    
    return { 
      success: true, 
      message: `生成工作流: ${workflow.name} (${workflow.nodes.length}个节点)`,
      data: workflow
    };
  });
  
  // 测试4: 端到端处理
  suite.addTest('端到端处理 - 简单请求', async () => {
    const result = await suite.copilot.process('监控WLD价格，跌5%就提醒我');
    
    if (!result.success) {
      return { 
        success: false, 
        message: `处理失败: ${result.error}` 
      };
    }
    
    if (!result.skillChain || result.skillChain.length === 0) {
      return { 
        success: false, 
        message: '未生成技能链' 
      };
    }
    
    if (!result.workflow || !result.workflow.nodes) {
      return { 
        success: false, 
        message: '未生成工作流' 
      };
    }
    
    return { 
      success: true, 
      message: `端到端处理成功: ${result.workflow.name}`,
      data: result
    };
  });
  
  // 测试5: 批量处理
  suite.addTest('批量处理 - 多个请求', async () => {
    const requests = [
      '监控WLD价格，跌5%就提醒我',
      '每天给我知乎热榜前5个话题'
    ];
    
    const results = await suite.copilot.batch(requests);
    
    if (results.length !== requests.length) {
      return { 
        success: false, 
        message: `批量处理数量不匹配: ${results.length}/${requests.length}` 
      };
    }
    
    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      return { 
        success: false, 
        message: `${failed.length}个请求处理失败` 
      };
    }
    
    return { 
      success: true, 
      message: `批量处理成功: ${results.length}个请求`,
      data: results
    };
  });
  
  // 测试6: 系统状态
  suite.addTest('系统状态检查', async () => {
    const status = suite.copilot.getStatus();
    
    if (!status.version) {
      return { success: false, message: '无法获取版本信息' };
    }
    
    if (!status.supportedSkills || status.supportedSkills.length === 0) {
      return { success: false, message: '无支持的技能' };
    }
    
    return { 
      success: true, 
      message: `系统状态正常: v${status.version}, ${status.supportedSkills.length}个技能`,
      data: status
    };
  });
  
  // 运行所有测试
  const testResult = await suite.runAll();
  
  // 退出码
  process.exit(testResult.failed > 0 ? 1 : 0);
}

// 执行测试
if (require.main === module) {
  main().catch(error => {
    console.error('💥 测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = TestSuite;