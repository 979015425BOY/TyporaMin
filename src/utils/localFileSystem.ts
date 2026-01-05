/**
 * 本地文件系统管理器
 * 
 * 使用 File System Access API 实现真正的本地文件夹映射
 * 功能：
 * - 选择本地文件夹并保存句柄
 * - 读取文件夹中的文件和子文件夹
 * - 支持文件内容的读取和写入
 * - 保存文件夹句柄到 IndexedDB
 */

import type { FileTreeNode } from '@/types'
import { INDEXED_DB_STORES } from '@/constants'
import { storageService } from '@/services/storage.service'

/**
 * 检查浏览器是否支持 File System Access API
 */
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window
}

/**
 * 选择本地文件夹
 * 
 * @returns 文件夹句柄
 */
export async function selectLocalFolder(): Promise<FileSystemDirectoryHandle> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('当前浏览器不支持 File System Access API，请使用 Chrome 86+ 或 Edge 86+')
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite' // 需要读写权限以便后续保存文件
    })
    
    // 验证句柄是否有效
    if (!handle || !handle.name) {
      throw new Error('获取文件夹句柄失败')
    }
    
    return handle
  } catch (error: any) {
    // 用户主动取消选择
    if (error.name === 'AbortError' || error.code === 20) {
      const cancelError = new Error('用户取消了文件夹选择')
      ;(cancelError as any).isUserCancel = true
      throw cancelError
    }
    
    // 权限被拒绝
    if (error.name === 'SecurityError' || error.name === 'NotAllowedError') {
      throw new Error('权限被拒绝，请允许访问文件夹')
    }
    
    // 其他错误
    console.error('选择文件夹时发生错误:', error)
    throw new Error(`选择文件夹失败: ${error.message || error.name || '未知错误'}`)
  }
}

/**
 * 保存文件夹句柄到 IndexedDB
 * 
 * @param workspaceId 工作区ID
 * @param handle 文件夹句柄
 */
export async function saveFolderHandle(
  workspaceId: string,
  handle: FileSystemDirectoryHandle
): Promise<void> {
  try {
    await storageService.indexedDB.save(INDEXED_DB_STORES.HANDLES, workspaceId, handle)
  } catch (error) {
    console.error('保存文件夹句柄失败:', error)
    throw new Error('保存文件夹句柄失败')
  }
}

/**
 * 从 IndexedDB 获取文件夹句柄
 * 
 * @param workspaceId 工作区ID
 * @returns 文件夹句柄
 */
export async function getFolderHandle(
  workspaceId: string
): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await storageService.indexedDB.get<FileSystemDirectoryHandle>(
      INDEXED_DB_STORES.HANDLES,
      workspaceId
    )
  } catch (error) {
    console.error('获取文件夹句柄失败:', error)
    return null
  }
}

/**
 * 删除文件夹句柄
 * 
 * @param workspaceId 工作区ID
 */
export async function deleteFolderHandle(workspaceId: string): Promise<void> {
  try {
    await storageService.indexedDB.delete(INDEXED_DB_STORES.HANDLES, workspaceId)
  } catch (error) {
    console.error('删除文件夹句柄失败:', error)
  }
}

/**
 * 从文件夹句柄读取文件树结构
 * 
 * @param handle 文件夹句柄
 * @param basePath 基础路径（用于构建相对路径）
 * @returns 文件树节点数组
 */
