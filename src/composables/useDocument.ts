/**
 * 文档组合式函数
 * 
 * 提供文档相关的响应式功能
 */

import { ref, computed } from 'vue'
import type { Document } from '@/types'
import { fileService } from '@/services/file.service'
import { storageService } from '@/services/storage.service'
import { STORAGE_KEYS } from '@/constants'

/**
 * 文档组合式函数
 */
export function useDocument() {
  const currentDocument = ref<Document | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 创建新文档
   */
  const createDocument = (): Document => {
    const now = new Date()
    const newDoc: Document = {
      id: fileService.generateId('doc'),
      title: '未命名文档',
      content: '',
      createdAt: now,
      updatedAt: now,
      isDirty: false,
      lastModified: now,
      isModified: false
    }
    
    currentDocument.value = newDoc
    return newDoc
  }

  /**
   * 加载文档
   */
  const loadDocument = async (id: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const document = await fileService.loadDocument(id)
      
      if (document) {
        currentDocument.value = document
        
        // 保存当前编辑状态
        const editingDocument = {
          id: document.id,
          title: document.title,
          filePath: document.filePath,
          createdAt: document.createdAt,
          updatedAt: new Date(),
          isDirty: false,
          lastModified: document.lastModified || new Date(),
          isModified: false
        }
        
        storageService.localStorage.set(STORAGE_KEYS.CURRENT_EDITING_DOCUMENT, editingDocument)
        storageService.localStorage.set(STORAGE_KEYS.CURRENT_EDITING_CONTENT, document.content || '')
      } else {
        throw new Error('文档不存在')
      }
    } catch (err: any) {
      error.value = err.message || '加载文档失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存文档
   */
  const saveDocument = async (document?: Document): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const doc = document || currentDocument.value
      if (!doc) {
        throw new Error('没有可保存的文档')
      }
      
      await fileService.saveDocument(doc)
      
      if (currentDocument.value?.id === doc.id) {
        currentDocument.value.lastModified = new Date()
        currentDocument.value.isModified = false
      }
    } catch (err: any) {
      error.value = err.message || '保存文档失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新文档
   */
  const updateDocument = (updates: Partial<Document>): void => {
    if (currentDocument.value) {
      currentDocument.value = {
        ...currentDocument.value,
        ...updates,
        lastModified: new Date(),
        isModified: true
      }
    }
  }

  /**
   * 删除文档
   */
  const deleteDocument = async (id: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      await fileService.deleteDocument(id)
      
      if (currentDocument.value?.id === id) {
        currentDocument.value = null
      }
    } catch (err: any) {
      error.value = err.message || '删除文档失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取所有文档
   */
  const listDocuments = async (): Promise<Document[]> => {
    try {
      return await fileService.listDocuments()
    } catch (err: any) {
      error.value = err.message || '获取文档列表失败'
      return []
    }
  }

  /**
   * 是否有未保存的更改
   */
  const hasUnsavedChanges = computed(() => {
    return currentDocument.value?.isModified ?? false
  })

  return {
    // 状态
    currentDocument: computed(() => currentDocument.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    hasUnsavedChanges,
    
    // 方法
    createDocument,
    loadDocument,
    saveDocument,
    updateDocument,
    deleteDocument,
    listDocuments
  }
}
