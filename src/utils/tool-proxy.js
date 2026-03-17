/**
 * 工具代理
 * 统一调用OpenClaw工具的接口
 */

const fs = require('fs');
const path = require('path');

class ToolProxy {
  constructor() {
    this.config = this.loadConfig();
  }
  
  loadConfig() {
    const configPaths = [
      require('./paths').getOpenClawHome() + '/config.json',
      path.join(process.env.HOME, '.openclaw/config.json'),
      './config.json'
    ];
    
    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        try {
          return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        } catch (error) {
          console.warn(`无法解析配置文件 ${configPath}: ${error.message}`);
        }
      }
    }
    
    return {
      channels: {},
      skills: {}
    };
  }
  
  // 发送消息（统一接口）
  async sendMessage(channel, message, options = {}) {
    console.log(`📤 发送 ${channel} 消息`);
    
    try {
      switch (channel) {
        case 'telegram':
          return await this.sendTelegram(message, options);
          
        case 'feishu':
          return await this.sendFeishu(message, options);
          
        case 'wechat':
          return await this.sendWechat(message, options);
          
        default:
          console.log(`   ⚠️  不支持的频道: ${channel}`);
          return {
            success: false,
            error: `不支持的频道: ${channel}`
          };
      }
    } catch (error) {
      console.error(`❌ 发送消息失败: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 发送Telegram消息
  async sendTelegram(message, options) {
    const telegramConfig = this.config.channels?.telegram;
    
    if (!telegramConfig) {
      console.log('   ⚠️  Telegram通道未配置');
      return {
        success: false,
        error: 'Telegram通道未配置'
      };
    }
    
    console.log(`   📝 消息内容: ${message.substring(0, 100)}...`);
    console.log(`   👤 接收者: ${options.to || '默认用户'}`);
    
    // 这里应该调用OpenClaw的message工具
    // 目前模拟执行
    await this.sleep(200);
    
    return {
      success: true,
      channel: 'telegram',
      message,
      to: options.to,
      sent_at: new Date().toISOString(),
      simulated: true
    };
  }
  
  // 发送飞书消息
  async sendFeishu(message, options) {
    console.log('   📝 飞书消息（模拟）');
    
    // 模拟发送
    await this.sleep(200);
    
    return {
      success: true,
      channel: 'feishu',
      message,
      sent_at: new Date().toISOString(),
      simulated: true
    };
  }
  
  // 发送微信消息
  async sendWechat(message, options) {
    console.log('   📝 微信消息（模拟）');
    
    // 模拟发送
    await this.sleep(200);
    
    return {
      success: true,
      channel: 'wechat',
      message,
      sent_at: new Date().toISOString(),
      simulated: true
    };
  }
  
  // 执行系统命令
  async executeCommand(command, options = {}) {
    console.log(`💻 执行命令: ${command.substring(0, 80)}...`);
    
    const { execSync } = require('child_process');
    
    try {
      const result = execSync(command, {
        encoding: 'utf-8',
        timeout: options.timeout || 30000,
        cwd: options.cwd || process.cwd()
      });
      
      console.log('   ✅ 命令执行成功');
      
      return {
        success: true,
        command,
        output: result,
        exit_code: 0,
        executed_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ 命令执行失败: ${error.message}`);
      
      return {
        success: false,
        command,
        error: error.message,
        exit_code: error.status || 1,
        stderr: error.stderr || ''
      };
    }
  }
  
  // 读写文件
  async writeFile(filePath, content, options = {}) {
    console.log(`💾 写入文件: ${filePath}`);
    
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const contentStr = typeof content === 'string' 
        ? content 
        : JSON.stringify(content, null, 2);
      
      fs.writeFileSync(filePath, contentStr, {
        encoding: options.encoding || 'utf-8'
      });
      
      const stats = fs.statSync(filePath);
      
      console.log(`   ✅ 文件写入成功: ${stats.size} 字节`);
      
      return {
        success: true,
        path: filePath,
        size: stats.size,
        saved_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ 写入文件失败: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async readFile(filePath, options = {}) {
    console.log(`📖 读取文件: ${filePath}`);
    
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }
      
      const content = fs.readFileSync(filePath, {
        encoding: options.encoding || 'utf-8'
      });
      
      const stats = fs.statSync(filePath);
      
      console.log(`   ✅ 文件读取成功: ${stats.size} 字节`);
      
      return {
        success: true,
        path: filePath,
        size: stats.size,
        content,
        read_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ 读取文件失败: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 创建定时任务
  async createCronJob(schedule, command, description) {
    console.log(`⏰ 创建定时任务: ${schedule}`);
    
    try {
      const cronId = `copilot_${Date.now()}`;
      const cronContent = `# OpenClaw Copilot 定时任务: ${description}
# 创建时间: ${new Date().toISOString()}
# 任务ID: ${cronId}

${schedule} ${command}

# 结束`;
      
      const cronFile = `/tmp/${cronId}.cron`;
      await this.writeFile(cronFile, cronContent);
      
      console.log(`   ✅ 定时任务文件创建成功: ${cronFile}`);
      console.log(`      计划: ${schedule}`);
      console.log(`      命令: ${command.substring(0, 80)}...`);
      
      return {
        success: true,
        job_id: cronId,
        schedule,
        command,
        cron_file: cronFile,
        created_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ 创建定时任务失败: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // HTTP请求
  async httpRequest(url, options = {}) {
    console.log(`🌐 HTTP请求: ${url}`);
    
    try {
      const https = require('https');
      const http = require('http');
      
      return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const req = protocol.request(url, options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            console.log(`   ✅ 请求成功: ${res.statusCode}`);
            
            resolve({
              success: true,
              url,
              status_code: res.statusCode,
              headers: res.headers,
              body: data,
              requested_at: new Date().toISOString()
            });
          });
        });
        
        req.on('error', (error) => {
          console.error(`❌ 请求失败: ${error.message}`);
          reject({
            success: false,
            error: error.message
          });
        });
        
        req.setTimeout(options.timeout || 10000, () => {
          req.destroy();
          reject({
            success: false,
            error: '请求超时'
          });
        });
        
        req.end();
      });
      
    } catch (error) {
      console.error(`❌ HTTP请求异常: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 辅助方法
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ToolProxy;