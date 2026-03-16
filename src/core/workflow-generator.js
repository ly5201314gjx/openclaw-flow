/**
 * 工作流生成器
 * 根据意图和技能链生成可执行的工作流
 */

class WorkflowGenerator {
  generate(intent, skillChain, skillParams) {
    const workflow = {
      version: '1.0',
      name: this.generateWorkflowName(intent),
      description: this.generateWorkflowDescription(intent),
      created_at: new Date().toISOString(),
      intent: intent,
      nodes: []
    };
    
    // 生成节点
    for (let i = 0; i < skillChain.length; i++) {
      const skillName = skillChain[i];
      const params = skillParams[skillName] || {};
      
      const node = {
        id: `node_${i}`,
        type: 'skill',
        skill: skillName,
        description: this.getNodeDescription(skillName, intent),
        action: this.getDefaultAction(skillName),
        parameters: this.enhanceParameters(params, intent, skillName),
        depends_on: i > 0 ? [`node_${i-1}`] : [],
        timeout_seconds: this.getTimeoutForSkill(skillName)
      };
      
      workflow.nodes.push(node);
    }
    
    // 添加条件节点（如果需要）
    if (intent.parameters?.threshold_percent) {
      workflow.nodes.push(this.createConditionNode(intent, workflow.nodes.length));
    }
    
    return workflow;
  }
  
  generateWorkflowName(intent) {
    if (intent.goal.includes('监控') && intent.parameters?.symbol) {
      return `价格监控: ${intent.parameters.symbol}`;
    }
    
    if (intent.goal.includes('知乎')) {
      return '知乎热榜收集';
    }
    
    if (intent.goal.includes('提醒')) {
      return '智能提醒工作流';
    }
    
    return `自动化工作流: ${intent.goal}`;
  }
  
  generateWorkflowDescription(intent) {
    const parts = [];
    
    if (intent.parameters?.symbol) {
      parts.push(`监控${intent.parameters.symbol}价格`);
    }
    
    if (intent.parameters?.threshold_percent) {
      parts.push(`下跌${Math.abs(intent.parameters.threshold_percent)}%时提醒`);
    }
    
    if (intent.parameters?.rise_threshold_percent) {
      parts.push(`上涨${intent.parameters.rise_threshold_percent}%时提醒`);
    }
    
    if (intent.parameters?.interval) {
      parts.push(`每${intent.parameters.interval.value}${intent.parameters.interval.unit}执行`);
    }
    
    if (intent.parameters?.platform) {
      parts.push(`从${intent.parameters.platform}获取数据`);
    }
    
    if (intent.parameters?.notify_channel) {
      parts.push(`通过${intent.parameters.notify_channel}通知`);
    }
    
    return parts.length > 0 ? parts.join('，') : intent.raw_text;
  }
  
  getNodeDescription(skill, intent) {
    const descriptions = {
      'binance-trading': `监控${intent.parameters?.symbol || '加密货币'}价格`,
      'telegram-message': '发送提醒消息',
      'cron': '定时执行任务',
      'zhihu-hot': '获取知乎热榜内容',
      'file-storage': '保存数据到文件'
    };
    
    return descriptions[skill] || `执行${skill}技能`;
  }
  
  getDefaultAction(skill) {
    const actions = {
      'binance-trading': 'monitor_price',
      'telegram-message': 'send',
      'cron': 'schedule',
      'zhihu-hot': 'get_hot_list',
      'file-storage': 'save'
    };
    
    return actions[skill] || 'execute';
  }
  
  enhanceParameters(params, intent, skill) {
    const enhanced = { ...params };
    
    switch (skill) {
      case 'binance-trading':
        if (!enhanced.symbol && intent.parameters?.symbol) {
          enhanced.symbol = intent.parameters.symbol;
        }
        if (!enhanced.interval) {
          enhanced.interval = intent.parameters?.interval?.value || 5;
        }
        break;
        
      case 'telegram-message':
        if (!enhanced.message) {
          let message = '系统提醒';
          if (intent.goal.includes('监控') && intent.parameters?.symbol) {
            message = `${intent.parameters.symbol}价格监控已启动`;
            if (intent.parameters.threshold_percent) {
              message += `，下跌${Math.abs(intent.parameters.threshold_percent)}%时将提醒`;
            }
          }
          enhanced.message = message;
        }
        break;
        
      case 'cron':
        if (!enhanced.schedule) {
          const interval = intent.parameters?.interval?.value || 5;
          const unit = intent.parameters?.interval?.unit || 'minutes';
          
          if (unit === 'minutes') {
            enhanced.schedule = `*/${interval} * * * *`;
          } else if (unit === 'hours') {
            enhanced.schedule = `0 */${interval} * * *`;
          } else if (unit === 'days') {
            enhanced.schedule = `0 9 */${interval} * *`;
          } else {
            enhanced.schedule = `*/5 * * * *`;
          }
        }
        break;
        
      case 'zhihu-hot':
        if (!enhanced.limit) {
          enhanced.limit = intent.parameters?.limit || 10;
        }
        break;
    }
    
    return enhanced;
  }
  
  getTimeoutForSkill(skill) {
    const timeouts = {
      'binance-trading': 30,
      'telegram-message': 10,
      'cron': 5,
      'zhihu-hot': 15,
      'file-storage': 5
    };
    
    return timeouts[skill] || 30;
  }
  
  createConditionNode(intent, nodeIndex) {
    const condition = {
      id: `condition_${nodeIndex}`,
      type: 'condition',
      description: '价格变化条件判断',
      condition: `output.price_change_percent <= ${intent.parameters.threshold_percent}`,
      true_branch: 'send_notification',
      false_branch: 'continue_monitoring',
      depends_on: [`node_${nodeIndex - 1}`]
    };
    
    return condition;
  }
  
  // 优化工作流（修复常见问题）
  optimizeWorkflow(workflow) {
    const optimized = JSON.parse(JSON.stringify(workflow));
    
    // 1. 移除无效节点
    optimized.nodes = optimized.nodes.filter(node => 
      node && node.skill && node.skill !== 'undefined'
    );
    
    // 2. 修复依赖关系
    optimized.nodes.forEach((node, index) => {
      node.id = `node_${index}`;
      if (index === 0) {
        node.depends_on = [];
      } else {
        node.depends_on = [`node_${index - 1}`];
      }
    });
    
    // 3. 优化参数
    optimized.nodes.forEach(node => {
      // 币种格式优化
      if (node.skill === 'binance-trading' && node.parameters?.symbol) {
        const symbol = node.parameters.symbol.toUpperCase();
        if (!symbol.endsWith('USDT') && symbol.length <= 3) {
          node.parameters.symbol = symbol + 'USDT';
        }
      }
      
      // 消息内容优化
      if (node.skill === 'telegram-message' && node.parameters?.message) {
        if (node.parameters.message === '系统提醒') {
          node.parameters.message = '自动化任务提醒';
        }
      }
    });
    
    return optimized;
  }
}

module.exports = WorkflowGenerator;