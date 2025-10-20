<!--
  文件树组件
  
  功能：
  - 显示文件夹目录结构
  - 支持文件和文件夹的展开/收起
  - 文件点击打开编辑
  - 文件和文件夹的增删改查操作
  - 右键菜单支持
  
  依赖：Element Plus、Vue3 Composition API
  使用场景：编辑器左侧文件管理面板
-->

<template>
  <div class="file-tree h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
    <!-- 文件树头部 -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">文件管理器</h3>
        <div class="flex items-center space-x-1">
          <el-tooltip content="新建文件" placement="bottom">
            <el-button 
              size="small" 
              text 
              :icon="DocumentAdd" 
              @click="showCreateFileDialog"
            />
          </el-tooltip>
          <el-tooltip content="新建文件夹" placement="bottom">
            <el-button 
              size="small" 
              text 
              :icon="FolderAdd" 
              @click="showCreateFolderDialog"
            />
          </el-tooltip>
          <el-tooltip content="刷新" placement="bottom">
            <el-button 
              size="small" 
              text 
              :icon="Refresh" 
              @click="refreshFileTree"
            />
          </el-tooltip>
        </div>
      </div>
      
      <!-- 当前文件夹路径 -->
      <div v-if="currentFolderPath" class="mt-2">
        <el-text size="small" class="text-gray-500 dark:text-gray-400 truncate block">
          {{ currentFolderPath }}
        </el-text>
      </div>
    </div>

    <!-- 文件树内容 -->
    <div class="flex-1 overflow-auto p-2">
      <el-tree
        ref="treeRef"
        :data="fileTreeData"
        :props="treeProps"
        :expand-on-click-node="false"
        :default-expand-all="false"
        node-key="id"
        class="file-tree-content"
        @node-click="handleNodeClick"
        @node-contextmenu="handleNodeContextMenu"
      >
        <template #default="{ node, data }">
          <div class="flex items-center w-full">
            <!-- 文件/文件夹图标 -->
            <el-icon class="mr-2 text-gray-500 dark:text-gray-400">
              <Folder v-if="data.type === 'folder'" />
              <Document v-else />
            </el-icon>
            
            <!-- 文件名 -->
            <span 
              class="flex-1 text-sm text-gray-900 dark:text-white truncate"
              :class="{ 'font-medium': data.type === 'folder' }"
            >
              {{ data.name }}
            </span>
            
            <!-- 文件状态指示器 -->
            <div v-if="data.type === 'file'" class="flex items-center space-x-1">
              <el-icon 
                v-if="data.isDirty" 
                class="text-orange-500" 
                size="12"
                title="未保存"
              >
                <Warning />
              </el-icon>
              <el-icon 
                v-if="isCurrentFile(data.id)" 
                class="text-blue-500" 
                size="12"
                title="当前文件"
              >
                <Select />
              </el-icon>
            </div>
          </div>
        </template>
      </el-tree>
      
      <!-- 空状态 -->
      <div v-if="!fileTreeData.length" class="text-center py-8">
        <el-icon size="48" class="text-gray-400 dark:text-gray-500 mb-4">
          <Folder />
        </el-icon>
        <p class="text-gray-500 dark:text-gray-400 text-sm">
          暂无文件夹
        </p>
        <el-button 
          type="primary" 
          size="small" 
          class="mt-4"
          @click="$emit('open-folder')"
        >
          打开文件夹
        </el-button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <el-dropdown
      ref="contextMenuRef"
      trigger="contextmenu"
      :teleported="false"
      @command="handleContextMenuCommand"
    >
      <div></div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            v-if="contextMenuData?.type === 'file'" 
            command="open"
            :icon="FolderOpened"
          >
            打开文件
          </el-dropdown-item>
          <el-dropdown-item 
            v-if="contextMenuData?.type === 'file'" 
            command="rename"
            :icon="Edit"
          >
            重命名
          </el-dropdown-item>
          <el-dropdown-item 
            v-if="contextMenuData?.type === 'folder'" 
            command="new-file"
            :icon="DocumentAdd"
          >
            新建文件
          </el-dropdown-item>
          <el-dropdown-item 
            v-if="contextMenuData?.type === 'folder'" 
            command="new-folder"
            :icon="FolderAdd"
          >
            新建文件夹
          </el-dropdown-item>
          <el-dropdown-item 
            command="rename"
            :icon="Edit"
          >
            重命名
          </el-dropdown-item>
          <el-dropdown-item 
            command="delete"
            :icon="Delete"
            class="text-red-600"
          >
            删除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 新建文件对话框 -->
    <el-dialog
      v-model="createFileDialogVisible"
      title="新建文件"
      width="400px"
      :before-close="handleCreateFileDialogClose"
    >
      <el-form :model="createFileForm" label-width="80px">
        <el-form-item label="文件名">
          <el-input
            v-model="createFileForm.name"
            placeholder="请输入文件名（如：document.md）"
            @keyup.enter="confirmCreateFile"
          />
        </el-form-item>
        <el-form-item label="位置">
          <el-text size="small" class="text-gray-500">
            {{ createFileForm.parentPath || '根目录' }}
          </el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createFileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreateFile">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新建文件夹对话框 -->
    <el-dialog
      v-model="createFolderDialogVisible"
      title="新建文件夹"
      width="400px"
      :before-close="handleCreateFolderDialogClose"
    >
      <el-form :model="createFolderForm" label-width="80px">
        <el-form-item label="文件夹名">
          <el-input
            v-model="createFolderForm.name"
            placeholder="请输入文件夹名"
            @keyup.enter="confirmCreateFolder"
          />
        </el-form-item>
        <el-form-item label="位置">
          <el-text size="small" class="text-gray-500">
            {{ createFolderForm.parentPath || '根目录' }}
          </el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createFolderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCreateFolder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重命名对话框 -->
    <el-dialog
      v-model="renameDialogVisible"
      title="重命名"
      width="400px"
      :before-close="handleRenameDialogClose"
    >
      <el-form :model="renameForm" label-width="80px">
        <el-form-item label="新名称">
          <el-input
            v-model="renameForm.name"
            placeholder="请输入新名称"
            @keyup.enter="confirmRename"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRename">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FileTreeNode } from '@/stores/app'
