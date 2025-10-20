/**
 * 文件管理工具模块
 * 提供本地存储、文件上传下载等文件操作功能
 */

import type { Document, FileHistoryItem } from '@/stores/app'

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
  CURRENT_EDITING_CONTENT: 'typora-min-current-editing-content'
} as const

/**
 * 支持的文件类型
 */
export const SUPPORTED_FILE_TYPES = {
  MARKDOWN: '.md',
  TEXT: '.txt',
  HTML: '.html'
} as const

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
 * 本地存储文件管理器
 */
export class LocalFileManager implements FileOperations {
  /**
   * 保存文档到本地存储
   */
  async save(document: Document): Promise<void> {
    try {
      const documents = await this.list()
      const existingIndex = documents.findIndex(doc => doc.id === document.id)
      
      if (existingIndex >= 0) {
        documents[existingIndex] = { ...document, updatedAt: new Date() }
      } else {
        documents.push({ ...document, createdAt: new Date(), updatedAt: new Date() })
      }
      
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
      
      // 更新最近文件列表
      await this.updateRecentFiles(document)
    } catch (error) {
      console.error('保存文档失败:', error)
      throw new Error('保存文档失败')
    }
  }

  /**
   * 从本地存储加载文档
   */
  async load(id: string): Promise<Document | null> {
    try {
      const documents = await this.list()
      const document = documents.find(doc => doc.id === id)
      
      if (document) {
        // 更新最近访问时间
        await this.updateRecentFiles(document)
      }
      
      return document || null
    } catch (error) {
      console.error('加载文档失败:', error)
      return null
    }
  }

  /**
   * 删除文档
   */
  async delete(id: string): Promise<void> {
    try {
      const documents = await this.list()
      const filteredDocuments = documents.filter(doc => doc.id !== id)
      
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filteredDocuments))
      
