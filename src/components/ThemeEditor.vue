<!--
  主题编辑器组件
  功能：创建和编辑自定义主题、颜色选择、实时预览
  依赖：Element Plus、颜色选择器
  使用场景：主题创建对话框、主题编辑界面
-->

<template>
  <div class="theme-editor">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <!-- 基础信息 -->
      <div class="section">
        <h4 class="section-title">基础信息</h4>
        
        <el-form-item label="主题名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入主题名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="主题类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio value="light">浅色主题</el-radio>
            <el-radio value="dark">深色主题</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <!-- 颜色配置 -->
      <div class="section">
        <h4 class="section-title">颜色配置</h4>
        
        <div class="color-grid">
          <el-form-item
            v-for="(colorInfo, key) in colorConfig"
            :key="key"
            :label="colorInfo.label"
            :prop="`cssVariables.${key}`"
            class="color-item"
          >
            <div class="color-input-group">
              <el-color-picker
                v-model="formData.cssVariables[key]"
                :predefine="colorInfo.presets"
                show-alpha
                size="small"
              />
              <el-input
                v-model="formData.cssVariables[key]"
                placeholder="#000000"
                class="color-text-input"
                size="small"
              />
            </div>
            <div class="color-description">
              {{ colorInfo.description }}
            </div>
          </el-form-item>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="section">
        <h4 class="section-title">主题预览</h4>
        
        <div 
          class="theme-preview-container"
          :style="previewStyles"
        >
          <div class="preview-header">
            <div class="preview-title">TyporaMin</div>
            <div class="preview-buttons">
              <div class="preview-button primary">主要按钮</div>
              <div class="preview-button secondary">次要按钮</div>
            </div>
          </div>
          
          <div class="preview-content">
            <div class="preview-sidebar">
              <div class="preview-menu-item active">文件管理</div>
              <div class="preview-menu-item">最近文件</div>
              <div class="preview-menu-item">设置</div>
            </div>
            
            <div class="preview-main">
              <div class="preview-editor">
                <div class="preview-text primary">这是主要文本颜色</div>
                <div class="preview-text muted">这是次要文本颜色</div>
                <div class="preview-border"></div>
              </div>
            </div>
          </div>
          
          <div class="preview-status">
            <div class="status-item success">成功状态</div>
            <div class="status-item warning">警告状态</div>
            <div class="status-item error">错误状态</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="handleCancel">
          取消
        </el-button>
        <el-button @click="handleReset" :disabled="isLoading">
          重置
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="isLoading"
        >
          {{ isEdit ? '更新主题' : '创建主题' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Theme } from '@/stores/theme'

/**
 * 组件属性定义
 */
interface Props {
  theme?: Partial<Theme> | null
}

/**
 * 组件事件定义
 */
interface Emits {
  (e: 'save', theme: Omit<Theme, 'id' | 'isBuiltIn'>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 响应式状态
const isLoading = ref(false)

// 是否为编辑模式
const isEdit = computed(() => !!props.theme?.id)

// 颜色配置定义
const colorConfig = {
  primaryColor: {
    label: '主色调',
    description: '按钮、链接等主要元素的颜色',
    presets: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  },
  backgroundColor: {
    label: '背景色',
    description: '页面主背景颜色',
    presets: ['#ffffff', '#f9fafb', '#111827', '#1f2937', '#0f172a']
  },
  textColor: {
    label: '文本色',
    description: '主要文本内容颜色',
    presets: ['#1f2937', '#374151', '#f9fafb', '#e5e7eb', '#9ca3af']
  },
  borderColor: {
    label: '边框色',
    description: '边框和分割线颜色',
    presets: ['#e5e7eb', '#d1d5db', '#374151', '#4b5563', '#6b7280']
  },
  accentColor: {
    label: '强调色',
    description: '卡片、面板等区域背景色',
    presets: ['#f3f4f6', '#f9fafb', '#1f2937', '#374151', '#111827']
  },
  surfaceColor: {
    label: '表面色',
    description: '浮动元素如对话框背景色',
    presets: ['#ffffff', '#f9fafb', '#1f2937', '#111827', '#0f172a']
  },
  mutedColor: {
    label: '次要文本',
    description: '辅助信息和次要文本颜色',
    presets: ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6']
  },
  successColor: {
    label: '成功色',
    description: '成功状态提示颜色',
    presets: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
  },
  warningColor: {
    label: '警告色',
    description: '警告状态提示颜色',
    presets: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']
  },
  errorColor: {
    label: '错误色',
    description: '错误状态提示颜色',
    presets: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']
  }
}

// 表单数据
const formData = ref<{
  name: string
  type: 'light' | 'dark'
  cssVariables: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    borderColor: string
    accentColor: string
    surfaceColor: string
    mutedColor: string
    successColor: string
    warningColor: string
    errorColor: string
  }
}>({
  name: '',
  type: 'light',
  cssVariables: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#e5e7eb',
    accentColor: '#f3f4f6',
    surfaceColor: '#f9fafb',
    mutedColor: '#6b7280',
    successColor: '#10b981',
    warningColor: '#f59e0b',
    errorColor: '#ef4444'
  }
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入主题名称', trigger: 'blur' },
    { min: 2, max: 50, message: '主题名称长度应在 2-50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择主题类型', trigger: 'change' }
  ]
}

// 预览样式
const previewStyles = computed(() => ({
  '--preview-primary': formData.value.cssVariables.primaryColor,
  '--preview-background': formData.value.cssVariables.backgroundColor,
  '--preview-text': formData.value.cssVariables.textColor,
  '--preview-border': formData.value.cssVariables.borderColor,
  '--preview-accent': formData.value.cssVariables.accentColor,
  '--preview-surface': formData.value.cssVariables.surfaceColor,
  '--preview-muted': formData.value.cssVariables.mutedColor,
  '--preview-success': formData.value.cssVariables.successColor,
  '--preview-warning': formData.value.cssVariables.warningColor,
  '--preview-error': formData.value.cssVariables.errorColor
}))

/**
 * 初始化表单数据
 */
const initFormData = () => {
  if (props.theme) {
    formData.value = {
      name: props.theme.name || '',
      type: props.theme.type || 'light',
      cssVariables: { ...formData.value.cssVariables, ...props.theme.cssVariables }
    }
  }
}

/**
 * 处理提交
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    isLoading.value = true

    const themeData: Theme = {
      id: Date.now().toString(),
      name: formData.value.name,
      type: formData.value.type,
      isBuiltIn: false,
      cssVariables: { ...formData.value.cssVariables }
    }

    emit('save', themeData)
  } catch (error) {
    ElMessage.error('请检查表单输入')
  } finally {
    isLoading.value = false
  }
}

/**
 * 处理取消
 */
const handleCancel = () => {
  emit('cancel')
}

/**
 * 重置表单
 */
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  initFormData()
}

