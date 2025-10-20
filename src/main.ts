/**
 * TyporaMin 应用入口文件
 * 
 * 功能：
 * - 初始化Vue3应用
 * - 配置路由和状态管理
 * - 注册全局组件和插件
 * 
 * 依赖：
 * - Vue3核心库
 * - Vue Router路由管理
 * - Pinia状态管理
 * - Element Plus UI组件库
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './main.css'

import App from './App.vue'
import router from './router'
import { useAppStore } from './stores/app'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化应用
const appStore = useAppStore()
appStore.initializeApp().catch(console.error)

app.mount('#app')