import {
  Folder,
  FolderAdd,
  FolderOpened,
  Document,
  DocumentAdd,
  Edit,
  Delete,
  Refresh,
  Warning,
  Select
} from '@element-plus/icons-vue'

/**
 * 文件树组件逻辑
 * 
 * 功能：
 * - 文件树数据管理
 * - 文件和文件夹操作
 * - 右键菜单处理
 * - 对话框管理
 */

// Props 和 Emits
interface Props {
  width?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 280
})

const emit = defineEmits<{
  'open-folder': []
  'file-select': [fileId: string]
}>()

// Store
const appStore = useAppStore()

// 响应式数据
const treeRef = ref()
const contextMenuRef = ref()
const contextMenuData = ref<FileTreeNode | null>(null)

// 对话框状态
const createFileDialogVisible = ref(false)
const createFolderDialogVisible = ref(false)
const renameDialogVisible = ref(false)

// 表单数据
const createFileForm = ref({
  name: '',
  parentPath: '',
  parentId: ''
})

const createFolderForm = ref({
  name: '',
  parentPath: '',
  parentId: ''
})

const renameForm = ref({
  id: '',
  name: '',
  type: 'file' as 'file' | 'folder'
})

// 计算属性
const fileTreeData = computed(() => appStore.fileTreeData)
const currentFolderPath = computed(() => appStore.currentFolderPath)
const currentDocument = computed(() => appStore.currentDocument)

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name',
  isLeaf: (data: FileTreeNode) => data.type === 'file'
}

/**
 * 判断是否为当前文件
 */
const isCurrentFile = (fileId: string): boolean => {
  return currentDocument.value?.id === fileId
}

/**
 * 处理节点点击
 */
const handleNodeClick = (data: FileTreeNode) => {
  if (data.type === 'file') {
    emit('file-select', data.id)
  }
}

/**
 * 处理节点右键菜单
 */
const handleNodeContextMenu = (event: MouseEvent, data: FileTreeNode) => {
  event.preventDefault()
  contextMenuData.value = data
  
  nextTick(() => {
    if (contextMenuRef.value) {
      contextMenuRef.value.handleOpen()
    }
  })
}

/**
 * 处理右键菜单命令
 */
const handleContextMenuCommand = async (command: string) => {
  if (!contextMenuData.value) return

  const data = contextMenuData.value
  
  switch (command) {
    case 'open':
      if (data.type === 'file') {
        emit('file-select', data.id)
      }
      break
      
    case 'new-file':
      showCreateFileDialog(data.id, data.path)
      break
      
    case 'new-folder':
      showCreateFolderDialog(data.id, data.path)
      break
      
    case 'rename':
      showRenameDialog(data)
      break
      
    case 'delete':
      await handleDelete(data)
      break
  }
  
  contextMenuData.value = null
}

