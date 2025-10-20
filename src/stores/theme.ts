/**
 * 主题管理Store
 * 功能：管理应用主题状态、自定义主题、CSS变量配置
 * 依赖：Pinia状态管理、本地存储API
 * 使用场景：全局主题切换、自定义主题创建、主题持久化
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

/**
 * 主题类型定义
 */
export interface Theme {
  id: string
  name: string
  type: 'light' | 'dark'
  isBuiltIn: boolean
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
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  currentThemeId: string
  customThemes: Theme[]
  autoSwitchTheme: boolean
  followSystemTheme: boolean
}

/**
 * 内置主题定义
 */
const BUILT_IN_THEMES: Theme[] = [
  {
    id: 'default-light',
    name: '默认浅色',
    type: 'light',
    isBuiltIn: true,
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
  },
  {
    id: 'default-dark',
    name: '默认深色',
    type: 'dark',
    isBuiltIn: true,
    cssVariables: {
      primaryColor: '#60a5fa',
      backgroundColor: '#111827',
      textColor: '#f9fafb',
      borderColor: '#374151',
      accentColor: '#1f2937',
      surfaceColor: '#1f2937',
      mutedColor: '#9ca3af',
      successColor: '#34d399',
      warningColor: '#fbbf24',
      errorColor: '#f87171'
    }
  },
  {
    id: 'github-light',
    name: 'GitHub 浅色',
    type: 'light',
    isBuiltIn: true,
    cssVariables: {
      primaryColor: '#0969da',
      backgroundColor: '#ffffff',
      textColor: '#24292f',
      borderColor: '#d0d7de',
      accentColor: '#f6f8fa',
      surfaceColor: '#f6f8fa',
      mutedColor: '#656d76',
      successColor: '#1a7f37',
      warningColor: '#9a6700',
      errorColor: '#cf222e'
    }
  },
  {
    id: 'github-dark',
    name: 'GitHub 深色',
    type: 'dark',
    isBuiltIn: true,
    cssVariables: {
      primaryColor: '#58a6ff',
      backgroundColor: '#0d1117',
      textColor: '#f0f6fc',
      borderColor: '#30363d',
      accentColor: '#21262d',
      surfaceColor: '#161b22',
      mutedColor: '#8b949e',
      successColor: '#3fb950',
      warningColor: '#d29922',
      errorColor: '#f85149'
    }
  }
]

/**
 * 本地存储键名
 */
const STORAGE_KEY = 'typoraMin_theme_config'

/**
 * 主题管理Store
 */
