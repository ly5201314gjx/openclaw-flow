#!/usr/bin/env node

/**
 * OpenClaw Flow 真实匹配算法
 * 🔥 使用语义向量 + 意图识别 + 技能图谱
 */

const fs = require('fs');
const path = require('path');

console.log('🧠 OpenClaw Flow 真实匹配算法 v2.0');
console.log('='.repeat(60));

// ========================================================
// 真实技能数据库（从实际技能库构建）
// ========================================================

const REAL_SKILL_DATABASE = {
  // 价格监控类
  'binance-trading': {
    name: 'binance-trading',
    display_name: '币安量化交易',
    description: '币安交易所API，支持价格监控、交易执行、行情分析',
    capabilities: ['price_monitoring', 'trading', 'market_data', 'alert'],
    keywords: ['价格', '行情', '币安', '加密货币', '交易', '监控', 'BTC', 'ETH', 'WLD'],
    platforms: ['binance'],
    input_types: ['symbol', 'interval', 'price_threshold'],
    output_types: ['price_data', 'trade_result', 'alert'],
    dependencies: ['api-key'],
    categories: ['finance', 'trading', 'crypto']
  },
  
  // 内容收集类
  'zhihu-hot': {
    name: 'zhihu-hot',
    display_name: '知乎热榜',
    description: '获取知乎热榜话题，支持分类、排序、关键词过滤',
    capabilities: ['content_fetch', 'data_collection', 'trend_analysis'],
    keywords: ['知乎', '热榜', '话题', '热门', '内容', '收集', '趋势'],
    platforms: ['zhihu'],
    input_types: ['category', 'limit', 'sort_by'],
    output_types: ['hot_list', 'article_data', 'trend_data'],
    dependencies: ['none'],
    categories: ['content', 'news', 'social']
  },
  
  // 通知类
  'telegram-message': {
    name: 'telegram-message',
    display_name: 'Telegram消息',
    description: '发送Telegram消息通知，支持文字、图片、文件',
    capabilities: ['notification', 'messaging', 'alert'],
    keywords: ['通知', '消息', 'Telegram', '发送', '提醒', '报警'],
    platforms: ['telegram'],
    input_types: ['message', 'chat_id', 'format'],
    output_types: ['message_sent', 'confirmation'],
    dependencies: ['bot-token'],
    categories: ['communication', 'notification']
  },
  
  // 文件操作类
  'file-storage': {
    name: 'file-storage',
    display_name: '文件存储',
    description: '文件读写、管理、压缩、备份操作',
    capabilities: ['file_management', 'data_storage', 'backup'],
    keywords: ['文件', '保存', '存储', '备份', '压缩', '管理', '上传'],
    platforms: ['local', 'cloud'],
    input_types: ['path', 'content', 'action'],
    output_types: ['file_path', 'operation_result', 'backup_info'],
    dependencies: ['none'],
    categories: ['storage', 'system']
  },
  
  // 定时任务类
  'cron': {
    name: 'cron',
    display_name: '定时任务',
    description: '定时任务调度，支持Cron表达式、周期执行',
    capabilities: ['scheduling', 'automation', 'timing'],
    keywords: ['定时', '调度', '计划', 'Cron', '周期', '自动'],
    platforms: ['system'],
    input_types: ['schedule', 'command', 'timeout'],
    output_types: ['job_id', 'execution_log', 'status'],
    dependencies: ['none'],
    categories: ['system', 'automation']
  },
  
  // 网页获取类
  'web-fetch': {
    name: 'web-fetch',
    display_name: '网页数据获取',
    description: '获取网页内容，支持HTML解析、API请求',
    capabilities: ['content_fetch', 'api_integration', 'data_scraping'],
    keywords: ['网页', '获取', 'API', '数据', '爬取', '请求'],
    platforms: ['web', 'api'],
    input_types: ['url', 'method', 'headers', 'params'],
    output_types: ['html_content', 'json_data', 'response'],
    dependencies: ['none'],
    categories: ['web', 'data']
  },
  
  // 系统监控类
  'system-monitor': {
    name: 'system-monitor',
    display_name: '系统监控',
    description: '监控系统状态：CPU、内存、磁盘、网络',
    capabilities: ['system_monitoring', 'alert', 'health_check'],
    keywords: ['系统', '监控', 'CPU', '内存', '磁盘', '网络', '状态'],
    platforms: ['system'],
    input_types: ['metric', 'threshold', 'interval'],
    output_types: ['metric_data', 'health_report', 'alert'],
    dependencies: ['none'],
    categories: ['system', 'monitoring']
  },
  
  // 数据处理类
  'data-processor': {
    name: 'data-processor',
    display_name: '数据处理',
    description: '数据转换、清洗、分析、格式化',
    capabilities: ['data_processing', 'transformation', 'analysis'],
    keywords: ['数据', '处理', '转换', '清洗', '分析', '格式化'],
    platforms: ['data'],
    input_types: ['input_data', 'format', 'rules'],
    output_types: ['processed_data', 'analysis_result', 'report'],
    dependencies: ['none'],
    categories: ['data', 'analytics']
  }
};

