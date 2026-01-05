/**
 * 文件系统组合式函数
 * 
 * 提供文件系统相关的响应式功能
 */

import { ref, computed } from 'vue'
import type { FileTreeNode } from '@/types'
import { 
  selectLocalFolder, 
  saveFolderHandle, 
  getFolderHandle, 
  deleteFolderHandle,
  readFolderStructure,
  readFileContent,
  writeFileContent,
  isFileSystemAccessSupported
} from '@/utils/localFileSystem'
import { INDEXED_DB_STORES } from '@/constants'
import { storageService } from '@/services/storage.service'

/**
 * 文件系统组合式函数
 */
export function useFileSystem(workspaceId?: string) {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const folderHandle = ref<FileSystemDirectoryHandle | null>(null)

  /**
   * 选择本地文件夹
   */
  const selectFolder = async (): Promise<FileSystemDirectoryHandle | null> => {
    try {
      isLoading.value = true
      error.value = null
      
      if (!isFileSystemAccessSupported()) {
        throw new Error('当前浏览器不支持 File System Access API')
      }
      
      const handle = await selectLocalFolder()
      folderHandle.value = handle
      
      if (workspaceId) {
        await saveFolderHandle(workspaceId, handle)
      }
      
      return handle
    } catch (err: any) {
      error.value = err.message || '选择文件夹失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载文件夹句柄
   */
  const loadFolderHandle = async (id: string): Promise<FileSystemDirectoryHandle | null> => {
    try {
      isLoading.value = true
      error.value = null
      
      const handle = await getFolderHandle(id)
      folderHandle.value = handle
      
      return handle
    } catch (err: any) {
      error.value = err.message || '加载文件夹句柄失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 读取文件夹结构
   */
  const loadFolderStructure = async (handle?: FileSystemDirectoryHandle): Promise<FileTreeNode[]> => {
    try {
      isLoading.value = true
      error.value = null
      
      const targetHandle = handle || folderHandle.value
      if (!targetHandle) {
        throw new Error('文件夹句柄不存在')
      }
      
      return await readFolderStructure(targetHandle)
    } catch (err: any) {
      error.value = err.message || '读取文件夹结构失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 读取文件内容
   */
  const loadFileContent = async (filePath: string, handle?: FileSystemDirectoryHandle): Promise<string> => {
    try {
      isLoading.value = true
      error.value = null
      
      const targetHandle = handle || folderHandle.value
      if (!targetHandle) {
        throw new Error('文件夹句柄不存在')
      }
      
      return await readFileContent(targetHandle, filePath)
    } catch (err: any) {
      error.value = err.message || '读取文件内容失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存文件内容
   */
  const saveFileContent = async (filePath: string, content: string, handle?: FileSystemDirectoryHandle): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const targetHandle = handle || folderHandle.value
      if (!targetHandle) {
        throw new Error('文件夹句柄不存在')
      }
      
      await writeFileContent(targetHandle, filePath, content)
    } catch (err: any) {
      error.value = err.message || '保存文件内容失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除文件夹句柄
   */
  const removeFolderHandle = async (id: string): Promise<void> => {
    try {
      await deleteFolderHandle(id)
      folderHandle.value = null
    } catch (err: any) {
      error.value = err.message || '删除文件夹句柄失败'
      throw err
    }
  }

  /**
   * 检查是否支持文件系统访问
   */
  const isSupported = computed(() => isFileSystemAccessSupported())

  return {
    // 状态
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    folderHandle: computed(() => folderHandle.value),
    isSupported,
    
    // 方法
    selectFolder,
    loadFolderHandle,
    loadFolderStructure,
    loadFileContent,
    saveFileContent,
    removeFolderHandle
  }
}
