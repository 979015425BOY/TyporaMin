/**
 * 应用全局状态管理 Store
 * 
 * 功能：
 * - 管理应用全局设置
 * - 处理主题切换
 * - 管理当前文档状态
 * - 处理最近文件列表
 * 
 * 依赖：
 * - Pinia
 * - 本地存储API
 * 
 * 使用场景：
 * - 全局状态共享
 * - 设置持久化
 * - 主题管理
 */

/**
 * 应用状态管理模块
 * 
 * 功能：管理应用设置、文档状态、工作区和文件夹结构
 * 依赖：Vue 3 Composition API、Pinia状态管理
 * 使用场景：全局状态管理，文档编辑、文件夹导入、工作区管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useThemeStore } from './theme'
import type {
  AppSettings,
  Document,
  Workspace,
  FileHistoryItem,
  FileTreeNode,
} from '@/types'
import { DEFAULT_SETTINGS } from '@/constants'

// 默认设置
const defaultSettings: AppSettings = DEFAULT_SETTINGS

export const useAppStore = defineStore('app', () => {
  // 状态
  const settings = ref<AppSettings>({ ...defaultSettings })
  const currentDocument = ref<Document | null>(null)
  const recentFiles = ref<FileHistoryItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 工作区状态
  const workspaces = ref<Workspace[]>([])
  const currentWorkspace = ref<Workspace | null>(null)
  
  // 文件夹状态
  const currentFolderPath = ref<string | null>(null)
  const fileTreeData = ref<FileTreeNode[]>([])
  const selectedFileId = ref<string | null>(null)
  const expandedFolders = ref<Set<string>>(new Set())

  // 计算属性
  const isDarkMode = computed(() => {
    if (settings.value.theme === 'dark') return true
    if (settings.value.theme === 'light') return false
    // auto模式：检测系统主题
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const hasUnsavedChanges = computed(() => {
    return currentDocument.value?.isModified ?? false
  })

  // 方法

  /**
   * 初始化应用
   * 
   * 功能：
   * - 加载本地设置
   * - 恢复最近文件列表
   * - 应用主题设置
   */
  const initializeApp = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // 初始化主题系统
      const themeStore = useThemeStore()
      await themeStore.loadConfig()
      
      // 加载设置
      await loadSettings()
      
      // 加载工作区
      await loadWorkspaces()
      
      // 加载最近文件
      await loadRecentFiles()
      
      // 恢复当前编辑文档状态
      await loadCurrentEditingDocument()
      
      console.log('应用初始化完成')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '应用初始化失败'
      console.error('应用初始化失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载设置
   */
  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('typoraMin_settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        settings.value = { ...defaultSettings, ...parsed }
      }
    } catch (err) {
      console.warn('加载设置失败，使用默认设置', err)
    }
  }

  /**
   * 保存设置
   */
  const saveSettings = async () => {
    try {
      localStorage.setItem('typoraMin_settings', JSON.stringify(settings.value))
    } catch (err) {
      error.value = '保存设置失败'
      throw err
    }
  }

  /**
   * 更新设置
   * 
   * @param newSettings 新设置
   */
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    await saveSettings()
    
    // 如果主题发生变化，重新应用
    if (newSettings.theme) {
      applyTheme()
    }
  }

  /**
   * 应用主题
   */
  const applyTheme = () => {
    const html = document.documentElement
    
    if (isDarkMode.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  /**
   * 加载最近文件列表
   */
  const loadRecentFiles = async () => {
    try {
      const savedFiles = localStorage.getItem('typoraMin_recentFiles')
      if (savedFiles) {
        const parsed = JSON.parse(savedFiles)
        recentFiles.value = parsed.map((item: any) => ({
          ...item,
          lastAccessed: new Date(item.lastAccessed || item.lastOpened)
        }))
      }
    } catch (err) {
      console.warn('加载最近文件失败', err)
    }
  }

  /**
   * 保存最近文件列表
   */
  const saveRecentFiles = async () => {
    try {
      localStorage.setItem('typoraMin_recentFiles', JSON.stringify(recentFiles.value))
    } catch (err) {
      console.warn('保存最近文件失败', err)
    }
  }

  /**
   * 添加到最近文件
   * 
   * @param file 文件信息
   */
  const addToRecentFiles = async (file: Omit<FileHistoryItem, 'lastAccessed'>) => {
    const existingIndex = recentFiles.value.findIndex(item => item.filePath === file.filePath)
    
    const fileItem: FileHistoryItem = {
      ...file,
      lastAccessed: new Date()
    }
    
    if (existingIndex >= 0) {
      // 更新现有记录
      recentFiles.value.splice(existingIndex, 1)
    }
    
    // 添加到开头
    recentFiles.value.unshift(fileItem)
    
    // 限制最大数量
    if (recentFiles.value.length > 10) {
      recentFiles.value = recentFiles.value.slice(0, 10)
    }
    
    await saveRecentFiles()
  }

  /**
   * 创建新文档
   */
  const createNewDocument = () => {
    const now = new Date()
    const newDoc: Document = {
      id: `doc_${Date.now()}`,
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
    isLoading.value = true
    error.value = null
    
    try {
      // 首先尝试从本地文件系统加载
      if (currentWorkspace.value) {
        try {
          const { getFolderHandle, readFileContent } = await import('@/utils/localFileSystem')
          const folderHandle = await getFolderHandle(currentWorkspace.value.id)
          
          if (folderHandle) {
            // 查找文件节点
            const fileNode = findNodeById(id)
            if (fileNode && fileNode.type === 'file') {
              // fileNode.path 是相对于工作区根目录的路径
              // 从本地文件系统读取文件内容
              const content = await readFileContent(folderHandle, fileNode.path)
              
              const document: Document = {
                id: fileNode.id,
                title: fileNode.name,
                content,
                filePath: fileNode.path, // 相对于工作区根目录的路径
                createdAt: fileNode.lastModified || new Date(),
                updatedAt: new Date(),
                isDirty: false,
                lastModified: fileNode.lastModified || new Date(),
                isModified: false,
                workspaceId: currentWorkspace.value.id
              }
              
              currentDocument.value = document
              
              // 保存当前编辑状态
              const { STORAGE_KEYS } = await import('@/utils/fileManager')
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
              
              localStorage.setItem(STORAGE_KEYS.CURRENT_EDITING_DOCUMENT, JSON.stringify(editingDocument))
              localStorage.setItem(STORAGE_KEYS.CURRENT_EDITING_CONTENT, document.content || '')
              
              await addToRecentFiles({
                id: document.id,
                title: document.title,
                filePath: document.filePath || document.title,
                workspaceId: currentWorkspace.value.id
              })
              
              return
            }
          }
        } catch (err) {
          console.warn('从本地文件系统加载失败，尝试从本地存储加载:', err)
        }
      }
      
      // 如果本地文件系统加载失败，尝试从本地存储加载
      const { fileManager, STORAGE_KEYS } = await import('@/utils/fileManager')
      const document = await fileManager.load(id)
      
      if (document) {
        currentDocument.value = document
        
        // 立即保存当前编辑状态到 localStorage，确保刷新后能恢复
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
        
        localStorage.setItem(STORAGE_KEYS.CURRENT_EDITING_DOCUMENT, JSON.stringify(editingDocument))
        localStorage.setItem(STORAGE_KEYS.CURRENT_EDITING_CONTENT, document.content || '')
        
        await addToRecentFiles({
          id: document.id,
          title: document.title,
          filePath: document.filePath || document.title
        })
      } else {
        throw new Error('文档不存在')
      }
    } catch (err) {
      error.value = '加载文档失败'
      console.error('加载文档失败:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新当前文档
   * 
   * @param updates 更新内容
   */
  const updateCurrentDocument = (updates: Partial<Document>) => {
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
   * 保存当前文档
   */
  const saveCurrentDocument = async (): Promise<void> => {
    if (!currentDocument.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      // 如果当前工作区有本地文件夹句柄，保存到本地文件系统
      if (currentWorkspace.value && currentDocument.value.filePath) {
        try {
          const { getFolderHandle, writeFileContent } = await import('@/utils/localFileSystem')
          const folderHandle = await getFolderHandle(currentWorkspace.value.id)
          
          if (folderHandle) {
            // currentDocument.value.filePath 是相对于工作区根目录的路径
            // 保存到本地文件系统（直接保存到原文件）
            await writeFileContent(folderHandle, currentDocument.value.filePath, currentDocument.value.content)
            
            // 更新文件节点的最后修改时间
            const fileNode = findNodeById(currentDocument.value.id)
            if (fileNode) {
              fileNode.lastModified = new Date()
            }
            
            currentDocument.value.lastModified = new Date()
            currentDocument.value.isModified = false
            
            console.log('文档已保存到本地文件系统:', currentDocument.value.filePath)
            return
          }
        } catch (err) {
          console.warn('保存到本地文件系统失败，尝试保存到本地存储:', err)
        }
      }
      
      // 如果本地文件系统保存失败，保存到本地存储
      const { fileManager } = await import('@/utils/fileManager')
      await fileManager.save(currentDocument.value)
      
      currentDocument.value.lastModified = new Date()
      currentDocument.value.isModified = false
      
      console.log('文档已保存到本地存储:', currentDocument.value)
    } catch (err) {
      error.value = '保存文档失败'
      console.error('保存文档失败:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 标记文档为已保存
   */
  const markDocumentAsSaved = () => {
    if (currentDocument.value) {
      currentDocument.value.isModified = false
    }
  }

  /**
   * 清除错误状态
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 加载文件夹结构
   * 
   * @param files 文件列表
   */
  const loadFolderStructure = async (files: FileList): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      // 导入 fileManager
      const { fileManager } = await import('@/utils/fileManager')
      
      const fileTree: FileTreeNode[] = []
      const pathMap = new Map<string, FileTreeNode>()
      const fileContentMap = new Map<string, File>()
      
      // 处理所有文件
      Array.from(files).forEach((file) => {
        const pathParts = file.webkitRelativePath.split('/')
        const fileName = pathParts[pathParts.length - 1]
        const filePath = file.webkitRelativePath
        
        // 只处理支持的文件类型
        const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
        const supportedExtensions = ['.md', '.txt', '.html']
        
        if (supportedExtensions.includes(fileExtension)) {
          // 创建文件节点
          const fileNode: FileTreeNode = {
            id: `file_${Date.now()}_${Math.random()}`,
            name: fileName,
            type: 'file',
            path: filePath,
            size: file.size,
            lastModified: new Date(file.lastModified)
          }
          
          pathMap.set(filePath, fileNode)
          fileContentMap.set(fileNode.id, file)
        }
        
        // 创建父文件夹节点
        let currentPath = ''
        for (let i = 0; i < pathParts.length - 1; i++) {
          const folderName = pathParts[i]
          const parentPath = currentPath
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName
          
          if (!pathMap.has(currentPath)) {
            const folderNode: FileTreeNode = {
              id: `folder_${Date.now()}_${Math.random()}`,
              name: folderName,
              type: 'folder',
              path: currentPath,
              children: [],
              isExpanded: i === 0, // 根文件夹默认展开
              parentId: parentPath ? pathMap.get(parentPath)?.id : undefined
            }
            pathMap.set(currentPath, folderNode)
          }
        }
      })
      
      // 读取文件内容并保存到文档存储
      const fileReadPromises: Promise<void>[] = []
      
      fileContentMap.forEach((file, fileId) => {
        const promise = new Promise<void>((resolve, reject) => {
          const reader = new FileReader()
          
          reader.onload = async (e) => {
            try {
              const content = e.target?.result as string
              const fileNode = Array.from(pathMap.values()).find(node => node.id === fileId)
              
              if (fileNode) {
                // 创建文档对象
                const document: Document = {
                  id: fileId,
                  title: fileNode.name,
                  content: content || '',
                  filePath: fileNode.path,
                  createdAt: fileNode.lastModified || new Date(),
                  updatedAt: new Date(),
                  isDirty: false,
                  lastModified: fileNode.lastModified || new Date(),
                  isModified: false
                }
                
                // 保存到文档存储
                await fileManager.save(document)
                console.log(`文件内容已保存: ${fileNode.name}`)
              }
              resolve()
            } catch (error) {
              console.error(`保存文件失败: ${file.name}`, error)
              reject(error)
            }
          }
          
          reader.onerror = () => {
            console.error(`读取文件失败: ${file.name}`)
            reject(new Error(`读取文件失败: ${file.name}`))
          }
          
          reader.readAsText(file, 'UTF-8')
        })
        
        fileReadPromises.push(promise)
      })
      
      // 等待所有文件读取完成
      await Promise.all(fileReadPromises)
      
      // 构建树形结构
      pathMap.forEach((node, path) => {
        if (node.type === 'file') {
          // 找到文件的父文件夹
          const pathParts = path.split('/')
          if (pathParts.length > 1) {
            const parentPath = pathParts.slice(0, -1).join('/')
            const parentNode = pathMap.get(parentPath)
            if (parentNode && parentNode.children) {
              parentNode.children.push(node)
              node.parentId = parentNode.id
            }
          }
        } else if (node.type === 'folder') {
          // 找到文件夹的父文件夹
          const pathParts = path.split('/')
          if (pathParts.length > 1) {
            const parentPath = pathParts.slice(0, -1).join('/')
            const parentNode = pathMap.get(parentPath)
            if (parentNode && parentNode.children) {
              parentNode.children.push(node)
              node.parentId = parentNode.id
            }
          } else {
            // 根文件夹
            fileTree.push(node)
          }
        }
      })
      
      // 排序：文件夹在前，文件在后，按名称排序
      const sortNodes = (nodes: FileTreeNode[]) => {
        nodes.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
        
        nodes.forEach(node => {
          if (node.children) {
            sortNodes(node.children)
          }
        })
      }
      
      sortNodes(fileTree)
      
      fileTreeData.value = fileTree
      currentFolderPath.value = fileTree.length > 0 ? fileTree[0].path : null
      
      console.log('文件夹结构加载完成:', fileTree)
      console.log(`成功导入 ${pathMap.size} 个节点`)
    } catch (err) {
      error.value = '加载文件夹结构失败'
      console.error('加载文件夹结构失败:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 切换文件夹展开状态
   * 
   * @param folderId 文件夹ID
   */
  const toggleFolderExpanded = (folderId: string) => {
    const toggleNodeExpanded = (nodes: FileTreeNode[]): boolean => {
      for (const node of nodes) {
        if (node.id === folderId) {
          node.isExpanded = !node.isExpanded
          if (node.isExpanded) {
            expandedFolders.value.add(folderId)
          } else {
            expandedFolders.value.delete(folderId)
          }
          return true
        }
        if (node.children && toggleNodeExpanded(node.children)) {
          return true
        }
      }
      return false
    }
    
    toggleNodeExpanded(fileTreeData.value)
  }

  /**
   * 选择文件
   * 
   * @param fileId 文件ID
   */
  const selectFile = (fileId: string) => {
    selectedFileId.value = fileId
  }

  /**
   * 根据ID查找文件树节点
   * 
   * @param nodeId 节点ID
   * @returns 找到的节点
   */
  const findNodeById = (nodeId: string): FileTreeNode | null => {
    const searchNodes = (nodes: FileTreeNode[]): FileTreeNode | null => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          return node
        }
        if (node.children) {
          const found = searchNodes(node.children)
          if (found) return found
        }
      }
      return null
    }
    
    return searchNodes(fileTreeData.value)
  }

  /**
   * 清空文件树数据
   */
  const clearFileTree = () => {
    fileTreeData.value = []
    currentFolderPath.value = null
    selectedFileId.value = null
    expandedFolders.value.clear()
  }

  /**
   * 创建新文件
   * 
   * @param fileName 文件名
   * @param parentId 父文件夹ID
   */
  const createFile = async (fileName: string, parentId = ''): Promise<void> => {
    try {
      // 构建文件路径（相对于工作区根目录）
      const filePath = parentId ? `${findNodeById(parentId)?.path}/${fileName}` : fileName
      
      // 如果当前工作区有本地文件夹句柄，在本地文件系统中创建真实文件
      if (currentWorkspace.value) {
        try {
          const { getFolderHandle, writeFileContent } = await import('@/utils/localFileSystem')
          const folderHandle = await getFolderHandle(currentWorkspace.value.id)
          
          if (folderHandle) {
            // 在本地文件系统中创建文件（写入空内容）
            await writeFileContent(folderHandle, filePath, '')
            console.log('本地文件系统文件创建成功:', filePath)
          }
        } catch (err) {
          console.warn('在本地文件系统创建文件失败，仅创建节点:', err)
          // 继续创建节点，即使本地文件系统创建失败
        }
      }
      
      const newFile: FileTreeNode = {
        id: `file_${Date.now()}_${Math.random()}`,
        name: fileName,
        type: 'file',
        path: filePath,
        size: 0,
        lastModified: new Date(),
        parentId: parentId || undefined
      }

      if (parentId) {
        // 添加到指定父文件夹
        const parentNode = findNodeById(parentId)
        if (parentNode && parentNode.children) {
          parentNode.children.push(newFile)
          // 排序
          parentNode.children.sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === 'folder' ? -1 : 1
            }
            return a.name.localeCompare(b.name)
          })
        }
      } else {
        // 添加到根目录
        fileTreeData.value.push(newFile)
        // 排序
        fileTreeData.value.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
      }

      console.log('文件创建成功:', newFile)
    } catch (err) {
      error.value = '创建文件失败'
      console.error('创建文件失败:', err)
      throw err
    }
  }

  /**
   * 创建新文件夹
   * 
   * @param folderName 文件夹名
   * @param parentId 父文件夹ID
   */
  const createFolder = async (folderName: string, parentId = ''): Promise<void> => {
    try {
      // 构建文件夹路径（相对于工作区根目录）
      const folderPath = parentId ? `${findNodeById(parentId)?.path}/${folderName}` : folderName
      
      // 如果当前工作区有本地文件夹句柄，在本地文件系统中创建真实文件夹
      if (currentWorkspace.value) {
        try {
          const { getFolderHandle } = await import('@/utils/localFileSystem')
          const folderHandle = await getFolderHandle(currentWorkspace.value.id)
          
          if (folderHandle) {
            // 在本地文件系统中创建文件夹
            const pathParts = folderPath.split('/').filter(part => part.length > 0)
            let currentHandle: FileSystemDirectoryHandle = folderHandle
            
            // 导航到父文件夹
            for (let i = 0; i < pathParts.length - 1; i++) {
              currentHandle = await currentHandle.getDirectoryHandle(pathParts[i])
            }
            
            // 创建新文件夹
            await currentHandle.getDirectoryHandle(pathParts[pathParts.length - 1], { create: true })
            console.log('本地文件系统文件夹创建成功:', folderPath)
          }
        } catch (err) {
          console.warn('在本地文件系统创建文件夹失败，仅创建节点:', err)
          // 继续创建节点，即使本地文件系统创建失败
        }
      }
      
      const newFolder: FileTreeNode = {
        id: `folder_${Date.now()}_${Math.random()}`,
        name: folderName,
        type: 'folder',
        path: folderPath,
        children: [],
        isExpanded: false,
        parentId: parentId || undefined
      }

      if (parentId) {
        // 添加到指定父文件夹
        const parentNode = findNodeById(parentId)
        if (parentNode && parentNode.children) {
          parentNode.children.push(newFolder)
          // 排序
          parentNode.children.sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === 'folder' ? -1 : 1
            }
            return a.name.localeCompare(b.name)
          })
        }
      } else {
        // 添加到根目录
        fileTreeData.value.push(newFolder)
        // 排序
        fileTreeData.value.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
      }

      console.log('文件夹创建成功:', newFolder)
    } catch (err) {
      error.value = '创建文件夹失败'
      console.error('创建文件夹失败:', err)
      throw err
    }
  }

  /**
   * 重命名文件
   * 
   * @param fileId 文件ID
   * @param newName 新名称
   */
  const renameFile = async (fileId: string, newName: string): Promise<void> => {
    try {
      const fileNode = findNodeById(fileId)
      if (!fileNode) {
        throw new Error('文件不存在')
      }
      
      const oldName = fileNode.name
      fileNode.name = newName
      
      // 更新路径
      const pathParts = fileNode.path.split('/')
      pathParts[pathParts.length - 1] = newName
      fileNode.path = pathParts.join('/')
      
      console.log(`文件重命名成功: ${oldName} -> ${newName}`)
    } catch (err) {
      error.value = '重命名文件失败'
      console.error('重命名文件失败:', err)
      throw err
    }
  }

  /**
   * 重命名文件夹
   * 
   * @param folderId 文件夹ID
   * @param newName 新名称
   */
  const renameFolder = async (folderId: string, newName: string): Promise<void> => {
    try {
      const folderNode = findNodeById(folderId)
      if (!folderNode) {
        throw new Error('文件夹不存在')
      }
      
      const oldName = folderNode.name
      folderNode.name = newName
      
      // 更新路径
      const pathParts = folderNode.path.split('/')
      pathParts[pathParts.length - 1] = newName
      const newPath = pathParts.join('/')
      
      // 递归更新子节点路径
      const updateChildrenPaths = (node: FileTreeNode, oldBasePath: string, newBasePath: string) => {
        if (node.children) {
          node.children.forEach(child => {
            child.path = child.path.replace(oldBasePath, newBasePath)
            if (child.type === 'folder') {
              updateChildrenPaths(child, oldBasePath, newBasePath)
            }
          })
        }
      }
      
      updateChildrenPaths(folderNode, folderNode.path, newPath)
      folderNode.path = newPath
      
      console.log(`文件夹重命名成功: ${oldName} -> ${newName}`)
    } catch (err) {
      error.value = '重命名文件夹失败'
      console.error('重命名文件夹失败:', err)
      throw err
    }
  }

  /**
   * 删除文件
   * 
   * @param fileId 文件ID
   */
  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      // 先查找文件节点，获取文件路径
      const fileNode = findNodeById(fileId)
      if (!fileNode || fileNode.type !== 'file') {
        throw new Error('文件不存在')
      }
      
      // 如果当前工作区有本地文件夹句柄，先删除本地文件系统中的真实文件
      if (currentWorkspace.value && fileNode.path) {
        try {
          const { getFolderHandle, deleteFile: deleteLocalFile } = await import('@/utils/localFileSystem')
          const folderHandle = await getFolderHandle(currentWorkspace.value.id)
          
          if (folderHandle) {
            // 删除本地文件系统中的真实文件
            await deleteLocalFile(folderHandle, fileNode.path)
            console.log('本地文件系统文件删除成功:', fileNode.path)
          }
        } catch (err) {
          console.warn('删除本地文件系统文件失败，继续删除节点:', err)
          // 继续删除节点，即使本地文件系统删除失败
        }
      }
      
      // 从文件树中移除节点
      const removeFromNodes = (nodes: FileTreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === fileId) {
            nodes.splice(i, 1)
            return true
          }
          if (nodes[i].children && removeFromNodes(nodes[i].children!)) {
            return true
          }
        }
        return false
      }

      if (removeFromNodes(fileTreeData.value)) {
        // 如果删除的是当前选中的文件，清除选中状态
        if (selectedFileId.value === fileId) {
          selectedFileId.value = null
        }
        // 如果删除的是当前编辑的文档，清除当前文档
        if (currentDocument.value?.id === fileId) {
          currentDocument.value = null
        }
        console.log('文件删除成功:', fileId)
      } else {
        throw new Error('文件不存在')
      }
    } catch (err) {
      error.value = '删除文件失败'
      console.error('删除文件失败:', err)
      throw err
    }
  }

  /**
   * 删除文件夹
   * 
   * @param folderId 文件夹ID
   */
  const deleteFolder = async (folderId: string): Promise<void> => {
    try {
      // 先查找文件夹节点，获取文件夹路径
      const folderNode = findNodeById(folderId)
      if (!folderNode || folderNode.type !== 'folder') {
        throw new Error('文件夹不存在')
      }
      
      // 如果当前工作区有本地文件夹句柄，先删除本地文件系统中的真实文件夹
      if (currentWorkspace.value && folderNode.path) {
        try {
          const { getFolderHandle, deleteFolder: deleteLocalFolder } = await import('@/utils/localFileSystem')
          const folderHandle = await getFolderHandle(currentWorkspace.value.id)
          
          if (folderHandle) {
            // 删除本地文件系统中的真实文件夹（递归删除所有内容）
            await deleteLocalFolder(folderHandle, folderNode.path)
            console.log('本地文件系统文件夹删除成功:', folderNode.path)
          }
        } catch (err) {
          console.warn('删除本地文件系统文件夹失败，继续删除节点:', err)
          // 继续删除节点，即使本地文件系统删除失败
        }
      }
      
      // 从文件树中移除节点
      const removeFromNodes = (nodes: FileTreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === folderId) {
            nodes.splice(i, 1)
            return true
          }
          if (nodes[i].children && removeFromNodes(nodes[i].children!)) {
            return true
          }
        }
        return false
      }

      if (removeFromNodes(fileTreeData.value)) {
        // 清除相关的展开状态
        expandedFolders.value.delete(folderId)
        console.log('文件夹删除成功:', folderId)
      } else {
        throw new Error('文件夹不存在')
      }
    } catch (err) {
      error.value = '删除文件夹失败'
      console.error('删除文件夹失败:', err)
      throw err
    }
  }

  /**
   * 刷新文件树
   */
  const refreshFileTree = async (): Promise<void> => {
    try {
      if (!currentWorkspace.value) {
        throw new Error('没有当前工作区')
      }
      
      // 尝试从本地文件系统重新加载
      try {
        const { getFolderHandle, readFolderStructure } = await import('@/utils/localFileSystem')
        const folderHandle = await getFolderHandle(currentWorkspace.value.id)
        
        if (folderHandle) {
          // 从本地文件系统读取最新的文件夹结构
          const folderStructure = await readFolderStructure(folderHandle)
          fileTreeData.value = folderStructure
          currentWorkspace.value.folderStructure = folderStructure
          currentWorkspace.value.updatedAt = new Date()
          await saveWorkspaces()
          console.log('文件树刷新成功（从本地文件系统）')
          return
        }
      } catch (err) {
        console.warn('从本地文件系统刷新失败:', err)
      }
      
      // 如果本地文件系统刷新失败，只是清空展开状态
      expandedFolders.value.clear()
      console.log('文件树刷新成功（仅清空展开状态）')
    } catch (err) {
      error.value = '刷新文件树失败'
      console.error('刷新文件树失败:', err)
      throw err
    }
  }

  /**
   * 加载当前编辑文档状态
   */
  const loadCurrentEditingDocument = async (): Promise<void> => {
    try {
      const { STORAGE_KEYS } = await import('@/utils/fileManager')
      const savedDocument = localStorage.getItem(STORAGE_KEYS.CURRENT_EDITING_DOCUMENT)
      const savedContent = localStorage.getItem(STORAGE_KEYS.CURRENT_EDITING_CONTENT)
      
      // 优先恢复保存的编辑状态
      if (savedDocument && savedContent) {
        const parsedDocument = JSON.parse(savedDocument)
        
        // 恢复文档对象，确保日期字段正确转换
        const restoredDocument: Document = {
          ...parsedDocument,
          content: savedContent,
          createdAt: new Date(parsedDocument.createdAt),
          updatedAt: new Date(parsedDocument.updatedAt),
          lastModified: parsedDocument.lastModified ? new Date(parsedDocument.lastModified) : new Date()
        }
        
        // 设置当前文档
        currentDocument.value = restoredDocument
        
        // 同步文件树选中状态
        if (restoredDocument.id) {
          selectedFileId.value = restoredDocument.id
        }
        
        console.log('成功恢复编辑文档状态:', restoredDocument.title)
        return
      }
      
      // 如果没有编辑状态，但有文件树数据，尝试恢复最后选中的文件
      if (fileTreeData.value.length > 0) {
        // 查找文件树中的第一个文件作为默认选择
        const findFirstFile = (items: FileTreeNode[]): FileTreeNode | null => {
          for (const item of items) {
            if (item.type === 'file') {
              return item
            }
            if (item.children) {
              const found = findFirstFile(item.children)
              if (found) return found
            }
          }
          return null
        }
        
        const firstFile = findFirstFile(fileTreeData.value)
        if (firstFile) {
          await loadDocument(firstFile.id)
          console.log('恢复到文件树中的第一个文件:', firstFile.name)
          return
        }
      }
      
      // 如果都没有，不自动创建新文档，让用户主动选择
      console.log('没有可恢复的文档状态，等待用户操作')
    } catch (err) {
      console.warn('恢复编辑文档状态失败:', err)
    }
  }

  /**
   * 清除当前编辑文档状态
   */
  const clearCurrentEditingDocument = (): void => {
    try {
      const { STORAGE_KEYS } = require('@/utils/fileManager')
      localStorage.removeItem(STORAGE_KEYS.CURRENT_EDITING_DOCUMENT)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_EDITING_CONTENT)
      console.log('已清除编辑文档状态')
    } catch (err) {
      console.warn('清除编辑文档状态失败:', err)
    }
  }

  /**
   * 创建新工作区
   * 
   * @param name 工作区名称
   * @param path 工作区路径
   * @param description 工作区描述
   */
  const createWorkspace = async (name: string, path: string, description?: string): Promise<Workspace> => {
    try {
      const now = new Date()
      const newWorkspace: Workspace = {
        id: `workspace_${Date.now()}_${Math.random()}`,
        name,
        path,
        description,
        createdAt: now,
        updatedAt: now,
        isActive: false,
        folderStructure: []
      }

      workspaces.value.push(newWorkspace)
      await saveWorkspaces()
      
      console.log('工作区创建成功:', newWorkspace)
      return newWorkspace
    } catch (err) {
      error.value = '创建工作区失败'
      console.error('创建工作区失败:', err)
      throw err
    }
  }

  /**
   * 从本地文件夹创建新工作区
   * 
   * @param description 工作区描述
   * @returns 工作区对象
   */
  const createWorkspaceFromLocalFolder = async (description?: string): Promise<Workspace> => {
    try {
      const { selectLocalFolder, saveFolderHandle, readFolderStructure, getFolderName } = await import('@/utils/localFileSystem')
      
      // 选择本地文件夹
      console.log('开始选择本地文件夹...')
      const folderHandle = await selectLocalFolder()
      console.log('文件夹选择成功，句柄:', folderHandle)
      
      const folderName = getFolderName(folderHandle)
      console.log('文件夹名称:', folderName)
      
      // 读取文件夹结构
      console.log('开始读取文件夹结构...')
      const folderStructure = await readFolderStructure(folderHandle)
      console.log('文件夹结构读取成功，节点数:', folderStructure.length)
      
      // 创建工作区
      const now = new Date()
      const newWorkspace: Workspace = {
        id: `workspace_${Date.now()}_${Math.random()}`,
        name: folderName,
        path: folderName,
        description,
        createdAt: now,
        updatedAt: now,
        isActive: false,
        folderStructure
      }
      
      // 保存文件夹句柄
      console.log('开始保存文件夹句柄...')
      await saveFolderHandle(newWorkspace.id, folderHandle)
      console.log('文件夹句柄保存成功')
      
      workspaces.value.push(newWorkspace)
      await saveWorkspaces()
      
      console.log('从本地文件夹创建工作区成功:', newWorkspace)
      return newWorkspace
    } catch (err: any) {
      console.log('createWorkspaceFromLocalFolder 捕获到错误:', {
        name: err.name,
        message: err.message,
        isUserCancel: err.isUserCancel,
        stack: err.stack,
        err: err
      })
      
      // 只有明确标记为 isUserCancel 的错误才认为是取消操作
      if (err.isUserCancel === true) {
        console.log('确认为用户取消操作，直接抛出')
        throw err
      }
      
      error.value = '从本地文件夹创建工作区失败'
      console.error('从本地文件夹创建工作区失败:', err)
      throw err
    }
  }

  /**
   * 切换到指定工作区
   * 
   * @param workspaceId 工作区ID
   */
  const switchWorkspace = async (workspaceId: string): Promise<void> => {
    try {
      const workspace = workspaces.value.find(w => w.id === workspaceId)
      if (!workspace) {
        throw new Error('工作区不存在')
      }

      // 取消当前活跃工作区
      if (currentWorkspace.value) {
        currentWorkspace.value.isActive = false
      }

      // 设置新的活跃工作区
      workspace.isActive = true
      currentWorkspace.value = workspace

      // 尝试从本地文件系统加载文件夹结构
      try {
        const { getFolderHandle, readFolderStructure } = await import('@/utils/localFileSystem')
        const folderHandle = await getFolderHandle(workspaceId)
        
        if (folderHandle) {
          // 从本地文件系统读取最新的文件夹结构
          const folderStructure = await readFolderStructure(folderHandle)
          fileTreeData.value = folderStructure
          workspace.folderStructure = folderStructure
          workspace.updatedAt = new Date()
          await saveWorkspaces()
        } else {
          // 如果没有文件夹句柄，使用保存的文件夹结构
          fileTreeData.value = workspace.folderStructure
        }
      } catch (err) {
        console.warn('从本地文件系统加载失败，使用保存的文件夹结构:', err)
        // 如果加载失败，使用保存的文件夹结构
        fileTreeData.value = workspace.folderStructure
      }
      
      currentFolderPath.value = workspace.path

      // 应用工作区特定设置
      if (workspace.settings) {
        await updateSettings(workspace.settings)
      }

      await saveWorkspaces()
      console.log('切换到工作区:', workspace.name)
    } catch (err) {
      error.value = '切换工作区失败'
      console.error('切换工作区失败:', err)
      throw err
    }
  }

  /**
   * 删除工作区
   * 
   * @param workspaceId 工作区ID
   */
  const deleteWorkspace = async (workspaceId: string): Promise<void> => {
    try {
      const index = workspaces.value.findIndex(w => w.id === workspaceId)
      if (index === -1) {
        throw new Error('工作区不存在')
      }

      const workspace = workspaces.value[index]
      
      // 删除文件夹句柄
      try {
        const { deleteFolderHandle } = await import('@/utils/localFileSystem')
        await deleteFolderHandle(workspaceId)
      } catch (err) {
        console.warn('删除文件夹句柄失败:', err)
      }
      
      // 如果删除的是当前工作区，需要切换到其他工作区或清空
      if (currentWorkspace.value?.id === workspaceId) {
        const remainingWorkspaces = workspaces.value.filter(w => w.id !== workspaceId)
        if (remainingWorkspaces.length > 0) {
          await switchWorkspace(remainingWorkspaces[0].id)
        } else {
          currentWorkspace.value = null
          clearFileTree()
        }
      }

      workspaces.value.splice(index, 1)
      await saveWorkspaces()
      
      console.log('工作区删除成功:', workspace.name)
    } catch (err) {
      error.value = '删除工作区失败'
      console.error('删除工作区失败:', err)
      throw err
    }
  }

  /**
   * 更新工作区信息
   * 
   * @param workspaceId 工作区ID
   * @param updates 更新内容
   */
  const updateWorkspace = async (workspaceId: string, updates: Partial<Workspace>): Promise<void> => {
    try {
      const workspace = workspaces.value.find(w => w.id === workspaceId)
      if (!workspace) {
        throw new Error('工作区不存在')
      }

      Object.assign(workspace, updates, { updatedAt: new Date() })
      
      // 如果更新的是当前工作区，同步更新当前工作区引用
      if (currentWorkspace.value?.id === workspaceId) {
        currentWorkspace.value = workspace
      }

      await saveWorkspaces()
      console.log('工作区更新成功:', workspace.name)
    } catch (err) {
      error.value = '更新工作区失败'
      console.error('更新工作区失败:', err)
      throw err
    }
  }

  /**
   * 保存工作区列表到本地存储
   */
  const saveWorkspaces = async (): Promise<void> => {
    try {
      localStorage.setItem('typoraMin_workspaces', JSON.stringify(workspaces.value))
    } catch (err) {
      console.warn('保存工作区失败', err)
    }
  }

  /**
   * 从本地存储加载工作区列表
   */
  const loadWorkspaces = async (): Promise<void> => {
    try {
      const savedWorkspaces = localStorage.getItem('typoraMin_workspaces')
      if (savedWorkspaces) {
        const parsed = JSON.parse(savedWorkspaces)
        workspaces.value = parsed.map((workspace: any) => ({
          ...workspace,
          createdAt: new Date(workspace.createdAt),
          updatedAt: new Date(workspace.updatedAt)
        }))

        // 恢复当前活跃工作区
        const activeWorkspace = workspaces.value.find(w => w.isActive)
        if (activeWorkspace) {
          currentWorkspace.value = activeWorkspace
          fileTreeData.value = activeWorkspace.folderStructure
          currentFolderPath.value = activeWorkspace.path
        }
      }
    } catch (err) {
      console.warn('加载工作区失败', err)
    }
  }

  /**
   * 将文件夹导入到当前工作区
   * 
   * @param files 文件列表
   */
  const importFolderToWorkspace = async (files: FileList): Promise<void> => {
    if (!currentWorkspace.value) {
      // 如果没有当前工作区，创建一个默认工作区
      const folderName = files[0]?.webkitRelativePath.split('/')[0] || '未命名工作区'
      const newWorkspace = await createWorkspace(folderName, folderName)
      await switchWorkspace(newWorkspace.id)
    }

    // 加载文件夹结构
    await loadFolderStructure(files)

    // 更新当前工作区的文件夹结构
    if (currentWorkspace.value) {
      currentWorkspace.value.folderStructure = fileTreeData.value
      currentWorkspace.value.updatedAt = new Date()
      await saveWorkspaces()
    }
  }

  return {
    // 状态
    settings,
    currentDocument,
    recentFiles,
    isLoading,
    error,
    
    // 工作区状态
    workspaces,
    currentWorkspace,
    
    // 文件夹状态
    currentFolderPath,
    fileTreeData,
    selectedFileId,
    expandedFolders,
    
    // 计算属性
    isDarkMode,
    hasUnsavedChanges,
    
    // 方法
    initializeApp,
    loadSettings,
    saveSettings,
    updateSettings,
    applyTheme,
    loadRecentFiles,
    saveRecentFiles,
    addToRecentFiles,
    createNewDocument,
    loadDocument,
    updateCurrentDocument,
    saveCurrentDocument,
    markDocumentAsSaved,
    clearError,
    
    // 工作区方法
    createWorkspace,
    createWorkspaceFromLocalFolder,
    switchWorkspace,
    deleteWorkspace,
    updateWorkspace,
    saveWorkspaces,
    loadWorkspaces,
    importFolderToWorkspace,
    
    // 文件夹方法
    loadFolderStructure,
    toggleFolderExpanded,
    selectFile,
    findNodeById,
    clearFileTree,
    
    // CRUD操作
    createFile,
    createFolder,
    renameFile,
    renameFolder,
    deleteFile,
    deleteFolder,
    refreshFileTree,
    
    // 编辑状态管理
    loadCurrentEditingDocument,
    clearCurrentEditingDocument
  }
})