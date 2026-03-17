#!/usr/bin/env node

/**
 * 修复工作流依赖关系
 */

const fs = require('fs');
const path = require('path');

// 修复工作流文件
function fixWorkflowFile(filepath) {
  try {
    const workflow = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    
    // 重新排序节点：技能节点在前，condition节点在后
    const skillNodes = [];
    const conditionNodes = [];
    
    workflow.nodes.forEach(node => {
      if (node.type === 'condition') {
        conditionNodes.push(node);
      } else {
        skillNodes.push(node);
      }
    });
    
    // 重新组合
    workflow.nodes = [...skillNodes, ...conditionNodes];
    
    // 重新设置依赖关系
    workflow.nodes.forEach((node, index) => {
      if (index > 0) {
        node.depends_on = [`node_${index - 1}`];
      } else {
        node.depends_on = [];
      }
      
      // 确保每个节点都有id
      if (!node.id) {
        node.id = `node_${index}`;
      } else {
        // 更新id格式
        node.id = node.id.replace(/condition_/, 'node_');
      }
    });
    
    // 保存修复后的文件
    const fixedPath = filepath.replace('.json', '.fixed.json');
    fs.writeFileSync(fixedPath, JSON.stringify(workflow, null, 2));
    
    console.log(`✅ 修复完成: ${path.basename(filepath)} → ${path.basename(fixedPath)}`);
    
    return fixedPath;
    
  } catch (error) {
    console.error(`❌ 修复失败 ${filepath}: ${error.message}`);
    return null;
  }
}

// 主程序
async function main() {
  const { getCopilotDir } = require('./src/utils/paths');
  const workflowsDir = path.join(getCopilotDir(), 'workflows');
  
  if (!fs.existsSync(workflowsDir)) {
    console.error('工作流目录不存在');
    return;
  }
  
  const files = fs.readdirSync(workflowsDir)
    .filter(f => f.endsWith('.json') && !f.includes('.fixed'));
  
  console.log(`🔧 开始修复 ${files.length} 个工作流文件\n`);
  
  const fixedFiles = [];
  for (const file of files) {
    const fixed = fixWorkflowFile(path.join(workflowsDir, file));
    if (fixed) {
      fixedFiles.push(path.basename(fixed));
    }
  }
  
  console.log(`\n🎉 修复完成！生成文件:`);
  fixedFiles.forEach(file => console.log(`   ${file}`));
  
  // 测试修复后的工作流
  if (fixedFiles.length > 0) {
    console.log('\n🧪 测试修复后的工作流...');
    
    const { WorkflowRunner } = require('./workflow-engine');
    const runner = new WorkflowRunner();
    
    const testFile = fixedFiles[0];
    console.log(`\n测试文件: ${testFile}`);
    
    try {
      const result = await runner.runWorkflowFile(testFile);
      console.log(`\n✅ 测试成功！执行结果:`);
      console.log(`   成功节点: ${Object.values(result.results).filter(r => r.success).length}`);
      console.log(`   失败节点: ${Object.values(result.results).filter(r => !r.success).length}`);
    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
    }
  }
}

main().catch(console.error);