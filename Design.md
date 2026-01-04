# Tingly Deepwiki - Product Design

## Overview

Tingly Deepwiki is a Chrome extension that helps users quickly convert GitHub repositories to Deepwiki URLs and save them for later access. The extension provides intelligent tab switching based on the current page context.

## Core Features

### 1. Smart Tab Switching

The popup automatically opens the most relevant tab based on the current page:

| Page Type | Default Tab | Reason |
|-----------|-------------|--------|
| Deepwiki pages | Switch | Already on Deepwiki, can save or navigate |
| GitHub repo pages (`github.com/owner/repo`) | Switch | Can convert to Deepwiki URL directly |
| GitHub non-repo pages (org, issues, etc.) | Scan | May contain repo links to scan |
| Other websites | Saved | No direct conversion, view saved items |

### 2. Switch Tab

**Purpose**: Convert current page to Deepwiki and save for later

**UI Elements**:
- Current URL display (truncated if > 50 chars)
- "Open in Deepwiki" button - converts and opens the Deepwiki URL
- "Save to Deepwiki" / "Save This Deepwiki" button - saves to storage (shown for GitHub & Deepwiki pages only)

**Behaviors**:
- GitHub URLs → `https://deepwiki.com/owner/repo`
- Other URLs → `https://deepwiki.com/hostname`
- Clean URLs (no query params, hash)

### 3. Scan Tab

**Purpose**: Extract GitHub repo links from the current page

**UI Elements**:
- "Scan Current Page" button
- List of found URLs with count
- Each item shows: URL, "Open" button, "Save" button (GitHub only)

**Behaviors**:
- Only extracts standard GitHub repo URLs (`github.com/owner/repo`)
- Filters out sub-paths like `/tree/main`, `/blob/main`
- Cleans URLs (removes query params, hash)
- Automatic deduplication

### 4. Saved Tab

**Purpose**: View and manage saved Deepwiki items

**UI Elements**:
- Count of saved items
- List of saved items, each showing:
  - Title (original URL)
  - Description (GitHub repo description or page description)
  - Save date
  - "Open" button - opens the Deepwiki URL
  - "Delete" button

**Storage Structure**:
```
{
  id: string
  url: string          // Deepwiki URL for navigation
  displayUrl: string   // Original URL (e.g., GitHub) for display
  title: string        // Original URL as title
  description?: string // Project/page description
  savedAt: string      // ISO timestamp
}
```

---

## UI Design

### Layout

```
┌─────────────────────────────────────┐
│     Tingly Deepwiki                 │  ← 蓝色标题栏
├─────┬──────┬───────┐                │
│Swap │ Scan │ Saved │                │  ← Tab 导航
├─────┴──────┴───────┴────────────────┤
│                                     │
│  Content Area                       │  ← 滚动内容区
│  (500px height)                      │
│                                     │
└─────────────────────────────────────┘
```

**Dimensions**:
- **Width**: 500px
- **Height**: 500px
- **Three-tab navigation**: Switch | Scan | Saved

### Color Scheme
| 用途 | 颜色 | Hex |
|------|------|-----|
| 主色 | 蓝色 | `#2563eb` |
| 成功 | 绿色 | `#10b981` |
| 危险 | 红色 | `#ef4444` |
| 标题 | 深灰 | `#374151` |
| 描述 | 中灰 | `#6b7280` |
| 日期 | 浅灰 | `#9ca3af` |

**Details**:
- **Primary Blue**: `#2563eb` (buttons, active state)
- **Success Green**: `#10b981` (save button)
- **Error Red**: `#ef4444` (delete button)
- **Backgrounds**: White, `#f9fafb`, `#f3f4f6`
- **Text**: `#374151` (primary), `#6b7280` (secondary), `#9ca3af` (muted)

### Typography
- **Font**: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif)
- **Sizes**: 11px-18px range

### Components

#### Tab 1: Switch
```
┌─────────────────────────────────────┐
│ Current URL:                        │
│ https://github.com/facebook/react   │  ← 显示当前 URL
│                                     │
│  [ Open in Deepwiki  ]              │  ← 主按钮（蓝色）
│  [ Save to Deepwiki ]               │  ← 次按钮（绿色）
└─────────────────────────────────────┘
```

