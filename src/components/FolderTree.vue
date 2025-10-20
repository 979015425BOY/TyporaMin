<!--
  文件夹树形展示组件
  
  功能：
  - 展示文件夹树形结构
  - 文件夹展开/收起
  - 文件选择和打开
  - 右键菜单操作
  
  使用场景：
  - 工作区文件管理
  - 文件导航
-->

<template>
  <div class="folder-tree">
    <!-- 树形结构头部 -->
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
        <el-icon class="mr-2">
          <FolderOpened />
        </el-icon>
        文件结构
      </h4>
      
      <div class="flex items-center space-x-1">
        <el-button 
          size="small" 
          text 
          @click="expandAll"
          :icon="Expand"
          title="展开所有"
        />
        <el-button 
          size="small" 
          text 
          @click="collapseAll"
          :icon="Fold"
          title="收起所有"
        />
        <el-button 
          size="small" 
          text 
          @click="refreshTree"
          :icon="Refresh"
          title="刷新"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="treeData.length === 0" class="text-center py-8">
      <el-icon :size="48" class="text-gray-400 dark:text-gray-500 mb-4">
        <Folder />
      </el-icon>
      <p class="text-gray-500 dark:text-gray-400 text-sm">暂无文件</p>
    </div>

    <!-- 文件树 -->
    <div v-else class="space-y-1">
      <FolderTreeNode 
        v-for="node in treeData" 
        :key="node.id"
        :node="node"
        :level="0"
        :selected-id="selectedFileId"
        :expanded-folders="expandedFolders"
        @select="handleNodeSelect"
        @toggle="handleNodeToggle"
        @context-menu="handleContextMenu"
      />
    </div>

    <!-- 右键菜单 -->
    <el-dropdown 
      ref="contextMenuRef"
      :virtual-ref="contextMenuVirtualRef"
      trigger="contextmenu"
      virtual-triggering
      @command="handleContextMenuCommand"
    >
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item 
            v-if="contextMenuNode?.type === 'file'" 
            command="open" 
            :icon="Document"
          >
            打开文件
          </el-dropdown-item>
          <el-dropdown-item 
            v-if="contextMenuNode?.type === 'folder'" 
            command="expand" 
            :icon="contextMenuNode?.isExpanded ? Fold : Expand"
          >
            {{ contextMenuNode?.isExpanded ? '收起' : '展开' }}
          </el-dropdown-item>
          <el-dropdown-item divided command="rename" :icon="Edit">
            重命名
          </el-dropdown-item>
          <el-dropdown-item command="delete" :icon="Delete" class="text-red-500">
            删除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- 重命名对话框 -->
    <el-dialog 
      v-model="showRenameDialog" 
      title="重命名" 
      width="400px"
      :before-close="handleRenameDialogClose"
    >
      <el-form :model="renameForm" :rules="renameRules" ref="renameFormRef">
        <el-form-item prop="name">
          <el-input 
            v-model="renameForm.name" 
            placeholder="请输入新名称"
            @keyup.enter="handleRename"
            ref="renameInputRef"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRenameDialog = false">取消</el-button>
          <el-button type="primary" @click="handleRename" :loading="renaming">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { FileTreeNode } from '@/stores/app'
import FolderTreeNode from './FolderTreeNode.vue'
import { 
  FolderOpened, 
  Folder, 
  Document, 
  Expand, 
  Fold, 
  Refresh, 
  Edit, 
  Delete 
} from '@element-plus/icons-vue'

/**
 * 文件夹树形展示组件逻辑
 * 
 * 功能：
 * - 文件树展示和操作
 * - 文件选择和打开
 * - 右键菜单功能
 */

const router = useRouter()
const appStore = useAppStore()

// 响应式数据
const showRenameDialog = ref(false)
const renaming = ref(false)
const contextMenuNode = ref<FileTreeNode | null>(null)
const contextMenuVirtualRef = ref()

// 表单引用
const renameFormRef = ref<FormInstance>()
const renameInputRef = ref()

// 重命名表单
const renameForm = reactive({
  name: ''
})

// 表单验证规则
const renameRules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 1, max: 100, message: '名称长度在 1 到 100 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const treeData = computed(() => appStore.fileTreeData)
const selectedFileId = computed(() => appStore.selectedFileId)
const expandedFolders = computed(() => appStore.expandedFolders)