export async function readFolderStructure(
  handle: FileSystemDirectoryHandle,
  basePath: string = ''
): Promise<FileTreeNode[]> {
  const nodes: FileTreeNode[] = []
  
  try {
    // 遍历文件夹中的所有条目
    // File System Access API 的 entries 方法返回异步迭代器
    const directoryHandle = handle as any
    for await (const [name, entry] of directoryHandle.entries()) {
      const currentPath = basePath ? `${basePath}/${name}` : name
      
      if (entry.kind === 'directory') {
        // 文件夹
        const folderNode: FileTreeNode = {
          id: `folder_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
          name,
          type: 'folder',
          path: currentPath,
          children: [],
          isExpanded: false
        }
        
        // 递归读取子文件夹
        try {
          folderNode.children = await readFolderStructure(entry, currentPath)
        } catch (error) {
          console.warn(`读取子文件夹失败: ${currentPath}`, error)
          folderNode.children = []
        }
        
        nodes.push(folderNode)
      } else if (entry.kind === 'file') {
        // 文件 - 只处理 .md 文件
        if (name.toLowerCase().endsWith('.md') || name.toLowerCase().endsWith('.markdown')) {
          try {
            const file = await entry.getFile()
            const fileNode: FileTreeNode = {
              id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
              name,
              type: 'file',
              path: currentPath,
              size: file.size,
              lastModified: new Date(file.lastModified)
            }
            
            nodes.push(fileNode)
          } catch (error) {
            console.warn(`读取文件失败: ${currentPath}`, error)
          }
        }
      }
    }
    
    // 排序：文件夹在前，文件在后，按名称排序
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
    
    // 对子文件夹也进行排序
    nodes.forEach(node => {
      if (node.type === 'folder' && node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
      }
    })
    
  } catch (error) {
    console.error('读取文件夹结构失败:', error)
    throw error
  }
  
  return nodes
}

/**
 * 从文件夹句柄读取文件内容
 * 
 * @param handle 文件夹句柄
 * @param filePath 文件相对路径（例如：folder/subfolder/file.md）
 * @returns 文件内容
 */
export async function readFileContent(
  handle: FileSystemDirectoryHandle,
  filePath: string
): Promise<string> {
  try {
    const pathParts = filePath.split('/')
    let currentHandle: FileSystemHandle = handle
    
    // 导航到文件所在的文件夹
    for (let i = 0; i < pathParts.length - 1; i++) {
      const dirHandle = await (currentHandle as FileSystemDirectoryHandle).getDirectoryHandle(pathParts[i])
      currentHandle = dirHandle
    }
    
    // 获取文件
    const fileName = pathParts[pathParts.length - 1]
    const fileHandle = await (currentHandle as FileSystemDirectoryHandle).getFileHandle(fileName)
    const file = await fileHandle.getFile()
    
    // 读取文件内容
    return await file.text()
  } catch (error) {
    console.error(`读取文件内容失败: ${filePath}`, error)
    throw new Error(`读取文件内容失败: ${filePath}`)
  }
}

/**
 * 写入文件内容到本地文件系统
 * 
 * @param handle 文件夹句柄
 * @param filePath 文件相对路径
 * @param content 文件内容
 */
export async function writeFileContent(
  handle: FileSystemDirectoryHandle,
  filePath: string,
  content: string
): Promise<void> {
  try {
    const pathParts = filePath.split('/')
    let currentHandle: FileSystemHandle = handle
    
    // 导航到文件所在的文件夹，如果文件夹不存在则创建
    for (let i = 0; i < pathParts.length - 1; i++) {
      try {
        const dirHandle = await (currentHandle as FileSystemDirectoryHandle).getDirectoryHandle(pathParts[i])
        currentHandle = dirHandle
      } catch (error: any) {
        if (error.name === 'NotFoundError') {
          // 文件夹不存在，创建它
          const dirHandle = await (currentHandle as FileSystemDirectoryHandle).getDirectoryHandle(pathParts[i], { create: true })
          currentHandle = dirHandle
        } else {
          throw error
        }
      }
    }
    
    // 获取或创建文件
    const fileName = pathParts[pathParts.length - 1]
    const fileHandle = await (currentHandle as FileSystemDirectoryHandle).getFileHandle(fileName, { create: true })
    
    // 创建可写流并写入内容
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  } catch (error) {
    console.error(`写入文件内容失败: ${filePath}`, error)
    throw new Error(`写入文件内容失败: ${filePath}`)
  }
}

/**
 * 获取文件夹名称
 * 
 * @param handle 文件夹句柄
 * @returns 文件夹名称
 */
export function getFolderName(handle: FileSystemDirectoryHandle): string {
  return handle.name
}
