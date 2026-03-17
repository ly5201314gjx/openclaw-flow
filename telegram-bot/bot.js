#!/usr/bin/env node

/**
 * 🚀 OpenClaw Flow Telegram Bot
 * 🤖 智能对话界面 - 一句话创建复杂工作流
 * 
 * 主要功能:
 * 1. 自然语言创建工作流
 * 2. 可视化工作流管理
 * 3. 实时状态监控
 * 4. 智能对话助手
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const winston = require('winston');

// 配置日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 检查环境变量
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  logger.error('❌ 请设置TELEGRAM_BOT_TOKEN环境变量');
  logger.info('ℹ️  联系 @BotFather 创建Bot并获取Token');
  process.exit(1);
}

// 创建Bot实例
const bot = new TelegramBot(token, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

logger.info('🤖 OpenClaw Flow Telegram Bot 启动中...');
logger.info(`📊 环境: ${process.env.NODE_ENV || 'development'}`);
logger.info(`🔗 Bot用户名: @${process.env.BOT_USERNAME || '未设置'}`);

// ============================================
// 核心消息处理器
// ============================================

class MessageHandler {
  constructor(bot, logger) {
    this.bot = bot;
    this.logger = logger;
    this.userStates = new Map(); // 用户对话状态
  }

  // 处理/start命令
  async handleStart(msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    
    this.logger.info(`👋 新用户: ${username} (${chatId})`);
    
    const welcomeMessage = `🎉 *欢迎使用 OpenClaw Flow！* 🤖\n\n` +
      `我是你的智能自动化助手，可以帮你：\n\n` +
      `✅ *一句话创建工作流* - 告诉我你想做什么\n` +
      `✅ *智能参数配置* - 我会引导你完成设置\n` +
      `✅ *实时监控管理* - 随时查看工作流状态\n` +
      `✅ *多平台自动化* - 支持加密货币、内容收集、文件备份等\n\n` +
      `💪 *立即试试看：*\n` +
      `1. 直接告诉我你的需求\n` +
      `  例如："监控BTC价格"\n` +
      `2. 或使用命令快速开始：\n` +
      `  /create - 创建新工作流\n` +
      `  /list - 查看现有工作流\n` +
      `  /help - 获取帮助\n\n` +
      `🚀 *你的第一句话，我的完整工作流！*`;
    
    const keyboard = {
      reply_markup: {
        keyboard: [
          [{ text: '🚀 创建第一个工作流' }],
          [{ text: '📊 查看使用教程' }, { text: '💡 功能示例' }],
          [{ text: '⚙️ 设置' }, { text: '❓ 帮助' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    };
    
    await this.bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      ...keyboard
    });
    
    // 设置用户初始状态
    this.userStates.set(chatId, { state: 'idle', context: {} });
  }

  // 处理文本消息
  async handleText(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const username = msg.from.username || msg.from.first_name;
    
    this.logger.info(`💬 消息来自 ${username}: ${text}`);
    
    // 检查用户状态
    const userState = this.userStates.get(chatId) || { state: 'idle', context: {} };
    
    // 处理快捷按钮
    if (text === '🚀 创建第一个工作流') {
      await this.handleCreateWorkflow(msg);
      return;
    }
    
    if (text === '📊 查看使用教程') {
      await this.handleTutorial(msg);
      return;
    }
    
    if (text === '💡 功能示例') {
      await this.handleExamples(msg);
      return;
    }
    
    // 自然语言处理
    if (this.isNaturalLanguageCommand(text)) {
      await this.processNaturalLanguage(chatId, text, userState);
      return;
    }
    
    // 根据状态处理
    switch (userState.state) {
      case 'awaiting_workflow_name':
        await this.handleWorkflowName(chatId, text, userState);
        break;
      case 'awaiting_parameter':
        await this.handleParameterInput(chatId, text, userState);
        break;
      default:
        await this.handleGeneralMessage(chatId, text);
    }
  }

  // 判断是否为自然语言命令
  isNaturalLanguageCommand(text) {
    const patterns = [
      /监控|监控|监视|关注/i,
      /收集|获取|爬取|抓取/i,
      /备份|保存|存储|存档/i,
      /同步|更新|导入|导出/i,
      /提醒|通知|报警|告警/i,
      /每天|定时|每周|每月/i
    ];
    
    return patterns.some(pattern => pattern.test(text));
  }

  // 处理自然语言命令
  async processNaturalLanguage(chatId, text, userState) {
    this.logger.info(`🧠 处理自然语言: ${text}`);
    
    // 解析意图
    const intent = await this.parseIntent(text);
    
    // 发送处理中的消息
    await this.bot.sendMessage(chatId, `🧠 正在分析你的需求: "${text}"`, {
      parse_mode: 'Markdown'
    });
    
    // 调用OpenClaw Flow处理
    try {
      const workflow = await this.createWorkflowFromIntent(intent, text);
      
      // 显示工作流详情
      await this.showWorkflowDetails(chatId, workflow);
      
      // 询问是否确认创建
      await this.askForConfirmation(chatId, workflow);
      
    } catch (error) {
      this.logger.error(`❌ 创建工作流失败: ${error.message}`);
      await this.bot.sendMessage(chatId, `❌ 抱歉，处理时出现错误:\n\`${error.message}\``, {
        parse_mode: 'Markdown'
      });
    }
  }

  // 解析用户意图
  async parseIntent(text) {
    // 这里可以集成更复杂的NLP算法
    // 目前使用简单的关键词匹配
    
    const lowerText = text.toLowerCase();
    
    // 意图检测
    const intent = {
      type: 'unknown',
      parameters: {},
      confidence: 0.8
    };
    
    // 价格监控相关
    if (/(BTC|比特币|以太坊|ETH|加密货币|数字货币)/i.test(text)) {
      intent.type = 'crypto_monitor';
      intent.parameters.asset = this.extractAsset(text);
      intent.parameters.threshold = this.extractNumber(text);
    }
    
    // 内容收集相关
    if (/(知乎|B站|哔哩哔哩|微博|热榜|热门|趋势)/i.test(text)) {
      intent.type = 'content_collect';
      intent.parameters.platform = this.extractPlatform(text);
      intent.parameters.frequency = this.extractFrequency(text);
    }
    
    // 文件备份相关
    if (/(备份|保存|存储|存档|workspace|目录)/i.test(text)) {
      intent.type = 'file_backup';
      intent.parameters.path = this.extractPath(text);
      intent.parameters.schedule = this.extractSchedule(text);
    }
    
    // 系统监控相关
    if (/(系统|CPU|内存|磁盘|监控|状态)/i.test(text)) {
      intent.type = 'system_monitor';
      intent.parameters.metrics = this.extractMetrics(text);
      intent.parameters.threshold = this.extractNumber(text);
    }
    
    return intent;
  }

  // 从文本中提取资产信息
  extractAsset(text) {
    const assets = {
      'BTC': ['BTC', '比特币', 'btc'],
      'ETH': ['ETH', '以太坊', 'eth'],
      'WLD': ['WLD', 'worldcoin', 'wld'],
      'SOL': ['SOL', 'solana', 'sol']
    };
    
    for (const [asset, keywords] of Object.entries(assets)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
        return asset;
      }
    }
    
    return 'BTC'; // 默认
  }

  // 从文本中提取数字
  extractNumber(text) {
    const match = text.match(/\$?(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  // 从文本中提取平台信息
  extractPlatform(text) {
    if (/知乎/i.test(text)) return 'zhihu';
    if (/(B站|哔哩哔哩)/i.test(text)) return 'bilibili';
    if (/微博/i.test(text)) return 'weibo';
    return 'zhihu'; // 默认
  }

  // 从文本中提取频率
  extractFrequency(text) {
    if (/每天|每日/i.test(text)) return 'daily';
    if (/每小时/i.test(text)) return 'hourly';
    if (/每周/i.test(text)) return 'weekly';
    if (/实时|立即/i.test(text)) return 'realtime';
    return 'daily'; // 默认
  }

  // 创建工作流
  async createWorkflowFromIntent(intent, originalText) {
    // 这里调用OpenClaw Flow核心功能
    // 目前先返回模拟数据
    
    const workflowTemplates = {
      crypto_monitor: {
        name: '加密货币价格监控',
        type: 'monitoring',
        description: `监控${intent.parameters.asset}价格`,
        parameters: {
          asset: intent.parameters.asset || 'BTC',
          threshold: intent.parameters.threshold || 50000,
          frequency: '15m',
          notification: 'telegram'
        },
        steps: [
          { action: 'fetch_price', interval: '15m' },
          { action: 'check_threshold', condition: `price > ${intent.parameters.threshold || 50000}` },
          { action: 'send_notification', channel: 'telegram' }
        ]
      },
      content_collect: {
        name: '热点内容收集',
        type: 'collection',
        description: `收集${intent.parameters.platform}热榜`,
        parameters: {
          platform: intent.parameters.platform || 'zhihu',
          frequency: intent.parameters.frequency || 'daily',
          limit: 10,
          save_format: 'json'
        }
      }
    };
    
    const template = workflowTemplates[intent.type] || workflowTemplates.crypto_monitor;
    
    return {
      id: `wf_${Date.now()}`,
      name: template.name,
      type: template.type,
      description: template.description,
      original_query: originalText,
      parameters: template.parameters,
      steps: template.steps || [],
      created_at: new Date().toISOString(),
      status: 'pending',
      confidence: intent.confidence
    };
  }

  // 显示工作流详情
  async showWorkflowDetails(chatId, workflow) {
    const message = `📋 *工作流详情*\n\n` +
      `🎯 *名称*: ${workflow.name}\n` +
      `📝 *描述*: ${workflow.description}\n\n` +
      `⚙️ *参数配置*:\n`;
    
    let paramsText = '';
    for (const [key, value] of Object.entries(workflow.parameters)) {
      paramsText += `  • ${key}: \`${value}\`\n`;
    }
    
    const fullMessage = message + paramsText + `\n📊 *置信度*: ${(workflow.confidence * 100).toFixed(1)}%`;
    
    await this.bot.sendMessage(chatId, fullMessage, {
      parse_mode: 'Markdown'
    });
  }

  // 请求确认创建
  async askForConfirmation(chatId, workflow) {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ 确认创建', callback_data: `create_confirm:${workflow.id}` },
            { text: '✏️ 编辑参数', callback_data: `create_edit:${workflow.id}` }
          ],
          [
            { text: '❌ 取消', callback_data: 'create_cancel' }
          ]
        ]
      }
    };
    
    await this.bot.sendMessage(chatId, '请确认是否创建此工作流:', keyboard);
    
    // 更新用户状态
    this.userStates.set(chatId, {
      state: 'awaiting_confirmation',
      context: { workflow }
    });
  }

  // 处理回调查询
  async handleCallbackQuery(query) {
    const chatId = query.message.chat.id;
    const data = query.data;
    
    this.logger.info(`🔄 回调查询: ${data}`);
    
    // 确认创建工作流
    if (data.startsWith('create_confirm:')) {
      const workflowId = data.split(':')[1];
      await this.confirmWorkflowCreation(chatId, workflowId);
    }
    
    // 编辑工作流
    else if (data.startsWith('create_edit:')) {
      const workflowId = data.split(':')[1];
      await this.startWorkflowEditing(chatId, workflowId);
    }
    
    // 取消创建
    else if (data === 'create_cancel') {
      await this.bot.sendMessage(chatId, '❌ 已取消创建工作流。');
      this.userStates.set(chatId, { state: 'idle', context: {} });
    }
    
    // 回答回调查询
    await this.bot.answerCallbackQuery(query.id);
  }

  // 确认创建工作流
  async confirmWorkflowCreation(chatId, workflowId) {
    const userState = this.userStates.get(chatId);
    const workflow = userState?.context?.workflow;
    
    if (!workflow) {
      await this.bot.sendMessage(chatId, '❌ 找不到工作流信息，请重新开始。');
      return;
    }
    
    // 这里实际调用OpenClaw Flow创建
    this.logger.info(`📝 创建工作流: ${workflowId}`);
    
    // 模拟创建过程
    await this.bot.sendMessage(chatId, '🔄 正在创建工作流...');
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 更新工作流状态
    workflow.status = 'active';
    workflow.activated_at = new Date().toISOString();
    
    const successMessage = `🎉 *工作流创建成功！*\n\n` +
      `✅ *名称*: ${workflow.name}\n` +
      `🆔 *ID*: \`${workflow.id}\`\n` +
      `📅 *创建时间*: ${new Date().toLocaleString()}\n` +
      `🟢 *状态*: 已激活\n\n` +
      `📋 *下一步操作*:\n` +
      `• 使用 /list 查看所有工作流\n` +
      `• 使用 /status ${workflow.id} 查看状态\n` +
      `• 直接告诉我新的需求\n\n` +
      `🚀 自动化已启动，我会在需要时通知你！`;
    
    await this.bot.sendMessage(chatId, successMessage, {
      parse_mode: 'Markdown'
    });
    
    // 重置用户状态
    this.userStates.set(chatId, { state: 'idle', context: {} });
  }

  // 处理/create命令
  async handleCreateWorkflow(msg) {
    const chatId = msg.chat.id;
    
    const message = `🚀 *创建新工作流*\n\n` +
      `请选择工作流类型：\n\n` +
      `1️⃣ *投资监控* - 加密货币价格监控\n` +
      `2️⃣ *内容收集* - 热榜/新闻/文章收集\n` +
      `3️⃣ *文件管理* - 备份/同步/清理\n` +
      `4️⃣ *系统监控* - 服务器状态监控\n` +
      `5️⃣ *数据同步* - 跨平台数据同步\n\n` +
      `💡 *或者直接告诉我你想做什么*`;
    
    const keyboard = {
      reply_markup: {
        keyboard: [
          [{ text: '💰 投资监控' }, { text: '📰 内容收集' }],
          [{ text: '💾 文件管理' }, { text: '🖥️ 系统监控' }],
          [{ text: '🔄 数据同步' }, { text: '🏠 返回主菜单' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    };
    
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      ...keyboard
    });
    
    this.userStates.set(chatId, {
      state: 'selecting_workflow_type',
      context: {}
    });
  }

  // 处理/list命令
  async handleListWorkflows(msg) {
    const chatId = msg.chat.id;
    
    // 模拟工作流数据
    const workflows = [
      { id: 'wf001', name: 'BTC价格监控', status: 'active', type: 'crypto' },
      { id: 'wf002', name: '知乎热榜收集', status: 'scheduled', type: 'content' },
      { id: 'wf003', name: '每日文件备份', status: 'active', type: 'file' }
    ];
    
    let message = `📋 *你的工作流列表*\n\n`;
    
    workflows.forEach((wf, index) => {
      const statusIcon = wf.status === 'active' ? '🟢' : '🟡';
      const typeIcon = wf.type === 'crypto' ? '💰' : wf.type === 'content' ? '📰' : '💾';
      
      message += `${index + 1}. ${typeIcon} *${wf.name}*\n`;
      message += `   🆔: \`${wf.id}\`\n`;
      message += `   📊: ${statusIcon} ${wf.status === 'active' ? '运行中' : '等待中'}\n`;
      message += `   ⚡: /status_${wf.id} | /pause_${wf.id} | /delete_${wf.id}\n\n`;
    });
    
    message += `📊 *统计*: 共 ${workflows.length} 个工作流\n`;
    message += `💪 *提示*: 点击工作流ID查看详情`;
    
    await this.bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  }

  // 处理教程
  async handleTutorial(msg) {
    const chatId = msg.chat.id;
    
    const tutorial = `📚 *OpenClaw Flow 使用教程*\n\n` +
      `🎯 *核心概念*:\n` +
      `• *工作流*: 自动化任务的完整流程\n` +
      `• *技能*: 执行特定功能的能力\n` +
      `• *参数*: 配置工作流的选项\n\n` +
      `🚀 *快速开始*:\n` +
      `1. 告诉我你的需求\n` +
      `2. 我会分析并创建方案\n` +
      `3. 确认参数并激活\n` +
      `4. 自动化开始运行\n\n` +
      `💡 *实用示例*:\n` +
      `• "监控BTC价格，超过$50000就通知我"\n` +
      `• "每天上午9点收集知乎热榜"\n` +
      `• "备份workspace目录到云存储"\n` +
      `• "系统CPU超过80%时报警"\n\n` +
      `⚡ *常用命令*:\n` +
      `/start - 开始使用\n` +
      `/create - 创建工作流\n` +
      `/list - 查看工作流\n` +
      `/help - 获取帮助\n\n` +
      `🎉 *现在就开始你的自动化之旅吧！*`;
    
    await this.bot.sendMessage(chatId, tutorial, {
      parse_mode: 'Markdown'
    });
  }

  // 处理示例
  async handleExamples(msg) {
    const chatId = msg.chat.id;
    
    const examples = `💡 *功能示例大全*\n\n` +
      `💰 *投资监控*:\n` +
      `• "监控BTC价格，超过$50000就通知我"\n` +
      `• "ETH低于$3000时提醒"\n` +
      `• "监控WLD价格波动，超过5%就报警"\n\n` +
      `📰 *内容收集*:\n` +
      `• "每天上午9点收集知乎热榜"\n` +
      `• "获取B站热门视频排行"\n` +
      `• "监控微博热搜话题"\n\n` +
      `💾 *文件管理*:\n` +
      `• "每天凌晨2点备份workspace"\n` +
      `• "每周清理临时文件"\n` +
      `• "自动同步重要文件到云存储"\n\n` +
      `🖥️ *系统监控*:\n` +
      `• "系统CPU超过80%时报警"\n` +
      `• "磁盘空间不足90%时提醒"\n` +
      `• "监控服务器网络状态"\n\n` +
      `🔄 *数据同步*:\n` +
      `• "同步GitHub issues到Notion"\n` +
      `• "自动备份数据库到云存储"\n` +
      `• "跨平台数据迁移"\n\n` +
      `🚀 *试试复制上面的例子，体验一句话自动化！*`;
    
    await this.bot.sendMessage(chatId, examples, {
      parse_mode: 'Markdown'
    });
  }

  // 处理通用消息
  async handleGeneralMessage(chatId, text) {
    const responses = [
      "🤔 我不太确定你想做什么，可以更具体一点吗？",
      "💡 试试告诉我你想自动化什么任务，比如：'监控BTC价格' 或 '收集知乎热榜'",
      "🎯 你可以使用 /create 命令开始创建工作流，或直接告诉我你的需求",
      "📚 需要帮助吗？使用 /help 查看完整指南"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    await this.bot.sendMessage(chatId, randomResponse);
  }
}

// ============================================
// 主程序
// ============================================

async function main() {
  try {
    logger.info('🚀 初始化Telegram Bot...');
    
    // 创建消息处理器
    const handler = new MessageHandler(bot, logger);
    
    // 注册消息监听器
    bot.on('message', async (msg) => {
      try {
        // 忽略非文本消息
        if (!msg.text) return;
        
        // 处理命令
        if (msg.text.startsWith('/')) {
          const command = msg.text.split(' ')[0];
          
          switch (command) {
            case '/start':
              await handler.handleStart(msg);
              break;
            case '/create':
            case '/创建':
              await handler.handleCreateWorkflow(msg);
              break;
            case '/list':
            case '/列表':
              await handler.handleListWorkflows(msg);
              break;
            case '/help':
            case '/帮助':
              await handler.handleTutorial(msg);
              break;
            default:
              await handler.handleText(msg);
          }
        } else {
          // 处理普通文本消息
          await handler.handleText(msg);
        }
      } catch (error) {
        logger.error(`❌ 处理消息时出错: ${error.message}`);
        logger.error(error.stack);
        
        try {
          await bot.sendMessage(msg.chat.id, '❌ 抱歉，处理消息时出现错误。请稍后重试。');
        } catch (sendError) {
          logger.error(`❌ 发送错误消息失败: ${sendError.message}`);
        }
      }
    });
    
    // 处理回调查询
    bot.on('callback_query', async (query) => {
      try {
        await handler.handleCallbackQuery(query);
      } catch (error) {
        logger.error(`❌ 处理回调查询时出错: ${error.message}`);
        logger.error(error.stack);
      }
    });
    
    // 错误处理
    bot.on('error', (error) => {
      logger.error(`❌ Telegram Bot错误: ${error.message}`);
      logger.error(error.stack);
    });
    
    // 启动Express服务器（用于webhook）
    app.use(express.json());
    
    app.get('/', (req, res) => {
      res.json({
        status: 'ok',
        service: 'OpenClaw Flow Telegram Bot',
        version: '0.1.0',
        uptime: process.uptime()
      });
    });
    
    app.listen(PORT, () => {
      logger.info(`🌐 Express服务器运行在端口 ${PORT}`);
      logger.info(`🔗 健康检查: http://localhost:${PORT}/`);
    });
    
    logger.info('✅ Telegram Bot启动成功！');
    logger.info('🤖 Bot已准备好接收消息...');
    
    // 发送启动通知（可选）
    if (process.env.ADMIN_CHAT_ID) {
      try {
        await bot.sendMessage(process.env.ADMIN_CHAT_ID, '🤖 OpenClaw Flow Telegram Bot已启动！');
      } catch (error) {
        logger.warn(`⚠️ 无法发送启动通知: ${error.message}`);
      }
    }
    
  } catch (error) {
    logger.error(`❌ 启动失败: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

// 启动程序
main();

// 优雅关闭
process.on('SIGINT', () => {
  logger.info('🛑 收到关闭信号，优雅关闭...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 收到终止信号，优雅关闭...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error(`💥 未捕获异常: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`💥 未处理的Promise拒绝: ${reason}`);
  process.exit(1);
});