      // 从最近文件中移除
      const recentFiles = this.getRecentFiles()
      const filteredRecentFiles = recentFiles.filter(file => file.id !== id)
      localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(filteredRecentFiles))
    } catch (error) {
      console.error('删除文档失败:', error)
      throw new Error('删除文档失败')
    }
  }

  /**
   * 获取所有文档列表
   */
  async list(): Promise<Document[]> {
    try {
      const documentsJson = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
      return documentsJson ? JSON.parse(documentsJson) : []
    } catch (error) {
      console.error('获取文档列表失败:', error)
      return []
    }
  }

  /**
   * 导出文档
   */
  async export(document: Document, format: 'md' | 'html' | 'txt'): Promise<void> {
    try {
      let content = document.content
      let mimeType = 'text/plain'
      let extension = '.txt'

      switch (format) {
        case 'md':
          mimeType = 'text/markdown'
          extension = '.md'
          break
        case 'html':
          // 这里可以集成markdown转html的功能
          content = this.convertMarkdownToHtml(content)
          mimeType = 'text/html'
          extension = '.html'
          break
        case 'txt':
          // 移除markdown语法，保留纯文本
          content = this.stripMarkdown(content)
          break
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      
      const link = globalThis.document.createElement('a')
      link.href = url
      link.download = `${document.title || '未命名文档'}${extension}`
      globalThis.document.body.appendChild(link)
      link.click()
      globalThis.document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出文档失败:', error)
      throw new Error('导出文档失败')
    }
  }

  /**
   * 导入文档
   */
  async import(file: File): Promise<Document> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const document: Document = {
            id: this.generateId(),
            title: this.extractTitleFromFilename(file.name),
            content,
            filePath: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDirty: false
          }
          
          resolve(document)
        } catch (error) {
          reject(new Error('文件读取失败'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      
      reader.readAsText(file, 'UTF-8')
    })
  }

  /**
   * 更新最近文件列表
   */
  private async updateRecentFiles(document: Document): Promise<void> {
    const recentFiles = this.getRecentFiles()
    const fileItem: FileHistoryItem = {
      id: document.id,
      title: document.title,
      filePath: document.filePath || document.title, // 在Web环境中，使用title作为路径标识
      lastAccessed: new Date()
    }

    // 移除已存在的记录
    const filteredFiles = recentFiles.filter(file => file.id !== document.id)
    
    // 添加到开头
    filteredFiles.unshift(fileItem)
    
    // 限制最近文件数量
    const limitedFiles = filteredFiles.slice(0, 10)
    
    localStorage.setItem(STORAGE_KEYS.RECENT_FILES, JSON.stringify(limitedFiles))
  }

  /**
   * 获取最近文件列表
   */
  private getRecentFiles(): FileHistoryItem[] {
    try {
      const recentFilesJson = localStorage.getItem(STORAGE_KEYS.RECENT_FILES)
      return recentFilesJson ? JSON.parse(recentFilesJson) : []
    } catch (error) {
      console.error('获取最近文件失败:', error)
      return []
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 从文件名提取标题
   */
  private extractTitleFromFilename(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '') || '未命名文档'
  }

  /**
   * 简单的Markdown转HTML转换
   */
  private convertMarkdownToHtml(markdown: string): string {
    // 这里是一个简单的转换，实际项目中可以使用marked库
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>')
  }

  /**
   * 移除Markdown语法，保留纯文本
   */
  private stripMarkdown(markdown: string): string {
    return markdown
      .replace(/^#+\s/gm, '') // 移除标题标记
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
      .replace(/`(.*?)`/g, '$1') // 移除代码标记
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 移除图片，保留alt文本
  }
}

/**
 * 文件上传处理器
 */
export class FileUploadHandler {
  private fileManager: LocalFileManager

  constructor() {
    this.fileManager = new LocalFileManager()
  }

  /**
   * 处理文件拖拽上传
   */
  async handleFileDrop(event: DragEvent): Promise<Document[]> {
    event.preventDefault()
    
    const files = Array.from(event.dataTransfer?.files || [])
    const supportedFiles = files.filter(file => this.isSupportedFile(file))
    
    if (supportedFiles.length === 0) {
      throw new Error('不支持的文件类型')
    }

    const documents: Document[] = []
    
    for (const file of supportedFiles) {
      try {
        const document = await this.fileManager.import(file)
        await this.fileManager.save(document)
        documents.push(document)
      } catch (error) {
        console.error(`导入文件 ${file.name} 失败:`, error)
      }
    }

    return documents
  }

  /**
   * 处理文件选择上传
   */
  async handleFileSelect(files: FileList): Promise<Document[]> {
    const fileArray = Array.from(files)
    const supportedFiles = fileArray.filter(file => this.isSupportedFile(file))
    
    if (supportedFiles.length === 0) {
      throw new Error('不支持的文件类型')
    }

    const documents: Document[] = []
    
    for (const file of supportedFiles) {
      try {
        const document = await this.fileManager.import(file)
        await this.fileManager.save(document)
        documents.push(document)
      } catch (error) {
        console.error(`导入文件 ${file.name} 失败:`, error)
      }
    }

    return documents
  }

  /**
   * 处理文件夹导入（通过webkitdirectory属性）
   */
  async handleFolderImport(): Promise<Document[]> {
    return new Promise((resolve, reject) => {
      const input = globalThis.document.createElement('input')
      input.type = 'file'
      input.webkitdirectory = true
      input.multiple = true
      
      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files
        if (!files || files.length === 0) {
          reject(new Error('未选择文件夹'))
          return
        }

        try {
          const documents = await this.handleFileSelect(files)
          resolve(documents)
        } catch (error) {
          reject(error)
        }
      }

      input.oncancel = () => {
        reject(new Error('用户取消选择'))
      }

      input.click()
    })
  }

  /**
   * 检查是否为支持的文件类型
   */
  private isSupportedFile(file: File): boolean {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return Object.values(SUPPORTED_FILE_TYPES).includes(extension as any)
  }
}

/**
 * 默认文件管理器实例
 */
export const fileManager = new LocalFileManager()

/**
 * 默认文件上传处理器实例
 */
export const fileUploadHandler = new FileUploadHandler()