/**
 * 应用配置文件
 * 
 * 管理应用的各种配置项
 */

import { DEFAULT_SETTINGS, ROUTE_PATHS } from '@/constants'

/**
 * 应用配置
 */
export const appConfig = {
  name: 'TyporaMin',
  version: '0.1.0',
  description: '一个简洁优雅的 Markdown 编辑器',
  author: 'TyporaMin Team',
  
  // API 配置
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000
  },
  
  // 路由配置
  router: {
    mode: 'history' as const,
    base: '/',
    routes: ROUTE_PATHS
  },
  
  // 编辑器配置
  editor: {
    defaultSettings: DEFAULT_SETTINGS,
    minFontSize: 10,
    maxFontSize: 24,
    minLineHeight: 1.0,
    maxLineHeight: 3.0
  },
  
  // 文件系统配置
  fileSystem: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedExtensions: ['.md', '.markdown', '.txt', '.html'],
    autoSaveInterval: 30000 // 30秒
  },
  
  // UI 配置
  ui: {
    sidebarWidth: 280,
    minSidebarWidth: 200,
    maxSidebarWidth: 400,
    headerHeight: 64
  }
} as const

/**
 * 开发环境配置
 */
export const devConfig = {
  enableDevTools: import.meta.env.DEV,
  enableLogger: import.meta.env.DEV,
  logLevel: 'debug' as const
} as const

/**
 * 生产环境配置
 */
export const prodConfig = {
  enableDevTools: false,
  enableLogger: false,
  logLevel: 'error' as const
} as const

/**
 * 根据环境获取配置
 */
export const getConfig = () => {
  return import.meta.env.PROD ? prodConfig : devConfig
}
