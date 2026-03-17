#!/usr/bin/env node

/**
 * 哔哩哔哩热榜工作流 - 定制版
 * 创建B站热门视频自动化收集系统
 */

const fs = require('fs');
const path = require('path');

console.log('📺 创建哔哩哔哩热榜工作流');
console.log('='.repeat(60));

// 创建工作流定义
const workflow = {
  id: 'bilibili_hot_daily_' + Date.now(),
  name: '哔哩哔哩热榜每日收集',
  description: '每天中午12点获取B站前20热门视频，保存并通知',
  schedule: '0 12 * * *', // 每天中午12点
  platform: 'bilibili',
  nodes: [
    {
      id: 'node_bilibili_api',
      skill: 'web-fetch',
      action: 'get',
      params: {
        url: 'https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      },
      description: '调用B站API获取热榜数据'
    },
    {
      id: 'node_process_data',
      skill: 'data-processor',
      action: 'transform',
      params: {
        input: '{{node_bilibili_api.result}}',
        template: `
          const data = JSON.parse(input);
          return {
            timestamp: new Date().toISOString(),
            count: data.data.list.length,
            videos: data.data.list.slice(0, 20).map((item, index) => ({
              rank: index + 1,
              title: item.title,
              up: item.owner.name,
              play: item.stat.view,
              danmaku: item.stat.danmaku,
              like: item.stat.like,
              coin: item.stat.coin,
              share: item.stat.share,
              duration: item.duration,
              bvid: item.bvid,
              url: 'https://www.bilibili.com/video/' + item.bvid
            }))
          };
        `
      },
      depends_on: ['node_bilibili_api'],
      description: '处理API数据，提取前20视频'
    },
    {
      id: 'node_save_file',
      skill: 'file-storage',
      action: 'save',
      params: {
        path: '/data/bilibili_hot/bilibili_hot_' + new Date().toISOString().split('T')[0] + '.json',
        content: '{{node_process_data.result}}'
      },
      depends_on: ['node_process_data'],
      description: '保存处理后的数据到JSON文件'
    },
    {
      id: 'node_generate_summary',
      skill: 'template-engine',
      action: 'render',
      params: {
        template: `
📺 **哔哩哔哩热榜 TOP {{videos.length}}**
📅 更新时间: {{new Date().toLocaleString('zh-CN')}}

{{#each videos}}
🏆 **{{rank}}. {{title}}**
   👤 UP主: {{up}}
   📊 数据: 👁️ {{play}} | 💬 {{danmaku}} | ❤️ {{like}}
   🔗 链接: {{url}}
{{/each}}

📈 **统计摘要:**
   总视频: {{videos.length}}个
   最高播放: {{maxPlay}}次
   平均播放: {{avgPlay}}次
   最活跃UP主: {{topUp}}

🚀 **自动化收集系统已启动!**
   下次执行: 明天中午12点
        `,
        data: '{{node_process_data.result}}'
      },
      depends_on: ['node_process_data'],
      description: '生成热榜摘要'
    },
    {
      id: 'node_send_notification',
      skill: 'telegram-message',
      action: 'send',
      params: {
        message: '{{node_generate_summary.result}}',
        to: 'user',
        parse_mode: 'Markdown'
      },
      depends_on: ['node_generate_summary'],
      description: '发送热榜摘要到Telegram'
    }
  ]
};

// 保存工作流定义
const workflowsDir = path.join(__dirname, 'workflows');
if (!fs.existsSync(workflowsDir)) {
  fs.mkdirSync(workflowsDir, { recursive: true });
}

const workflowFile = path.join(workflowsDir, `bilibili_hot_${Date.now()}.json`);
fs.writeFileSync(workflowFile, JSON.stringify(workflow, null, 2));

console.log('\n🎯 工作流配置：');
console.log(`📋 ID: ${workflow.id}`);
console.log(`📝 名称: ${workflow.name}`);
console.log(`⏰ 调度: ${workflow.schedule} (每天中午12点)`);
console.log(`📁 保存: ${workflowFile}`);
console.log('');

console.log('🔗 技能链：');
workflow.nodes.forEach((node, index) => {
  console.log(`   ${index + 1}. ${node.skill} → ${node.action}`);
});

console.log('\n📊 节点详情：');
workflow.nodes.forEach((node, index) => {
  console.log(`\n   🔸 节点 ${index + 1}: ${node.skill}`);
  console.log(`      动作: ${node.action}`);
  console.log(`      描述: ${node.description}`);
  
  if (node.params && node.params.url) {
    console.log(`      API: ${node.params.url}`);
  }
});

// 创建执行脚本
const execScript = `#!/bin/bash
# 哔哩哔哩热榜每日收集脚本
# 自动生成 by OpenClaw Flow

echo "📺 开始哔哩哔哩热榜收集 $(date)"
cd ${__dirname}

# 使用OpenClaw Flow执行
echo "🚀 通过OpenClaw Flow执行B站热榜收集..."
node cli.js process "获取哔哩哔哩当前热榜前20视频"

# 或者直接调用API
echo "🌐 备选方案：直接调用API..."
curl -s "https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all" \\
  -H "User-Agent: Mozilla/5.0" \\
  -o "bilibili_hot_\$(date +%Y%m%d).json"

echo "✅ 收集完成 $(date)"
echo "💾 结果保存在: bilibili_hot_*.json"
`;

const scriptPath = path.join(__dirname, 'bilibili_hot_daily.sh');
fs.writeFileSync(scriptPath, execScript);
fs.chmodSync(scriptPath, '755');

console.log(`\n📜 执行脚本已创建: ${scriptPath}`);
console.log(`💡 可以添加到Cron: 0 12 * * * ${scriptPath}`);

// 创建简化的OpenClaw Flow命令
console.log('\n🚀 OpenClaw Flow 命令：');
console.log('   # 立即执行一次');
console.log('   openclaw-flow process "哔哩哔哩热榜前20"');
console.log('');
console.log('   # 定时任务');
console.log('   openclaw-flow process "每天中午12点获取B站热榜"');
console.log('');
console.log('   # 完整功能');
console.log('   openclaw-flow process "建立哔哩哔哩热榜工作流每天12点保存文件并Telegram通知"');

// 获取模拟数据并展示
console.log('\n📺 哔哩哔哩热榜示例：');
console.log('='.repeat(50));

const mockBilibiliHot = [
  { rank: 1, title: "2026年AI技术发展展望", up: "科技前沿君", play: "256万", like: "15万" },
  { rank: 2, title: "深度学习从入门到精通", up: "AI教学王", play: "198万", like: "12万" },
  { rank: 3, title: "Web3.0创业实战分享", up: "区块链探索者", play: "167万", like: "10万" },
  { rank: 4, title: "大模型应用开发教程", up: "代码艺术家", play: "145万", like: "9万" },
  { rank: 5, title: "智能家居全屋方案", up: "生活科技家", play: "132万", like: "8万" },
  { rank: 6, title: "新能源汽车评测", up: "汽车达人秀", play: "118万", like: "7万" },
  { rank: 7, title: "远程工作高效工具", up: "效率提升师", play: "105万", like: "6万" },
  { rank: 8, title: "元宇宙应用开发", up: "虚拟现实先锋", play: "94万", like: "5万" },
  { rank: 9, title: "加密货币投资指南", up: "数字资产分析师", play: "83万", like: "4万" },
  { rank: 10, title: "内容创作AI工具", up: "创意生产力", play: "72万", like: "3万" }
];

mockBilibiliHot.forEach(video => {
  console.log(`🏆 ${video.rank}. ${video.title}`);
  console.log(`   👤 ${video.up} | 👁️ ${video.play} | ❤️ ${video.like}`);
});

console.log('\n🎉 工作流创建完成！');
console.log('💪 老大，哔哩哔哩热榜自动化收集系统已就绪！');

// 保存示例数据
const exampleData = {
  workflow: workflow,
  example_videos: mockBilibiliHot,
  created_at: new Date().toISOString(),
  openclaw_flow_command: 'openclaw-flow process "哔哩哔哩热榜"'
};

const exampleFile = path.join(__dirname, 'bilibili_hot_example.json');
fs.writeFileSync(exampleFile, JSON.stringify(exampleData, null, 2));

console.log(`\n💾 示例数据已保存: ${exampleFile}`);