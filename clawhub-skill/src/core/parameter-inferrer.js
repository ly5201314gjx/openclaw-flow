/**
 * 参数推断器
 * 根据意图和技能推断参数值
 */

class ParameterInferrer {
  infer(intent, skillChain) {
    const skillParams = {};
    
    for (const skillName of skillChain) {
      switch (skillName) {
        case 'binance-trading':
          skillParams[skillName] = this.inferBinanceParams(intent);
          break;
          
        case 'telegram-message':
          skillParams[skillName] = this.inferTelegramParams(intent);
          break;
          
        case 'cron':
          skillParams[skillName] = this.inferCronParams(intent);
          break;
          
        case 'zhihu-hot':
          skillParams[skillName] = this.inferZhihuParams(intent);
          break;
          
        case 'file-storage':
          skillParams[skillName] = this.inferFileStorageParams(intent);
          break;
          
        default:
          skillParams[skillName] = this.inferDefaultParams(intent, skillName);
      }
    }
    
    return skillParams;
  }
  
  inferBinanceParams(intent) {
    const params = {
      symbol: intent.parameters?.symbol || 'WLDUSDT',
      action: 'monitor_price'
    };
    
    if (intent.parameters?.interval) {
      params.check_interval = intent.parameters.interval.value;
    } else {
      params.check_interval = 5; // 默认5分钟
    }
    
    if (intent.parameters?.threshold_percent) {
      params.threshold_percent = intent.parameters.threshold_percent;
    }
    
    return params;
  }
  
  inferTelegramParams(intent) {
    let message = '系统提醒';
    
    if (intent.goal.includes('监控') && intent.parameters?.symbol) {
      const symbol = intent.parameters.symbol;
      message = `${symbol}价格监控已启动`;
      
      if (intent.parameters.threshold_percent) {
        message += `，下跌${Math.abs(intent.parameters.threshold_percent)}%时将提醒`;
      }
    } else if (intent.goal.includes('知乎')) {
      message = '知乎热榜数据收集任务已启动';
    }
    
    return {
      message,
      to: 'user'
    };
  }
  
  inferCronParams(intent) {
    let schedule = '*/5 * * * *'; // 默认5分钟
    
    if (intent.parameters?.interval) {
      const interval = intent.parameters.interval.value;
      const unit = intent.parameters.interval.unit;
      
      if (unit === 'minutes') {
        schedule = `*/${interval} * * * *`;
      } else if (unit === 'hours') {
        schedule = `0 */${interval} * * *`;
      } else if (unit === 'days') {
        schedule = `0 9 */${interval} * *`; // 每天9点
      }
    }
    
    return { schedule };
  }
  
  inferZhihuParams(intent) {
    return {
      limit: intent.parameters?.limit || 10
    };
  }
  
  inferFileStorageParams(intent) {
    const timestamp = new Date().toISOString().split('T')[0];
    const workflowName = intent.goal.replace(/\s+/g, '_').toLowerCase();
    
    return {
      path: `/data/${timestamp}_${workflowName}.json`,
      content: '{}'
    };
  }
  
  inferDefaultParams(intent, skillName) {
    // 为未知技能提供默认参数
    return {
      action: 'execute',
      notes: `自动为技能 ${skillName} 生成的参数`
    };
  }
}

module.exports = ParameterInferrer;