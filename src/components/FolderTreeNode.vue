<!--
  文件夹树节点组件
  
  功能：
  - 单个文件/文件夹节点展示
  - 递归渲染子节点
  - 节点交互处理
  
  使用场景：
  - FolderTree组件的子组件
  - 递归渲染文件树结构
-->

<template>
  <div class="folder-tree-node">
    <!-- 节点内容 -->
    <div 
      class="flex items-center py-1 px-2 rounded cursor-pointer transition-colors group"
      :class="[
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700',
        `ml-${level * 4}`
      ]"
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      <!-- 展开/收起图标 -->
      <div class="w-4 h-4 flex items-center justify-center mr-1">
        <el-icon 
          v-if="node.type === 'folder'" 
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          :class="{ 'transform rotate-90': isExpanded }"
          @click.stop="handleToggle"
        >
          <ArrowRight />
        </el-icon>
      </div>
      
      <!-- 文件/文件夹图标 -->
      <el-icon class="mr-2 flex-shrink-0" :class="getIconClass()">
        <component :is="getIcon()" />
      </el-icon>
      
      <!-- 文件/文件夹名称 -->
      <span 
        class="text-sm truncate flex-1" 
        :class="isSelected ? 'font-medium' : ''"
        :title="node.name"
      >
        {{ node.name }}
      </span>
      
      <!-- 文件信息 -->
      <div v-if="node.type === 'file'" class="flex items-center text-xs text-gray-400 dark:text-gray-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span v-if="node.size !== undefined">{{ formatFileSize(node.size) }}</span>
      </div>
    </div>
    
    <!-- 子节点 -->
    <div v-if="node.type === 'folder' && isExpanded && node.children" class="ml-2">
      <FolderTreeNode 
        v-for="child in node.children" 
        :key="child.id"
        :node="child"
        :level="level + 1"
        :selected-id="selectedId"
        :expanded-folders="expandedFolders"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
        @context-menu="$emit('context-menu', $event, child)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FileTreeNode } from '@/types'
import { 
  ArrowRight,
  Folder,
  FolderOpened,
  Document,
  Picture,
  VideoPlay,
  Edit,
  Delete,
  Plus,
  Files,
  MoreFilled
} from '@element-plus/icons-vue'

/**
 * 文件夹树节点组件属性
 */
interface Props {
  node: FileTreeNode
  level: number
  selectedId: string | null
  expandedFolders: Set<string>
}

/**
 * 组件事件
 */
interface Emits {
  (e: 'select', node: FileTreeNode): void
  (e: 'toggle', node: FileTreeNode): void
  (e: 'context-menu', event: MouseEvent, node: FileTreeNode): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 计算属性
const isSelected = computed(() => props.selectedId === props.node.id)
const isExpanded = computed(() => props.expandedFolders.has(props.node.id))

/**
 * 获取文件/文件夹图标
 * 
 * @returns 图标组件
 */
const getIcon = () => {
  if (props.node.type === 'folder') {
    return isExpanded.value ? FolderOpened : Folder
  }
  
  // 根据文件扩展名返回不同图标
  const extension = props.node.name.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return Picture
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
      return VideoPlay
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return Files
    case 'md':
    case 'txt':
    case 'html':
    case 'css':
    case 'js':
    case 'ts':
    case 'json':
    case 'xml':
      return Document
    default:
      return Files
  }
}

/**
 * 获取图标样式类
 * 
 * @returns 样式类字符串
 */
const getIconClass = () => {
  if (props.node.type === 'folder') {
    return isExpanded.value ? 'text-blue-500' : 'text-gray-500'
  }
  
  // 根据文件类型返回不同颜色
  const extension = props.node.name.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'webp':
      return 'text-green-500'
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
      return 'text-red-500'
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return 'text-purple-500'
    case 'md':
      return 'text-blue-500'
    case 'txt':
      return 'text-gray-500'
    case 'html':
      return 'text-orange-500'
    case 'css':
      return 'text-blue-400'
    case 'js':
    case 'ts':
      return 'text-yellow-500'
    case 'json':
      return 'text-green-400'
    case 'xml':
      return 'text-orange-400'
    default:
      return 'text-gray-400'
  }
}

/**
 * 格式化文件大小
 * 
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * 处理节点点击
 */
const handleClick = () => {
  emit('select', props.node)
}

/**
 * 处理节点展开/收起
 */
const handleToggle = () => {
  emit('toggle', props.node)
}

/**
 * 处理右键菜单
 * 
 * @param event 鼠标事件
 */
const handleContextMenu = (event: MouseEvent) => {
  emit('context-menu', event, props.node)
}
</script>

<style scoped>
.folder-tree-node {
  @apply select-none;
}

/* 动态缩进样式 */
.ml-0 { margin-left: 0; }
.ml-4 { margin-left: 1rem; }
.ml-8 { margin-left: 2rem; }
.ml-12 { margin-left: 3rem; }
.ml-16 { margin-left: 4rem; }
.ml-20 { margin-left: 5rem; }
.ml-24 { margin-left: 6rem; }
.ml-28 { margin-left: 7rem; }
.ml-32 { margin-left: 8rem; }
</style>