#### Tab 2: Scan
```
┌─────────────────────────────────────┐
│  [ Scan Current Page ]              │
│                                     │
│  Found URLs (3)                     │
│  ┌───────────────────────────────┐  │
│  │ github.com/facebook/react    │  │
│  │              [Open] [Save]   │  │
│  ├───────────────────────────────┤  │
│  │ github.com/vuejs/core        │  │
│  │                [Open] [Save] │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Tab 3: Saved
```
┌─────────────────────────────────────┐
│  Saved Deepwikis (5)                │
│  ┌───────────────────────────────┐  │
│  │ github.com/facebook/react    │  │
│  │ facebook/react                │  │
│  │ 2024-01-04                    │  │
│  │                  [Open][Del] │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Toast Notification
```
┌─────────────────────────────┐
│ ✓ Saved successfully!       │  ← 左下角弹出
└─────────────────────────────┘     绿色背景，3秒后消失
```

**Buttons**:
- Primary: Blue, rounded 6px
- Secondary: Green, rounded 6px
- Small action buttons: 6px padding, rounded 4px

**Cards/Items**:
- Light gray background (`#f9fafb`)
- Rounded 6px
- 10px padding

---

## UX Features

### Toast Notifications
- **Position**: Bottom-left corner
- **Animation**: Slide in from left
- **Types**: Success (green), Error (red)
- **Auto-dismiss**: Yes, after 3 seconds

### Loading States
Buttons show loading state during operation:
```
[ Scanning... ]  /  [ Saving... ]
```

### Delete Action
- Click delete button to remove (no confirmation dialog)
- Shows toast "Deleted successfully" after deletion

### Feedback Messages
- **Success**: "GitHub repo saved to Deepwiki!", "Deepwiki page saved!", "Deleted successfully"
- **Empty State**: "No saved deepwikis yet"

### URL Handling
- **GitHub repo detection**: Exactly 2 path segments (`/owner/repo`)
- **URL cleaning**: Strip query params and hash
- **Conversion**: Preserve `owner/repo` path for GitHub URLs

---

## GitHub Integration

### Repo Description Extraction
When on a GitHub repo page, the extension extracts:
- Project description from `[itemprop="about"]` element
- Falls back to meta tags if not found
- Used as description in saved items

### Scan Rules
Only captures standard GitHub repo URLs:

| Original URL | Result |
|-------------|--------|
| `https://github.com/owner/repo` | ✅ Keep |
| `https://github.com/owner/repo/tree/main` | ❌ Filter |
| `https://github.com/owner/repo/issues` | ❌ Filter |
| `https://github.com/owner/repo?readme=1` | ✅ Clean to `/owner/repo` |

### Supported GitHub URL Patterns
| Pattern | Supported | Action |
|---------|-----------|--------|
| `github.com/owner/repo` | ✅ | Convert to Deepwiki |
| `github.com/owner/repo/tree/main` | ❌ | Filtered out (not standard repo) |
| `github.com/owner` | ❌ | Use Scan tab |
| `github.com/org/repo/issues` | ❌ | Filtered out (not standard repo) |

### Display Format
Saved GitHub repos show:
- **Title**: Full URL
- **Description**: `owner/repo` format

---

## User Flow

### Flow 1: 保存 GitHub 仓库
```
1. 用户在任意网页（如 GitHub Trending）
2. 打开扩展 → 自动进入 Scan tab
3. 点击 "Scan Current Page"
4. 显示所有 GitHub 仓库链接
5. 点击某个仓库的 "Save" 按钮
6. 左下角弹出提示 "GitHub repo saved to Deepwiki!"
7. 切换到 Saved tab 可查看
```

### Flow 2: 打开 Deepwiki
```
1. 用户在 GitHub 页面
2. 打开扩展 → 显示 "Save to Deepwiki" 按钮
3. 点击 "Open in Deepwiki"
4. 新标签页打开 Deepwiki URL
```

### Flow 3: 管理已保存项目
```
1. 打开扩展 → 进入 Saved tab
2. 浏览所有已保存项目
3. 点击 "Open" 打开 Deepwiki
4. 或点击 "Delete" 删除条目
```
