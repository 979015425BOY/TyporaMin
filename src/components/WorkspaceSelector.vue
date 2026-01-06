<!--
  工作区选择器组件
  
  功能：
  - 显示当前工作区
  - 切换工作区
  - 创建新工作区
  - 删除工作区
  
  使用场景：
  - 首页工作区管理
  - 多工作区切换
-->

<template>
  <div class="workspace-selector">
    <!-- 当前工作区显示 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <el-icon class="mr-2">
          <Folder />
        </el-icon>
        工作区
      </h3>
      
      <div class="flex items-center space-x-2">
        <el-button 
          size="small" 
          type="primary" 
          @click="showCreateDialog = true"
          :icon="Plus"
        >
          新建
        </el-button>
        
        <el-button 
          size="small" 
          type="success" 
          @click="handleCreateFromLocalFolder"
          :icon="FolderOpened"
        >
          选择本地文件夹
        </el-button>
        
        <el-dropdown @command="handleWorkspaceAction" v-if="workspaces.length > 0">
          <el-button size="small" :icon="MoreFilled" circle />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="refresh" :icon="Refresh">刷新</el-dropdown-item>
              <el-dropdown-item command="import" :icon="Upload">导入文件夹</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 工作区列表 -->
    <div v-if="workspaces.length === 0" class="text-center py-8">
      <el-icon :size="48" class="text-gray-400 dark:text-gray-500 mb-4">
        <FolderOpened />
      </el-icon>
      <p class="text-gray-500 dark:text-gray-400 mb-4">暂无工作区</p>
      <el-button type="primary" @click="showCreateDialog = true" :icon="Plus">
        创建第一个工作区
      </el-button>
    </div>

    <div v-else class="space-y-2">
      <div 
        v-for="workspace in workspaces" 
        :key="workspace.id"
        class="group cursor-pointer p-4 rounded-lg border transition-all duration-200"
        :class="[
          workspace.isActive 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
        @click="switchToWorkspace(workspace.id)"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center">
              <el-icon class="mr-2" :class="workspace.isActive ? 'text-blue-500' : 'text-gray-400'">
                <FolderOpened v-if="workspace.isActive" />
                <Folder v-else />
              </el-icon>
              <h4 class="text-sm font-medium truncate" 
                  :class="workspace.isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'">
                {{ workspace.name }}
              </h4>
              <el-tag v-if="workspace.isActive" size="small" type="primary" class="ml-2">
                当前
              </el-tag>
            </div>
            
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {{ workspace.description || workspace.path }}
            </p>
            
            <div class="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-1">
              <span>{{ workspace.folderStructure.length }} 个项目</span>
              <span class="mx-2">•</span>
              <span>{{ formatDate(workspace.updatedAt) }}</span>
            </div>
          </div>
          
          <el-dropdown @command="(command) => handleWorkspaceItemAction(command, workspace)" trigger="click" v-if="!workspace.isActive">
            <el-button size="small" text :icon="MoreFilled" @click.stop />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="`edit_${workspace.id}`" :icon="Edit">编辑</el-dropdown-item>
                <el-dropdown-item :command="`delete_${workspace.id}`" :icon="Delete" class="text-red-500">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 创建工作区对话框 -->
    <el-dialog 
      v-model="showCreateDialog" 
      title="创建新工作区" 
      width="500px"
      :before-close="handleCreateDialogClose"
    >
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input 
            v-model="createForm.name" 
            placeholder="请输入工作区名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="createForm.description" 
            type="textarea" 
            placeholder="请输入工作区描述（可选）"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreateWorkspace" :loading="creating">
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑工作区对话框 -->
    <el-dialog 
      v-model="showEditDialog" 
      title="编辑工作区" 
      width="500px"
      :before-close="handleEditDialogClose"
    >
      <el-form :model="editForm" :rules="createRules" ref="editFormRef" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input 
            v-model="editForm.name" 
            placeholder="请输入工作区名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            placeholder="请输入工作区描述（可选）"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateWorkspace" :loading="updating">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Workspace } from '@/types'
import { 
  Folder, 
  FolderOpened, 
  Plus, 
  MoreFilled, 
  Refresh, 
  Upload, 
  Edit, 
  Delete 
} from '@element-plus/icons-vue'

/**
 * 工作区选择器组件逻辑
 * 
 * 功能：
 * - 工作区列表展示
 * - 工作区切换
 * - 工作区创建、编辑、删除
 */

const appStore = useAppStore()

// 响应式数据
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const creating = ref(false)
const updating = ref(false)
const editingWorkspace = ref<Workspace | null>(null)

// 表单引用
const createFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

// 创建表单
const createForm = reactive({
  name: '',
  description: ''
})

// 编辑表单
const editForm = reactive({
  name: '',
  description: ''
})

