<!--
  编辑器页面组件
  
  功能：
  - 主编辑器界面
  - 文档管理
  - 工具栏和侧边栏
  - 文件操作
  - 文件树管理
  
  使用场景：
  - 主要编辑界面
  - 文档编辑和预览
  - 文件夹管理
-->

<template>
  <div class="editor-view h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- 顶部导航栏 -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- 左侧：返回和文档信息 -->
        <div class="flex items-center space-x-4">
          <el-button 
            circle 
            @click="$router.push('/')"
            :icon="ArrowLeft"
            title="返回首页"
          />
          
          <!-- 文件树切换按钮 -->
          <el-button 
            circle 
            @click="toggleFileTree"
            :icon="showFileTree ? FolderOpened : Folder"
            :title="showFileTree ? '隐藏文件树' : '显示文件树'"
          />
          
          <div class="flex items-center space-x-2">
            <el-icon class="text-gray-500">
              <Document />
            </el-icon>
            <span class="text-lg font-medium text-gray-900 dark:text-white">
              {{ currentDocument?.title || '未命名文档' }}
            </span>
            <el-tag 
              v-if="hasUnsavedChanges" 
              type="warning" 
              size="small"
            >
              未保存
            </el-tag>
          </div>
        </div>
        
        <!-- 右侧：操作按钮 -->
        <div class="flex items-center space-x-2">
          <el-button 
            @click="saveDocument"
            :disabled="!hasUnsavedChanges"
            type="primary"
            :icon="Check"
          >
            保存
          </el-button>
          
          <el-button 
            @click="exportDocument"
            :icon="Download"
          >
            导出
          </el-button>
          
          <el-divider direction="vertical" />
          
          <el-button 
            circle 
            @click="$router.push('/settings')"
            :icon="Setting"
            title="设置"
          />
        </div>
      </div>
    </header>
    
    <!-- 主编辑区域 -->
    <main class="flex-1 flex overflow-hidden">
      <!-- 文件树侧边栏 -->
      <FileTree
        v-if="showFileTree"
        :width="fileTreeWidth"
        @file-select="handleFileSelect"
        @open-folder="handleOpenFolder"
        class="flex-shrink-0"
      />
      
      <!-- 大纲侧边栏 -->
      <aside 
        v-if="showOutline"
        class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0"
      >
        <!-- 侧边栏标题 -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">文档大纲</h3>
            <el-button 
              size="small" 
              text 
              :icon="Close"
              @click="showOutline = false"
              title="关闭大纲"
            />
          </div>
        </div>
        
        <!-- 大纲内容 -->
        <div class="flex-1 overflow-auto p-4">
          <div v-if="outline.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-8">
            <el-icon :size="32" class="mb-2">
              <List />
            </el-icon>
            <p class="text-sm">暂无标题</p>
          </div>
          
          <div v-else class="space-y-1">
            <div 
              v-for="(item, index) in outline" 
              :key="index"
              :class="[
                'cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                `ml-${(item.level - 1) * 4}`
              ]"
              @click="scrollToHeading(item)"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300">
                {{ item.text }}
              </span>
            </div>
          </div>
        </div>
      </aside>
      
      <!-- 编辑器区域 -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- 编辑器工具栏 -->
        <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <el-button 
                size="small" 
                text 
                :icon="List"
                @click="showOutline = !showOutline"
                :title="showOutline ? '隐藏大纲' : '显示大纲'"
              />
              <el-divider direction="vertical" />
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ documentStats }}
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <el-button 
                v-if="!showFileTree && appStore.fileTreeData.length > 0"
                size="small"
                @click="handleOpenFolder"
                :icon="FolderAdd"
              >
                打开文件夹
              </el-button>
            </div>
          </div>
        </div>
        
        <MarkdownEditor 
          v-model="documentContent"
          @change="handleContentChange"
          @save="handleSave"
          ref="editorRef"
          class="flex-1"
        />
      </div>
    </main>
    
    <!-- 导出对话框 -->
    <el-dialog 
      v-model="showExportDialog" 
      title="导出文档" 
      width="400px"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            导出格式
          </label>
          <el-select v-model="exportFormat" class="w-full">
            <el-option label="Markdown (.md)" value="md" />
            <el-option label="HTML (.html)" value="html" />
            <el-option label="纯文本 (.txt)" value="txt" />
          </el-select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            文件名
          </label>
          <el-input 
            v-model="exportFileName" 
            placeholder="请输入文件名"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="showExportDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmExport">导出</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import FileTree from '../components/FileTree.vue'
