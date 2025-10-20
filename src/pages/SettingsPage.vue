<!--
  设置页面组件
  功能：应用设置管理、主题配置、编辑器偏好设置
  依赖：Element Plus、主题Store、应用Store
  使用场景：用户个性化配置、系统设置管理
-->

<template>
  <div class="settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="flex items-center space-x-4">
        <el-button 
          :icon="ArrowLeft" 
          circle 
          @click="$router.back()"
        />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          设置
        </h1>
      </div>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <div class="settings-layout">
        <!-- 侧边栏导航 -->
        <div class="settings-sidebar">
          <el-menu
            :default-active="activeTab"
            mode="vertical"
            @select="handleTabChange"
            class="settings-menu"
          >
            <el-menu-item index="appearance">
              <el-icon><Setting /></el-icon>
              <span>外观主题</span>
            </el-menu-item>
            <el-menu-item index="editor">
              <el-icon><Edit /></el-icon>
              <span>编辑器</span>
            </el-menu-item>
            <el-menu-item index="files">
              <el-icon><Folder /></el-icon>
              <span>文件管理</span>
            </el-menu-item>
            <el-menu-item index="shortcuts">
              <el-icon><Setting /></el-icon>
              <span>快捷键</span>
            </el-menu-item>
            <el-menu-item index="about">
              <el-icon><InfoFilled /></el-icon>
              <span>关于</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 设置面板 -->
        <div class="settings-panel">
          <!-- 外观主题设置 -->
          <div v-show="activeTab === 'appearance'" class="setting-section">
            <div class="section-header">
              <h2 class="section-title">外观主题</h2>
              <p class="section-description">
                自定义应用的外观和主题设置
              </p>
            </div>
            
            <div class="section-content">
              <theme-selector />
            </div>
          </div>

          <!-- 编辑器设置 -->
          <div v-show="activeTab === 'editor'" class="setting-section">
            <div class="section-header">
              <h2 class="section-title">编辑器设置</h2>
              <p class="section-description">
                配置编辑器的行为和显示选项
              </p>
            </div>
            
            <div class="section-content">
              <el-form :model="editorSettings" label-width="120px">
                <el-form-item label="字体大小">
                  <el-slider
                    v-model="editorSettings.fontSize"
                    :min="12"
                    :max="24"
                    :step="1"
                    show-input
                    :format-tooltip="(val) => `${val}px`"
                  />
                </el-form-item>
                
                <el-form-item label="字体族">
                  <el-select v-model="editorSettings.fontFamily" style="width: 100%">
                    <el-option label="系统默认" value="system-ui" />
                    <el-option label="Monaco" value="Monaco" />
                    <el-option label="Consolas" value="Consolas" />
                    <el-option label="Source Code Pro" value="'Source Code Pro'" />
                    <el-option label="JetBrains Mono" value="'JetBrains Mono'" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="行高">
                  <el-slider
                    v-model="editorSettings.lineHeight"
                    :min="1.2"
                    :max="2.0"
                    :step="0.1"
                    show-input
                  />
                </el-form-item>
                
                <el-form-item label="自动换行">
                  <el-switch v-model="editorSettings.wordWrap" />
                </el-form-item>
                
                <el-form-item label="显示行号">
                  <el-switch v-model="editorSettings.showLineNumbers" />
                </el-form-item>
                
                <el-form-item label="自动保存">
                  <el-switch v-model="editorSettings.autoSave" />
                </el-form-item>
                
                <el-form-item 
                  v-if="editorSettings.autoSave"
                  label="保存间隔"
                >
                  <el-input-number
                    v-model="editorSettings.autoSaveInterval"
                    :min="5"
                    :max="300"
                    :step="5"
                    controls-position="right"
                  />
                  <span class="ml-2 text-sm text-gray-500">秒</span>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 文件管理设置 -->
          <div v-show="activeTab === 'files'" class="setting-section">
            <div class="section-header">
              <h2 class="section-title">文件管理</h2>
              <p class="section-description">
                配置文件操作和历史记录选项
              </p>
            </div>
            
            <div class="section-content">
              <el-form :model="fileSettings" label-width="120px">
                <el-form-item label="最近文件数量">
                  <el-input-number
                    v-model="fileSettings.maxRecentFiles"
                    :min="5"
                    :max="50"
                    :step="5"
                    controls-position="right"
                  />
                </el-form-item>
                
                <el-form-item label="自动清理">
                  <el-switch v-model="fileSettings.autoCleanup" />
                </el-form-item>
                
                <el-form-item label="默认编码">
                  <el-select v-model="fileSettings.defaultEncoding" style="width: 100%">
                    <el-option label="UTF-8" value="utf-8" />
                    <el-option label="GBK" value="gbk" />
                    <el-option label="UTF-16" value="utf-16" />
                  </el-select>
                </el-form-item>
              </el-form>
              
              <div class="mt-6">
                <el-button 
                  type="danger" 
                  @click="clearRecentFiles"
                  :loading="isClearing"
                >
                  清空最近文件
                </el-button>
              </div>
            </div>
          </div>

          <!-- 快捷键设置 -->
          <div v-show="activeTab === 'shortcuts'" class="setting-section">
            <div class="section-header">
              <h2 class="section-title">快捷键</h2>
              <p class="section-description">
                查看和自定义键盘快捷键
              </p>
            </div>
            
            <div class="section-content">
              <div class="shortcuts-list">
                <div 
                  v-for="shortcut in shortcuts"
                  :key="shortcut.action"
                  class="shortcut-item"
                >
                  <div class="shortcut-info">
                    <div class="shortcut-name">{{ shortcut.name }}</div>
                    <div class="shortcut-description">{{ shortcut.description }}</div>
                  </div>
                  <div class="shortcut-keys">
                    <el-tag
                      v-for="key in shortcut.keys"
                      :key="key"
                      size="small"
                      class="shortcut-key"
                    >
                      {{ key }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 关于页面 -->
          <div v-show="activeTab === 'about'" class="setting-section">
            <div class="section-header">
              <h2 class="section-title">关于 TyporaMin</h2>
              <p class="section-description">
                应用信息和版本详情
              </p>
            </div>
            
            <div class="section-content">
              <div class="about-info">
                <div class="app-logo">
                  <el-icon :size="64" class="text-blue-500">
                    <Document />
                  </el-icon>
                </div>
                
                <div class="app-details">
                  <h3 class="app-name">TyporaMin</h3>
                  <p class="app-version">版本 1.0.0</p>
                  <p class="app-description">
                    一个简洁、高效的 Markdown 编辑器，专注于写作体验。
                  </p>
                  
                  <div class="app-links">
                    <el-button type="primary" link>
                      <el-icon><Link /></el-icon>
                      官方网站
                    </el-button>
                    <el-button type="primary" link>
                      <el-icon><Document /></el-icon>
                      使用文档
                    </el-button>
                    <el-button type="primary" link>
                      <el-icon><ChatDotRound /></el-icon>
                      反馈建议
                    </el-button>
                  </div>
                </div>
              </div>
              
              <div class="tech-info">
                <h4 class="tech-title">技术栈</h4>
                <div class="tech-list">
                  <el-tag>Vue 3</el-tag>
                  <el-tag>TypeScript</el-tag>
                  <el-tag>Vite</el-tag>
                  <el-tag>Element Plus</el-tag>
                  <el-tag>Tailwind CSS</el-tag>
                  <el-tag>CodeMirror 6</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Setting,
  Edit,
  Folder,
  InfoFilled,
  Document,
  Link,
  ChatDotRound
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'
import ThemeSelector from '@/components/ThemeSelector.vue'

// Stores
const appStore = useAppStore()
const themeStore = useThemeStore()

// 响应式状态
const activeTab = ref('appearance')
const isClearing = ref(false)

// 编辑器设置
const editorSettings = reactive({
  fontSize: 16,
  fontFamily: 'system-ui',
  lineHeight: 1.6,
  wordWrap: true,
  showLineNumbers: false,
  autoSave: true,
  autoSaveInterval: 30
})

// 文件设置
const fileSettings = reactive({
  maxRecentFiles: 20,
  autoCleanup: true,
  defaultEncoding: 'utf-8'
})

// 快捷键列表
const shortcuts = ref([
  {
    action: 'new-file',
    name: '新建文件',
    description: '创建一个新的 Markdown 文档',
    keys: ['Ctrl', 'N']
  },
  {
    action: 'open-file',
    name: '打开文件',
    description: '打开本地 Markdown 文件',
    keys: ['Ctrl', 'O']
  },
  {
    action: 'save-file',
    name: '保存文件',
    description: '保存当前文档',
    keys: ['Ctrl', 'S']
  },
  {
    action: 'save-as',
    name: '另存为',
    description: '将文档保存到新位置',
    keys: ['Ctrl', 'Shift', 'S']
  },
  {
    action: 'toggle-theme',
    name: '切换主题',
    description: '在明暗主题间切换',
    keys: ['Ctrl', 'T']
  },
  {
    action: 'toggle-preview',
    name: '切换预览',
    description: '显示/隐藏预览面板',
    keys: ['Ctrl', 'P']
  },
  {
    action: 'find',
    name: '查找',
    description: '在文档中查找文本',
    keys: ['Ctrl', 'F']
  },
  {
    action: 'replace',
    name: '替换',
    description: '查找并替换文本',
    keys: ['Ctrl', 'H']
  }
])

/**
 * 处理标签页切换
 * @param key 标签页键名
 */
const handleTabChange = (key: string) => {
  activeTab.value = key
}

/**
 * 清空最近文件
 */
const clearRecentFiles = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有最近文件记录吗？此操作不可撤销。',
      '确认清空',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    isClearing.value = true
    
    // 清空最近文件列表
    appStore.recentFiles.splice(0)
    await appStore.saveSettings()
    
    ElMessage.success('最近文件已清空')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败')
    }
  } finally {
    isClearing.value = false
  }
}

