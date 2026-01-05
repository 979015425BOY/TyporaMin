/**
 * 全局常量定义
 * 
 * 集中管理应用中的所有常量
 */

/**
 * 本地存储键名常量
 */
export const STORAGE_KEYS = {
  DOCUMENTS: 'typora-min-documents',
  SETTINGS: 'typora-min-settings',
  RECENT_FILES: 'typora-min-recent-files',
  CURRENT_DOCUMENT: 'typora-min-current-document',
  FILE_TREE: 'typora-min-file-tree',
  CURRENT_EDITING_DOCUMENT: 'typora-min-current-editing-document',
  CURRENT_EDITING_CONTENT: 'typora-min-current-editing-content',
  WORKSPACES: 'typoraMin_workspaces',
  THEME_CONFIG: 'typoraMin_themeConfig'
} as const

/**
 * 支持的文件类型
 */
export const SUPPORTED_FILE_TYPES = {
  MARKDOWN: '.md',
  MARKDOWN_ALT: '.markdown',
  TEXT: '.txt',
  HTML: '.html'
} as const

/**
 * 支持的文件扩展名数组
 */
export const SUPPORTED_EXTENSIONS = [
  SUPPORTED_FILE_TYPES.MARKDOWN,
  SUPPORTED_FILE_TYPES.MARKDOWN_ALT,
  SUPPORTED_FILE_TYPES.TEXT,
  SUPPORTED_FILE_TYPES.HTML
] as const

/**
 * 文件类型 MIME 映射
 */
export const FILE_MIME_TYPES = {
  [SUPPORTED_FILE_TYPES.MARKDOWN]: 'text/markdown',
  [SUPPORTED_FILE_TYPES.MARKDOWN_ALT]: 'text/markdown',
  [SUPPORTED_FILE_TYPES.TEXT]: 'text/plain',
  [SUPPORTED_FILE_TYPES.HTML]: 'text/html'
} as const

/**
 * 默认应用设置
 */
export const DEFAULT_SETTINGS = {
  theme: 'auto' as const,
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
  lineHeight: 1.6,
  autoSave: true,
  autoSaveInterval: 30000, // 30秒
  showLineNumbers: true,
  wordWrap: true,
  tabSize: 2,
  language: 'zh-CN' as const
} as const

/**
 * 路由路径常量
 */
export const ROUTE_PATHS = {
  HOME: '/',
  EDITOR: '/editor',
  SETTINGS: '/settings',
  ABOUT: '/about',
  NOT_FOUND: '/404'
} as const

/**
 * 主题常量
 */
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const

/**
 * 语言常量
 */
export const LANGUAGE = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US'
} as const

/**
 * 文件操作常量
 */
export const FILE_OPERATIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import'
} as const

/**
 * 导出格式常量
 */
export const EXPORT_FORMATS = {
  MARKDOWN: 'md',
  HTML: 'html',
  TEXT: 'txt'
} as const

/**
 * 分页默认值
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const

/**
 * 最近文件最大数量
 */
export const MAX_RECENT_FILES = 10

/**
 * IndexedDB 数据库名称
 */
export const INDEXED_DB_NAME = 'TyporaMinFileSystem'

/**
 * IndexedDB 版本
 */
export const INDEXED_DB_VERSION = 1

/**
 * IndexedDB 对象存储名称
 */
export const INDEXED_DB_STORES = {
  HANDLES: 'handles'
} as const