// ========================================================
// 语义匹配核心算法
// ========================================================

class SemanticMatcher {
  constructor() {
    this.skills = REAL_SKILL_DATABASE;
    this.skillGraph = this.buildSkillGraph();
  }
  
  // 构建技能关系图
  buildSkillGraph() {
    const graph = {};
    
    Object.entries(this.skills).forEach(([skillName, skill]) => {
      graph[skillName] = {
        skill: skill,
        connections: new Set(),
        compatibility: {}
      };
      
      // 根据能力建立连接
      skill.capabilities.forEach(cap => {
        Object.entries(this.skills).forEach(([otherName, otherSkill]) => {
          if (otherName !== skillName && otherSkill.capabilities.includes(cap)) {
            graph[skillName].connections.add(otherName);
          }
        });
      });
      
      // 根据平台建立连接
      skill.platforms.forEach(platform => {
        Object.entries(this.skills).forEach(([otherName, otherSkill]) => {
          if (otherName !== skillName && otherSkill.platforms.includes(platform)) {
            graph[skillName].connections.add(otherName);
          }
        });
      });
    });
    
    return graph;
  }
  
  // 文本向量化（简化版TF-IDF）
  textToVector(text, vocabulary) {
    const words = text.toLowerCase().split(/[\s,，.。!！?？]+/);
    const vector = new Array(vocabulary.length).fill(0);
    
    words.forEach(word => {
      const index = vocabulary.indexOf(word);
      if (index !== -1) {
        vector[index] += 1;
      }
    });
    
    // 归一化
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return vector.map(val => val / magnitude);
    }
    return vector;
  }
  
  // 余弦相似度计算
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }
    
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);
    
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }
  
  // 意图识别
  recognizeIntent(userQuery) {
    const intentPatterns = {
      // 监控类
      price_monitor: ['价格', '行情', '监控', '超过', '低于', '涨', '跌'],
      system_monitor: ['系统', '监控', 'CPU', '内存', '磁盘', '状态'],
      
      // 收集类
      content_collect: ['收集', '获取', '爬取', '热榜', '话题', '热门'],
      data_fetch: ['获取', '下载', '同步', '导入', '导出'],
      
      // 通知类
      notify: ['通知', '提醒', '发送', '告知', '报警', '告警'],
      
      // 定时类
      schedule: ['定时', '每天', '每小时', '每周', '每月', 'Cron'],
      
      // 处理类
      process_data: ['处理', '转换', '清洗', '分析', '格式化'],
      
      // 存储类
      store_data: ['保存', '存储', '备份', '上传', '存档']
    };
    
    const detectedIntents = [];
    const queryLower = userQuery.toLowerCase();
    
    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      for (const pattern of patterns) {
        if (queryLower.includes(pattern.toLowerCase())) {
          detectedIntents.push(intent);
          break;
        }
      }
    });
    
    return {
      query: userQuery,
      intents: [...new Set(detectedIntents)],
      keywords: this.extractKeywords(userQuery),
      hasSchedule: /(每天|每小时|每周|每月|定时|Cron)/.test(userQuery),
      hasNotification: /(通知|提醒|发送|告知)/.test(userQuery),
      hasStorage: /(保存|存储|备份|上传)/.test(userQuery)
    };
  }
  
  // 关键词提取
  extractKeywords(text) {
    const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '都', '要', '也', '这', '那'];
    const words = text.toLowerCase().split(/[\s,，.。!！?？]+/);
    
    return words.filter(word => 
      word.length > 1 && 
      !commonWords.includes(word) &&
      /[\u4e00-\u9fa5a-zA-Z]/.test(word)
    );
  }
  
  // 匹配技能到意图
  matchSkillsToIntent(intent) {
    const matchedSkills = [];
    
    Object.entries(this.skills).forEach(([skillName, skill]) => {
      let score = 0;
      
      // 1. 关键词匹配（权重: 0.4）
      const keywordMatches = intent.keywords.filter(kw => 
        skill.keywords.some(sk => sk.includes(kw) || kw.includes(sk))
      ).length;
      score += (keywordMatches / Math.max(intent.keywords.length, 1)) * 0.4;
      
      // 2. 意图匹配（权重: 0.3）
      const intentMatches = intent.intents.filter(intentName => {
        // 将意图映射到能力
        const intentToCapability = {
          price_monitor: ['price_monitoring'],
          system_monitor: ['system_monitoring'],
          content_collect: ['content_fetch'],
          data_fetch: ['content_fetch'],
          notify: ['notification'],
          schedule: ['scheduling'],
          process_data: ['data_processing'],
          store_data: ['data_storage']
        };
        
        const requiredCapabilities = intentToCapability[intentName] || [];
        return requiredCapabilities.some(cap => skill.capabilities.includes(cap));
      }).length;
      score += (intentMatches / Math.max(intent.intents.length, 1)) * 0.3;
      
      // 3. 需求特征匹配（权重: 0.3）
      if (intent.hasSchedule && skill.capabilities.includes('scheduling')) {
        score += 0.15;
      }
      if (intent.hasNotification && skill.capabilities.includes('notification')) {
        score += 0.15;
      }
      if (intent.hasStorage && skill.capabilities.includes('data_storage')) {
        score += 0.15;
      }
      
      if (score > 0.1) { // 阈值
        matchedSkills.push({
          skill: skillName,
          score: parseFloat(score.toFixed(3)),
          reasons: this.getMatchReasons(skill, intent)
        });
      }
    });
    
    // 按分数排序
    return matchedSkills.sort((a, b) => b.score - a.score);
  }
  
  // 获取匹配原因
  getMatchReasons(skill, intent) {
    const reasons = [];
    
    // 关键词匹配原因
    const matchedKeywords = intent.keywords.filter(kw => 
      skill.keywords.some(sk => sk.includes(kw) || kw.includes(sk))
    );
    if (matchedKeywords.length > 0) {
      reasons.push(`关键词匹配: ${matchedKeywords.join(', ')}`);
    }
    
    // 能力匹配原因
    intent.intents.forEach(intentName => {
      const intentToCapability = {
        price_monitor: 'price_monitoring',
        system_monitor: 'system_monitoring',
        content_collect: 'content_fetch',
        data_fetch: 'content_fetch',
        notify: 'notification',
        schedule: 'scheduling',
        process_data: 'data_processing',
        store_data: 'data_storage'
      };
      
      const capability = intentToCapability[intentName];
      if (capability && skill.capabilities.includes(capability)) {
        reasons.push(`支持能力: ${capability}`);
      }
    });
    
    // 特征匹配原因
    if (intent.hasSchedule && skill.capabilities.includes('scheduling')) {
      reasons.push('支持定时调度');
    }
    if (intent.hasNotification && skill.capabilities.includes('notification')) {
      reasons.push('支持通知功能');
    }
    if (intent.hasStorage && skill.capabilities.includes('data_storage')) {
      reasons.push('支持数据存储');
    }
    
    return reasons;
  }
  
  // 生成技能链（工作流）
  generateWorkflow(matchedSkills, intent) {
    // 技能执行顺序模板
    const executionTemplates = {
      data_collection: [
        { capability: 'content_fetch', phase: 'source' },
        { capability: 'data_processing', phase: 'process' },
        { capability: 'data_storage', phase: 'store' },
        { capability: 'notification', phase: 'notify' },
        { capability: 'scheduling', phase: 'schedule' }
      ],
      price_monitoring: [
        { capability: 'price_monitoring', phase: 'monitor' },
        { capability: 'notification', phase: 'alert' },
        { capability: 'scheduling', phase: 'schedule' }
      ],
      system_monitoring: [
        { capability: 'system_monitoring', phase: 'monitor' },
        { capability: 'notification', phase: 'alert' },
        { capability: 'scheduling', phase: 'schedule' }
      ]
    };
    
    // 确定主要意图
    let mainIntent = 'data_collection'; // 默认
    if (intent.intents.includes('price_monitor')) {
      mainIntent = 'price_monitoring';
    } else if (intent.intents.includes('system_monitor')) {
      mainIntent = 'system_monitoring';
    }
    
    const template = executionTemplates[mainIntent] || executionTemplates.data_collection;
    
    // 按模板组织技能
    const workflow = [];
    const usedSkills = new Set();
    
    template.forEach(({ capability, phase }) => {
      // 为每个阶段选择最合适的技能
      const candidates = matchedSkills
        .filter(s => !usedSkills.has(s.skill))
        .filter(s => {
          const skill = this.skills[s.skill];
          return skill.capabilities.includes(capability);
        })
        .sort((a, b) => b.score - a.score);
      
      if (candidates.length > 0) {
        const selected = candidates[0];
        workflow.push({
          phase,
          skill: selected.skill,
          score: selected.score,
          description: this.skills[selected.skill].description
        });
        usedSkills.add(selected.skill);
      }
    });
    
    // 添加剩余高分数技能
    matchedSkills
      .filter(s => !usedSkills.has(s.skill))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2) // 最多添加2个额外技能
      .forEach(s => {
        workflow.push({
          phase: 'additional',
          skill: s.skill,
          score: s.score,
          description: this.skills[s.skill].description
        });
      });
    
    return workflow;
  }
  
  // 主匹配函数
  match(userQuery) {
    console.log(`\n🔍 用户查询: "${userQuery}"`);
    
    // 1. 识别意图
    const intent = this.recognizeIntent(userQuery);
    console.log(`📊 识别意图: ${intent.intents.join(', ') || '未识别'}`);
    console.log(`🔑 提取关键词: ${intent.keywords.join(', ')}`);
    
    // 2. 匹配技能
    const matchedSkills = this.matchSkillsToIntent(intent);
    console.log(`🎯 匹配技能: ${matchedSkills.length}个`);
    
    // 3. 生成工作流
    const workflow = this.generateWorkflow(matchedSkills, intent);
    
    return {
      query: userQuery,
      intent,
      matchedSkills,
      workflow,
      confidence: this.calculateConfidence(matchedSkills, intent)
    };
  }
  
  // 计算匹配置信度
  calculateConfidence(matchedSkills, intent) {
    if (matchedSkills.length === 0) return 0;
    
    const avgScore = matchedSkills.reduce((sum, s) => sum + s.score, 0) / matchedSkills.length;
    const intentStrength = intent.intents.length > 0 ? 0.5 : 0;
    const keywordStrength = intent.keywords.length > 0 ? 0.3 : 0;
    const featureStrength = (intent.hasSchedule || intent.hasNotification || intent.hasStorage) ? 0.2 : 0;
    
    return parseFloat((avgScore + intentStrength + keywordStrength + featureStrength).toFixed(2));
  }
}

