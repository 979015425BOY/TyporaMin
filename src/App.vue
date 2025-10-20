<!--
  TyporaMin 主应用组件
  
  功能：
  - 应用主布局容器
  - 路由视图渲染
  - 全局样式和主题管理
  
  使用场景：
  - 应用根组件，承载所有页面内容
-->

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'

/**
 * 应用初始化逻辑
 * 
 * 功能：
 * - 加载用户设置
 * - 初始化主题
 * - 恢复上次会话状态
 */
const appStore = useAppStore()

onMounted(() => {
  // 初始化应用设置
  appStore.initializeApp()
})
</script>

<style scoped>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>