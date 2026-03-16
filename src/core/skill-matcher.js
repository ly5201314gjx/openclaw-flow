/**
 * 技能匹配器
 * 根据意图匹配合适的技能链
 */

class SkillMatcher {
  // 能力到技能的映射
  capabilityToSkills = {
    price_monitoring: ['binance-trading'],
    scheduling: ['cron'],
    notification: ['telegram-message'],
    data_fetch: ['zhihu-hot', 'twitter-search', 'github-search'],
    data_storage: ['file-storage'],
    automation: ['cron', 'schedule'],
    analysis: ['data-analysis']
  };

  // 意图到能力映射
  intentToCapabilities = {
    price_monitor: ['price_monitoring', 'scheduling', 'notification'],
    data_collection: ['data_fetch', 'scheduling', 'notification', 'data_storage'],
    notification: ['notification'],
    scheduling: ['scheduling'],
    automation: ['automation']
  };

  // 平台到技能映射
  platformToSkills = {
    zhihu: ['zhihu-hot'],
    twitter: ['twitter-search'],
    github: ['github-search'],
    bilibili: ['bilibili-feed'],
    weibo: ['weibo-trending']
  };

  match(intent) {
    // 确定所需能力
    const requiredCapabilities = new Set();
    
    // 根据意图类型添加能力
    for (const intentType of intent.intent_types) {
      const capabilities = this.intentToCapabilities[intentType] || [];
      capabilities.forEach(cap => requiredCapabilities.add(cap));
    }
    
    // 根据平台添加特定技能
    if (intent.parameters?.platform) {
      const platformSkills = this.platformToSkills[intent.parameters.platform] || [];
      platformSkills.forEach(skill => {
        // 找到技能对应的能力
        for (const [cap, skills] of Object.entries(this.capabilityToSkills)) {
          if (skills.includes(skill)) {
            requiredCapabilities.add(cap);
            break;
          }
        }
      });
    }
    
    // 添加约束条件相关能力
    if (intent.constraints.includes('自动执行')) {
      requiredCapabilities.add('automation');
    }
    
    if (intent.parameters?.notify_channel === 'telegram') {
      requiredCapabilities.add('notification');
    }
    
    // 匹配技能
    const matchedSkills = new Set();
    for (const capability of requiredCapabilities) {
      const skills = this.capabilityToSkills[capability] || [];
      skills.forEach(skill => matchedSkills.add(skill));
    }
    
    // 返回排序后的技能链
    return this.orderSkillChain(Array.from(matchedSkills), intent);
  }

  orderSkillChain(skills, intent) {
    // 技能执行顺序逻辑
    const executionOrder = [
      'data_fetch',          // 数据获取
      'price_monitoring',    // 价格监控  
      'analysis',            // 分析处理
      'data_storage',        // 数据存储
      'notification',        // 通知发送
      'scheduling',          // 定时调度
      'automation'           // 自动化
    ];
    
    // 技能到主要能力的映射
    const skillToCapability = {};
    for (const [capability, skillList] of Object.entries(this.capabilityToSkills)) {
      for (const skill of skillList) {
        skillToCapability[skill] = capability;
      }
    }
    
    // 按执行顺序排序
    return skills.sort((a, b) => {
      const capA = skillToCapability[a];
      const capB = skillToCapability[b];
      
      const indexA = executionOrder.indexOf(capA);
      const indexB = executionOrder.indexOf(capB);
      
      // 两个都在顺序列表中
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // 只有A在列表中
      if (indexA !== -1) {
        return -1;
      }
      
      // 只有B在列表中
      if (indexB !== -1) {
        return 1;
      }
      
      // 都不在列表中，保持原顺序
      return 0;
    });
  }

  // 验证技能是否可用
  validateSkillAvailability(skill) {
    // 这里应该检查技能是否已安装
    // 目前返回模拟数据
    const availableSkills = [
      'binance-trading',
      'cron', 
      'telegram-message',
      'zhihu-hot',
      'file-storage'
    ];
    
    return availableSkills.includes(skill);
  }

  // 获取技能描述
  getSkillDescription(skill) {
    const descriptions = {
      'binance-trading': '币安量化交易，支持价格监控和交易',
      'cron': '定时任务调度，支持周期性执行',
      'telegram-message': '发送Telegram消息通知',
      'zhihu-hot': '获取知乎热榜内容',
      'file-storage': '文件存储和管理',
      'twitter-search': '搜索推特内容',
      'github-search': '搜索GitHub仓库',
      'data-analysis': '数据分析处理'
    };
    
    return descriptions[skill] || '未命名技能';
  }
}

module.exports = SkillMatcher;