// 表单验证规则
const createRules: FormRules = {
  name: [
    { required: true, message: '请输入工作区名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const workspaces = computed(() => appStore.workspaces)

/**
 * 格式化日期
 * 
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
const formatDate = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * 切换到指定工作区
 * 
 * @param workspaceId 工作区ID
 */
const switchToWorkspace = async (workspaceId: string) => {
  try {
    await appStore.switchWorkspace(workspaceId)
    ElMessage.success('工作区切换成功')
  } catch (error) {
    ElMessage.error('工作区切换失败')
    console.error('切换工作区失败:', error)
  }
}

/**
 * 处理工作区操作
 * 
 * @param command 操作命令
 */
const handleWorkspaceAction = async (command: string) => {
  switch (command) {
    case 'refresh':
      try {
        // 刷新当前工作区的文件树
        if (appStore.currentWorkspace) {
          await appStore.refreshFileTree()
          ElMessage.success('文件树已刷新')
        } else {
          appStore.loadWorkspaces()
          ElMessage.success('工作区列表已刷新')
        }
      } catch (error) {
        ElMessage.error('刷新失败')
        console.error('刷新失败:', error)
      }
      break
    case 'import':
      importFolder()
      break
  }
}

/**
 * 处理工作区项目操作
 * 
 * @param command 操作命令
 * @param workspace 工作区对象
 */
const handleWorkspaceItemAction = (command: string, workspace: Workspace) => {
  const [action, workspaceId] = command.split('_')
  
  switch (action) {
    case 'edit':
      editWorkspace(workspace)
      break
    case 'delete':
      deleteWorkspace(workspaceId)
      break
  }
}

/**
 * 导入文件夹
 */
const importFolder = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.webkitdirectory = true
  input.multiple = true
  
  input.onchange = async (event) => {
    const files = (event.target as HTMLInputElement).files
    if (files && files.length > 0) {
      try {
        await appStore.importFolderToWorkspace(files)
        ElMessage.success(`成功导入文件夹到工作区`)
      } catch (error) {
        ElMessage.error('导入文件夹失败')
        console.error('导入文件夹失败:', error)
      }
    }
  }
  
  input.click()
}

/**
 * 创建工作区
 */
const handleCreateWorkspace = async () => {
  if (!createFormRef.value) return
  
  try {
    await createFormRef.value.validate()
    creating.value = true
    
    await appStore.createWorkspace(
      createForm.name,
      createForm.name, // 使用名称作为路径
      createForm.description || undefined
    )
    
    ElMessage.success('工作区创建成功')
    showCreateDialog.value = false
    resetCreateForm()
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error('创建工作区失败')
      console.error('创建工作区失败:', error)
    }
  } finally {
    creating.value = false
  }
}

/**
 * 从本地文件夹创建工作区
 */
const handleCreateFromLocalFolder = async () => {
  try {
    creating.value = true
    
    // 检查浏览器是否支持 File System Access API
    const { isFileSystemAccessSupported } = await import('@/utils/localFileSystem')
    
    if (!isFileSystemAccessSupported()) {
      ElMessage.warning('当前浏览器不支持直接访问本地文件夹，请使用 Chrome 86+ 或 Edge 86+ 浏览器')
      return
    }
    
    const workspace = await appStore.createWorkspaceFromLocalFolder()
    // 自动切换到新创建的工作区
    await appStore.switchWorkspace(workspace.id)
    
    ElMessage.success(`工作区"${workspace.name}"创建成功`)
  } catch (error: any) {
    // 检查是否是用户取消操作
    // 只有明确标记为 isUserCancel 的错误才认为是取消操作
    const isUserCancel = error.isUserCancel === true

    
    if (isUserCancel) {
      // 用户取消，不显示错误，静默处理
      
      // 检查原始错误，看是否有更多信息
      if (error.originalError) {
        console.warn('原始错误信息:', error.originalError)
      }
      
      // 注意：如果用户确定点击了选择但看到此消息，可能是浏览器权限问题
      // 请检查浏览器是否阻止了文件夹访问权限
      // 建议：刷新页面后重试，或检查浏览器地址栏的权限设置
      console.warn('提示：如果确定点击了选择，请检查：')
      console.warn('1. 浏览器地址栏左侧的权限设置')
      console.warn('2. 是否在 HTTPS 或 localhost 环境下运行')
      console.warn('3. 浏览器是否阻止了文件访问权限')
      
      return
    }
    
    // 显示错误信息
    const errorMessage = error.message || '未知错误'
    ElMessage.error(`从本地文件夹创建工作区失败: ${errorMessage}`)
    console.error('从本地文件夹创建工作区失败:', error)
  } finally {
    creating.value = false
  }
}

/**
 * 编辑工作区
 * 
 * @param workspace 工作区对象
 */
const editWorkspace = (workspace: Workspace) => {
  editingWorkspace.value = workspace
  editForm.name = workspace.name
  editForm.description = workspace.description || ''
  showEditDialog.value = true
}

/**
 * 更新工作区
 */
const handleUpdateWorkspace = async () => {
  if (!editFormRef.value || !editingWorkspace.value) return
  
  try {
    await editFormRef.value.validate()
    updating.value = true
    
    await appStore.updateWorkspace(editingWorkspace.value.id, {
      name: editForm.name,
      description: editForm.description || undefined
    })
    
    ElMessage.success('工作区更新成功')
    showEditDialog.value = false
    resetEditForm()
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      ElMessage.error('更新工作区失败')
      console.error('更新工作区失败:', error)
    }
  } finally {
    updating.value = false
  }
}

/**
 * 删除工作区
 * 
 * @param workspaceId 工作区ID
 */
const deleteWorkspace = async (workspaceId: string) => {
  try {
    await ElMessageBox.confirm(
      '删除工作区将清除所有相关数据，此操作不可恢复。确定要删除吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await appStore.deleteWorkspace(workspaceId)
    ElMessage.success('工作区删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除工作区失败')
      console.error('删除工作区失败:', error)
    }
  }
}

/**
 * 重置创建表单
 */
const resetCreateForm = () => {
  createForm.name = ''
  createForm.description = ''
  createFormRef.value?.resetFields()
}

/**
 * 重置编辑表单
 */
const resetEditForm = () => {
  editForm.name = ''
  editForm.description = ''
  editingWorkspace.value = null
  editFormRef.value?.resetFields()
}

/**
 * 处理创建对话框关闭
 */
const handleCreateDialogClose = () => {
  resetCreateForm()
}

/**
 * 处理编辑对话框关闭
 */
const handleEditDialogClose = () => {
  resetEditForm()
}
</script>

<style scoped>
.workspace-selector {
  @apply w-full;
}

.dialog-footer {
  @apply flex justify-end space-x-2;
}
</style>