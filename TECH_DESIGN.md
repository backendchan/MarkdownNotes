# Markdown 笔记应用技术设计文档

## 1. 技术栈选择

### 1.1 前端技术栈

| 技术领域 | 技术选型 | 选择理由 |
|---------|---------|---------|
| **框架** | React 18 | 组件化开发、虚拟DOM高效更新、生态成熟、社区活跃 |
| **构建工具** | Vite | 快速冷启动、热更新、优化的生产构建 |
| **状态管理** | Zustand | 轻量级、API简洁、TypeScript友好、无样板代码 |
| **路由** | React Router v6 | 声明式路由、支持嵌套路由 |
| **UI组件库** | Ant Design 5.x | 企业级组件、完善的文档、主题定制能力强 |
| **图标** | Lucide React | 轻量、树摇优化、图标丰富 |
| **样式方案** | CSS Modules + Tailwind CSS | 组件级样式隔离 + 原子化CSS快速开发 |

### 1.2 Markdown 处理

| 技术领域 | 技术选型 | 选择理由 |
|---------|---------|---------|
| **Markdown解析** | markdown-it | 插件生态丰富、可扩展性强、CommonMark兼容 |
| **代码高亮** | Prism.js | 轻量、支持语言多、主题丰富 |
| **编辑器** | CodeMirror 6 | 高性能、可扩展、支持行号、语法高亮 |
| **数学公式** | KaTeX | 快速渲染、无依赖 |

### 1.3 数据存储

| 技术领域 | 技术选型 | 选择理由 |
|---------|---------|---------|
| **本地存储** | localForage | 统一API、支持IndexedDB/WebSQL/LocalStorage降级、异步API |
| **数据备份** | File System Access API + Blob | 支持文件导入导出 |

### 1.4 开发工具

| 工具类型 | 选型 | 说明 |
|---------|------|------|
| **语言** | TypeScript 5.x | 类型安全、更好的IDE支持 |
| **代码规范** | ESLint + Prettier | 代码质量保证 |
| **测试框架** | Vitest + React Testing Library | 单元测试与组件测试 |
| **端到端测试** | Playwright | 跨浏览器测试 |

### 1.5 后端技术栈

> **说明**：根据 PRD 需求，本应用为纯前端离线应用，**不需要后端服务**。所有数据存储在浏览器本地。

后续版本如需云同步功能，建议技术栈：
- **后端框架**：Node.js + Express / Fastify
- **数据库**：PostgreSQL（用户数据）+ Redis（会话缓存）
- **文件存储**：对象存储服务（如 AWS S3 / 阿里云 OSS）
- **认证**：JWT + OAuth2.0

---

## 2. 项目结构

