/**
 * Vue Router 路由配置
 * 
 * 功能：
 * - 定义应用路由规则
 * - 配置页面导航
 * - 处理路由守卫和权限
 * 
 * 依赖：
 * - Vue Router 4.x
 * - 各页面组件
 * 
 * 使用场景：
 * - 单页面应用路由管理
 * - 页面间导航控制
 */

import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import EditorView from '@/pages/EditorView.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import NotFoundView from '@/pages/NotFoundView.vue'
import AboutView from '@/pages/AboutView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
      meta: {
        title: 'TyporaMin - 首页'
      }
    },
    {
      path: '/editor',
      name: 'Editor',
      component: EditorView,
      meta: {
        title: 'TyporaMin - 编辑器'
      }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsPage,
      meta: {
        title: 'TyporaMin - 设置'
      }
    },
    {
      path: '/about',
      name: 'About',
      component: AboutView,
      meta: {
        title: 'TyporaMin - 关于'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
      meta: {
        title: 'TyporaMin - 页面未找到'
      }
    }
  ]
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string
  } else {
    document.title = 'TyporaMin'
  }
  
  next()
})

export default router