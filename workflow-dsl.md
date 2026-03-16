# OpenClaw Copilot 工作流描述语言

## 设计目标
1. **自然语言友好** - 用户可以用自然语言描述需求
2. **技能自动匹配** - 系统能自动找到合适的技能
3. **参数智能填充** - 自动推断所需参数
4. **流程可编排** - 支持多步骤工作流

## 核心概念

### 1. 用户意图 (User Intent)
```yaml
intent:
  goal: "监控WLD价格，跌5%就提醒我"
  constraints:
    - "价格跌5%时提醒"
    - "通过Telegram发送"
    - "每5分钟检查一次"
```

### 2. 技能能力 (Skill Capability)
```yaml
skill:
  name: "binance-trading"
  capabilities:
    - action: "monitor_price"
      target: "cryptocurrency"
      parameters:
        - symbol: "string"  # 币种符号
        - interval: "number"  # 检查间隔(分钟)
      output: "price_data"
      triggers: ["price_change_percent"]
```

### 3. 工作流节点 (Workflow Node)
```yaml
node:
  id: "price_monitor"
  type: "skill"
  skill: "binance-trading"
  config:
    symbol: "WLDUSDT"
    interval: 5
  condition: "price_change_percent <= -5"
  actions:
    - "send_notification"
```

### 4. 连接器 (Connector)
```yaml
connector:
  from: "price_monitor"
  to: "telegram_notify"
  condition: "price_drop_triggered"
  data_mapping:
    "price_data.symbol": "message.symbol"
    "price_data.change_percent": "message.change"
```

## DSL 语法示例

### 简单监控工作流
```yaml
workflow:
  name: "WLD价格监控"
  trigger: "启动时"
  nodes:
    - type: "skill"
      skill: "binance-trading"
      action: "monitor_price"
      params:
        symbol: "WLDUSDT"
        interval: 5
      output: "current_price"
    
    - type: "condition"
      condition: "current_price.change_percent <= -5"
      true_branch: "send_alert"
      false_branch: "continue_monitoring"
    
    - type: "skill"
      skill: "telegram-message"
      action: "send"
      params:
        message: "WLD价格下跌{change_percent}%，当前价格${price}"
      depends_on: "send_alert"
```

### 数据采集+处理工作流
```yaml
workflow:
  name: "每日市场报告"
  trigger: "cron:0 9 * * *"  # 每天9点
  nodes:
    - type: "parallel"
      tasks:
        - skill: "twitter-search"
          params: { query: "bitcoin", limit: 20 }
          output: "twitter_data"
        
        - skill: "coingecko"
          params: { coin: "bitcoin", days: 1 }
          output: "price_data"
        
        - skill: "reddit-hot"
          params: { subreddit: "cryptocurrency", limit: 10 }
          output: "reddit_data"
    
    - type: "skill"
      skill: "data-analysis"
      action: "generate_report"
      params:
        sources: ["twitter_data", "price_data", "reddit_data"]
        template: "market_report"
      output: "report_html"
    
    - type: "skill"
      skill: "feishu-doc"
      action: "create"
      params:
        title: "每日加密市场报告 {date}"
        content: "report_html"
```

### 技能自动发现语法
```yaml
intent: "我想每天收到知乎热榜"
analysis:
  required_capabilities:
    - "data_fetch"      # 需要数据获取能力
    - "schedule"        # 需要定时能力
    - "notification"    # 需要通知能力
  
  candidate_skills:
    - "zhihu-hot"      # 知乎热榜技能
    - "cron"           # 定时任务技能
    - "telegram-message" # 消息发送技能
  
  workflow:
    - "zhihu-hot -> cron -> telegram-message"
```

## 智能匹配算法

### 1. 意图解析
```
用户输入: "帮我监控WLD价格，跌5%就提醒我"
→ 提取关键词: [监控, WLD, 价格, 跌5%, 提醒]
→ 识别意图类型: "价格监控与通知"
→ 提取参数: {symbol: "WLD", threshold: -5%, channel: "telegram"}
```

### 2. 技能匹配
```
需求能力: ["价格监控", "定时检查", "消息通知"]
匹配技能:
  - binance-trading: [价格监控, 定时检查] ✓
  - cron: [定时调度] ✓  
  - telegram-message: [消息通知] ✓
```

### 3. 参数推断
```
监控币种: "WLD" → "WLDUSDT" (添加交易对)
检查间隔: 默认5分钟 (合理频率)
通知模板: "价格下跌{percent}%，当前价格${price}"
```

### 4. 工作流生成
```
workflow:
  1. binance-trading.monitor_price(WLDUSDT, interval=5)
  2. condition: price_change <= -5%
  3. telegram-message.send(alert_template)
  4. cron.schedule(workflow, interval=5)
```

## 实现架构

### 前端: 自然语言接口
```
用户输入 → 意图解析 → 技能匹配 → 参数确认 → 工作流预览 → 确认执行
```

### 后端: 工作流引擎
```
工作流DSL → 技能适配器 → 参数验证 → 执行计划 → 状态监控 → 结果返回
```

### 技能适配器层
```
通用技能接口:
  - get_capabilities(): 返回技能能力描述
  - validate_params(params): 验证参数有效性
  - execute(params): 执行技能
  - get_output_schema(): 返回输出数据结构
```

## 下一步开发计划

### Phase 1: 基础解析器
- 自然语言意图解析
- 技能能力目录构建
- 简单工作流生成

### Phase 2: 执行引擎  
- 工作流DSL解释器
- 技能适配器框架
- 状态管理和错误处理

### Phase 3: 智能优化
- 参数自动推断
- 工作流优化建议
- 执行效果分析

### Phase 4: 社区生态
- 工作流模板市场
- 技能贡献指南
- 使用数据反馈循环
```

---

## 快速原型设计

让我先创建一个最小可行性原型，验证核心概念：**自然语言 → 技能匹配 → 工作流生成**

```javascript
// Phase 1: 意图解析器原型
class IntentParser {
  parse(text) {
    // 提取关键词和意图
    return {
      goal: this.extractGoal(text),
      constraints: this.extractConstraints(text),
      parameters: this.extractParameters(text)
    };
  }
}

// Phase 2: 技能匹配器原型  
class SkillMatcher {
  match(intent, skillCatalog) {
    // 根据意图匹配技能链
    return this.findSkillChain(intent, skillCatalog);
  }
}

// Phase 3: 工作流生成器原型
class WorkflowGenerator {
  generate(skillChain, parameters) {
    // 生成可执行的工作流DSL
    return this.createWorkflowDSL(skillChain, parameters);
  }
}

// Phase 4: 执行器原型
class WorkflowExecutor {
  execute(workflowDSL) {
    // 解释并执行工作流
    return this.interpretAndRun(workflowDSL);
  }
}
```

**下一步行动：**
1. 创建意图解析器原型
2. 构建技能能力目录
3. 实现简单工作流生成
4. 测试端到端流程