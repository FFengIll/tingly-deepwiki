# Tingly Deepwiki

<div align="center">

**One-click GitHub → Deepwiki converter & manager for Chrome**

[Chrome 扩展：一键转换 GitHub 仓库为 Deepwiki，随时保存查看]

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## ✨ Quick Look / 一眼了解

- 🔀 **One-click convert** - Convert GitHub repos to Deepwiki URLs instantly / 一键转换 GitHub 仓库为 Deepwiki
- 🔍 **Smart scan** - Extract all GitHub repo links from any page / 智能扫描页面中所有 GitHub 仓库链接
- 💾 **Save for later** - Save your favorite repos / deepwiki and access them anytime / 保存常用仓库/deepwiki，随时访问
- 🎯 **Smart tabs** - Auto-switches to the right tab based on current page / 根据当前页面智能切换标签

---

## 🚀 Quick Start / 快速开始

```bash
# 1. Clone and build / 克隆并构建
git clone <repo-url>
cd tingly-deepwiki
pnpm install && pnpm build

# 2. Load in Chrome / 加载到 Chrome
# Open chrome://extensions/
# Enable "Developer mode"
# Click "Load unpacked"
# Select the tingly-deepwiki/dist` folder
```

**Done!** Click the extension icon to start using.

**完成！** 点击扩展图标即可开始使用。

---

## 📖 How to Use / 如何使用

### I'm on a GitHub repo page... / 我在 GitHub 仓库页面...

Click the extension → Click **"Open in Deepwiki"**

点击扩展 → 点击 **"Open in Deepwiki"**

```
github.com/facebook/react  →  deepwiki.com/facebook/react
```

### I want to scan a page for repos... / 我想扫描页面的仓库...

Click the extension → Go to **Scan** tab → Click **"Scan Current Page"**

点击扩展 → 进入 **Scan** 标签 → 点击 **"Scan Current Page"**

```
Found: github.com/facebook/react  [Open] [Save]
Found: github.com/vuejs/core      [Open] [Save]
```

### I want to see my saved repos... / 我想看已保存的仓库...

Click the extension → Go to **Saved** tab → Click **"Open"**

点击扩展 → 进入 **Saved** 标签 → 点击 **"Open"**

---

## 🎯 Features / 详细功能

### Smart Tab Switching / 智能标签切换

Automatically opens the most relevant tab:

| Page Type | Default Tab |
|-----------|-------------|
| 📦 Deepwiki page | Switch |
| 🐙 GitHub repo | Switch |
| 🔍 GitHub (org/issues) | Scan |
| 🌐 Other sites | Saved |

### One-Click Conversion / 一键转换

- GitHub: `github.com/owner/repo` → `deepwiki.com/owner/repo`
- Others: `example.com/page` → `deepwiki.com/example.com`
- Auto-cleans URL params and hash / 自动清理 URL 参数

### Page Scanning / 页面扫描

- ✅ Extracts standard repo URLs only / 只提取标准仓库 URL
- ✅ Filters sub-pages (`/tree`, `/blob`, etc.) / 过滤子页面
- ✅ Removes duplicates / 自动去重
- ✅ Cleans URLs / 清理 URL

### Save & Manage / 保存管理

- Save GitHub repos to Deepwiki / 保存 GitHub 仓库
- Save Deepwiki result pages / 保存 Deepwiki 结果页
- View all saved items / 查看所有已保存项目
- Delete unwanted items / 删除不需要的项目

---

## 🔧 Development / 开发

```bash
pnpm install    # Install dependencies
pnpm dev        # Dev mode with auto-reload
pnpm build      # Production build
```

**Tech Stack**: React 18 + TypeScript + Vite

---

## 📄 License / 许可证

MIT © [Tingly.Dev](LICENSE)

---

<div align="center">

Made with ❤️ by [Tingly.Dev](https://tingly.dev)

</div>
