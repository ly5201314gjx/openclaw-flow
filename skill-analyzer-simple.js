#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { getOpenClawHome, getOpenClawWorkspace, getCopilotDir } = require('./src/utils/paths');

// 技能能力分类
const capabilityCategories = {
  'data-fetch': { desc: '数据获取', keywords: ['search', 'fetch', 'scrape', 'crawl', 'api', 'web', 'browser'] },
  'file-operation': { desc: '文件操作', keywords: ['read', 'write', 'edit', 'file', 'directory', 'folder'] },
  'system-command': { desc: '系统命令', keywords: ['exec', 'command', 'bash', 'shell', 'terminal', 'process'] },
  'automation': { desc: '自动化', keywords: ['cron', 'schedule', 'timer', 'reminder', '自动', '定时'] },
  'communication': { desc: '通讯', keywords: ['message', 'send', 'telegram', 'whatsapp', 'email', 'notify'] },
  'analysis': { desc: '分析处理', keywords: ['analyze', 'process', 'parse', 'transform', 'convert', 'calculate'] },
  'monitoring': { desc: '监控', keywords: ['monitor', 'watch', 'check', 'status', 'price', 'alert'] },
  'integration': { desc: '集成', keywords: ['integration', 'connect', 'api', 'service', 'platform'] },
  'trading': { desc: '交易', keywords: ['trade', 'binance', 'coin', 'crypto', 'stock', '投资'] },
  'coding': { desc: '编程开发', keywords: ['code', 'program', 'develop', 'debug', 'test', 'git'] }
};

async function findSkillFiles() {
  const skillDirs = [
    path.join(getOpenClawWorkspace(), 'skills'),
    path.join(getOpenClawHome(), 'skills'),
    path.join(getOpenClawHome(), 'extensions'),
    process.env.OPENCLAW_SKILLS_DIR,
  ].filter(Boolean);

  
  const skillFiles = [];
  
  for (const dir of skillDirs) {
    if (!fs.existsSync(dir)) continue;
    
    const findSkills = (currentPath) => {
      try {
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
      } catch (err) {
        // 忽略权限错误等
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
      capabilities: [],
      description: ''
    };
    
    // 提取描述（从第一个段落）
    const lines = content.split('\n');
    let inDescription = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 跳过空行和注释
      if (!line || line.startsWith('#')) continue;
      
      // 找到第一个非标题段落
      if (!line.startsWith('#') && line.length > 10) {
        skill.description = line.slice(0, 100);
        break;
      }
    }
    
    // 分析能力关键词
    const lowerContent = content.toLowerCase();
    for (const [category, info] of Object.entries(capabilityCategories)) {
      for (const keyword of info.keywords) {
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
  for (const skillFile of skillFiles.slice(0, 30)) { // 先分析前30个
    const skill = analyzeSkill(skillFile);
    if (skill && skill.capabilities.length > 0) {
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
  
  console.log('\n🔧 Top 10 技能分析:');
  skills.slice(0, 10).forEach((skill, index) => {
    console.log(`\n  ${index + 1}. ${skill.name}:`);
    console.log(`     描述: ${skill.description}`);
    console.log(`     能力: ${skill.capabilities.map(c => c.description).join(', ')}`);
  });
  
  // 保存分析结果
  const outputDir = getCopilotDir();
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputData = {
    totalSkills: skillFiles.length,
    analyzedSkills: skills.length,
    capabilityStats,
    skills: skills.map(s => ({
      name: s.name,
      description: s.description,
      capabilities: s.capabilities.map(c => c.description)
    }))
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'skill-analysis.json'),
    JSON.stringify(outputData, null, 2)
  );
  
  console.log(`\n✅ 分析完成！结果已保存到: ${path.join(outputDir, 'skill-analysis.json')}`);
  
  // 生成能力映射表
  console.log('\n🔗 能力->技能映射:');
  const capabilityToSkills = {};
  skills.forEach(skill => {
    skill.capabilities.forEach(cap => {
      if (!capabilityToSkills[cap.description]) {
        capabilityToSkills[cap.description] = [];
      }
      capabilityToSkills[cap.description].push(skill.name);
    });
  });
  
  Object.entries(capabilityToSkills)
    .forEach(([capability, skillNames]) => {
      console.log(`\n  ${capability}:`);
      console.log(`     ${skillNames.slice(0, 5).join(', ')}${skillNames.length > 5 ? `... (+${skillNames.length - 5}个)` : ''}`);
    });
}

main().catch(console.error);