export const useThemeStore = defineStore('theme', () => {
  // 响应式状态
  const config = ref<ThemeConfig>({
    currentThemeId: 'default-light',
    customThemes: [],
    autoSwitchTheme: false,
    followSystemTheme: true
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const allThemes = computed(() => [...BUILT_IN_THEMES, ...config.value.customThemes])
  
  const currentTheme = computed(() => 
    allThemes.value.find(theme => theme.id === config.value.currentThemeId) || BUILT_IN_THEMES[0]
  )

  const isDarkMode = computed(() => currentTheme.value.type === 'dark')

  const lightThemes = computed(() => allThemes.value.filter(theme => theme.type === 'light'))
  
  const darkThemes = computed(() => allThemes.value.filter(theme => theme.type === 'dark'))

  /**
   * 应用CSS变量到文档根元素
   * @param theme 要应用的主题
   */
  const applyCSSVariables = (theme: Theme) => {
    const root = document.documentElement
    const { cssVariables } = theme

    // 应用CSS变量
    root.style.setProperty('--color-primary', cssVariables.primaryColor)
    root.style.setProperty('--color-background', cssVariables.backgroundColor)
    root.style.setProperty('--color-text', cssVariables.textColor)
    root.style.setProperty('--color-border', cssVariables.borderColor)
    root.style.setProperty('--color-accent', cssVariables.accentColor)
    root.style.setProperty('--color-surface', cssVariables.surfaceColor)
    root.style.setProperty('--color-muted', cssVariables.mutedColor)
    root.style.setProperty('--color-success', cssVariables.successColor)
    root.style.setProperty('--color-warning', cssVariables.warningColor)
    root.style.setProperty('--color-error', cssVariables.errorColor)

    // 设置主题类型类名
    root.classList.remove('light', 'dark')
    root.classList.add(theme.type)
  }

  /**
   * 切换主题
   * @param themeId 主题ID
   */
  const switchTheme = async (themeId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const theme = allThemes.value.find(t => t.id === themeId)
      if (!theme) {
        throw new Error(`主题 ${themeId} 不存在`)
      }

      config.value.currentThemeId = themeId
      applyCSSVariables(theme)
      
      // 保存到本地存储
      await saveConfig()
      
      console.log(`主题已切换到: ${theme.name}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '切换主题失败'
      console.error('切换主题失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 切换明暗模式
   */
  const toggleDarkMode = async () => {
    const targetType = isDarkMode.value ? 'light' : 'dark'
    const targetThemes = targetType === 'light' ? lightThemes.value : darkThemes.value
    
    if (targetThemes.length > 0) {
      await switchTheme(targetThemes[0].id)
    }
  }

  /**
   * 创建自定义主题
   * @param theme 主题配置
   */
  const createCustomTheme = async (theme: Omit<Theme, 'id' | 'isBuiltIn'>) => {
    try {
      isLoading.value = true
      error.value = null

      const newTheme: Theme = {
        ...theme,
        id: `custom-${Date.now()}`,
        isBuiltIn: false
      }

      config.value.customThemes.push(newTheme)
      await saveConfig()
      
      console.log(`自定义主题已创建: ${newTheme.name}`)
      return newTheme
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建主题失败'
      console.error('创建主题失败:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 删除自定义主题
   * @param themeId 主题ID
   */
  const deleteCustomTheme = async (themeId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const themeIndex = config.value.customThemes.findIndex(t => t.id === themeId)
      if (themeIndex === -1) {
        throw new Error('主题不存在')
      }

      const theme = config.value.customThemes[themeIndex]
      if (theme.isBuiltIn) {
        throw new Error('不能删除内置主题')
      }

      config.value.customThemes.splice(themeIndex, 1)

      // 如果删除的是当前主题，切换到默认主题
      if (config.value.currentThemeId === themeId) {
        await switchTheme('default-light')
      }

      await saveConfig()
      console.log(`主题已删除: ${theme.name}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除主题失败'
      console.error('删除主题失败:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 检测系统主题偏好
   */
  const detectSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  /**
   * 跟随系统主题
   */
  const followSystemTheme = () => {
    if (!config.value.followSystemTheme) return

    const systemTheme = detectSystemTheme()
    const targetThemes = systemTheme === 'dark' ? darkThemes.value : lightThemes.value
    
    if (targetThemes.length > 0 && currentTheme.value.type !== systemTheme) {
      switchTheme(targetThemes[0].id)
    }
  }

  /**
   * 保存配置到本地存储
   */
  const saveConfig = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
    } catch (err) {
      console.error('保存主题配置失败:', err)
      throw new Error('保存主题配置失败')
    }
  }

  /**
   * 从本地存储加载配置
   */
  const loadConfig = async () => {
    try {
      isLoading.value = true
      error.value = null

      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const savedConfig = JSON.parse(saved) as ThemeConfig
        config.value = { ...config.value, ...savedConfig }
      }

      // 应用当前主题
      applyCSSVariables(currentTheme.value)

      // 设置系统主题监听
      if (typeof window !== 'undefined' && window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', followSystemTheme)
      }

      // 初始检查系统主题
      followSystemTheme()

      console.log('主题配置已加载')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载主题配置失败'
      console.error('加载主题配置失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 重置为默认配置
   */
  const resetConfig = async () => {
    try {
      isLoading.value = true
      error.value = null

      config.value = {
        currentThemeId: 'default-light',
        customThemes: [],
        autoSwitchTheme: false,
        followSystemTheme: true
      }

      await saveConfig()
      applyCSSVariables(currentTheme.value)
      
      console.log('主题配置已重置')
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重置配置失败'
      console.error('重置配置失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 监听配置变化，自动保存
  watch(
    () => config.value,
    () => {
      saveConfig().catch(console.error)
    },
    { deep: true }
  )

  return {
    // 状态
    config,
    isLoading,
    error,
    
    // 计算属性
    allThemes,
    currentTheme,
    isDarkMode,
    lightThemes,
    darkThemes,
    
    // 方法
    switchTheme,
    toggleDarkMode,
    createCustomTheme,
    deleteCustomTheme,
    detectSystemTheme,
    followSystemTheme,
    loadConfig,
    resetConfig,
    saveConfig
  }
})