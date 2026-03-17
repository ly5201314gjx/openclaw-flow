#!/bin/bash

# ========================================================
# OpenClaw Flow 一键安装脚本
# 🚀 你的第一句话，我的完整工作流
# ========================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 输出函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示横幅
show_banner() {
    clear
    echo -e "${BLUE}"
    echo '  ___  _  _  ___  _      ___  __    ___  _      _      __   __   __  '
    echo ' / __|| || || __|| |    | __||  |  / __|| |    | |    / _] /  \ |  | '
    echo '| (__ | || || _| | |__  | _| |  |_| (__ | |__  | |__ | [__| || ||  | '
    echo ' \___||_||_||___||____| |___||____|\___||____| |____| \___|\__/ |__| '
    echo -e "${NC}"
    echo '===================================================================='
    echo '🚀 你的第一句话，我的完整工作流'
    echo '📦 一键安装 OpenClaw Flow'
    echo '===================================================================='
    echo ''
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    local missing_deps=()
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        missing_deps+=("nodejs")
    else
        node_version=$(node -v | cut -d'v' -f2)
        log_info "Node.js 版本: v$node_version"
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        missing_deps+=("npm")
    fi
    
    # 检查 git
    if ! command -v git &> /dev/null; then
        log_warning "git 未安装，将无法从GitHub克隆"
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "缺少依赖: ${missing_deps[*]}"
        echo ""
        echo "请先安装以下依赖:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "然后重新运行此脚本。"
        exit 1
    fi
    
    log_success "所有依赖检查通过"
}

# 检查OpenClaw环境
check_openclaw_env() {
    log_info "检查OpenClaw环境..."
    
    if [ -d "$HOME/.openclaw" ]; then
        log_success "检测到OpenClaw安装目录: $HOME/.openclaw"
        
        # 检查技能目录
        if [ -d "$HOME/.openclaw/skills" ]; then
            log_info "技能目录存在: $HOME/.openclaw/skills"
        else
            log_warning "技能目录不存在，将创建..."
            mkdir -p "$HOME/.openclaw/skills"
        fi
        
        return 0
    else
        log_warning "未检测到OpenClaw标准目录"
        log_info "将在当前目录安装..."
        return 1
    fi
}

# 安装方式选择
select_installation_method() {
    echo ""
    echo "📦 请选择安装方式:"
    echo "   1. 标准安装 (推荐)"
    echo "      - 安装到 ~/.openclaw/skills/"
    echo "      - 自动创建符号链接"
    echo "      - 配置全局命令"
    echo ""
    echo "   2. 开发安装"
    echo "      - 安装到当前目录"
    echo "      - 适合开发调试"
    echo ""
    echo "   3. 自定义目录安装"
    echo "      - 安装到指定目录"
    echo "      - 完全控制"
    echo ""
    echo "   4. 退出"
    echo ""
    
    while true; do
        read -p "请输入选项 (1-4): " choice
        
        case $choice in
            1)
                INSTALL_METHOD="standard"
                INSTALL_DIR="$HOME/.openclaw/skills/openclaw-flow"
                log_info "选择: 标准安装"
                break
                ;;
            2)
                INSTALL_METHOD="development"
                INSTALL_DIR="$(pwd)/openclaw-flow"
                log_info "选择: 开发安装"
                break
                ;;
            3)
                read -p "请输入安装目录路径: " custom_dir
                if [ -z "$custom_dir" ]; then
                    log_error "目录不能为空"
                    continue
                fi
                INSTALL_METHOD="custom"
                INSTALL_DIR="$custom_dir"
                log_info "选择: 自定义安装到 $INSTALL_DIR"
                break
                ;;
            4)
                log_info "退出安装"
                exit 0
                ;;
            *)
                log_error "无效选项，请重新输入"
                ;;
        esac
    done
}

