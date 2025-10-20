<!--
  404页面组件
  
  功能：
  - 404错误页面展示
  - 友好的错误提示
  - 导航返回功能
  
  使用场景：
  - 路由不匹配时显示
  - 用户访问不存在页面
-->

<template>
  <div class="not-found-view min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div class="text-center max-w-md mx-auto px-4">
      <!-- 404图标 -->
      <div class="mb-8">
        <div class="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <span class="text-white font-bold text-6xl">?</span>
        </div>
      </div>
      
      <!-- 错误信息 -->
      <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">页面未找到</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
        抱歉，您访问的页面不存在或已被移动。
        请检查URL是否正确，或返回首页继续浏览。
      </p>
      
      <!-- 操作按钮 -->
      <div class="space-y-4">
        <el-button 
          type="primary" 
          size="large"
          @click="$router.push('/')"
          :icon="House"
        >
          返回首页
        </el-button>
        
        <div class="flex justify-center space-x-4">
          <el-button 
            @click="$router.back()"
            :icon="ArrowLeft"
          >
            返回上页
          </el-button>
          
          <el-button 
            @click="$router.push('/editor')"
            :icon="Edit"
          >
            新建文档
          </el-button>
        </div>
      </div>
      
      <!-- 建议链接 -->
      <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">您可能想要访问：</p>
        <div class="flex flex-wrap justify-center gap-2">
          <router-link 
            to="/" 
            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline"
          >
            首页
          </router-link>
          <span class="text-gray-400">•</span>
          <router-link 
            to="/editor" 
            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline"
          >
            编辑器
          </router-link>
          <span class="text-gray-400">•</span>
          <router-link 
            to="/settings" 
            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline"
          >
            设置
          </router-link>
          <span class="text-gray-400">•</span>
          <router-link 
            to="/about" 
            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline"
          >
            关于
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { House, ArrowLeft, Edit } from '@element-plus/icons-vue'

/**
 * 404页面逻辑
 * 
 * 功能：
 * - 友好的错误提示
 * - 导航功能
 * - 建议链接
 */
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
}
</style>