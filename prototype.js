#!/usr/bin/env node

/**
 * OpenClaw Copilot 原型系统
 * 验证核心概念：自然语言 → 技能匹配 → 工作流生成
 */

const fs = require('fs');
const path = require('path');

// ==================== 技能能力目录 ====================
const skillCatalog = {
  // 价格监控类技能
  'binance-trading': {
    name: 'binance-trading',
    description: '币安量化交易，支持价格监控',
    capabilities: ['price_monitoring', 'crypto_data'],
    parameters: {
      symbol: { type: 'string', required: true, example: 'WLDUSDT' },
      interval: { type: 'number', default: 5, unit: 'minutes' }
    },
    actions: ['monitor_price'],
    outputs: ['price_data']
  },
  
  // 定时任务技能
  'cron': {
    name: 'cron',
    description: '定时任务调度',
    capabilities: ['scheduling', 'automation'],
    parameters: {
      schedule: { type: 'string', required: true, example: '*/5 * * * *' },
      task: { type: 'object', required: true }
    },
    actions: ['schedule'],
    outputs: ['job_id']
  },
  
  // 消息通知技能
  'telegram-message': {
    name: 'telegram-message',
    description: '发送Telegram消息',
    capabilities: ['notification', 'messaging'],
    parameters: {
      message: { type: 'string', required: true },
      to: { type: 'string', default: 'user' }
    },
    actions: ['send'],
    outputs: ['message_id']
  },
  
  // 知乎热榜技能
  'zhihu-hot': {
    name: 'zhihu-hot',
    description: '获取知乎热榜',
    capabilities: ['data_fetch', 'content_aggregation'],
    parameters: {
      limit: { type: 'number', default: 10 }
    },
    actions: ['get_hot_list'],
    outputs: ['hot_topics']
  },
  
  // 数据存储技能
  'file-storage': {
    name: 'file-storage',
    description: '文件存储和管理',
    capabilities: ['data_storage', 'file_operation'],
    parameters: {
      path: { type: 'string', required: true },
      content: { type: 'any', required: true }
    },
    actions: ['save', 'read'],
    outputs: ['file_path', 'content']
  }
};

// ==================== 意图解析器 ====================
class IntentParser {
  // 意图模式匹配
  patterns = {
    price_monitor: [
      /监控(.+?)价格/,
      /关注(.+?)行情/,
      /(.+?)跌(.+?)就提醒/
    ],
    data_collection: [
      /获取(.+?)热榜/,
      /收集(.+?)数据/,
      /每天给我(.+?)/
    ],
    notification: [
      /提醒我/,
      /通知我/,
      /发消息/
    ],
    scheduling: [
      /每天/,
      /每小时/,
      /每(.+?)分钟/,
      /定时/
    ]
  };

  parse(text) {
    const lowerText = text.toLowerCase();
    
    // 提取意图类型
    const intentTypes = this.detectIntentTypes(lowerText);
    
    // 提取参数
    const parameters = this.extractParameters(lowerText);
    
    // 提取约束条件
    const constraints = this.extractConstraints(lowerText);
    
    return {
      raw_text: text,
      intent_types: intentTypes,
      parameters,
      constraints,
      goal: this.summarizeGoal(intentTypes, parameters)
    };
  }

  detectIntentTypes(text) {
    const types = new Set();
    
    for (const [type, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          types.add(type);
          break;
        }
      }
    }
    
    return Array.from(types);
  }

  extractParameters(text) {
    const params = {};
    
    // 提取币种符号
    const symbolMatch = text.match(/([A-Z]{2,6})/);
    if (symbolMatch) {
      params.symbol = symbolMatch[1];
    }
    
    // 提取百分比阈值
    const percentMatch = text.match(/跌(\d+)%/);
    if (percentMatch) {
      params.threshold_percent = -parseInt(percentMatch[1]);
    }
    
    // 提取时间间隔
    const intervalMatch = text.match(/每(\d+)[分钟小时天]/);
    if (intervalMatch) {
      const value = parseInt(intervalMatch[1]);
      const unit = intervalMatch[0].includes('小时') ? 'hours' : 
                   intervalMatch[0].includes('天') ? 'days' : 'minutes';
      params.interval = { value, unit };
    }
    
    // 提取平台/来源
    const platformMatch = text.match(/(知乎|推特|微博|b站)/);
    if (platformMatch) {
      params.platform = platformMatch[1];
    }
    
    // 提取数量限制
    const limitMatch = text.match(/(\d+)个/);
    if (limitMatch) {
      params.limit = parseInt(limitMatch[1]);
    }
    
    return params;
  }

  extractConstraints(text) {
    const constraints = [];
    
    if (text.includes('telegram') || text.includes('tg')) {
      constraints.push('通过Telegram发送');
    }
    
    if (text.includes('每天')) {
      constraints.push('每天执行');
    }
    
    if (text.includes('自动')) {
      constraints.push('自动执行');
    }
    
    return constraints;
  }

  summarizeGoal(intentTypes, parameters) {
    if (intentTypes.includes('price_monitor') && parameters.symbol) {
      return `监控${parameters.symbol}价格变化`;
    }
    
    if (intentTypes.includes('data_collection') && parameters.platform) {
      return `收集${parameters.platform}数据`;
    }
    
    return '完成用户请求的任务';
  }
}