# 下载源码
download_source() {
    log_info "下载OpenClaw Flow源码..."
    
    local repo_url="https://github.com/ly5201314gjx/openclaw-flow.git"
    
    if [ -d "$INSTALL_DIR" ]; then
        log_warning "目录已存在: $INSTALL_DIR"
        read -p "是否覆盖？(y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "备份原有目录..."
            backup_dir="${INSTALL_DIR}.backup.$(date +%s)"
            mv "$INSTALL_DIR" "$backup_dir"
            log_info "已备份到: $backup_dir"
        else
            log_info "使用现有目录"
            return 0
        fi
    fi
    
    # 创建目录
    mkdir -p "$(dirname "$INSTALL_DIR")"
    
    # 克隆仓库
    log_info "从GitHub克隆: $repo_url"
    if git clone "$repo_url" "$INSTALL_DIR" 2>/dev/null; then
        log_success "源码下载完成"
    else
        log_error "Git克隆失败，尝试直接下载..."
        
        # 备选方案：直接下载zip
        local temp_zip="/tmp/openclaw-flow-$(date +%s).zip"
        if curl -L "https://github.com/ly5201314gjx/openclaw-flow/archive/refs/heads/main.zip" -o "$temp_zip" 2>/dev/null; then
            mkdir -p "$INSTALL_DIR"
            unzip -q "$temp_zip" -d "/tmp/"
            mv "/tmp/openclaw-flow-main/"* "$INSTALL_DIR/"
            rm -rf "/tmp/openclaw-flow-main" "$temp_zip"
            log_success "源码下载完成 (通过ZIP)"
        else
            log_error "下载失败，请检查网络连接"
            exit 1
        fi
    fi
}

# 安装依赖
install_dependencies() {
    log_info "安装Node.js依赖..."
    
    cd "$INSTALL_DIR"
    
    if [ -f "package.json" ]; then
        log_info "安装 npm 包..."
        if npm install 2>/dev/null; then
            log_success "依赖安装完成"
        else
            log_warning "npm install 失败，尝试安装核心依赖..."
            # 只安装必须的依赖
            npm install commander 2>/dev/null || log_warning "commander安装失败，但继续..."
        fi
    else
        log_error "package.json 不存在，可能下载失败"
        exit 1
    fi
}

# 配置全局命令
setup_global_command() {
    log_info "配置全局命令..."
    
    cd "$INSTALL_DIR"
    
    # 创建符号链接
    local bin_path="/usr/local/bin/openclaw-flow"
    local local_bin="./cli.js"
    
    if [ -f "$local_bin" ]; then
        # 给执行权限
        chmod +x "$local_bin"
        
        # 创建符号链接
        if ln -sf "$(pwd)/$local_bin" "$bin_path" 2>/dev/null; then
            log_success "全局命令已创建: openclaw-flow"
        else
            # 尝试本地链接
            if npm link 2>/dev/null; then
                log_success "通过npm link创建本地命令"
            else
                log_warning "无法创建全局命令，使用本地命令:"
                log_info "  cd $INSTALL_DIR && node cli.js"
            fi
        fi
    else
        log_error "找不到 cli.js 文件"
    fi
}

# 安装推荐技能
install_recommended_skills() {
    log_info "安装推荐技能 (增强功能)..."
    
    echo ""
    echo "💡 推荐安装以下技能以增强功能:"
    echo "   1. telegram-message - 通知功能"
    echo "   2. file-storage     - 文件存储"
    echo "   3. cron            - 定时任务"
    echo "   4. web-fetch       - 网页获取"
    echo ""
    
    read -p "是否安装推荐技能？ (Y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        log_info "跳过技能安装"
        return 0
    fi
    
    # 检查clawhub命令
    if command -v clawhub &> /dev/null; then
        log_info "使用clawhub安装技能..."
        
        local skills=("telegram-message" "file-storage" "cron" "web-fetch")
        
        for skill in "${skills[@]}"; do
            log_info "安装 $skill..."
            if clawhub install "$skill" 2>/dev/null; then
                log_success "  ✓ $skill 安装成功"
            else
                log_warning "  ✗ $skill 安装失败 (可能已安装)"
            fi
        done
    else
        log_warning "clawhub命令未找到，跳过技能安装"
        log_info "你可以手动安装: clawhub install <skill-name>"
    fi
}