import { marked } from 'marked'
import { 
  ArrowLeft, 
  Document, 
  Check, 
  Download, 
  Setting, 
  List,
  Folder,
  FolderOpened,
  FolderAdd,
  Close
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { STORAGE_KEYS } from '@/utils/fileManager'

/**
 * 编辑器页面逻辑
 * 
 * 功能：
 * - 文档编辑管理
 * - 大纲生成
 * - 文件导出
 * - 自动保存
 * - 文件树管理
 */

// 大纲项接口
interface OutlineItem {
  level: number
  text: string
  id: string
}

const router = useRouter()
const appStore = useAppStore()
const editorRef = ref<InstanceType<typeof MarkdownEditor>>()

// 状态
const showOutline = ref(true)  // 默认显示文档大纲
const showFileTree = ref(false)
const showExportDialog = ref(false)
const exportFormat = ref('md')
const exportFileName = ref('')
const fileTreeWidth = ref(280)

// 计算属性
const currentDocument = computed(() => appStore.currentDocument)
const hasUnsavedChanges = computed(() => appStore.hasUnsavedChanges)
const settings = computed(() => appStore.settings)

// 文档内容
const documentContent = ref('')

// 文档统计信息
const documentStats = computed(() => {
  const content = documentContent.value
  const wordCount = content.replace(/\s+/g, ' ').trim().split(' ').filter(word => word.length > 0).length
  const charCount = content.length
  const lineCount = content.split('\n').length
  
  return `${wordCount} 词 · ${charCount} 字符 · ${lineCount} 行`
})

// 大纲生成
const outline = computed(() => {
  const headings: OutlineItem[] = []
  const lines = documentContent.value.split('\n')
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)/)
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        id: `heading-${index}`
      })
    }
  })
  
  return headings
})

/**
 * 初始化文档内容
 */
const initializeDocument = () => {
  // 移除重复的恢复逻辑调用，只依赖app.ts中的统一恢复
  if (currentDocument.value) {
    documentContent.value = currentDocument.value.content
    exportFileName.value = currentDocument.value.title
  } else {
    // 如果没有当前文档，不自动创建新文档，让用户主动选择
    documentContent.value = ''
    exportFileName.value = '未命名文档'
  }
}

/**
 * 处理内容变化
 * 
 * @param content 新内容
 */
const handleContentChange = (content: string) => {
  documentContent.value = content
  
  // 实时保存当前编辑状态到localStorage
  saveCurrentEditingState(content)
  
  // 自动保存
  if (settings.value.autoSave) {
    scheduleAutoSave()
  }
}

/**
 * 自动保存定时器
 */
let autoSaveTimer: NodeJS.Timeout | null = null

const scheduleAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  
  autoSaveTimer = setTimeout(() => {
    saveDocument()
  }, settings.value.autoSaveInterval)
}

/**
 * 保存文档
 */
const saveDocument = async () => {
  if (!currentDocument.value) return
  
  try {
    // 更新文档内容
    appStore.updateCurrentDocument({
      content: documentContent.value,
      title: extractTitle(documentContent.value) || currentDocument.value.title
    })
    
    // 保存到原文件（如果是从本地文件系统加载的，会直接保存到原文件）
    await appStore.saveCurrentDocument()
    
    // 保存后清除编辑状态
    clearCurrentEditingState()
    
    ElMessage.success('文档已保存')
  } catch (error) {
    console.error('保存文档失败:', error)
    ElMessage.error('保存文档失败: ' + (error as Error).message)
  }
}

/**
 * 从内容中提取标题
 * 
 * @param content 文档内容
 * @returns 提取的标题
 */
const extractTitle = (content: string): string | null => {
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)/)
    if (match) {
      return match[1].trim()
    }
  }
  return null
}

/**
 * 保存到本地存储
 */
const saveToLocalStorage = () => {
  if (!currentDocument.value) return
  
  try {
    const key = `typoraMin_doc_${currentDocument.value.id}`
    localStorage.setItem(key, JSON.stringify(currentDocument.value))
  } catch (error) {
    console.warn('保存到本地存储失败:', error)
  }
}

/**
 * 保存当前编辑状态到localStorage
 * 
 * @param content 当前编辑内容
 */
const saveCurrentEditingState = (content: string) => {
  try {
    if (currentDocument.value) {
      // 保存当前编辑的文档信息
      const editingDocument = {
        id: currentDocument.value.id,
        title: currentDocument.value.title,
        filePath: currentDocument.value.filePath,
        createdAt: currentDocument.value.createdAt,
        updatedAt: new Date(),
        isDirty: true,
        lastModified: new Date(),
        isModified: true
      }
      
      localStorage.setItem(STORAGE_KEYS.CURRENT_EDITING_DOCUMENT, JSON.stringify(editingDocument))
      localStorage.setItem(STORAGE_KEYS.CURRENT_EDITING_CONTENT, content)
    }
  } catch (error) {
    console.warn('保存当前编辑状态失败:', error)
  }
}



/**
 * 清除当前编辑状态
 */
const clearCurrentEditingState = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_EDITING_DOCUMENT)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_EDITING_CONTENT)
  } catch (error) {
    console.warn('清除编辑状态失败:', error)
  }
}

