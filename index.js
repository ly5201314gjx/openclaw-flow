/**
 * OpenClaw Copilot 主模块
 * 统一导出所有核心组件
 */

// 核心组件
const IntentParser = require('./src/core/intent-parser');
const SkillMatcher = require('./src/core/skill-matcher');
const WorkflowGenerator = require('./src/core/workflow-generator');
const ParameterInferrer = require('./src/core/parameter-inferrer');
const WorkflowExecutor = require('./src/core/workflow-executor');

// 工具类
const RealSkillAdapter = require('./src/adapters/real-skill-adapter');
const ToolProxy = require('./src/utils/tool-proxy');

// 主类
class OpenClawCopilot {
  constructor(options = {}) {
    this.options = {
      dryRun: false,
      verbose: true,
      autoConfirm: false,
      ...options
    };
    
    this.components = {
      parser: new IntentParser(),
      matcher: new SkillMatcher(),
      generator: new WorkflowGenerator(),
      inferrer: new ParameterInferrer(),
      executor: new WorkflowExecutor(this.options)
    };
    
    console.log(`🚀 OpenClaw Copilot ${this.getVersion()} 已初始化`);
    console.log(`   模式: ${this.options.dryRun ? '模拟执行' : '真实执行'}`);
  }
  
  getVersion() {
    try {
      const packageJson = require('./package.json');
      return packageJson.version;
    } catch {
      return '0.1.0';
    }
  }
  
  // 处理用户请求
  async process(text, userOptions = {}) {
    const options = { ...this.options, ...userOptions };
    
    try {
      // 1. 解析意图
      const intent = this.components.parser.parse(text);
      
      // 2. 匹配技能
      const skillChain = this.components.matcher.match(intent);
      
      // 3. 推断参数
      const skillParams = this.components.inferrer.infer(intent, skillChain);
      
      // 4. 生成工作流
      const workflow = this.components.generator.generate(intent, skillChain, skillParams);
      
      // 5. 优化工作流
      const optimizedWorkflow = this.components.generator.optimizeWorkflow(workflow);
      
      // 6. 执行工作流
      const result = await this.components.executor.execute(optimizedWorkflow);
      
      return {
        success: true,
        intent,
        skillChain,
        workflow: optimizedWorkflow,
        result
      };
      
    } catch (error) {
      console.error(`❌ 处理失败: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 批量处理
  async batch(requests, options = {}) {
    const results = [];
    
    for (const request of requests) {
      console.log(`\n📝 处理: "${request}"`);
      const result = await this.process(request, options);
      results.push(result);
    }
    
    return results;
  }
  
  // 获取状态
  getStatus() {
    return {
      version: this.getVersion(),
      mode: this.options.dryRun ? 'dry-run' : 'real',
      supportedSkills: this.components.matcher.getAvailableSkills(),
      stats: this.components.executor.getStats()
    };
  }
}

// 导出所有组件
module.exports = {
  // 主类
  OpenClawCopilot,
  
  // 核心组件
  IntentParser,
  SkillMatcher,
  WorkflowGenerator,
  ParameterInferrer,
  WorkflowExecutor,
  
  // 工具类
  RealSkillAdapter,
  ToolProxy,
  
  // 工具函数
  createCopilot: (options) => new OpenClawCopilot(options)
};