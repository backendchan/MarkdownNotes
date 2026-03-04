# AI Agent 开发指南

> 本文件为 AI 助手提供项目开发规范和指导，确保代码质量和一致性。

---

## 1. 项目概述

### 1.1 项目简介

本项目是一个**轻量级、离线优先的 Markdown 笔记应用**，采用纯前端架构，所有数据存储在浏览器本地。

### 1.2 核心特性

- 离线可用：完全支持离线工作模式
- 本地存储：使用 LocalStorage/IndexedDB 存储数据
- 实时预览：左右分栏，编辑与预览同步
- 安全可靠：数据不上传服务器，保护用户隐私

### 1.3 技术栈

| 领域 | 技术 |
|-----|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 状态管理 | Zustand |
| UI 组件 | Ant Design 5.x |
| 样式 | CSS Modules + Tailwind CSS |
| Markdown | markdown-it + Prism.js |
| 编辑器 | CodeMirror 6 |
| 存储 | localForage |
| 测试 | Vitest + Playwright |

---

## 2. 开发规范

### 2.1 目录结构规范

```
src/
├── components/          # 组件目录
│   ├── common/          # 通用UI组件（无业务逻辑）
│   ├── layout/          # 布局组件
│   └── business/        # 业务组件
├── hooks/               # 自定义 Hooks
├── services/            # 服务层（存储、API等）
├── store/               # 状态管理
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
├── constants/           # 常量定义
└── pages/               # 页面组件
```

### 2.2 组件开发规范

#### 组件分类

| 类型 | 目录 | 特点 | 示例 |
|-----|------|------|------|
| 通用组件 | `components/common` | 无业务逻辑、高度可复用 | Button, Modal, Input |
| 布局组件 | `components/layout` | 页面布局相关 | Header, Sidebar, ResizablePanel |
| 业务组件 | `components/business` | 包含业务逻辑 | NoteList, Editor, Preview |

#### 组件结构

每个组件应包含以下文件：

```
ComponentName/
├── index.tsx           # 组件主文件
├── styles.module.css   # 样式文件（CSS Modules）
├── types.ts            # 类型定义（如需要）
└── test.tsx            # 测试文件
```

#### 组件命名

- 组件名使用 PascalCase：`NoteList`, `SearchBar`
- 文件名使用 PascalCase：`NoteList.tsx`
- 样式类名使用 camelCase：`.noteCard`, `.searchInput`
- 常量使用 UPPER_SNAKE_CASE：`MAX_NOTE_COUNT`

### 2.3 TypeScript 规范

#### 类型定义位置

- 组件内部类型：定义在组件文件顶部或 `types.ts`
- 全局共享类型：定义在 `src/types/` 目录
- 服务层类型：定义在对应服务文件或 `types/` 目录

#### 类型命名

```typescript
interface Note { }           // 数据模型
interface NoteProps { }      // 组件 Props
type SortOption = ...        // 联合类型/类型别名
enum ThemeMode { }           // 枚举
```

#### 禁止使用

- 禁止使用 `any` 类型，如必须使用需添加注释说明原因
- 禁止使用 `@ts-ignore`，应修复类型错误

### 2.4 状态管理规范

#### Zustand Store 结构

```typescript
import { create } from 'zustand';

interface NoteStore {
  notes: Note[];
  currentNoteId: string | null;
  
  // Actions
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (id: string | null) => void;
}

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  currentNoteId: null,
  
  addNote: (note) => set((state) => ({
    notes: [note, ...state.notes]
  })),
  
  updateNote: (id, updates) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id ? { ...note, ...updates } : note
    )
  })),
  
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((note) => note.id !== id)
  })),
  
  setCurrentNote: (id) => set({ currentNoteId: id }),
}));
```

#### 状态分类

| Store | 用途 |
|-------|------|
| `noteStore` | 笔记数据和操作 |
| `settingStore` | 应用设置 |
| `uiStore` | UI 状态（侧边栏、模态框等） |

### 2.5 Hooks 规范

#### 命名规范

- Hook 名称以 `use` 开头：`useNotes`, `useAutoSave`
- 返回值使用对象解构：`const { notes, addNote } = useNotes()`

