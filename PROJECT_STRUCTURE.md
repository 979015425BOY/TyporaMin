# 项目目录结构

## 企业级目录组织

```
src/
├── assets/              # 静态资源文件
│   ├── images/         # 图片资源
│   ├── fonts/          # 字体文件
│   └── icons/          # 图标文件
│
├── components/          # Vue 组件
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   └── business/       # 业务组件
│
├── composables/         # Vue 组合式函数 (Composables)
│   ├── useDocument.ts   # 文档相关组合式函数
│   └── useFileSystem.ts # 文件系统相关组合式函数
│
├── config/              # 配置文件
│   └── index.ts         # 应用配置
│
├── constants/           # 常量定义
│   └── index.ts         # 全局常量
│
├── directives/          # 自定义指令
│
├── layouts/             # 布局组件
│
├── pages/               # 页面组件 (Views)
│   ├── HomePage.vue
│   ├── EditorView.vue
│   ├── SettingsPage.vue
│   └── AboutView.vue
│
├── plugins/             # 插件
│
├── router/               # 路由配置
│   └── index.ts
│
├── services/            # 服务层 (业务逻辑)
│   ├── file.service.ts      # 文件服务
│   └── storage.service.ts   # 存储服务
│
├── stores/              # Pinia 状态管理
│   ├── app.ts           # 应用状态
│   └── theme.ts          # 主题状态
│
├── styles/              # 样式文件
│   ├── main.css         # 主样式
│   ├── variables.css    # CSS 变量
│   └── utilities.css    # 工具类
│
├── types/               # TypeScript 类型定义
│   ├── index.ts         # 全局类型
│   └── fileSystem.d.ts  # 文件系统类型
│
├── utils/               # 工具函数
│   ├── index.ts         # 统一导出
│   ├── fileManager.ts   # 文件管理工具
│   ├── localFileSystem.ts # 本地文件系统工具
│   ├── format.ts        # 格式化工具
│   ├── validator.ts     # 验证工具
│   └── logger.ts        # 日志工具
│
├── App.vue              # 根组件
├── main.ts              # 入口文件
└── vite-env.d.ts        # Vite 环境类型定义
```

## 目录说明

### `/types` - 类型定义
集中管理所有 TypeScript 类型定义，包括：
- 应用核心类型（Document, Workspace, FileTreeNode 等）
- 文件系统类型
- API 响应类型

### `/constants` - 常量定义
集中管理应用中的所有常量：
- 存储键名
- 文件类型
- 路由路径
- 默认配置

### `/config` - 配置文件
应用配置管理：
- 应用基本信息
- API 配置
- 编辑器配置
- 环境相关配置

### `/services` - 服务层
业务逻辑封装：
- **storage.service.ts**: 封装 localStorage 和 IndexedDB 操作
- **file.service.ts**: 文件相关业务逻辑

### `/composables` - 组合式函数
Vue 3 Composition API 的可复用逻辑：
- **useDocument.ts**: 文档管理相关功能
- **useFileSystem.ts**: 文件系统操作相关功能

### `/utils` - 工具函数
通用工具函数：
- **logger.ts**: 日志记录
- **validator.ts**: 数据验证
- **format.ts**: 数据格式化
- **fileManager.ts**: 文件管理
- **localFileSystem.ts**: 本地文件系统

### `/components` - 组件
Vue 组件按功能分类：
- **common/**: 通用组件（按钮、输入框等）
- **layout/**: 布局组件（头部、侧边栏等）
- **business/**: 业务组件（文件树、编辑器等）

### `/stores` - 状态管理
Pinia 状态管理：
- **app.ts**: 应用全局状态
- **theme.ts**: 主题状态

## 最佳实践

### 1. 导入路径
使用 `@/` 别名导入：
```typescript
import { Document } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { fileService } from '@/services/file.service'
```

### 2. 类型定义
所有类型定义集中在 `/types` 目录，通过 `index.ts` 统一导出。

### 3. 常量管理
所有常量集中在 `/constants` 目录，避免魔法字符串。

### 4. 服务层
业务逻辑封装在服务层，组件只负责 UI 展示和用户交互。

### 5. 组合式函数
可复用的逻辑封装为组合式函数，提高代码复用性。

### 6. 工具函数
通用工具函数放在 `/utils`，按功能分类。
