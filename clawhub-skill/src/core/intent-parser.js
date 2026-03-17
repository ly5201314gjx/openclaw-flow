/**
 * 意图解析器
 * 将自然语言转换为结构化意图
 */

class IntentParser {
  // 意图模式匹配
  patterns = {
    price_monitor: [
      /监控(.+?)价格/,
      /关注(.+?)行情/,
      /(.+?)跌(.+?)就提醒/,
      /监控(.+?)(涨|跌)/
    ],
    data_collection: [
      /获取(.+?)热榜/,
      /收集(.+?)数据/,
      /每天给我(.+?)/
    ],
    notification: [
      /提醒我/,
      /通知我/,
      /发消息/,
      /通过(.+?)发送/
    ],
    scheduling: [
      /每天/,
      /每小时/,
      /每(.+?)分钟/,
      /定时/,
      /定期/
    ]
  };

  // 币种映射
  symbolMap = {
    'WLD': 'WLDUSDT',
    'BTC': 'BTCUSDT', 
    'ETH': 'ETHUSDT',
    'WIF': 'WIFUSDT',
    'BNB': 'BNBUSDT'
  };

  parse(text) {
    const lowerText = text.toLowerCase();
    
    return {
      raw_text: text,
      intent_types: this.detectIntentTypes(lowerText),
      parameters: this.extractParameters(text),
      constraints: this.extractConstraints(lowerText),
      goal: this.summarizeGoal(text)
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
    
    // 提取币种符号（支持中英文）
    const symbolPattern = /([A-Z]{2,6})|(wld|btc|eth|wif|bnb)/gi;
    const symbolMatch = text.match(symbolPattern);
    if (symbolMatch) {
      let symbol = symbolMatch[0].toUpperCase();
      if (symbol.length <= 3) {
        symbol = this.symbolMap[symbol] || symbol + 'USDT';
      }
      params.symbol = symbol;
    }
    
    // 提取百分比阈值
    const percentMatch = text.match(/[跌降降下](\d+)%/);
    if (percentMatch) {
      params.threshold_percent = -parseInt(percentMatch[1]);
    }
    
    // 提取涨幅阈值
    const riseMatch = text.match(/[上涨涨升](\d+)%/);
    if (riseMatch) {
      params.rise_threshold_percent = parseInt(riseMatch[1]);
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
    const platformMap = {
      '知乎': 'zhihu',
      '推特': 'twitter', 
      '微博': 'weibo',
      'b站': 'bilibili',
      'github': 'github'
    };
    
    for (const [chinese, english] of Object.entries(platformMap)) {
      if (text.includes(chinese) || text.toLowerCase().includes(english)) {
        params.platform = english;
        break;
      }
    }
    
    // 提取数量限制
    const limitMatch = text.match(/(\d+)个/);
    if (limitMatch) {
      params.limit = parseInt(limitMatch[1]);
    }
    
    // 提取通知渠道
    if (text.includes('Telegram') || text.includes('tg')) {
      params.notify_channel = 'telegram';
    } else if (text.includes('微信')) {
      params.notify_channel = 'wechat';
    } else if (text.includes('飞书')) {
      params.notify_channel = 'feishu';
    }
    
    return params;
  }

  extractConstraints(text) {
    const constraints = [];
    
    if (text.includes('自动')) {
      constraints.push('自动执行');
    }
    
    if (text.includes('实时')) {
      constraints.push('实时监控');
    }
    
    if (text.includes('安全') || text.includes('风控')) {
      constraints.push('安全风控');
    }
    
    return constraints;
  }

  summarizeGoal(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('监控') || lowerText.includes('关注')) {
      const symbolMatch = text.match(/([A-Z]{2,6})|(wld|btc|eth)/i);
      if (symbolMatch) {
        const symbol = symbolMatch[0].toUpperCase();
        return `监控${symbol}价格变化`;
      }
      return '监控资产价格';
    }
    
    if (lowerText.includes('获取') || lowerText.includes('收集')) {
      if (text.includes('知乎')) {
        return '获取知乎热榜内容';
      } else if (text.includes('推特')) {
        return '收集推特动态';
      }
      return '收集数据信息';
    }
    
    if (lowerText.includes('提醒') || lowerText.includes('通知')) {
      return '设置提醒通知';
    }
    
    return '完成自动化任务';
  }
}

module.exports = IntentParser;