/**
 * 处理节点选择
 * 
 * @param node 文件树节点
 */
const handleNodeSelect = async (node: FileTreeNode) => {
  if (node.type === 'file') {
    try {
      appStore.selectFile(node.id)
      await appStore.loadDocument(node.id)
      router.push('/editor')
    } catch (error) {
      ElMessage.error('打开文件失败')
      console.error('打开文件失败:', error)
    }
  }
}

/**
 * 处理节点展开/收起
 * 
 * @param node 文件树节点
 */
const handleNodeToggle = (node: FileTreeNode) => {
  if (node.type === 'folder') {
    appStore.toggleFolderExpanded(node.id)
  }
}

/**
 * 处理右键菜单
 * 
 * @param event 鼠标事件
 * @param node 文件树节点
 */
const handleContextMenu = (event: MouseEvent, node: FileTreeNode) => {
  event.preventDefault()
  contextMenuNode.value = node
  contextMenuVirtualRef.value = {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        top: event.clientY,
        left: event.clientX,
        right: event.clientX,
        bottom: event.clientY,
      }
    }
  }
}

/**
 * 处理右键菜单命令
 * 
 * @param command 命令
 */
const handleContextMenuCommand = (command: string) => {
  if (!contextMenuNode.value) return
  
  const node = contextMenuNode.value
  
  switch (command) {
    case 'open':
      if (node.type === 'file') {
        handleNodeSelect(node)
      }
      break
    case 'expand':
      if (node.type === 'folder') {
        handleNodeToggle(node)
      }
      break
    case 'rename':
      showRenameDialog.value = true
      renameForm.name = node.name
      nextTick(() => {
        renameInputRef.value?.focus()
        renameInputRef.value?.select()
      })
      break
    case 'delete':
      deleteNode(node)
      break
  }
}

/**
 * 展开所有文件夹
 */
const expandAll = () => {
  const expandAllNodes = (nodes: FileTreeNode[]) => {
    nodes.forEach(node => {
      if (node.type === 'folder') {
        appStore.expandedFolders.add(node.id)
        if (node.children) {
          expandAllNodes(node.children)
        }
      }
    })
  }
  
  expandAllNodes(treeData.value)
  ElMessage.success('已展开所有文件夹')
}

/**
 * 收起所有文件夹
 */
const collapseAll = () => {
  appStore.expandedFolders.clear()
  ElMessage.success('已收起所有文件夹')
}

/**
 * 刷新文件树
 */
const refreshTree = () => {
  appStore.refreshFileTree()
  ElMessage.success('文件树已刷新')
}

/**
 * 删除节点
 * 
 * @param node 文件树节点
 */
const deleteNode = async (node: FileTreeNode) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${node.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (node.type === 'file') {
      await appStore.deleteFile(node.id)
    } else {
      await appStore.deleteFolder(node.id)
    }
    
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除失败:', error)
    }
  }
}

/**
 * 处理重命名
 */
const handleRename = async () => {
  if (!renameFormRef.value || !contextMenuNode.value) return
  
  try {
    await renameFormRef.value.validate()
    renaming.value = true
    
    const node = contextMenuNode.value
    const newName = renameForm.name.trim()
    
    if (newName === node.name) {
      showRenameDialog.value = false
      return
    }
    
    if (node.type === 'file') {
      await appStore.renameFile(node.id, newName)
    } else {
      await appStore.renameFolder(node.id, newName)
    }
    
    ElMessage.success('重命名成功')
    showRenameDialog.value = false
    resetRenameForm()
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error('重命名失败')
      console.error('重命名失败:', error)
    }
  } finally {
    renaming.value = false
  }
}

/**
 * 重置重命名表单
 */
const resetRenameForm = () => {
  renameForm.name = ''
  contextMenuNode.value = null
  renameFormRef.value?.resetFields()
}

/**
 * 处理重命名对话框关闭
 */
const handleRenameDialogClose = () => {
  resetRenameForm()
}
</script>

<style scoped>
.folder-tree {
  @apply w-full;
}

.dialog-footer {
  @apply flex justify-end space-x-2;
}
</style>