#### 自定义 Hook 示例

```typescript
export const useAutoSave = (
  callback: () => void,
  delay: number = 1000
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(callback, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callback, delay]);
};
```

---

## 3. 代码风格

### 3.1 通用规则

- **缩进**：2 空格
- **引号**：优先使用单引号，JSX 中使用双引号
- **分号**：不强制使用分号
- **行宽**：最大 100 字符
- **尾逗号**：多行时始终添加尾逗号

### 3.2 React 规则

```tsx
// 组件定义：使用函数组件
export const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  // 1. Hooks 放在最前面
  const [isEditing, setIsEditing] = useState(false);
  const noteStore = useNoteStore();
  
  // 2. 派生状态
  const formattedDate = useMemo(() => 
    formatDate(note.updatedAt), 
    [note.updatedAt]
  );
  
  // 3. 事件处理函数
  const handleDelete = useCallback(() => {
    onDelete(note.id);
  }, [note.id, onDelete]);
  
  // 4. 副作用
  useEffect(() => {
    // ...
  }, []);
  
  // 5. 渲染
  return (
    <div className={styles.noteCard}>
      {/* ... */}
    </div>
  );
};
```

### 3.3 CSS 规范

```css
/* 使用 CSS Modules */
.noteCard {
  padding: 16px;
  border-radius: 8px;
}

.noteCard:hover {
  background-color: var(--color-bg-secondary);
}

.noteTitle {
  font-size: 16px;
  font-weight: 600;
}

/* 使用 CSS 变量实现主题 */
:root {
  --color-primary: #3498db;
  --color-bg-primary: #ffffff;
  --color-text-primary: #333333;
}

[data-theme='dark'] {
  --color-bg-primary: #1a1a1a;
  --color-text-primary: #e0e0e0;
}
```

### 3.4 注释规范

```typescript
/**
 * 创建新笔记
 * @param title 笔记标题
 * @returns 新创建的笔记对象
 */
export const createNote = (title: string): Note => {
  return {
    id: generateId(),
    title,
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

// TODO: 后续支持标签功能
// FIXME: 大文件时性能需要优化
// NOTE: 这里使用防抖避免频繁保存
```

---

## 4. 测试要求

### 4.1 测试框架

- 单元测试：Vitest + React Testing Library
- E2E 测试：Playwright

### 4.2 测试覆盖率要求

| 类型 | 最低覆盖率 |
|-----|-----------|
| 单元测试 | 80% |
| 组件测试 | 70% |
| 关键流程 | 100% |

### 4.3 测试文件命名

- 单元测试：`*.test.ts` 或 `*.test.tsx`
- E2E 测试：`*.spec.ts`

### 4.4 测试示例

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NoteCard } from './NoteCard';

