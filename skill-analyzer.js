#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 技能目录列表
const skillDirs = [
  '/root/.openclaw/extensions',
  '/root/.openclaw/skills',
  '/root/.openclaw/workspace/skills',
  '/root/.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/skills'
];

// 技能能力分类
const capabilityCategories = {
  'data-fetch': { desc: '数据获取', examples: ['web_search', 'web_fetch', 'browser'] },
  'file-operation': { desc: '文件操作', examples: ['read', 'write', 'edit'] },
  'system-command': { desc: '系统命令', examples: ['exec', 'process'] },
  'automation': { desc: '自动化', examples: ['cron', 'browser automation'] },
  'communication': { desc: '通讯', examples: ['message', 'sessions_send'] },
  'analysis': { desc: '分析处理', examples: ['data analysis', 'code review'] },
  'monitoring': { desc: '监控', examples: ['price monitoring', 'status check'] },
  'integration': { desc: '集成', examples: ['API integration', 'service connection'] }
};

async function findSkillFiles() {
  const skillFiles = [];
  
  for (const dir of skillDirs) {
    if (!fs.existsSync(dir)) continue;
    
    const findSkills = (currentPath) => {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        
        if (item.isDirectory()) {
          // 检查目录下是否有SKILL.md
          const skillPath = path.join(fullPath, 'SKILL.md');
          if (fs.existsSync(skillPath)) {
            skillFiles.push(skillPath);
          }
          // 递归搜索
          findSkills(fullPath);
        }
      }
    };
    
    findSkills(dir);
  }
  
  return skillFiles;
}

function analyzeSkill(skillPath) {
  try {
    const content = fs.readFileSync(skillPath, 'utf-8');
    const dir = path.dirname(skillPath);
    
    // 提取基本信息
    const skill = {
      path: skillPath,
      dir: dir,
      name: path.basename(dir),
      capabilities: []
    };
    
    // 解析frontmatter（如果有）
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      try {
        const frontmatter = yaml.load(frontmatterMatch[1]);
        skill.metadata = frontmatter;
        skill.description = frontmatter.description || '';
      } catch (e) {
        // 忽略frontmatter解析错误
      }
    }
    
    // 提取描述（如果没有frontmatter）
    if (!skill.description) {
      const descMatch = content.match(/#.*\n+(.*?)(?:\n#|\n##|\n###|\n####|\n#####|\n######|$)/);
      if (descMatch && descMatch[1]) {
        skill.description = descMatch[1].trim();
      }
    }
    
    // 分析能力关键词
    const lowerContent = content.toLowerCase();
    for (const [category, info] of Object.entries(capabilityCategories)) {
      const keywords = [...info.examples, info.desc];
      for (const keyword of keywords) {
        if (lowerContent.includes(keyword.toLowerCase())) {
          skill.capabilities.push({
            category,
            keyword,
            description: info.desc
          });
          break; // 每个类别只记录一次
        }
      }
    }
    
    // 去重能力
    skill.capabilities = skill.capabilities.filter((cap, index, self) =>
      index === self.findIndex(c => c.category === cap.category)
    );
    
    return skill;
    
  } catch (error) {
    console.error(`分析技能失败 ${skillPath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🎯 OpenClaw Copilot - 技能能力分析\n');
  
  const skillFiles = await findSkillFiles();
  console.log(`找到 ${skillFiles.length} 个技能文件`);
  
  const skills = [];
  for (const skillFile of skillFiles.slice(0, 20)) { // 先分析前20个
    const skill = analyzeSkill(skillFile);
    if (skill) {
      skills.push(skill);
    }
  }
  
  // 生成能力统计
  const capabilityStats = {};
  skills.forEach(skill => {
    skill.capabilities.forEach(cap => {
      capabilityStats[cap.category] = (capabilityStats[cap.category] || 0) + 1;
    });
  });
  
  console.log('\n📊 能力分布统计:');
  Object.entries(capabilityStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const info = capabilityCategories[category];
      console.log(`  ${info.desc}: ${count} 个技能`);
    });
  
  console.log('\n🔧 示例技能分析:');
  skills.slice(0, 5).forEach(skill => {
    console.log(`\n  ${skill.name}:`);
    console.log(`    描述: ${skill.description?.slice(0, 100)}...`);
    console.log(`    能力: ${skill.capabilities.map(c => capabilityCategories[c.category].desc).join(', ')}`);
  });
  
  // 保存分析结果
  const outputDir = '/root/.openclaw/workspace/copilot';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'skill-analysis.json'),
    JSON.stringify({ skills, capabilityStats }, null, 2)
  );
  
  console.log(`\n✅ 分析完成！结果已保存到: ${path.join(outputDir, 'skill-analysis.json')}`);
}

main().catch(console.error);