```
markdown-notes/
├── public/                     # 静态资源
│   ├── favicon.ico
│   └── fonts/                  # 字体文件
│
├── src/
│   ├── assets/                 # 需要构建的静态资源
│   │   ├── images/
│   │   └── styles/
│   │       ├── global.css      # 全局样式
│   │       └── variables.css   # CSS变量（主题）
│   │
│   ├── components/             # 通用组件
│   │   ├── common/             # 基础UI组件
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Input/
│   │   │   └── index.ts
│   │   ├── layout/             # 布局组件
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── MainContent/
│   │   │   └── ResizablePanel/
│   │   └── business/           # 业务组件
│   │       ├── NoteList/
│   │       ├── NoteCard/
│   │       ├── Editor/
│   │       ├── Preview/
│   │       ├── Toolbar/
│   │       └── SearchBar/
│   │
│   ├── hooks/                  # 自定义Hooks
│   │   ├── useNotes.ts         # 笔记数据管理
│   │   ├── useAutoSave.ts      # 自动保存
│   │   ├── useTheme.ts         # 主题切换
│   │   ├── useSearch.ts        # 搜索功能
│   │   └── useLocalStorage.ts  # 本地存储
│   │
│   ├── services/               # 服务层
│   │   ├── storage.ts          # 存储服务
│   │   ├── markdown.ts         # Markdown解析服务
│   │   ├── export.ts           # 导出服务
│   │   └── import.ts           # 导入服务
│   │
│   ├── store/                  # 状态管理
│   │   ├── noteStore.ts        # 笔记状态
│   │   ├── settingStore.ts     # 设置状态
│   │   └── uiStore.ts          # UI状态
│   │
│   ├── types/                  # TypeScript类型定义
│   │   ├── note.ts
│   │   ├── settings.ts
│   │   └── common.ts
│   │
│   ├── utils/                  # 工具函数
│   │   ├── date.ts             # 日期处理
│   │   ├── string.ts           # 字符串处理
│   │   ├── id.ts               # ID生成
│   │   └── debounce.ts         # 防抖节流
│   │
│   ├── constants/              # 常量定义
│   │   ├── app.ts
│   │   └── storage.ts
│   │
│   ├── pages/                  # 页面组件
│   │   ├── Home/
│   │   └── Settings/
│   │
│   ├── App.tsx                 # 根组件
│   ├── main.tsx                # 入口文件
│   └── vite-env.d.ts           # Vite类型声明
│
├── tests/                      # 测试文件
│   ├── unit/
│   └── e2e/
│
├── .eslintrc.cjs               # ESLint配置
├── .prettierrc                 # Prettier配置
├── tsconfig.json               # TypeScript配置
├── vite.config.ts              # Vite配置
├── package.json
└── README.md
```

### 2.1 目录职责说明

| 目录 | 职责 |
|-----|------|
| `components/common` | 无业务逻辑的纯UI组件，可复用 |
| `components/layout` | 页面布局相关组件 |
| `components/business` | 包含业务逻辑的组件 |
| `hooks` | 可复用的状态逻辑 |
| `services` | 与外部交互的封装（存储、API等） |
| `store` | 全局状态管理 |
| `utils` | 纯函数工具 |

---

## 3. 数据模型

### 3.1 笔记模型 (Note)

```typescript
interface Note {
  id: string;                    // 唯一标识符，UUID v4
  title: string;                 // 笔记标题
  content: string;               // Markdown内容
  createdAt: number;             // 创建时间戳
  updatedAt: number;             // 最后修改时间戳
  tags?: string[];               // 标签（V1.3）
  isPinned?: boolean;            // 是否置顶
  isDeleted?: boolean;           // 软删除标记
  deletedAt?: number;            // 删除时间戳
}
```

### 3.2 应用设置模型 (Settings)

```typescript
interface Settings {
  theme: 'light' | 'dark' | 'system';  // 主题模式
  editorFontSize: number;               // 编辑器字号
  editorFontFamily: string;             // 编辑器字体
  previewFontSize: number;              // 预览区字号
  autoSaveInterval: number;             // 自动保存间隔(ms)
  defaultSort: SortOption;              // 默认排序方式
  showLineNumbers: boolean;             // 是否显示行号
  syncScroll: boolean;                  // 同步滚动
  layoutRatio: [number, number, number]; // 三栏宽度比例
}

type SortOption = 'createdAt' | 'updatedAt' | 'title';
```

### 3.3 应用状态模型 (AppState)

```typescript
interface AppState {
  currentNoteId: string | null;         // 当前编辑的笔记ID
  searchQuery: string;                   // 搜索关键词
  sortBy: SortOption;                    // 当前排序方式
  isSidebarCollapsed: boolean;           // 侧边栏折叠状态
  editorMode: 'split' | 'editor' | 'preview'; // 编辑模式
}
```

### 3.4 存储结构设计

```typescript
interface StorageSchema {
  'md-notes:notes': Note[];              // 笔记列表
  'md-notes:settings': Settings;          // 应用设置
  'md-notes:state': AppState;             // 应用状态
  'md-notes:version': string;             // 数据版本号
}
```

### 3.5 数据关系图