# 创建工作流模板
create_workflow_templates() {
    log_info "创建常用工作流模板..."
    
    local templates_dir="$INSTALL_DIR/workflow-templates"
    mkdir -p "$templates_dir"
    
    # 模板1：加密货币监控
    cat > "$templates_dir/crypto-monitor.json" << 'EOF'
{
  "name": "加密货币价格监控",
  "description": "监控加密货币价格，超过阈值时通知",
  "trigger": "监控BTC价格，超过$50000就通知我",
  "workflow": {
    "steps": [
      {
        "action": "获取价格",
        "skill": "binance-trading",
        "params": { "symbol": "BTCUSDT" }
      },
      {
        "action": "检查阈值",
        "condition": "price > 50000",
        "if_true": {
          "action": "发送通知",
          "skill": "telegram-message",
          "params": { "message": "🚨 BTC价格已超过$50000!" }
        }
      }
    ]
  },
  "usage": "openclaw-flow process \"监控BTC价格，超过$50000就通知我\""
}
EOF
    
    # 模板2：内容收集
    cat > "$templates_dir/content-collector.json" << 'EOF'
{
  "name": "多平台内容收集",
  "description": "定时收集多个平台的热门内容",
  "trigger": "每天上午9点收集知乎和B站热榜",
  "workflow": {
    "schedule": "0 9 * * *",
    "steps": [
      {
        "action": "获取知乎热榜",
        "skill": "zhihu-hot",
        "params": { "limit": 10 }
      },
      {
        "action": "获取B站热榜",
        "skill": "bilibili-hot",
        "params": { "limit": 10 }
      },
      {
        "action": "保存到文件",
        "skill": "file-storage",
        "params": { "path": "/data/hot-content-{{date}}.json" }
      }
    ]
  },
  "usage": "openclaw-flow process \"每天上午9点收集知乎和B站热榜\""
}
EOF
    
    # 模板3：文件备份
    cat > "$templates_dir/file-backup.json" << 'EOF'
{
  "name": "自动化文件备份",
  "description": "定时备份重要文件到指定位置",
  "trigger": "每天凌晨2点备份workspace目录",
  "workflow": {
    "schedule": "0 2 * * *",
    "steps": [
      {
        "action": "压缩目录",
        "skill": "file-processor",
        "params": { "action": "compress", "source": "~/workspace", "target": "/backups/workspace-{{date}}.zip" }
      },
      {
        "action": "上传到云存储",
        "skill": "cloud-storage",
        "params": { "action": "upload", "file": "/backups/workspace-{{date}}.zip" }
      },
      {
        "action": "发送备份完成通知",
        "skill": "telegram-message",
        "params": { "message": "✅ 文件备份已完成: workspace-{{date}}.zip" }
      }
    ]
  },
  "usage": "openclaw-flow process \"每天凌晨2点备份workspace目录\""
}
EOF
    
    # 模板4：系统监控
    cat > "$templates_dir/system-monitor.json" << 'EOF'
{
  "name": "系统健康监控",
  "description": "监控系统状态，异常时报警",
  "trigger": "每5分钟检查系统状态",
  "workflow": {
    "schedule": "*/5 * * * *",
    "steps": [
      {
        "action": "检查磁盘空间",
        "skill": "system-monitor",
        "params": { "check": "disk", "threshold": 90 }
      },
      {
        "action": "检查内存使用",
        "skill": "system-monitor",
        "params": { "check": "memory", "threshold": 85 }
      },
      {
        "action": "检查CPU负载",
        "skill": "system-monitor",
        "params": { "check": "cpu", "threshold": 80 }
      },
      {
        "action": "生成报告",
        "condition": "any_check_failed",
        "if_true": {
          "action": "发送警报",
          "skill": "telegram-message",
          "params": { "message": "🚨 系统监控异常！请立即检查。" }
        }
      }
    ]
  },
  "usage": "openclaw-flow process \"监控系统状态，异常时报警\""
}
EOF
    
    # 模板5：数据同步
    cat > "$templates_dir/data-sync.json" << 'EOF'
{
  "name": "跨平台数据同步",
  "description": "在不同平台间同步数据",
  "trigger": "每小时同步GitHub issues到Notion",
  "workflow": {
    "schedule": "0 * * * *",
    "steps": [
      {
        "action": "获取GitHub issues",
        "skill": "github-api",
        "params": { "repo": "your/repo", "state": "open" }
      },
      {
        "action": "转换数据格式",
        "skill": "data-processor",
        "params": { "transform": "github_to_notion" }
      },
      {
        "action": "同步到Notion",
        "skill": "notion-api",
        "params": { "database_id": "your-database-id" }
      },
      {
        "action": "记录同步状态",
        "skill": "file-storage",
        "params": { "path": "/logs/sync-{{timestamp}}.json" }
      }
    ]
  },
  "usage": "openclaw-flow process \"同步GitHub数据到Notion\""
}
EOF
    
    log_success "创建了5个常用工作流模板"
    log_info "模板位置: $templates_dir/"
}

