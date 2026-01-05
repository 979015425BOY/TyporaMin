<!--
  首页组件
  
  功能：
  - 显示欢迎界面
  - 提供快速操作入口
  - 新建文档功能
  
  使用场景：
  - 应用启动页面
  - 文件管理入口
-->

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <!-- 导航栏 -->
    <nav class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">T</span>
            </div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">TyporaMin</h1>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex items-center space-x-4">
            <el-button 
              type="primary" 
              @click="createNewDocument"
              :icon="Plus"
            >
              新建文档
            </el-button>
            
            <el-button 
              @click="openFile"
              :icon="Folder"
            >
              打开文件
            </el-button>
            
            <el-button 
              type="success" 
              @click="openFolder"
              :icon="Folder"
            >
              打开文件夹
            </el-button>
            
            <el-button 
              :icon="themeStore.isDarkMode ? Sunny : Moon" 
              circle 
              @click="themeStore.toggleDarkMode()"
              :loading="themeStore.isLoading"
              title="切换主题"
            />
            <el-button 
              circle 
              @click="$router.push('/settings')"
              :icon="Setting"
            />
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main 
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
    >
      <!-- 拖拽提示遮罩 -->
      <div 
        v-if="isDragging"
        class="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50 pointer-events-none"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-2 border-dashed border-blue-500">
          <div class="text-center">
            <el-icon :size="48" class="text-blue-500 mb-4">
              <Folder />
            </el-icon>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              拖拽文件夹到此处
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              释放以导入文件夹中的所有 Markdown 文件
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-8">
        <!-- 工作区管理区域 -->
        <div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <!-- 工作区选择器 -->
            <WorkspaceSelector />
            
            <!-- 分隔线 -->
            <div class="border-t border-gray-200 dark:border-gray-700 my-6"></div>
            
            <!-- 文件夹树形展示 -->
            <FolderTree />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'
import { 
  Moon,
  Sunny,
  Folder,
  Plus,
  Setting
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import WorkspaceSelector from '@/components/WorkspaceSelector.vue'
import FolderTree from '@/components/FolderTree.vue'

/**
 * 首页逻辑
 * 
 * 功能：
 * - 文档创建和打开
 * - 页面导航
 */

const router = useRouter()
const appStore = useAppStore()
const themeStore = useThemeStore()

// 响应式数据
const isDragging = ref(false)
const dragCounter = ref(0)

// 计算属性
const isDarkMode = computed(() => appStore.isDarkMode)

// 方法
const createNewDocument = async () => {
  try {
    const newDoc = appStore.createNewDocument()
    
    // 先保存文档到fileManager
    const { fileManager } = await import('@/utils/fileManager')
    await fileManager.save(newDoc)
    
    // 保存成功后跳转到编辑器页面
    router.push({ path: '/editor', query: { id: newDoc.id } })
  } catch (error) {
    console.error('创建新文档失败:', error)
    ElMessage.error('创建新文档失败')
  }
}

const openFile = () => {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md,.markdown,.txt'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      try {
        const content = await file.text()
        const doc = {
          id: `doc_${Date.now()}`,
          title: file.name.replace(/\.(md|markdown|txt)$/, ''),
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
          isDirty: false,
          lastModified: new Date(),
          isModified: false
        }
        
        // 先保存文档到fileManager，然后设置为当前文档并跳转
        const { fileManager } = await import('@/utils/fileManager')
        await fileManager.save(doc)
        appStore.currentDocument = doc
        router.push({ path: '/editor', query: { id: doc.id } })
      } catch (error) {
        ElMessage.error('文件读取失败')
      }
    }
  }
  input.click()
}

const openFolder = () => {
  // 创建文件夹输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.webkitdirectory = true
  input.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files
    if (files && files.length > 0) {
      try {
        await appStore.loadFolderStructure(files)
        ElMessage.success(`成功导入 ${files.length} 个文件`)
      } catch (error) {
        ElMessage.error('文件夹导入失败')
      }
    }
  }
  input.click()
}

const toggleDarkMode = () => {
  appStore.updateSettings({ theme: isDarkMode.value ? 'light' : 'dark' })
}

// 拖拽处理方法
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value++
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  dragCounter.value = 0

  const items = e.dataTransfer?.items
  if (!items) return

  try {
    const files: File[] = []
    
    // 处理拖拽的文件和文件夹
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry()
        if (entry) {
          await processEntry(entry, files)
        }
      }
    }

    if (files.length > 0) {
      // 创建 FileList 对象
      const fileList = Object.create(FileList.prototype)
      Object.defineProperty(fileList, 'length', { value: files.length })
      files.forEach((file, index) => {
        Object.defineProperty(fileList, index, { value: file })
      })

      await appStore.loadFolderStructure(fileList)
      ElMessage.success(`成功导入 ${files.length} 个文件`)
      
      // 如果当前没有工作区，自动创建一个
      if (!appStore.currentWorkspace) {
        const workspaceName = files[0].webkitRelativePath.split('/')[0] || '新工作区'
        await appStore.createWorkspace(workspaceName, appStore.currentFolderPath)
      }
    } else {
      ElMessage.warning('没有找到可导入的 Markdown 文件')
    }
  } catch (error) {
    console.error('拖拽导入失败:', error)
    ElMessage.error('拖拽导入失败')
  }
}

// 递归处理文件夹条目
const processEntry = async (entry: any, files: File[], path = '') => {
  const fullPath = path ? `${path}/${entry.name}` : entry.name

  if (entry.isFile) {
    // 只处理 Markdown 文件
    if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
      const file = await new Promise<File>((resolve) => {
        entry.file((file: File) => {
          // 添加 webkitRelativePath 属性
          Object.defineProperty(file, 'webkitRelativePath', {
            value: fullPath,
            writable: false
          })
          resolve(file)
        })
      })
      files.push(file)
    }
  } else if (entry.isDirectory) {
    const reader = entry.createReader()
    const entries = await new Promise<any[]>((resolve) => {
      reader.readEntries((entries: any[]) => {
        resolve(entries)
      })
    })

    for (const childEntry of entries) {
      await processEntry(childEntry, files, fullPath)
    }
  }
}

// 生命周期
onMounted(() => {
  // 初始化应用状态
  appStore.loadCurrentEditingDocument()
})
</script>