```
┌─────────────────────────────────────────────────────────┐
│                    LocalStorage                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Notes[]   │    │  Settings   │    │  AppState   │  │
│  ├─────────────┤    ├─────────────┤    ├─────────────┤  │
│  │ - id        │    │ - theme     │    │ - currentId │  │
│  │ - title     │    │ - fontSize  │    │ - search    │  │
│  │ - content   │    │ - autoSave  │    │ - sortBy    │  │
│  │ - createdAt │    │ - ...       │    │ - ...       │  │
│  │ - updatedAt │    │             │    │             │  │
│  │ - ...       │    │             │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 4. 关键技术点

### 4.1 实时预览同步滚动

**难点**：编辑区与预览区内容高度不一致，难以实现精确的滚动同步。

**解决方案**：
```typescript
const useSyncScroll = (editorRef, previewRef) => {
  const syncScroll = useCallback(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    
    if (!editor || !preview) return;
    
    const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    const previewScrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);
    
    preview.scrollTop = previewScrollTop;
  }, []);
  
  return syncScroll;
};
```

**优化策略**：
- 使用 `requestAnimationFrame` 节流滚动事件
- 基于行号映射实现更精确的同步
- 提供开关让用户选择是否启用

### 4.2 自动保存机制

**难点**：频繁保存影响性能，保存失败需要提示用户。

**解决方案**：
```typescript
const useAutoSave = (note: Note, delay: number = 1000) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const debouncedSave = useMemo(
    () => debounce(async (content: string) => {
      setSaveStatus('saving');
      try {
        await storageService.saveNote({ ...note, content, updatedAt: Date.now() });
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
      }
    }, delay),
    [note, delay]
  );
  
  return { saveStatus, save: debouncedSave };
};
```

**策略**：
- 使用防抖（debounce）避免频繁保存
- 保存状态可视化反馈
- 失败重试机制

### 4.3 Markdown 安全渲染

**难点**：用户输入的 Markdown 可能包含恶意脚本，存在 XSS 风险。

**解决方案**：
```typescript
import DOMPurify from 'dompurify';

const renderMarkdown = (content: string): string => {
  const rawHtml = markdownIt.render(content);
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id'],
  });
};
```

**安全措施**：
- 使用 DOMPurify 过滤危险标签
- 禁止内联 JavaScript
- 图片使用懒加载，防止恶意图片攻击

### 4.4 大文件性能优化

**难点**：笔记内容过长时，编辑和预览性能下降。

**解决方案**：

1. **虚拟滚动**：笔记列表使用虚拟滚动
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const NoteList = ({ notes }) => {
  const virtualizer = useVirtualizer({
    count: notes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });
  // ...
};
```

2. **预览节流**：大内容预览使用延迟渲染
```typescript
const Preview = ({ content }) => {
  const [renderedContent, setRenderedContent] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderedContent(renderMarkdown(content));
    }, 300);
    return () => clearTimeout(timer);
  }, [content]);
  
  return <div dangerouslySetInnerHTML={{ __html: renderedContent }} />;
};
```

3. **Web Worker**：Markdown 解析放入 Worker
```typescript
const parseMarkdownInWorker = async (content: string): Promise<string> => {
  const worker = new Worker(new URL('./markdown.worker.ts', import.meta.url));
  return new Promise((resolve) => {
    worker.onmessage = (e) => resolve(e.data);
    worker.postMessage(content);
  });
};
```

### 4.5 离线可用性

**难点**：确保应用在离线状态下完全可用。

**解决方案**：

1. **Service Worker 缓存**
```typescript
const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registered:', registration);
  }
};
```

2. **Manifest 配置**
```json
{
  "name": "Markdown Notes",
  "short_name": "MD Notes",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#3498db",
  "icons": [...]
}
```

3. **离线检测**
```typescript
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
```

### 4.6 数据迁移与版本管理

**难点**：应用升级时数据结构可能变化，需要平滑迁移。

