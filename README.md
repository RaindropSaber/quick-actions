# Smart Actions

<div align="center">

![Smart Actions Logo](https://img.shields.io/badge/VSCode-Smart%20Actions-blue?style=for-the-badge&logo=visual-studio-code)

一个简洁而强大的 VSCode 插件，允许用户通过快捷键选择和执行自定义 Action。支持内置文本转换、AI 处理和自定义脚本执行。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](https://github.com/your-username/smart-actions)
[![VSCode](https://img.shields.io/badge/VSCode-1.74.0+-blue.svg)](https://code.visualstudio.com/)

</div>

## ✨ 功能特性

- 🚀 **快速选择** - 通过 `Alt+Q` 快速选择要执行的 Action
- 🔧 **内置转换** - 支持驼峰命名、下划线等多种文本转换
- 🤖 **AI 处理** - 集成 AI 能力，支持代码优化、翻译等智能处理
- 📝 **脚本执行** - 支持自定义 JavaScript 脚本，无限扩展可能
- 🎯 **上下文感知** - 支持基于选中文本、光标位置等不同触发条件
- ⚙️ **可视化配置** - 基于 Vue 的现代化配置界面，操作简单直观
- 🔒 **安全可靠** - 本地执行，保护您的代码隐私

## 🚀 快速开始

### 安装方式

#### 方式一：从 VSCode 扩展市场安装（推荐）

1. 打开 VSCode
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "Smart Actions"
4. 点击安装

#### 方式二：从源码安装

1. 克隆此仓库到本地：
   ```bash
   git clone https://github.com/your-username/smart-actions.git
   cd smart-actions
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 编译项目：
   ```bash
   npm run build
   ```
4. 在 VSCode 中按 `F5` 启动调试模式

### 初次配置

安装完成后，建议先配置 AI 功能：

1. 按 `Alt+W` 打开配置界面
2. 点击 "🤖 AI 配置" 按钮
3. 填入您的 AI API Key 和相关配置
4. 点击 "测试连接" 确保配置正确

### 基本使用

#### 核心快捷键

| 快捷键  | 功能        | 说明                                    |
| ------- | ----------- | --------------------------------------- |
| `Alt+Q` | 执行 Action | 显示 Action 选择器，选择要执行的 Action |
| `Alt+W` | 打开配置    | 打开配置界面，管理您的 Actions          |

#### 使用流程

1. **配置 Actions**

   - 按 `Alt+W` 打开配置界面
   - 点击 "添加 Action" 创建新的 Action
   - 选择 Action 类型（内置转换、AI 处理或自定义脚本）
   - 配置相关参数并保存

2. **执行 Actions**
   - 在编辑器中选中要处理的文本（可选）
   - 按 `Alt+Q` 显示 Action 选择器
   - 选择要执行的 Action
   - 查看处理结果

#### 使用示例

**文本转换示例：**

```javascript
// 选中以下文本
hello_world_example;

// 按 Alt+Q，选择 "转换为驼峰命名"
// 结果：
helloWorldExample;
```

**AI 处理示例：**

```javascript
// 选中以下代码
function add(a, b) {
  return a + b;
}

// 按 Alt+Q，选择 "AI优化代码"
// AI 会返回优化后的代码和建议
```

## 📋 Action 类型详解

### 🔧 内置 Action

内置 Action 提供常用的文本转换功能，无需额外配置即可使用：

| 类型     | 功能                  | 示例                         |
| -------- | --------------------- | ---------------------------- |
| 驼峰命名 | 转换为 camelCase 格式 | `hello_world` → `helloWorld` |

**配置说明：**

- 选择 "内置" 类型
- 在 "内置类型" 下拉框中选择具体的转换方式

### 🤖 AI Action

AI Action 利用人工智能处理文本和代码，功能强大且灵活：

**支持的 AI 服务：**

- OpenAI GPT 系列
- Claude 系列
- 其他兼容 OpenAI API 的服务

**配置步骤：**

1. 在配置界面点击 "🤖 AI 配置"
2. 填入 API Key、Base URL、模型名称
3. 调整温度参数（控制创造性）
4. 测试连接确保配置正确

**示例用途：**

- 代码优化和重构
- 代码注释生成
- 语言翻译
- 文本格式化
- 错误修复建议

### 📝 脚本 Action

脚本 Action 允许您编写自定义 JavaScript 脚本，实现无限可能：

**脚本规范：**

```javascript
// 脚本必须导出两个函数
const executeable = () => true;
const execute = ({ vscode }) => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  const selection = editor.selection;
  const text = editor.document.getText(selection);
  const result = text + 'custom script';

  editor.edit((editBuilder) => {
    editBuilder.replace(selection, result);
  });
};

module.exports = {
  executeable,
  execute,
};
```

**配置说明：**

- 选择 "脚本" 类型
- 指定 JavaScript 文件路径
- 确保脚本文件可访问

## ⚙️ 配置说明

### AI 配置

您可以通过两种方式配置 AI 功能：

#### 方式一：通过配置界面（推荐）

1. 按 `Alt+W` 打开配置界面
2. 点击 "🤖 AI 配置" 按钮
3. 填写以下信息：
   - **API Key**: 您的 AI 服务 API 密钥
   - **Base URL**: API 服务地址（如 `https://api.openai.com/v1`）
   - **模型**: 使用的模型名称（如 `gpt-3.5-turbo`）
   - **温度**: 0-2 之间，控制回答的创造性

#### 方式二：通过 VSCode 设置

在 VSCode 设置中直接配置：

```json
{
  "quickActions.ai": {
    "apiKey": "your-api-key",
    "baseURL": "https://api.openai.com/v1",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7
  }
}
```

### Action 配置

Actions 配置存储在 VSCode 的用户设置中，您也可以直接编辑：

```json
{
  "quickActions.actions": [
    {
      "name": "转换为驼峰命名",
      "description": "将选中的文本转换为驼峰命名格式",
      "type": "builtin",
      "context": {
        "trigger": "always"
      },
      "config": {
        "builtinType": "camelCase"
      }
    },
    {
      "name": "AI优化代码",
      "description": "使用AI优化选中的代码",
      "type": "ai",
      "context": {
        "trigger": "always"
      },
      "config": {
        "aiPrompt": "请优化以下代码，使其更简洁、高效和可读：\n\n{{input}}\n\n请只返回优化后的代码，不要添加任何解释。"
      }
    }
  ]
}
```

## 🛠️ 开发指南

### 项目结构

```
src/
├── extension.ts              // 主入口文件
├── const/
│   └── index.ts             // 常量定义
├── core/
│   ├── ActionManager.ts     // Action 管理器
│   ├── ConfigPanel.ts       // 配置面板管理
│   ├── ExtBridgeApi.ts      // 扩展桥接API
│   └── index.ts            // 核心模块导出
├── handlers/
│   ├── ActionHandler.ts     // Action 处理基类
│   ├── AIHandler.ts         // AI 处理器
│   ├── BuildInHandler.ts    // 内置处理器
│   ├── ScriptHandler.ts     // 脚本处理器
│   └── index.ts            // 处理器导出
├── types/
│   ├── index.ts            // 类型定义
│   └── vue-shim.d.ts       // Vue 类型声明
├── utils/
│   └── RBridge.ts          // 通信桥接工具
└── webview/
    ├── components/         // Vue 组件
    ├── panel/
    │   └── ActionConfig.vue // 配置界面主组件
    ├── index.html          // HTML 模板
    ├── main.ts            // Vue 应用入口
    └── useExt.ts          // 扩展钩子
```

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（同时监听扩展和 Vue 应用）
npm run dev

# 构建项目
npm run build

# 只构建扩展
npm run build:extension

# 只构建 Vue 应用
npm run build:webview

# 监听模式
npm run watch

# 发布准备
npm run vscode:prepublish
```

### 本地调试

1. 在 VSCode 中打开项目
2. 按 `F5` 启动调试模式
3. 在新打开的 VSCode 窗口中测试扩展功能
4. 修改代码后，按 `Ctrl+R` 重新加载扩展

### 贡献指南

欢迎提交 Issue 和 Pull Request！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细的贡献指南。

## 🧪 技术栈

- **TypeScript** - 主要开发语言，提供类型安全
- **Vue 3** - 现代化的配置界面框架
- **Vite** - 快速的前端构建工具
- **VSCode Extension API** - 官方扩展开发接口

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。

## 🤝 支持与反馈

- 🐛 **问题反馈**: [GitHub Issues](https://github.com/your-username/smart-actions/issues)
- 💡 **功能建议**: [GitHub Discussions](https://github.com/your-username/smart-actions/discussions)
- ⭐ **如果这个项目对您有帮助，请给我们一个 Star！**

---

<div align="center">
Made with ❤️ by Smart Actions Team
</div>