// 监听主题变化，自动切换默认颜色
watch(
  () => formData.value.type,
  (newType) => {
    if (newType === 'dark') {
      // 切换到深色主题默认颜色
      Object.assign(formData.value.cssVariables, {
        backgroundColor: '#111827',
        textColor: '#f9fafb',
        borderColor: '#374151',
        accentColor: '#1f2937',
        surfaceColor: '#1f2937',
        mutedColor: '#9ca3af'
      })
    } else {
      // 切换到浅色主题默认颜色
      Object.assign(formData.value.cssVariables, {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderColor: '#e5e7eb',
        accentColor: '#f3f4f6',
        surfaceColor: '#f9fafb',
        mutedColor: '#6b7280'
      })
    }
  }
)

// 组件挂载时初始化
onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.theme-editor {
  max-width: 56rem;
  margin: 0 auto;
}

.section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.section:last-child {
  border-bottom: none;
}

.dark .section {
  border-bottom-color: #374151;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.dark .section-title {
  color: #ffffff;
}

.color-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .color-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.color-item {
  margin-bottom: 0;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-text-input {
  flex: 1;
}

.color-description {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.dark .color-description {
  color: #9ca3af;
}

.theme-preview-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: var(--preview-background);
  color: var(--preview-text);
}

.dark .theme-preview-container {
  border-color: #374151;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid;
  border-color: var(--preview-border);
}

.preview-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--preview-text);
}

.preview-buttons {
  display: flex;
  gap: 0.5rem;
}

.preview-button {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.preview-button.primary {
  background-color: var(--preview-primary);
  color: white;
}

.preview-button.secondary {
  background-color: var(--preview-accent);
  color: var(--preview-text);
  border: 1px solid var(--preview-border);
}

.preview-content {
  display: flex;
  min-height: 8rem;
}

.preview-sidebar {
  width: 12rem;
  padding: 1rem;
  border-right: 1px solid;
  background-color: var(--preview-accent);
  border-color: var(--preview-border);
}

.preview-menu-item {
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  color: var(--preview-muted);
}

.preview-menu-item.active {
  background-color: var(--preview-primary);
  color: white;
}

.preview-main {
  flex: 1;
  padding: 1rem;
}

.preview-editor > * + * {
  margin-top: 0.5rem;
}

.preview-text.primary {
  color: var(--preview-text);
}

.preview-text.muted {
  color: var(--preview-muted);
}

.preview-border {
  height: 1px;
  background-color: var(--preview-border);
}

.preview-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid;
  border-color: var(--preview-border);
}

.status-item {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-item.success {
  background-color: var(--preview-success);
  color: white;
}

.status-item.warning {
  background-color: var(--preview-warning);
  color: white;
}

.status-item.error {
  background-color: var(--preview-error);
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.dark .form-actions {
  border-top-color: #374151;
}
</style>