/**
 * 显示新建文件对话框
 */
const showCreateFileDialog = (parentId = '', parentPath = '') => {
  createFileForm.value = {
    name: '',
    parentId,
    parentPath
  }
  createFileDialogVisible.value = true
}

/**
 * 显示新建文件夹对话框
 */
const showCreateFolderDialog = (parentId = '', parentPath = '') => {
  createFolderForm.value = {
    name: '',
    parentId,
    parentPath
  }
  createFolderDialogVisible.value = true
}

/**
 * 显示重命名对话框
 */
const showRenameDialog = (data: FileTreeNode) => {
  renameForm.value = {
    id: data.id,
    name: data.name,
    type: data.type
  }
  renameDialogVisible.value = true
}

/**
 * 确认新建文件
 */
const confirmCreateFile = async () => {
  const { name, parentId } = createFileForm.value
  
  if (!name.trim()) {
    ElMessage.warning('请输入文件名')
    return
  }
  
  try {
    await appStore.createFile(name.trim(), parentId)
    ElMessage.success('文件创建成功')
    createFileDialogVisible.value = false
  } catch (error) {
    ElMessage.error('文件创建失败: ' + (error as Error).message)
  }
}

/**
 * 确认新建文件夹
 */
const confirmCreateFolder = async () => {
  const { name, parentId } = createFolderForm.value
  
  if (!name.trim()) {
    ElMessage.warning('请输入文件夹名')
    return
  }
  
  try {
    await appStore.createFolder(name.trim(), parentId)
    ElMessage.success('文件夹创建成功')
    createFolderDialogVisible.value = false
  } catch (error) {
    ElMessage.error('文件夹创建失败: ' + (error as Error).message)
  }
}

/**
 * 确认重命名
 */
const confirmRename = async () => {
  const { id, name, type } = renameForm.value
  
  if (!name.trim()) {
    ElMessage.warning('请输入新名称')
    return
  }
  
  try {
    if (type === 'file') {
      await appStore.renameFile(id, name.trim())
    } else {
      await appStore.renameFolder(id, name.trim())
    }
    ElMessage.success('重命名成功')
    renameDialogVisible.value = false
  } catch (error) {
    ElMessage.error('重命名失败: ' + (error as Error).message)
  }
}

/**
 * 处理删除操作
 */
const handleDelete = async (data: FileTreeNode) => {
  const itemType = data.type === 'file' ? '文件' : '文件夹'
  
  try {
    await ElMessageBox.confirm(
      `确定要删除${itemType}"${data.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    if (data.type === 'file') {
      await appStore.deleteFile(data.id)
    } else {
      await appStore.deleteFolder(data.id)
    }
    
    ElMessage.success(`${itemType}删除成功`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${itemType}删除失败: ` + (error as Error).message)
    }
  }
}

/**
 * 刷新文件树
 */
const refreshFileTree = async () => {
  try {
    await appStore.refreshFileTree()
    ElMessage.success('文件树刷新成功')
  } catch (error) {
    ElMessage.error('文件树刷新失败: ' + (error as Error).message)
  }
}

/**
 * 对话框关闭处理
 */
const handleCreateFileDialogClose = () => {
  createFileForm.value = { name: '', parentPath: '', parentId: '' }
}

const handleCreateFolderDialogClose = () => {
  createFolderForm.value = { name: '', parentPath: '', parentId: '' }
}

const handleRenameDialogClose = () => {
  renameForm.value = { id: '', name: '', type: 'file' }
}
</script>

<style scoped>
.file-tree {
  min-width: 200px;
  max-width: 400px;
}

.file-tree-content {
  --el-tree-node-hover-bg-color: theme('colors.gray.50');
  --el-tree-node-content-height: 32px;
}

.dark .file-tree-content {
  --el-tree-node-hover-bg-color: theme('colors.gray.700');
}

:deep(.el-tree-node__content) {
  padding: 0 8px;
  border-radius: 4px;
  margin: 1px 0;
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--el-tree-node-hover-bg-color);
}

:deep(.el-tree-node__expand-icon) {
  color: theme('colors.gray.500');
}

:deep(.el-tree-node__expand-icon.expanded) {
  transform: rotate(90deg);
}
</style>