/**
 * 保存设置
 */
const saveSettings = async () => {
  try {
    // 更新应用设置
    const updatedSettings = {
      ...appStore.settings,
      fontSize: editorSettings.fontSize,
      fontFamily: editorSettings.fontFamily,
      lineHeight: editorSettings.lineHeight,
      wordWrap: editorSettings.wordWrap,
      showLineNumbers: editorSettings.showLineNumbers,
      autoSave: editorSettings.autoSave,
      autoSaveInterval: editorSettings.autoSaveInterval * 1000 // 转换为毫秒
    }
    
    await appStore.updateSettings(updatedSettings)
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存设置失败')
  }
}

// 组件挂载时加载设置
onMounted(() => {
  // 从 store 加载当前设置
  const settings = appStore.settings
  editorSettings.fontSize = settings.fontSize
  editorSettings.fontFamily = settings.fontFamily
  editorSettings.lineHeight = settings.lineHeight
  editorSettings.wordWrap = settings.wordWrap
  editorSettings.showLineNumbers = settings.showLineNumbers
  editorSettings.autoSave = settings.autoSave
  editorSettings.autoSaveInterval = Math.floor(settings.autoSaveInterval / 1000) // 转换为秒
})

// 监听设置变化，自动保存
// watch([editorSettings, fileSettings], saveSettings, { deep: true })
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.dark .settings-page {
  background-color: #111827;
}