/**
 * 处理保存事件
 * 
 * @param content 文档内容
 */
const handleSave = async (content: string) => {
  documentContent.value = content
  await saveDocument()
}

/**
 * 导出文档
 */
const exportDocument = () => {
  if (!currentDocument.value) return
  
  exportFileName.value = currentDocument.value.title || '未命名文档'
  showExportDialog.value = true
}

/**
 * 确认导出
 */
const confirmExport = async () => {
  if (!documentContent.value) return
  
  let content = documentContent.value
  let mimeType = 'text/plain'
  let extension = exportFormat.value
  
  // 根据格式处理内容
  switch (exportFormat.value) {
    case 'html':
      content = await marked(documentContent.value)
      mimeType = 'text/html'
      break
    case 'txt':
      // 移除Markdown语法，保留纯文本
      content = documentContent.value
        .replace(/#{1,6}\s+/g, '') // 移除标题标记
        .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
        .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
        .replace(/`(.*?)`/g, '$1') // 移除行内代码标记
        .replace(/^\s*[-*+]\s+/gm, '') // 移除列表标记
        .replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表标记
        .replace(/^>\s+/gm, '') // 移除引用标记
      mimeType = 'text/plain'
      break
    case 'md':
    default:
      mimeType = 'text/markdown'
      break
  }
  
  // 创建下载链接
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = `${exportFileName.value}.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
  showExportDialog.value = false
  
  ElMessage.success('文档导出成功')
}

/**
 * 滚动到指定标题
 * 
 * @param item 大纲项
 */
const scrollToHeading = (item: OutlineItem) => {
  // 这里可以实现滚动到指定标题的功能
  // 由于CodeMirror的复杂性，这里暂时省略具体实现
  console.log('滚动到标题:', item.text)
}

/**
 * 切换文件树显示
 */
const toggleFileTree = () => {
  showFileTree.value = !showFileTree.value
}

/**
 * 处理文件选择
 */
const handleFileSelect = async (fileId: string) => {
  try {
    await appStore.loadDocument(fileId)
    ElMessage.success('文件已打开')
  } catch (error) {
    ElMessage.error('打开文件失败: ' + (error as Error).message)
  }
}

/**
 * 处理打开文件夹
 */
const handleOpenFolder = () => {
  // 触发文件夹选择
  const input = document.createElement('input')
  input.type = 'file'
  input.webkitdirectory = true
  input.multiple = true
  
  input.onchange = async (event) => {
    const files = (event.target as HTMLInputElement).files
    if (files && files.length > 0) {
      try {
        await appStore.loadFolderStructure(files)
        showFileTree.value = true
        ElMessage.success(`成功加载文件夹，共 ${files.length} 个文件`)
      } catch (error) {
        ElMessage.error('加载文件夹失败: ' + (error as Error).message)
      }
    }
  }
  
  input.click()
}

// 监听当前文档变化
watch(currentDocument, () => {
  initializeDocument()
}, { immediate: true })

// 监听文件树数据变化，自动显示文件树
watch(() => appStore.fileTreeData, (newData) => {
  if (newData.length > 0 && !showFileTree.value) {
    showFileTree.value = true
  }
}, { immediate: true })

// 页面离开前的保存提醒
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = '您有未保存的更改，确定要离开吗？'
    return event.returnValue
  }
}

// 生命周期
onMounted(async () => {
  // 检查路由参数中是否有文档ID
  const route = router.currentRoute.value
  const documentId = route.query.id as string
  
  if (documentId) {
    // 如果有文档ID参数，尝试加载对应文档
    try {
      await appStore.loadDocument(documentId)
      console.log('从路由参数加载文档成功:', documentId)
    } catch (error) {
      console.error('从路由参数加载文档失败:', error)
      ElMessage.error('文档加载失败: ' + (error as Error).message)
      // 如果加载失败，尝试恢复上次编辑的文档
      await appStore.loadCurrentEditingDocument()
    }
  } else {
    // 如果没有路由参数，尝试恢复上次编辑的文档
    try {
      await appStore.loadCurrentEditingDocument()
      console.log('恢复上次编辑文档成功')
    } catch (error) {
      console.log('没有可恢复的文档，创建新文档')
      // 如果没有可恢复的文档，创建一个新文档
      appStore.createNewDocument()
    }
  }
  
  initializeDocument()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 清理
const cleanup = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  window.removeEventListener('beforeunload', handleBeforeUnload)
}

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.editor-view {
  user-select: none;
}

/* 大纲缩进样式 */
.ml-0 { margin-left: 0; }
.ml-4 { margin-left: 1rem; }
.ml-8 { margin-left: 2rem; }
.ml-12 { margin-left: 3rem; }
.ml-16 { margin-left: 4rem; }
.ml-20 { margin-left: 5rem; }
</style>