// ==================== 技能匹配器 ====================
class SkillMatcher {
  // 能力到技能的映射
  capabilityToSkills = {
    price_monitoring: ['binance-trading'],
    scheduling: ['cron'],
    notification: ['telegram-message'],
    data_fetch: ['zhihu-hot', 'binance-trading'],
    data_storage: ['file-storage']
  };

  // 意图到能力映射
  intentToCapabilities = {
    price_monitor: ['price_monitoring', 'scheduling', 'notification'],
    data_collection: ['data_fetch', 'scheduling', 'notification', 'data_storage'],
    notification: ['notification'],
    scheduling: ['scheduling']
  };

  match(intent) {
    // 确定所需能力
    const requiredCapabilities = new Set();
    
    for (const intentType of intent.intent_types) {
      const capabilities = this.intentToCapabilities[intentType] || [];
      capabilities.forEach(cap => requiredCapabilities.add(cap));
    }
    
    // 添加约束条件相关能力
    if (intent.constraints.includes('通过Telegram发送')) {
      requiredCapabilities.add('notification');
    }
    
    if (intent.constraints.includes('每天执行')) {
      requiredCapabilities.add('scheduling');
    }
    
    // 匹配技能
    const matchedSkills = new Set();
    for (const capability of requiredCapabilities) {
      const skills = this.capabilityToSkills[capability] || [];
      skills.forEach(skill => matchedSkills.add(skill));
    }
    
    // 返回技能链（按执行顺序）
    return this.orderSkillChain(Array.from(matchedSkills), intent);
  }

  orderSkillChain(skills, intent) {
    // 简单的顺序逻辑：数据获取 → 处理 → 通知 → 调度
    const order = ['data_fetch', 'price_monitoring', 'data_storage', 'notification', 'scheduling'];
    
    return skills.sort((a, b) => {
      const skillA = skillCatalog[a];
      const skillB = skillCatalog[b];
      
      // 根据主要能力排序
      const capA = skillA.capabilities[0];
      const capB = skillB.capabilities[0];
      
      const indexA = order.indexOf(capA);
      const indexB = order.indexOf(capB);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      return 0;
    });
  }
}

// ==================== 参数推断器 ====================
class ParameterInferrer {
  inferParameters(intent, skillChain) {
    const parameters = { ...intent.parameters };
    
    // 为每个技能推断参数
    const skillParams = {};
    
    for (const skillName of skillChain) {
      const skill = skillCatalog[skillName];
      
      switch (skillName) {
        case 'binance-trading':
          if (parameters.symbol && !parameters.symbol.endsWith('USDT')) {
            parameters.symbol = parameters.symbol + 'USDT';
          }
          skillParams[skillName] = {
            symbol: parameters.symbol || 'BTCUSDT',
            interval: parameters.interval?.value || 5
          };
          break;
          
        case 'cron':
          let schedule = '*/5 * * * *'; // 默认5分钟
          if (parameters.interval) {
            if (parameters.interval.unit === 'minutes') {
              schedule = `*/${parameters.interval.value} * * * *`;
            } else if (parameters.interval.unit === 'hours') {
              schedule = `0 */${parameters.interval.value} * * *`;
            } else if (parameters.interval.unit === 'days') {
              schedule = `0 9 */${parameters.interval.value} * *`;
            }
          }
          skillParams[skillName] = { schedule };
          break;
          
        case 'telegram-message':
          let message = '系统提醒';
          if (intent.goal.includes('监控') && parameters.symbol) {
            message = `${parameters.symbol}价格下跌${Math.abs(parameters.threshold_percent || 5)}%，请注意风险`;
          } else if (intent.goal.includes('收集')) {
            message = `已收集${parameters.platform || '平台'}最新数据`;
          }
          skillParams[skillName] = { message, to: 'user' };
          break;
          
        case 'zhihu-hot':
          skillParams[skillName] = {
            limit: parameters.limit || 10
          };
          break;
          
        case 'file-storage':
          const timestamp = new Date().toISOString().split('T')[0];
          skillParams[skillName] = {
            path: `/data/${timestamp}_${intent.goal.replace(/\s+/g, '_')}.json`,
            content: '{}'
          };
          break;
      }
    }
    
    return skillParams;
  }
}

