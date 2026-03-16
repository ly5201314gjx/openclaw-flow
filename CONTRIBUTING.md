# Contributing to OpenClaw Flow 🌊

Thank you for your interest in contributing to OpenClaw Flow! We're excited to have you join our community of builders who are making automation accessible to everyone.

## 🤝 Our Philosophy

OpenClaw Flow is built on three core principles:

1. **Simplicity First** - Automation should be as easy as conversation
2. **Power Through Composition** - Small, focused skills combine into powerful workflows
3. **Community-Driven** - The best features come from real user needs

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- Git
- A GitHub account

### Setup Development Environment

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/openclaw-flow.git
cd openclaw-flow

# 3. Install dependencies
npm install

# 4. Link for local testing
npm link

# 5. Verify setup
openclaw-flow --version
```

### Install OpenClaw (if not already)
```bash
npm install -g openclaw

# Install essential skills for testing
clawhub install binance-trading
clawhub install telegram-message
```

## 🧪 Running Tests

We use Jest for testing. Run tests with:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/intent-parser.test.js

# Run with coverage
npm run test:coverage

# Watch mode (for development)
npm run test:watch
```

## 🏗️ Project Structure

Understanding the codebase:

```
src/
├── core/                    # Core engine components
│   ├── intent-parser.js     # Natural language understanding
│   ├── skill-matcher.js     # Skill discovery and matching
│   ├── parameter-inferrer.js # Smart parameter inference
│   ├── workflow-generator.js # Workflow creation
│   └── workflow-executor.js  # Workflow execution
├── adapters/                # Skill adapters
│   └── real-skill-adapter.js # Integration with real OpenClaw skills
└── utils/                   # Utility functions
    └── tool-proxy.js        # Tool orchestration layer
```

## 📝 How to Contribute

### 1. Reporting Bugs

Found a bug? Great! Please create an issue with:

- **Clear title** describing the bug
- **Steps to reproduce** (be specific!)
- **Expected behavior** vs **Actual behavior**
- **Environment details** (OS, Node version, OpenClaw version)
- **Code examples** if applicable
- **Screenshots** if visual issue

### 2. Suggesting Features

Have an idea? We'd love to hear it! Create a feature request with:

- **Use case** - What problem does this solve?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Did you think of other ways?
- **Impact** - Who benefits and how?

### 3. Contributing Code

#### Small Changes
For typos, documentation fixes, or small improvements:

1. Fork the repository
2. Make your changes
3. Submit a Pull Request

#### Significant Features
For larger features:

1. **Start with an issue** - Discuss the feature before coding
2. **Get feedback** - Make sure the approach aligns with project goals
3. **Create a draft PR** - Get early feedback on implementation
4. **Iterate** - Incorporate feedback and improve

### 4. Improving Documentation

Great documentation is crucial! You can help by:

- Fixing typos or unclear explanations
- Adding examples
- Improving API documentation
- Translating to other languages

### 5. Adding New Skills

Want to add support for a new OpenClaw skill?

1. **Check if skill exists** in `src/adapters/real-skill-adapter.js`
2. **Add adapter** - Create skill execution logic
3. **Register skill** in `src/core/skill-matcher.js`
4. **Add parameter inference** in `src/core/parameter-inferrer.js`
5. **Write tests** for the new skill
6. **Update documentation** with examples

Example skill adapter structure:
```javascript
// In src/adapters/real-skill-adapter.js
'new-skill': {
  execute: async (params) => {
    // Implementation here
  },
  validate: (params) => {
    // Validation logic
  }
}
```

## 🔧 Code Guidelines

### JavaScript Style
- Use **ES6+** features
- **2-space** indentation
- **Single quotes** for strings
- **Semicolons** at end of statements
- **CamelCase** for variables and functions
- **PascalCase** for classes

### Documentation
- JSDoc comments for public functions
- Clear, concise comments for complex logic
- Keep README and docs updated

### Testing
- Write tests for new features
- Maintain high test coverage
- Test edge cases
- Mock external dependencies

### Commits
- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Keep commits focused and atomic
- Write clear commit messages

Example commit messages:
```
feat: add support for Twitter skill
fix: handle missing symbol parameter gracefully
docs: update installation instructions
test: add tests for intent parser
chore: update dependencies
```

## 🚀 Pull Request Process

1. **Fork** the repository
2. **Create a branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### PR Checklist
- [ ] Tests pass (`npm test`)
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Linked to relevant issue

### PR Review Process
1. **Automated checks** (CI, tests, linting)
2. **Maintainer review** - Feedback within 2-3 days
3. **Address feedback** - Make requested changes
4. **Merge** - Once approved!

## 🌟 Recognition

All contributors will be:
- Listed in the project's CONTRIBUTORS.md
- Recognized in release notes
- Given credit for their work

## 📚 Learning Resources

- [OpenClaw Documentation](https://docs.openclaw.ai)
- [OpenClaw Skills Guide](https://docs.openclaw.ai/skills)
- [OpenClaw Community Discord](https://discord.gg/clawd)
- [GitHub Guides](https://guides.github.com/)

## 🤔 Questions?

- **GitHub Issues** - For bugs and feature requests
- **Discord** - For real-time discussion
- **Twitter** - [@openclaw](https://twitter.com/openclaw)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making OpenClaw Flow better! Together, we're building the future of accessible automation. 🚀