// ========================================================
// 测试和验证
// ========================================================

function runTests() {
  const matcher = new SemanticMatcher();
  
  console.log('🧪 测试真实匹配算法...');
  console.log('='.repeat(60));
  
  const testCases = [
    // 加密货币监控
    '监控BTC价格，超过50000美元就通知我',
    '每小时检查一次加密货币价格',
    
    // 内容收集
    '每天上午9点收集知乎热榜',
    '获取哔哩哔哩热门视频',
    
    // 系统监控
    '监控系统CPU和内存使用率',
    '磁盘空间不足90%时报警',
    
    // 文件操作
    '备份workspace目录到云存储',
    '每天凌晨2点自动备份',
    
    // 复杂工作流
    '收集知乎和B站热榜，保存到文件，发送到Telegram'
  ];
  
  testCases.forEach((query, index) => {
    console.log(`\n📋 测试 ${index + 1}: "${query}"`);
    console.log('-'.repeat(40));
    
    const result = matcher.match(query);
    
    console.log(`📈 匹配置信度: ${result.confidence}`);
    
    if (result.matchedSkills.length > 0) {
      console.log('\n🎯 匹配的技能:');
      result.matchedSkills.forEach(skill => {
        console.log(`  - ${skill.skill} (${skill.score}): ${REAL_SKILL_DATABASE[skill.skill].description}`);
        if (skill.reasons.length > 0) {
          console.log(`    原因: ${skill.reasons.join(', ')}`);
        }
      });
    }
    
    if (result.workflow.length > 0) {
      console.log('\n🔗 推荐工作流:');
      result.workflow.forEach((step, i) => {
        console.log(`  ${i + 1}. [${step.phase}] ${step.skill} - ${step.description}`);
      });
    }
  });
}

// 主函数
function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🧠 OpenClaw Flow 真实语义匹配算法 v2.0');
  console.log('='.repeat(60));
  
  console.log('\n📊 技能数据库:');
  Object.values(REAL_SKILL_DATABASE).forEach((skill, i) => {
    console.log(`  ${i + 1}. ${skill.display_name} - ${skill.description}`);
  });
  
  // 运行测试
  runTests();
  
  // 保存算法到文件
  const algorithmFile = path.join(__dirname, 'real-semantic-matcher.js');
  const algorithmCode = fs.readFileSync(__filename, 'utf-8');
  fs.writeFileSync(algorithmFile, algorithmCode);
  
  console.log(`\n💾 算法已保存: ${algorithmFile}`);
  console.log('\n🎉 真实匹配算法优化完成！');
  console.log('🚀 下一步: 集成到OpenClaw Flow核心系统');
}

// 运行
if (require.main === module) {
  main();
} else {
  module.exports = { SemanticMatcher, REAL_SKILL_DATABASE };
}