// ==================== 工作流生成器 ====================
class WorkflowGenerator {
  generate(intent, skillChain, skillParams) {
    const workflow = {
      version: '1.0',
      name: `工作流: ${intent.goal}`,
      description: `自动生成的工作流，用于: ${intent.raw_text}`,
      created_at: new Date().toISOString(),
      intent: intent,
      nodes: []
    };
    
    // 生成节点
    for (let i = 0; i < skillChain.length; i++) {
      const skillName = skillChain[i];
      const skill = skillCatalog[skillName];
      const params = skillParams[skillName] || {};
      
      const node = {
        id: `node_${i}`,
        type: 'skill',
        skill: skillName,
        description: skill.description,
        action: skill.actions[0],
        parameters: params,
        depends_on: i > 0 ? [`node_${i-1}`] : []
      };
      
      // 添加条件节点
      if (skillName === 'binance-trading' && intent.parameters.threshold_percent) {
        workflow.nodes.push({
          id: `condition_${i}`,
          type: 'condition',
          condition: `output.price_change_percent <= ${intent.parameters.threshold_percent}`,
          true_branch: 'send_notification',
          depends_on: [`node_${i}`]
        });
      }
      
      workflow.nodes.push(node);
    }
    
    return workflow;
  }
}

// ==================== 主程序 ====================
async function main() {
  console.log('🚀 OpenClaw Copilot 原型系统\n');
  
  // 测试用例
  const testCases = [
    "监控WLD价格，跌5%就通过Telegram提醒我",
    "每天给我知乎热榜前10个话题",
    "关注BTC行情，每小时检查一次",
    "收集推特上关于AI的热门推文"
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 测试用例: "${testCase}"`);
    console.log('─'.repeat(50));
    
    // 1. 意图解析
    const parser = new IntentParser();
    const intent = parser.parse(testCase);
    console.log('🔍 意图分析:');
    console.log(`   目标: ${intent.goal}`);
    console.log(`   类型: ${intent.intent_types.join(', ')}`);
    console.log(`   参数:`, JSON.stringify(intent.parameters, null, 2));
    
    // 2. 技能匹配
    const matcher = new SkillMatcher();
    const skillChain = matcher.match(intent);
    console.log(`\n🔗 匹配技能链: ${skillChain.join(' → ')}`);
    
    // 3. 参数推断
    const inferrer = new ParameterInferrer();
    const skillParams = inferrer.inferParameters(intent, skillChain);
    console.log('\n⚙️  推断参数:');
    for (const [skill, params] of Object.entries(skillParams)) {
      console.log(`   ${skill}:`, JSON.stringify(params, null, 2));
    }
    
    // 4. 工作流生成
    const generator = new WorkflowGenerator();
    const workflow = generator.generate(intent, skillChain, skillParams);
    
    console.log('\n📋 生成工作流:');
    console.log(JSON.stringify(workflow, null, 2));
    
    // 保存工作流文件
    const { getCopilotDir } = require('./src/utils/paths');
    const outputDir = path.join(getCopilotDir(), 'workflows');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `workflow_${Date.now()}_${testCase.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(workflow, null, 2));
    console.log(`\n💾 工作流已保存: ${filepath}`);
  }
  
  console.log('\n✅ 原型测试完成！');
  console.log('\n📈 下一步计划:');
  console.log('  1. 扩展技能目录，支持更多真实技能');
  console.log('  2. 实现工作流执行引擎');
  console.log('  3. 添加用户确认和编辑界面');
  console.log('  4. 集成到OpenClaw主界面');
}

// 执行主程序
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  IntentParser,
  SkillMatcher,
  ParameterInferrer,
  WorkflowGenerator,
  skillCatalog
};