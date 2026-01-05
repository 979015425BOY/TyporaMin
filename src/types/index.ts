/**
 * 全局类型定义
 * 
 * 集中管理所有 TypeScript 类型定义
 */

/**
 * 应用设置接口
 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  fontFamily: string
  lineHeight: number
  autoSave: boolean
  autoSaveInterval: number
  showLineNumbers: boolean
  wordWrap: boolean
  tabSize: number
  language: 'zh-CN' | 'en-US'
}

/**
 * 文档接口
 */
export interface Document {
  id: string
  title: string
  content: string
  filePath?: string
  createdAt: Date
  updatedAt: Date
  isDirty: boolean
  lastModified?: Date
  isModified?: boolean
  workspaceId?: string
}

/**
 * 工作区接口
 */
export interface Workspace {
  id: string
  name: string
  path: string
  description?: string
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  folderStructure: FileTreeNode[]
  settings?: Partial<AppSettings>
}

/**
 * 文件历史记录接口
 */
export interface FileHistoryItem {
  id: string
  title: string
  filePath: string
  lastAccessed: Date
  workspaceId?: string
}

/**
 * 文件树节点接口
 */
export interface FileTreeNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  size?: number
  lastModified?: Date
  children?: FileTreeNode[]
  isExpanded?: boolean
  parentId?: string
  workspaceId?: string
}

/**
 * 文件夹状态接口
 */
export interface FolderState {
  currentPath: string | null
  treeData: FileTreeNode[]
  selectedFileId: string | null
  expandedFolders: Set<string>
}

/**
 * 文件操作接口
 */
export interface FileOperations {
  save: (document: Document) => Promise<void>
  load: (id: string) => Promise<Document | null>
  delete: (id: string) => Promise<void>
  list: () => Promise<Document[]>
  export: (document: Document, format: 'md' | 'html' | 'txt') => Promise<void>
  import: (file: File) => Promise<Document>
}

/**
 * API 响应基础接口
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationParams & { total: number }
}