**解决方案**：
```typescript
const DATA_VERSION = '1.0.0';

const migrateData = async () => {
  const storedVersion = await storageService.get('md-notes:version');
  
  if (!storedVersion) {
    await initialSetup();
  } else if (semver.lt(storedVersion, DATA_VERSION)) {
    await runMigrations(storedVersion, DATA_VERSION);
  }
  
  await storageService.set('md-notes:version', DATA_VERSION);
};

const migrations = {
  '0.9.0': async (data) => {
    // 添加新字段默认值
    data.notes = data.notes.map(note => ({
      ...note,
      isPinned: note.isPinned ?? false,
    }));
    return data;
  },
};
```

### 4.7 响应式布局适配

**难点**：三栏布局在不同屏幕尺寸下的适配。

**解决方案**：
```typescript
const useResponsiveLayout = () => {
  const [layout, setLayout] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      if (width >= 1200) setLayout('desktop');
      else if (width >= 768) setLayout('tablet');
      else setLayout('mobile');
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);
  
  return layout;
};
```

**布局策略**：
- 桌面端（≥1200px）：三栏布局
- 平板（768px-1199px）：两栏布局（列表+编辑/预览切换）
- 移动端（<768px）：单栏布局（标签页切换）

### 4.8 代码块语法高亮

**难点**：按需加载语言包，避免打包体积过大。

**解决方案**：
```typescript
const loadLanguage = async (lang: string) => {
  const languages = {
    javascript: () => import('prismjs/components/prism-javascript'),
    typescript: () => import('prismjs/components/prism-typescript'),
    python: () => import('prismjs/components/prism-python'),
    rust: () => import('prismjs/components/prism-rust'),
    // ...
  };
  
  if (languages[lang]) {
    await languages[lang]();
  }
};
```

---

## 5. 性能指标与监控

### 5.1 关键性能指标

| 指标 | 目标值 | 监控方式 |
|-----|-------|---------|
| 首屏加载时间 (FCP) | < 1.5s | Performance API |
| 可交互时间 (TTI) | < 2s | Lighthouse |
| 编辑器输入延迟 | < 100ms | 自定义埋点 |
| 预览更新延迟 | < 300ms | 自定义埋点 |
| 搜索响应时间 | < 500ms | 自定义埋点 |

### 5.2 性能监控代码

```typescript
const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  
  if (duration > 100) {
    console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
  }
};
```

---

## 6. 安全策略

### 6.1 内容安全策略 (CSP)

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self';
">
```

### 6.2 数据安全

- 所有数据存储在用户本地，不上传服务器
- 敏感操作（删除）需要二次确认
- 定期提醒用户备份数据

---

## 7. 测试策略

### 7.1 测试金字塔

```
          /\
         /  \
        / E2E\        - 关键用户流程
       /------\
      /  集成  \      - 组件交互
     /----------\
    /   单元测试  \    - 工具函数、Hooks
   /--------------\
```

### 7.2 测试覆盖目标

| 类型 | 覆盖率目标 |
|-----|-----------|
| 单元测试 | ≥ 80% |
| 组件测试 | ≥ 70% |
| E2E测试 | 关键流程 100% |

### 7.3 关键测试场景

1. **笔记 CRUD 操作**
2. **自动保存功能**
3. **搜索过滤功能**
4. **数据导入导出**
5. **主题切换**
6. **离线可用性**

---

## 8. 部署方案

### 8.1 静态部署

由于是纯前端应用，可部署到任意静态托管服务：

| 平台 | 特点 |
|-----|------|
| Vercel | 自动CI/CD、边缘缓存 |
| Netlify | 简单配置、表单处理 |
| GitHub Pages | 免费、适合开源项目 |
| Cloudflare Pages | 全球CDN、速度快 |

### 8.2 构建命令

```bash
npm run build
```

输出目录：`dist/`

---

## 9. 开发里程碑

| 阶段 | 功能 | 预计工期 |
|-----|------|---------|
| MVP | 基础笔记管理、编辑预览、本地存储 | 2周 |
| V1.1 | 语法高亮、工具栏、主题切换 | 1周 |
| V1.2 | 导入导出、快捷键、布局调整 | 1周 |
| V1.3 | 标签、分类、云同步 | 2周 |