# 创建使用示例
create_examples() {
    log_info "创建使用示例..."
    
    local examples_dir="$INSTALL_DIR/examples"
    mkdir -p "$examples_dir"
    
    # 创建示例脚本
    cat > "$examples_dir/quick-start.sh" << 'EOF'
#!/bin/bash
# OpenClaw Flow 快速开始示例

echo "🚀 OpenClaw Flow 快速开始"
echo "========================"

# 1. 简单示例
echo ""
echo "1. 简单热榜获取:"
echo "   openclaw-flow process \"知乎热榜\""
echo "   openclaw-flow process \"哔哩哔哩热榜\""

# 2. 定时任务
echo ""
echo "2. 定时任务:"
echo "   openclaw-flow process \"每天上午9点获取热榜\""
echo "   openclaw-flow process \"每2小时检查价格\""

# 3. 条件执行
echo ""
echo "3. 条件执行:"
echo "   openclaw-flow process \"价格超过$100就通知我\""
echo "   openclaw-flow process \"磁盘空间不足90%时报警\""

# 4. 复杂工作流
echo ""
echo "4. 复杂工作流:"
echo "   openclaw-flow process \"获取热榜，保存到文件，发送到Telegram\""
echo "   openclaw-flow process \"监控价格，异常时邮件和Telegram双通知\""
EOF
    
    chmod +x "$examples_dir/quick-start.sh"
    
    # 创建测试脚本
    cat > "$examples_dir/test-workflow.js" << 'EOF'
#!/usr/bin/env node
/**
 * OpenClaw Flow 工作流测试
 */

const { execSync } = require('child_process');

console.log('🧪 OpenClaw Flow 工作流测试');
console.log('==========================\n');

const testCases = [
  {
    name: '简单热榜获取',
    command: 'openclaw-flow process "知乎热榜" --dry-run',
    description: '测试自然语言理解'
  },
  {
    name: '定时任务创建',
    command: 'openclaw-flow process "每天中午12点执行" --dry-run',
    description: '测试定时调度'
  },
  {
    name: '多技能组合',
    command: 'openclaw-flow process "获取数据并保存文件" --dry-run',
    description: '测试技能链'
  }
];

testCases.forEach((test, index) => {
  console.log(`🔍 测试 ${index + 1}: ${test.name}`);
  console.log(`📝 ${test.description}`);
  console.log(`💻 ${test.command}\n`);
  
  try {
    const output = execSync(test.command, { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ 测试成功\n');
  } catch (error) {
    console.log('❌ 测试失败:', error.message, '\n');
  }
});

console.log('🎉 测试完成！');
console.log('🚀 开始使用: openclaw-flow process "你的第一句话"');
EOF
    
    log_success "使用示例已创建"
}

# 验证安装
verify_installation() {
    log_info "验证安装..."
    
    cd "$INSTALL_DIR"
    
    echo ""
    echo "🔍 安装验证检查:"
    echo "========================"
    
    local checks_passed=0
    local checks_total=5
    
    # 检查1: 目录结构
    if [ -f "package.json" ]; then
        echo "✅ 目录结构正常"
        checks_passed=$((checks_passed + 1))
    else
        echo "❌ package.json 不存在"
    fi
    
    # 检查2: 依赖安装
    if [ -d "node_modules" ]; then
        echo "✅ 依赖已安装"
        checks_passed=$((checks_passed + 1))
    else
        echo "⚠️  依赖目录不存在"
    fi
    
    # 检查3: 主文件
    if [ -f "cli.js" ]; then
        echo "✅ 主文件存在"
        checks_passed=$((checks_passed + 1))
    else
        echo "❌ cli.js 不存在"
    fi
    
    # 检查4: 命令可用性
    if command -v openclaw-flow &> /dev/null || [ -f "node_modules/.bin/openclaw-flow" ]; then
        echo "✅ 命令可用"
        checks_passed=$((checks_passed + 1))
    else
        echo "⚠️  命令未全局安装，使用: node cli.js"
    fi
    
    # 检查5: 运行测试
    if node -e "console.log('✅ Node.js运行正常')" &>/dev/null; then
        echo "✅ 运行环境正常"
        checks_passed=$((checks_passed + 1))
    else
        echo "❌ Node.js运行失败"
    fi
    
    echo "========================"
    echo "📊 验证结果: $checks_passed/$checks_total 通过"
    
    if [ $checks_passed -ge 4 ]; then
        log_success "安装验证通过！"
        return 0
    else
        log_warning "安装验证部分通过，可能需要手动调整"
        return 1
    fi
}

# 显示完成信息
show_completion() {
    echo ""
    echo "🎉🎉🎉 安装完成！ 🎉🎉🎉"
    echo "========================================"
    echo "🚀 OpenClaw Flow 已成功安装"
    echo "📦 安装目录: $INSTALL_DIR"
    echo "========================================"
    echo ""
    echo "📚 可用资源:"
    echo "   📖 文档: $INSTALL_DIR/README.md"
    echo "   📂 模板: $INSTALL_DIR/workflow-templates/"
    echo "   🧪 示例: $INSTALL_DIR/examples/"
    echo ""
    echo "🚀 立即开始使用:"
    echo "   1. 获取热榜:"
    echo "      openclaw-flow process \"知乎热榜\""
    echo "      openclaw-flow process \"哔哩哔哩热榜\""
    echo ""
    echo "   2. 定时任务:"
    echo "      openclaw-flow process \"每天中午12点执行\""
    echo ""
    echo "   3. 复杂工作流:"
    echo "      openclaw-flow process \"监控价格，异常时通知\""
    echo ""
    echo "💡 提示: 使用 --dry-run 参数预览工作流"
    echo "      openclaw-flow process \"你的需求\" --dry-run"
    echo ""
    echo "🔗 GitHub: https://github.com/ly5201314gjx/openclaw-flow"
    echo ""
    echo "💪 老大，你的大龙虾已装备OpenClaw Flow！"
    echo "   一句话创建自动化工作流的时代来了！ 🚀"
}

# 主函数
main() {
    show_banner
    check_dependencies
    check_openclaw_env
    select_installation_method
    download_source
    install_dependencies
    setup_global_command
    install_recommended_skills
    create_workflow_templates
    create_examples
    verify_installation
    show_completion
}

# 异常处理
trap 'log_error "安装过程被中断"; exit 1' INT TERM

# 运行主函数
main "$@"