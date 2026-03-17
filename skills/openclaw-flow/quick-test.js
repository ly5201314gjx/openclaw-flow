#!/usr/bin/env node

// OpenClaw Flow 快速测试
// 验证技能基本功能

console.log('🧪 OpenClaw Flow 快速测试');
console.log('────────────────────────────────────');

// 检查基本模块
console.log('🔍 1. 检查核心模块...');
try {
  const fs = require('fs');
  const path = require('path');
  
  // 检查必要文件
  const requiredFiles = [
    'SKILL.md',
    'package.json', 
    'clawhub.json',
    'cli.js',
    'index.js'
  ];
  
  const missing = [];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      missing.push(file);
    }
  }
  
  if (missing.length > 0) {
    console.log(`❌ 缺少文件: ${missing.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ 所有必要文件存在');
  
  // 检查源代码目录
  console.log('🔍 2. 检查源代码...');
  const srcFiles = [
    'src/core/intent-parser.js',
    'src/core/skill-matcher.js',
    'src/core/parameter-inferrer.js',
    'src/core/workflow-generator.js',
    'src/core/workflow-executor.js',
    'src/adapters/real-skill-adapter.js',
    'src/utils/tool-proxy.js'
  ];
  
  const srcMissing = [];
  for (const file of srcFiles) {
    if (!fs.existsSync(file)) {
      srcMissing.push(file);
    }
  }
  
  if (srcMissing.length > 0) {
    console.log(`❌ 缺少源代码文件: ${srcMissing.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`✅ 源代码完整 (${srcFiles.length}个文件)`);
  
  // 检查package.json
  console.log('🔍 3. 检查包配置...');
  const pkg = require('./package.json');
  
  const requiredFields = ['name', 'version', 'description', 'main', 'bin'];
  for (const field of requiredFields) {
    if (!pkg[field]) {
      console.log(`❌ package.json缺少字段: ${field}`);
      process.exit(1);
    }
  }
  
  console.log(`✅ 包配置完整: ${pkg.name} v${pkg.version}`);
  console.log(`📝 描述: ${pkg.description}`);
  
  // 检查clawhub.json
  console.log('🔍 4. 检查ClawHub配置...');
  const clawhubConfig = require('./clawhub.json');
  
  const requiredClawhubFields = ['name', 'displayName', 'version', 'description'];
  for (const field of requiredClawhubFields) {
    if (!clawhubConfig[field]) {
      console.log(`❌ clawhub.json缺少字段: ${field}`);
      process.exit(1);
    }
  }
  
  console.log(`✅ ClawHub配置完整: ${clawhubConfig.displayName}`);
  
  // 测试CLI文件
  console.log('🔍 5. 测试CLI文件...');
  const cliContent = fs.readFileSync('cli.js', 'utf-8');
  if (!cliContent.includes('#!/usr/bin/env node')) {
    console.log('❌ CLI文件缺少shebang');
    process.exit(1);
  }
  
  if (!cliContent.includes('commander')) {
    console.log('❌ CLI文件缺少commander依赖');
    process.exit(1);
  }
  
  console.log('✅ CLI文件结构正确');
  
  // 测试入口文件
  console.log('🔍 6. 测试入口文件...');
  try {
    const { OpenClawFlow, createFlow } = require('./index.js');
    console.log('✅ 入口文件加载成功');
  } catch (error) {
    console.log(`❌ 入口文件加载失败: ${error.message}`);
    process.exit(1);
  }
  
  // 测试技能文档
  console.log('🔍 7. 检查技能文档...');
  const skillDoc = fs.readFileSync('SKILL.md', 'utf-8');
  if (!skillDoc.includes('# OpenClaw Flow')) {
    console.log('❌ 技能文档格式不正确');
    process.exit(1);
  }
  
  console.log('✅ 技能文档完整');
  
  console.log('\n🎉 快速测试通过！');
  console.log('────────────────────────────────────');
  console.log(`📦 技能名: ${pkg.name}`);
  console.log(`🏷️  版本: v${pkg.version}`);
  console.log(`📝 描述: ${pkg.description}`);
  console.log(`📁 文件数: ${srcFiles.length}个核心文件`);
  console.log(`🚀 状态: 准备好发布到ClawHub！`);
  
} catch (error) {
  console.error(`💥 测试失败: ${error.message}`);
  process.exit(1);
}