.page-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
}

.dark .page-header {
  background-color: #1f2937;
  border-bottom-color: #374151;
}

.settings-content {
  flex: 1;
}

.settings-layout {
  display: flex;
  max-width: 80rem;
  margin: 0 auto;
}

.settings-sidebar {
  width: 16rem;
  background-color: #ffffff;
  border-right: 1px solid #e5e7eb;
  min-height: calc(100vh - 73px);
}

.dark .settings-sidebar {
  background-color: #1f2937;
  border-right-color: #374151;
}

.settings-menu {
  border: none;
}

.settings-panel {
  flex: 1;
  padding: 1.5rem;
}

.setting-section {
  max-width: 56rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.dark .section-title {
  color: #ffffff;
}

.section-description {
  color: #4b5563;
}

.dark .section-description {
  color: #9ca3af;
}

.section-content {
  background-color: #ffffff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  max-height: 60vh;
  overflow-y: auto;
}

.dark .section-content {
  background-color: #1f2937;
  border-color: #374151;
}

.shortcuts-list > * + * {
  margin-top: 1rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.dark .shortcut-item {
  background-color: #374151;
}

.shortcut-info {
  flex: 1;
}

.shortcut-name {
  font-weight: 500;
  color: #111827;
}

.dark .shortcut-name {
  color: #ffffff;
}

.shortcut-description {
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 0.25rem;
}

.dark .shortcut-description {
  color: #9ca3af;
}

.shortcut-keys {
  display: flex;
  gap: 0.25rem;
}

.shortcut-key {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

.about-info {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.app-logo {
  flex-shrink: 0;
}

.app-details {
  flex: 1;
}

.app-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.dark .app-name {
  color: #ffffff;
}

.app-version {
  color: #4b5563;
  margin-bottom: 1rem;
}

.dark .app-version {
  color: #9ca3af;
}

.app-description {
  color: #374151;
  margin-bottom: 1.5rem;
}

.dark .app-description {
  color: #d1d5db;
}

.app-links {
  display: flex;
  gap: 1rem;
}

.tech-info {
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.dark .tech-info {
  border-top-color: #374151;
}

.tech-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.dark .tech-title {
  color: #ffffff;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>