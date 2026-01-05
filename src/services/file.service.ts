/**
 * 文件服务
 * 
 * 封装文件相关操作
 */

import type { Document } from '@/types'
import { storageService } from './storage.service'
import { STORAGE_KEYS, SUPPORTED_EXTENSIONS } from '@/constants'

/**
 * 文件服务类
 */
export class FileService {
  /**
   * 保存文档
   */
  static async saveDocument(document: Document): Promise<void> {
    try {
      const documents = await this.listDocuments()
      const existingIndex = documents.findIndex(doc => doc.id === document.id)
      
      if (existingIndex >= 0) {
        documents[existingIndex] = { ...document, updatedAt: new Date() }
      } else {
        documents.push({ ...document, createdAt: new Date(), updatedAt: new Date() })
      }
      
      storageService.localStorage.set(STORAGE_KEYS.DOCUMENTS, documents)
    } catch (error) {
      console.error('保存文档失败:', error)
      throw new Error('保存文档失败')
    }
  }

  /**
   * 加载文档
   */
  static async loadDocument(id: string): Promise<Document | null> {
    try {
      const documents = await this.listDocuments()
      return documents.find(doc => doc.id === id) || null
    } catch (error) {
      console.error('加载文档失败:', error)
      return null
    }
  }

  /**
   * 删除文档
   */
  static async deleteDocument(id: string): Promise<void> {
    try {
      const documents = await this.listDocuments()
      const filteredDocuments = documents.filter(doc => doc.id !== id)
      storageService.localStorage.set(STORAGE_KEYS.DOCUMENTS, filteredDocuments)
    } catch (error) {
      console.error('删除文档失败:', error)
      throw new Error('删除文档失败')
    }
  }

  /**
   * 获取所有文档
   */
  static async listDocuments(): Promise<Document[]> {
    try {
      return storageService.localStorage.get<Document[]>(STORAGE_KEYS.DOCUMENTS) || []
    } catch (error) {
      console.error('获取文档列表失败:', error)
      return []
    }
  }

  /**
   * 检查文件类型是否支持
   */
  static isSupportedFile(file: File): boolean {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return SUPPORTED_EXTENSIONS.includes(extension as any)
  }

  /**
   * 从文件名提取标题
   */
  static extractTitleFromFilename(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '') || '未命名文档'
  }

  /**
   * 生成唯一ID
   */
  static generateId(prefix: string = 'doc'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  }
}

export const fileService = FileService
