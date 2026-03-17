---
name: openclaw-flow
description: >
  One sentence to a real workflow.
  Turn natural language into OpenClaw-ready automation chains.
  Intent → skills → runnable flow (with defaults you can edit).
  Use when: (1) user wants to automate tasks with natural language,
  (2) needs multi-skill workflows fast,
  (3) wants zero-to-one automation without manual wiring.
  Triggers: "帮我自动化", "创建工作流", "监控价格", "定时提醒",
  "openclaw flow", "natural language workflow", "automate with words".
---

# OpenClaw Flow 🌊

## Description
**Your First Sentence, My Full Workflow**

Turn natural language into complete automation workflows. One sentence → One workflow → Zero configuration.

## Overview
OpenClaw Flow is the ultimate automation assistant that understands what you want and creates complete workflows automatically. No coding, no configuration, just speak or write naturally.

## Features
- **Natural language understanding** - Just say what you want
- **Dynamic skill matching** - Automatically finds the right OpenClaw skills
- **Smart parameter inference** - Figures out the details for you
- **Real execution** - Connects to real OpenClaw skills
- **Zero configuration** - Works out of the box
- **CLI interface** - Easy to use command line tool
- **MIT licensed** - Open source and free

## Installation
```bash
# Install the skill
clawhub install openclaw-flow

# Install recommended dependencies
clawhub install binance-trading
clawhub install telegram-message
clawhub install cron
```

## Quick Start
```bash
# After installation, use:
openclaw-flow process "Monitor WLD price, alert on Telegram if drops 5%"

# Or run demo
openclaw-flow demo
```

## Examples
```bash
# Crypto monitoring
openclaw-flow "Monitor BTC and ETH prices every hour"

# Content collection
openclaw-flow "Get top 10 Zhihu topics daily at 9 AM"

# Smart reminders
openclaw-flow "Remind me to check emails every 2 hours"

# System automation
openclaw-flow "Backup important files daily at 2 AM"
```

## How It Works
1. **You speak/write** what you want to automate
2. **OpenClaw Flow understands** your intent
3. **Finds the right skills** from OpenClaw ecosystem
4. **Infers smart parameters** automatically
5. **Creates & executes** the complete workflow
6. **✅ You're done!** Automation is running

## Supported Skills
- **Binance Trading** - Price monitoring and alerts
- **Telegram Message** - Notifications and messaging
- **Cron** - Scheduling and automation
- **Zhihu Hot** - Content collection
- **File Storage** - Data persistence
- **More coming soon!**

## CLI Reference
```bash
# Process a single request
openclaw-flow process "Your request here"

# Batch process multiple requests
openclaw-flow batch requests.txt

# Run interactive demo
openclaw-flow demo

# Show system status
openclaw-flow status

# Show help
openclaw-flow --help
```

## Configuration
No configuration required! OpenClaw Flow automatically:
- Detects installed OpenClaw skills
- Uses your existing configurations
- Adapts to your environment

## Troubleshooting
**Issue**: "Skill not found"  
**Solution**: Install required skills with `clawhub install`

**Issue**: "Permission denied"  
**Solution**: Ensure OpenClaw has proper permissions

**Issue**: "Execution failed"  
**Solution**: Check logs with `openclaw-flow process --verbose`

## Development
```bash
# Clone repository
git clone https://github.com/ly5201314gjx/openclaw-flow.git
cd openclaw-flow

# Install development dependencies
npm install

# Link for local testing
npm link

# Run tests
npm test
```

## Contributing
Contributions welcome! See [CONTRIBUTING.md](https://github.com/ly5201314gjx/openclaw-flow/blob/main/CONTRIBUTING.md) for details.

## Links
- **GitHub**: https://github.com/ly5201314gjx/openclaw-flow
- **Issues**: https://github.com/ly5201314gjx/openclaw-flow/issues
- **Discord**: https://discord.gg/clawd
- **Twitter**: https://twitter.com/openclaw

## License
MIT License - See [LICENSE](https://github.com/ly5201314gjx/openclaw-flow/blob/main/LICENSE)

## Author
OpenClaw Flow Team

## Version
0.1.0

## Tags
openclaw, flow, automation, workflow, natural-language, ai, productivity, cli