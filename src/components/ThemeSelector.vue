<!--
  主题选择器组件
  功能：提供主题切换界面、自定义主题创建、主题预览
  依赖：Element Plus、主题Store
  使用场景：设置页面、工具栏快速切换
-->

<template>
  <div class="theme-selector">
    <!-- 快速切换按钮 -->
    <div class="flex items-center space-x-2 mb-4">
      <el-button
        :type="themeStore.isDarkMode ? 'default' : 'primary'"
        :icon="Sunny"
        size="small"
        @click="switchToLight"
        :disabled="themeStore.isLoading"
      >
        浅色
      </el-button>
      
      <el-button
        :type="themeStore.isDarkMode ? 'primary' : 'default'"
        :icon="Moon"
        size="small"
        @click="switchToDark"
        :disabled="themeStore.isLoading"
      >
        深色
      </el-button>
      
      <el-button
        :icon="Monitor"
        size="small"
        @click="toggleFollowSystem"
        :type="themeStore.config.followSystemTheme ? 'primary' : 'default'"
        :disabled="themeStore.isLoading"
      >
        跟随系统
      </el-button>
    </div>

    <!-- 主题列表 -->
    <div class="theme-list">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        选择主题
      </h4>
      
      <div class="grid grid-cols-1 gap-3">
        <div
          v-for="theme in themeStore.allThemes"
          :key="theme.id"
          class="theme-item"
          :class="{
            'theme-item--active': theme.id === themeStore.currentTheme.id,
            'theme-item--light': theme.type === 'light',
            'theme-item--dark': theme.type === 'dark'
          }"
          @click="selectTheme(theme.id)"
        >
          <!-- 主题预览 -->
          <div class="theme-preview">
            <div 
              class="preview-color primary"
              :style="{ backgroundColor: theme.cssVariables.primaryColor }"
            ></div>
            <div 
              class="preview-color background"
              :style="{ backgroundColor: theme.cssVariables.backgroundColor }"
            ></div>
            <div 
              class="preview-color text"
              :style="{ backgroundColor: theme.cssVariables.textColor }"
            ></div>
            <div 
              class="preview-color accent"
              :style="{ backgroundColor: theme.cssVariables.accentColor }"
            ></div>
          </div>
          
          <!-- 主题信息 -->
          <div class="theme-info">
            <div class="theme-name">{{ theme.name }}</div>
            <div class="theme-type">
              <el-tag 
                :type="theme.type === 'dark' ? 'info' : 'warning'"
                size="small"
              >
                {{ theme.type === 'dark' ? '深色' : '浅色' }}
              </el-tag>
              <el-tag 
                v-if="!theme.isBuiltIn"
                type="success"
                size="small"
              >
                自定义
              </el-tag>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="theme-actions">
            <el-button
              v-if="!theme.isBuiltIn"
              :icon="Edit"
              size="small"
              text
              @click.stop="editTheme(theme)"
            />
            <el-button
              v-if="!theme.isBuiltIn"
              :icon="Delete"
              size="small"
              text
              type="danger"
              @click.stop="deleteTheme(theme.id)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 创建自定义主题按钮 -->
    <div class="mt-4">
      <el-button
        :icon="Plus"
        size="small"
        type="primary"
        @click="showCreateDialog = true"
        :disabled="themeStore.isLoading"
      >
        创建自定义主题
      </el-button>
    </div>

    <!-- 创建主题对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建自定义主题"
      width="600px"
      :close-on-click-modal="false"
    >
      <theme-editor
        v-if="showCreateDialog"
        :theme="editingTheme"
        @save="handleSaveTheme"
        @cancel="handleCancelEdit"
      />
    </el-dialog>

    <!-- 错误提示 -->
    <el-alert
      v-if="themeStore.error"
      :title="themeStore.error"
      type="error"
      :closable="false"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Sunny, Moon, Monitor, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useThemeStore, type Theme } from '@/stores/theme'
import ThemeEditor from '@/components/ThemeEditor.vue'

/**
 * 组件属性定义
 */
interface Props {
  compact?: boolean // 紧凑模式
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

// Store
const themeStore = useThemeStore()

// 响应式状态
const showCreateDialog = ref(false)
const editingTheme = ref<Partial<Theme> | null>(null)

/**
 * 切换到浅色主题
 */
const switchToLight = async () => {
  const lightTheme = themeStore.lightThemes[0]
  if (lightTheme) {
    await themeStore.switchTheme(lightTheme.id)
  }
}

/**
 * 切换到深色主题
 */
const switchToDark = async () => {
  const darkTheme = themeStore.darkThemes[0]
  if (darkTheme) {
    await themeStore.switchTheme(darkTheme.id)
  }
}

/**
 * 切换跟随系统主题
 */
const toggleFollowSystem = () => {
  themeStore.config.followSystemTheme = !themeStore.config.followSystemTheme
  if (themeStore.config.followSystemTheme) {
    themeStore.followSystemTheme()
  }
}

/**
 * 选择主题
 * @param themeId 主题ID
 */
const selectTheme = async (themeId: string) => {
  try {
    await themeStore.switchTheme(themeId)
    ElMessage.success('主题切换成功')
  } catch (error) {
    ElMessage.error('主题切换失败')
  }
}

/**
 * 编辑主题
 * @param theme 要编辑的主题
 */
const editTheme = (theme: Theme) => {
  editingTheme.value = { ...theme }
  showCreateDialog.value = true
}

/**
 * 删除主题
 * @param themeId 主题ID
 */
const deleteTheme = async (themeId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个自定义主题吗？此操作不可撤销。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await themeStore.deleteCustomTheme(themeId)
    ElMessage.success('主题删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('主题删除失败')
    }
  }
}

/**
 * 处理保存主题
 * @param theme 主题数据
 */
const handleSaveTheme = async (theme: Omit<Theme, 'id' | 'isBuiltIn'>) => {
  try {
    if (editingTheme.value?.id) {
      // 更新现有主题
      const existingTheme = themeStore.allThemes.find(t => t.id === editingTheme.value?.id)
      if (existingTheme && !existingTheme.isBuiltIn) {
        Object.assign(existingTheme, theme)
        await themeStore.saveConfig()
        ElMessage.success('主题更新成功')
      }
    } else {
      // 创建新主题
      await themeStore.createCustomTheme(theme)
      ElMessage.success('主题创建成功')
    }
    
    showCreateDialog.value = false
    editingTheme.value = null
  } catch (error) {
    ElMessage.error('保存主题失败')
  }
}

/**
 * 取消编辑
 */
const handleCancelEdit = () => {
  showCreateDialog.value = false
  editingTheme.value = null
}
</script>

<style scoped>
.theme-selector {
  width: 100%;
}

.theme-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #ffffff;
}

.theme-item:hover {
  border-color: #93c5fd;
  background-color: #eff6ff;
}

.dark .theme-item {
  border-color: #374151;
  background-color: #1f2937;
}

.dark .theme-item:hover {
  border-color: #2563eb;
  background-color: rgba(30, 58, 138, 0.2);
}

.theme-item--active {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.dark .theme-item--active {
  background-color: rgba(30, 58, 138, 0.3);
}

.theme-preview {
  display: flex;
  gap: 0.25rem;
  margin-right: 0.75rem;
}

.preview-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
}

.dark .preview-color {
  border-color: #4b5563;
}

.theme-info {
  flex: 1;
}

.theme-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
}

.dark .theme-name {
  color: #ffffff;
}

.theme-type {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.theme-actions {
  display: flex;
  gap: 0.25rem;
}
</style>