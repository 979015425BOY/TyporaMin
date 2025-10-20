<!--
  关于页面组件
  
  功能：
  - 应用信息展示
  - 版本信息
  - 技术栈介绍
  - 开发者信息
  
  使用场景：
  - 应用介绍页面
  - 版本信息查看
-->

<template>
  <div class="about-view min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <!-- 导航栏 -->
    <nav class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center h-16">
          <el-button 
            circle 
            @click="$router.back()"
            :icon="ArrowLeft"
            title="返回"
          />
          <h1 class="ml-4 text-xl font-semibold text-gray-900 dark:text-white">关于 TyporaMin</h1>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="space-y-8">
        
        <!-- 应用介绍 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span class="text-white font-bold text-4xl">T</span>
          </div>
          
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">TyporaMin</h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            一个简洁、高效的 Markdown 编辑器，专为写作而生。
            提供流畅的编辑体验、实时预览和丰富的功能特性。
          </p>
          
          <div class="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>版本 1.0.0</span>
            <span>•</span>
            <span>2024年发布</span>
          </div>
        </div>

        <!-- 功能特性 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">功能特性</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="text-center p-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <el-icon :size="24" class="text-blue-600 dark:text-blue-400">
                  <Edit />
                </el-icon>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">实时编辑</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">基于 CodeMirror 6 的强大编辑器，支持语法高亮和智能补全</p>
            </div>
            
            <div class="text-center p-4">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <el-icon :size="24" class="text-green-600 dark:text-green-400">
                  <View />
                </el-icon>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">实时预览</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">所见即所得的预览模式，支持分屏显示和全屏预览</p>
            </div>
            
            <div class="text-center p-4">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <el-icon :size="24" class="text-purple-600 dark:text-purple-400">
                  <Brush />
                </el-icon>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">主题切换</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">支持浅色、深色和自动主题，提供舒适的视觉体验</p>
            </div>
            
            <div class="text-center p-4">
              <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <el-icon :size="24" class="text-orange-600 dark:text-orange-400">
                  <Timer />
                </el-icon>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">自动保存</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">智能自动保存功能，永不丢失您的创作内容</p>
            </div>
            
            <div class="text-center p-4">
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <el-icon :size="24" class="text-red-600 dark:text-red-400">
                  <Download />
                </el-icon>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">多格式导出</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">支持导出为 Markdown、HTML、纯文本等多种格式</p>
            </div>
            
            <div class="text-center p-4">
              <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <el-icon :size="24" class="text-indigo-600 dark:text-indigo-400">
                  <Setting />
                </el-icon>
              </div>
              <h4 class="font-semibold text-gray-900 dark:text-white mb-2">个性化设置</h4>
              <p class="text-sm text-gray-600 dark:text-gray-300">丰富的个性化选项，打造专属的写作环境</p>
            </div>
          </div>
        </div>

        <!-- 技术栈 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">技术栈</h3>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2"></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Vue 3</span>
            </div>
            
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2"></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">TypeScript</span>
            </div>
            
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="w-8 h-8 bg-purple-500 rounded-lg mx-auto mb-2"></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">CodeMirror 6</span>
            </div>
            
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="w-8 h-8 bg-orange-500 rounded-lg mx-auto mb-2"></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Vite</span>
            </div>
            
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="w-8 h-8 bg-cyan-500 rounded-lg mx-auto mb-2"></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Tailwind CSS</span>
            </div>
            
            <div class="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="w-8 h-8 bg-indigo-500 rounded-lg mx-auto mb-2"></div>
              <span class="text-sm font-medium text-gray-900 dark:text-white">Element Plus</span>
            </div>
          </div>
        </div>

        <!-- 开发信息 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">开发信息</h3>
          
          <div class="max-w-2xl mx-auto space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">版本</span>
              <span class="font-medium text-gray-900 dark:text-white">1.0.0</span>
            </div>
            
            <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">发布日期</span>
              <span class="font-medium text-gray-900 dark:text-white">2024年1月</span>
            </div>
            
            <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">许可证</span>
              <span class="font-medium text-gray-900 dark:text-white">MIT License</span>
            </div>
            
            <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-400">构建工具</span>
              <span class="font-medium text-gray-900 dark:text-white">Vite 5.x</span>
            </div>
            
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-600 dark:text-gray-400">运行环境</span>
              <span class="font-medium text-gray-900 dark:text-white">现代浏览器</span>
            </div>
          </div>
        </div>

        <!-- 致谢 -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">致谢</h3>
          <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            感谢所有开源项目的贡献者，特别是 Vue.js、CodeMirror、Element Plus 等项目团队，
            让我们能够构建出这样一个优秀的 Markdown 编辑器。
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { 
  ArrowLeft, 
  Edit, 
  View, 
  Brush, 
  Timer, 
  Download, 
  Setting 
} from '@element-plus/icons-vue'

/**
 * 关于页面逻辑
 * 
 * 功能：
 * - 展示应用信息
 * - 显示技术栈
 * - 提供版本信息
 */
</script>

<style scoped>
.about-view {
  min-height: 100vh;
}
</style>