describe('NoteCard', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Test content',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('should render note title', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<NoteCard note={mockNote} onDelete={onDelete} />);
    
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
```

### 4.5 关键测试场景

必须编写测试的场景：

1. 笔记 CRUD 操作
2. 自动保存功能
3. 搜索过滤功能
4. 数据导入导出
5. 主题切换
6. Markdown 渲染安全性

---

## 5. 安全注意事项

### 5.1 XSS 防护

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

### 5.2 数据安全

- 所有数据存储在用户本地
- 敏感操作（删除）需要二次确认
- 不记录或上传用户数据

### 5.3 禁止事项

- 禁止使用 `eval()` 或 `new Function()`
- 禁止直接使用 `innerHTML`，必须经过消毒处理
- 禁止在代码中硬编码敏感信息

---

## 6. 性能优化指南

### 6.1 防抖与节流

```typescript
// 防抖：搜索输入、自动保存
import { debounce } from 'lodash-es';

const debouncedSearch = debounce((query: string) => {
  searchNotes(query);
}, 300);

// 节流：滚动事件
import { throttle } from 'lodash-es';

const throttledScroll = throttle(() => {
  syncScrollPosition();
}, 16);
```

### 6.2 虚拟滚动

笔记列表超过 50 条时使用虚拟滚动：

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
```

### 6.3 懒加载

- 代码块语言包按需加载
- 图片使用懒加载
- 大组件使用 `React.lazy` 动态导入

### 6.4 Memo 优化

```typescript
// 避免不必要的重渲染
const NoteCard = React.memo<NoteCardProps>(({ note, onDelete }) => {
  // ...
});

// 缓存计算结果
const sortedNotes = useMemo(() => {
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}, [notes]);

// 缓存回调函数
const handleDelete = useCallback((id: string) => {
  deleteNote(id);
}, [deleteNote]);
```

---

## 7. 数据模型参考

### 7.1 Note 模型

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  isPinned?: boolean;
  isDeleted?: boolean;
  deletedAt?: number;
}
```

### 7.2 Settings 模型

```typescript
interface Settings {
  theme: 'light' | 'dark' | 'system';
  editorFontSize: number;
  editorFontFamily: string;
  previewFontSize: number;
  autoSaveInterval: number;
  defaultSort: 'createdAt' | 'updatedAt' | 'title';
  showLineNumbers: boolean;
  syncScroll: boolean;
  layoutRatio: [number, number, number];
}
```

---

## 8. 常见任务指南

### 8.1 添加新组件

1. 在对应目录创建组件文件夹
2. 创建 `index.tsx` 和 `styles.module.css`
3. 定义 TypeScript 类型
4. 编写单元测试
5. 在 `index.ts` 中导出

### 8.2 添加新功能

1. 在 `types/` 中定义数据模型
2. 在 `store/` 中添加状态管理
3. 在 `services/` 中添加服务函数
4. 在 `hooks/` 中添加自定义 Hook
5. 创建或修改组件
6. 编写测试

### 8.3 修改现有功能

1. 阅读相关代码和测试
2. 确保修改不影响现有功能
3. 更新测试用例
4. 更新文档（如有必要）

---

## 9. Git 提交规范

### 9.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 9.2 Type 类型

| Type | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具相关 |

### 9.3 示例

```
feat(editor): add syntax highlighting for code blocks

- Add Prism.js integration
- Support 10+ programming languages
- Add theme support for code blocks

Closes #123
```

---

## 10. 注意事项清单

### 10.1 开发前必读

- [ ] 阅读 PRD.md 了解产品需求
- [ ] 阅读 TECH_DESIGN.md 了解技术方案
- [ ] 确保本地开发环境配置正确

### 10.2 编码时注意

- [ ] 遵循 TypeScript 类型规范，不使用 any
- [ ] 组件拆分合理，单一职责
- [ ] 状态管理清晰，避免 prop drilling
- [ ] 样式使用 CSS Modules，避免全局污染
- [ ] 用户输入必须经过安全处理

### 10.3 提交前检查

- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 TypeScript 类型检查
- [ ] 单元测试通过
- [ ] 手动测试关键功能

### 10.4 性能检查

- [ ] 避免不必要的重渲染
- [ ] 大列表使用虚拟滚动
- [ ] 图片和资源已优化
- [ ] 首屏加载时间 < 2 秒

---

## 11. 快速参考

### 11.1 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run test         # 运行测试
npm run lint         # 运行 ESLint
npm run typecheck    # 运行类型检查
```

### 11.2 关键文件路径

| 文件 | 用途 |
|-----|------|
| `PRD.md` | 产品需求文档 |
| `TECH_DESIGN.md` | 技术设计文档 |
| `AGENTS.md` | AI 开发指南（本文件） |
| `src/store/` | 状态管理 |
| `src/services/storage.ts` | 存储服务 |
| `src/services/markdown.ts` | Markdown 解析服务 |

### 11.3 重要常量

```typescript
const STORAGE_KEYS = {
  NOTES: 'md-notes:notes',
  SETTINGS: 'md-notes:settings',
  STATE: 'md-notes:state',
  VERSION: 'md-notes:version',
};

const AUTO_SAVE_DELAY = 1000; // ms
const DEBOUNCE_DELAY = 300; // ms
const MAX_NOTE_CONTENT_LENGTH = 100000; // 字符
```

---

## 12. 联系与支持

如有疑问，请参考：
- [React 官方文档](https://react.dev/)
- [Ant Design 文档](https://ant.design/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [CodeMirror 6 文档](https://codemirror.net/)
