#!/usr/bin/env node

/**
 * OpenClaw Flow CLI Tool
 * Your First Sentence, My Full Workflow
 */

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');

// Check if commander is available
let commander;
try {
  commander = require('commander');
} catch (error) {
  console.error('❌ Missing dependencies. Please run:');
  console.error('   npm install');
  console.error('');
  console.error('Or (one-time) install globally:');
  console.error('   npm install -g openclaw-flow');
  process.exit(1);
}

// Load package info
const packageJson = require('./package.json');
const { OpenClawCopilot, createCopilot } = require('./index');

// Create CLI program
const program = new commander.Command();

program
  .name('openclaw-flow')
  .description(packageJson.description)
  .version(packageJson.version);

// Show banner
function showBanner() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 OpenClaw Flow'.padEnd(45) + 'v' + packageJson.version);
  console.log('📝 Your First Sentence, My Full Workflow'.padEnd(45) + '✨');
  console.log('='.repeat(60) + '\n');
}

// process command
program
  .command('process')
  .description('Process a natural language request and execute workflow')
  .argument('<text>', 'Your request, e.g., "Monitor WLD price"')
  .option('-d, --dry-run', 'Preview without execution')
  .option('-y, --yes', 'Auto-confirm execution')
  .option('-o, --output <file>', 'Save result to file')
  .option('-v, --verbose', 'Show detailed logs')
  .action(async (text, options) => {
    showBanner();
    
    console.log(`📝 Processing: "${text}"\n`);
    
    const flow = createCopilot({
      dryRun: options.dryRun,
      verbose: options.verbose || false,
      autoConfirm: options.yes
    });
    
    const startTime = Date.now();
    
    try {
      const result = await flow.process(text);
      
      if (result.success) {
        console.log(`\n🎉 Workflow created: ${result.workflow.name}`);
        console.log(`🔗 Skill chain: ${result.skillChain.join(' → ')}`);
        console.log(`⚡ Duration: ${Date.now() - startTime}ms`);
        console.log(`✅ Status: ${result.result.success ? 'Success' : 'Partial success'}`);
        
        if (options.output) {
          fs.writeFileSync(options.output, JSON.stringify(result, null, 2));
          console.log(`\n💾 Result saved to: ${options.output}`);
        }
        
        if (options.dryRun) {
          console.log('\n⚠️  Dry-run mode: No actual execution performed');
          console.log('   Use without --dry-run to execute for real');
        }
      } else {
        console.error(`\n❌ Processing failed: ${result.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`\n💥 Unexpected error: ${error.message}`);
      process.exit(1);
    }
  });

// batch command
program
  .command('batch')
  .description('Process multiple requests from a file')
  .argument('<file>', 'Text file with one request per line')
  .option('-d, --dry-run', 'Preview without execution')
  .option('-o, --output <dir>', 'Output directory for results')
  .action(async (file, options) => {
    showBanner();
    
    if (!fs.existsSync(file)) {
      console.error(`❌ File not found: ${file}`);
      process.exit(1);
    }
    
    const requests = fs.readFileSync(file, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    console.log(`📋 Processing ${requests.length} requests\n`);
    
    const flow = createCopilot({
      dryRun: options.dryRun,
      autoConfirm: true
    });
    
    const results = [];
    
    for (let i = 0; i < requests.length; i++) {
      console.log(`📝 [${i + 1}/${requests.length}] "${requests[i]}"`);
      
      const result = await flow.process(requests[i]);
      results.push(result);
      
      // Brief pause between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Save results
    if (options.output) {
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultFile = path.join(options.output, `batch_results_${timestamp}.json`);
      
      fs.writeFileSync(resultFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        requests,
        results
      }, null, 2));
      
      console.log(`\n💾 Batch results saved to: ${resultFile}`);
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    console.log(`\n📊 Summary: ${successful}/${requests.length} successful`);
  });

// demo command
program
  .command('demo')
  .description('Run interactive demo')
  .action(async () => {
    showBanner();
    
    console.log('🎬 Interactive Demo\n');
    
    const demoRequests = [
      "Monitor WLD price and alert me on Telegram if it drops 5%",
      "Get top 10 trending topics from Zhihu every day",
      "Check BTC price every hour and send report"
    ];
    
    const flow = createCopilot({ dryRun: true });
    
    for (let i = 0; i < demoRequests.length; i++) {
      console.log(`🔧 Example ${i + 1}: "${demoRequests[i]}"`);
      console.log('-'.repeat(50));
      
      const result = await flow.process(demoRequests[i]);
      
      if (result.success) {
        console.log(`   Workflow: ${result.workflow.name}`);
        console.log(`   Skills: ${result.skillChain.join(' → ')}`);
        console.log(`   Nodes: ${result.workflow.nodes.length}`);
        console.log();
      }
    }
    
    console.log('🎉 Demo completed!');
    console.log('\n💡 Try it for real:');
    console.log('   openclaw-flow process "Monitor WLD price, alert on Telegram if drops 5%"');
  });

// status command
program
  .command('status')
  .description('Show system status and available skills')
  .action(() => {
    showBanner();
    
    const flow = createCopilot();
    const status = flow.getStatus();
    
    console.log('📊 System Status\n');
    console.log(`   Version: ${status.version}`);
    console.log(`   Mode: ${status.mode}`);
    console.log(`   Supported skills: ${status.supportedSkills.length}`);
    
    console.log('\n🔧 Available Skills:');
    status.supportedSkills.forEach(skill => {
      console.log(`   ✅ ${skill}`);
    });
    
    console.log(`\n📈 Stats: ${JSON.stringify(status.stats, null, 2)}`);
  });

// install command
program
  .command('install')
  .description('Install dependencies and configure system')
  .action(() => {
    showBanner();
    
    console.log('🔧 Installation Guide\n');
    
    console.log('1. Check prerequisites:');
    console.log(`   Node.js: ${process.version}`);
    console.log(`   npm: ${require('child_process').execSync('npm --version').toString().trim()}`);
    
    console.log('\n2. Install OpenClaw (if not installed):');
    console.log('   npm install -g openclaw');
    
    console.log('\n3. Install OpenClaw Flow:');
    console.log('   npm install -g openclaw-flow');
    
    console.log('\n4. Install recommended skills:');
    console.log('   clawhub install binance-trading');
    console.log('   clawhub install telegram-message');
    console.log('   clawhub install cron');
    
    console.log('\n5. Test installation:');
    console.log('   openclaw-flow --version');
    console.log('   openclaw-flow demo');
    
    console.log('\n💡 For one-click setup, run: ./setup.sh');
  });

// Default command (when no subcommand provided)
program
  .command('flow')
  .description('Process request (alias for process)')
  .argument('<text>', 'Your request')
  .action(async (text) => {
    // Redirect to process command
    const args = process.argv.slice(2);
    args[args.indexOf('flow')] = 'process';
    program.parse(args);
  });

// If no arguments, show help
if (process.argv.length <= 2) {
  showBanner();
  
  console.log('🚀 Quick Start:');
  console.log('   openclaw-flow process "Monitor WLD price, alert on Telegram if drops 5%"');
  console.log('   openclaw-flow demo');
  console.log('   openclaw-flow --help\n');
  
  console.log('📖 Examples:');
  console.log('   • Monitor crypto: openclaw-flow "Watch BTC and ETH prices every hour"');
  console.log('   • Content collection: openclaw-flow "Get Zhihu hot topics daily"');
  console.log('   • Reminders: openclaw-flow "Remind me to check emails every 2 hours"');
  console.log('   • System tasks: openclaw-flow "Backup database daily at 2 AM"');
  
  process.exit(0);
}

// Parse arguments
program.parse(process.argv);