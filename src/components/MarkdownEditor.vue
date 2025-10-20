<!--
  CodeMirror 6 Markdown编辑器组件
  
  功能：
  - 基于CodeMirror 6的Markdown编辑器
  - 双编辑模式：可视化编辑模式和源码编辑模式
  - 语法高亮和自动补全
  - 实时预览功能
  - 自定义主题支持
  - 代码块语法高亮
  
  依赖：
  - CodeMirror 6
  - Markdown语言包
  - 主题包
  - highlight.js
  
  使用场景：
  - 主要编辑器组件
  - Markdown文档编辑
-->

<template>
  <div class="markdown-editor h-full flex flex-col">
    <!-- 工具栏 -->
    <div class="editor-toolbar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div class="flex items-center justify-between">
        <!-- 左侧工具 -->
        <div class="flex items-center space-x-2">
          <!-- 编辑模式切换 -->
          <el-button-group>
            <el-button 
              size="small" 
              :type="editMode === 'visual' ? 'primary' : 'default'"
              @click="switchEditMode('visual')"
              title="可视化编辑模式"
            >
              <el-icon><Edit /></el-icon>
              可视化
            </el-button>
            <el-button 
              size="small" 
              :type="editMode === 'source' ? 'primary' : 'default'"
              @click="switchEditMode('source')"
              title="源码编辑模式"
            >
              <el-icon><Document /></el-icon>
              源码
            </el-button>
          </el-button-group>
          
          <el-divider direction="vertical" />
          
          <!-- 格式化工具（仅在可视化模式下显示） -->
          <div v-if="editMode === 'visual'" class="flex items-center space-x-2">
            <el-button-group>
              <el-button 
                size="small" 
                @click="insertText('**', '**')"
                title="粗体 (Ctrl+B)"
              >
                <strong>B</strong>
              </el-button>
              <el-button 
                size="small" 
                @click="insertText('*', '*')"
                title="斜体 (Ctrl+I)"
              >
                <em>I</em>
              </el-button>
              <el-button 
                size="small" 
                @click="insertText('`', '`')"
                title="行内代码 (Ctrl+K)"
              >
                <code>&lt;/&gt;</code>
              </el-button>
            </el-button-group>
            
            <el-divider direction="vertical" />
            
            <el-button-group>
              <el-button 
                size="small" 
                @click="insertHeading(1)"
                title="标题1"
              >
                H1
              </el-button>
              <el-button 
                size="small" 
                @click="insertHeading(2)"
                title="标题2"
              >
                H2
              </el-button>
              <el-button 
                size="small" 
                @click="insertHeading(3)"
                title="标题3"
              >
                H3
              </el-button>
            </el-button-group>
            
            <el-divider direction="vertical" />
            
            <el-button-group>
              <el-button 
                size="small" 
                @click="insertText('- ', '')"
                title="无序列表"
              >
                <el-icon><List /></el-icon>
              </el-button>
              <el-button 
                size="small" 
                @click="insertText('1. ', '')"
                title="有序列表"
              >
                1.
              </el-button>
              <el-button 
                size="small" 
                @click="insertText('> ', '')"
                title="引用"
              >
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
            </el-button-group>
            
            <el-divider direction="vertical" />
            
            <el-button-group>
              <el-button 
                size="small" 
                @click="insertCodeBlock"
                title="代码块"
              >
                <el-icon><Document /></el-icon>
                代码块
              </el-button>
              <el-button 
                size="small" 
                @click="insertTable"
                title="表格"
              >
                <el-icon><Grid /></el-icon>
                表格
              </el-button>
              <el-button 
                size="small" 
                @click="insertLink"
                title="链接"
              >
                <el-icon><Link /></el-icon>
                链接
              </el-button>
            </el-button-group>
          </div>
        </div>
        
        <!-- 右侧工具 -->
        <div class="flex items-center space-x-2">
          <el-button 
            size="small" 
            :type="showPreview ? 'primary' : 'default'"
            @click="togglePreview"
          >
            <el-icon><View /></el-icon>
            {{ showPreview ? '隐藏预览' : '显示预览' }}
          </el-button>
          
          <el-button 
            size="small" 
            @click="toggleFullscreen"
          >
            <el-icon><FullScreen /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 编辑器主体 -->
    <div class="editor-body flex-1 flex" style="height: 0; min-height: 0;">
      <!-- 编辑器区域 -->
      <div 
        :class="[
          'editor-pane transition-all duration-300 flex flex-col',
          showPreview ? 'w-1/2' : 'w-full'
        ]"
      >
        <!-- 可视化编辑模式 -->
        <div 
          v-if="editMode === 'visual'"
          ref="visualEditorRef" 
          class="flex-1 visual-editor"
          style="height: 100%; min-height: 0; overflow: auto; background-color: #fff;"
        ></div>
        
        <!-- 源码编辑模式 -->
        <div 
          v-if="editMode === 'source'"
          ref="sourceEditorRef" 
          class="flex-1 source-editor overflow-hidden"
        ></div>
      </div>
      
      <!-- 预览区域 -->
      <div 
        v-if="showPreview"
        class="preview-pane w-1/2 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      >
        <div 
          ref="previewRef"
          class="h-full overflow-auto p-6"
          @scroll="onPreviewScroll"
        >
          <div 
            class="markdown-preview prose prose-gray dark:prose-invert max-w-none"
            v-html="renderedMarkdown"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- 状态栏 -->
    <div class="editor-status bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
      <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-center space-x-4">
          <span>{{ editMode === 'visual' ? '可视化编辑' : '源码编辑' }}</span>
          <span>行 {{ cursorPosition.line }}, 列 {{ cursorPosition.column }}</span>
          <span>{{ wordCount }} 字</span>
          <span>{{ characterCount }} 字符</span>
          <span v-if="selectedText">选中 {{ selectedText.length }} 字符</span>
        </div>
        
        <div class="flex items-center space-x-4">
          <span v-if="isModified" class="text-orange-500">未保存</span>
          <span>{{ settings.tabSize }} 空格</span>
          <span>UTF-8</span>
          <span>Markdown</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { useAppStore } from '../stores/app'
import { 
  List, 
  ChatDotRound, 
  View, 
  FullScreen,
  Grid,
  Link,
  Edit,
  Document
} from '@element-plus/icons-vue'

/**
 * Markdown编辑器组件
 * 
 * 功能：
 * - CodeMirror 6编辑器集成
 * - 双编辑模式（可视化/源码）
 * - 实时Markdown预览
 * - 工具栏操作
 * - 状态统计
 * - 代码高亮
 * - 滚动同步
 */

// 编辑模式类型
type EditMode = 'visual' | 'source'

// Props
interface Props {
  modelValue?: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  readonly: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'save': [value: string]
}>()

// 状态
const visualEditorRef = ref<HTMLElement>()
const sourceEditorRef = ref<HTMLElement>()
const previewRef = ref<HTMLElement>()
const showPreview = ref(false)
const isFullscreen = ref(false)
const visualEditorView = ref<EditorView>()
const sourceEditorView = ref<EditorView>()
const isScrollSyncing = ref(false)
const editMode = ref<EditMode>('visual')

// Store
const appStore = useAppStore()
const settings = computed(() => appStore.settings)
const isDarkMode = computed(() => appStore.isDarkMode)

// 编辑器状态
const cursorPosition = ref({ line: 1, column: 1 })
const isModified = ref(false)
const selectedText = ref('')

// 内容统计
const content = ref(props.modelValue)
const wordCount = computed(() => {
  return content.value.replace(/\s+/g, '').length
})
const characterCount = computed(() => {
  return content.value.length
})

// 配置marked和highlight.js
marked.use({
  renderer: {
    code(code: string, lang?: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlighted = hljs.highlight(code, { language: lang }).value
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`
        } catch (err) {
          console.warn('代码高亮失败:', err)
        }
      }
      const highlighted = hljs.highlightAuto(code).value
      return `<pre><code class="hljs">${highlighted}</code></pre>`
    }
  },
  breaks: true,
  gfm: true
})

// Markdown渲染
const renderedMarkdown = computed(() => {
  try {
    const result = marked(content.value)
    // 确保返回同步字符串
    if (typeof result === 'string') {
      return result
    } else {
      // 如果是Promise，返回加载状态
      return '<p>正在渲染...</p>'
    }
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return '<p>渲染失败</p>'
  }
})

/**
 * 将HTML内容转换为Markdown
 * 这是一个简化的转换函数，处理基本的HTML标签
 */
const convertHtmlToMarkdown = (html: string): string => {
  let markdown = html
  
  // 移除不必要的属性和样式
  markdown = markdown.replace(/<(\w+)[^>]*>/g, '<$1>')
  
  // 转换标题
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
  
  // 转换段落
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
  
  // 转换粗体和斜体
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
  
  // 转换代码
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
  
  // 转换链接
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
  
  // 转换图片
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
  markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)')
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
  
  // 转换列表
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
    const items = content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    return items + '\n'
  })
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
    let counter = 1
    const items = content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`)
    return items + '\n'
  })
  
  // 转换引用
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
    const lines = content.split('\n').map(line => line.trim() ? `> ${line.trim()}` : '>').join('\n')
    return lines + '\n\n'
  })
  
  // 转换换行
  markdown = markdown.replace(/<br[^>]*>/gi, '\n')
  
  // 移除剩余的HTML标签
  markdown = markdown.replace(/<[^>]*>/g, '')
  
  // 清理多余的空行
  markdown = markdown.replace(/\n{3,}/g, '\n\n')
  
  // 解码HTML实体
  markdown = markdown
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  
  return markdown.trim()
}

/**
 * 创建自动补全扩展
 */
const createAutocompletion = () => {
  const markdownCompletions = [
    { label: '**粗体**', type: 'text', info: '粗体文本' },
    { label: '*斜体*', type: 'text', info: '斜体文本' },
    { label: '`代码`', type: 'text', info: '行内代码' },
    { label: '```\n\n```', type: 'text', info: '代码块' },
    { label: '# 标题1', type: 'text', info: '一级标题' },
    { label: '## 标题2', type: 'text', info: '二级标题' },
    { label: '### 标题3', type: 'text', info: '三级标题' },
    { label: '- 列表项', type: 'text', info: '无序列表' },
    { label: '1. 列表项', type: 'text', info: '有序列表' },
    { label: '> 引用', type: 'text', info: '引用块' },
    { label: '[链接文本](URL)', type: 'text', info: '链接' },
    { label: '![图片描述](图片URL)', type: 'text', info: '图片' },
    { label: '| 表头1 | 表头2 |\n|-------|-------|\n| 内容1 | 内容2 |', type: 'text', info: '表格' }
  ]

  return autocompletion({
    override: [
      (context) => {
        const word = context.matchBefore(/\w*/)
        if (!word || (word.from === word.to && !context.explicit)) return null
        
        return {
          from: word.from,
          options: markdownCompletions
        }
      }
    ]
  })
}

/**
 * 创建编辑器更新监听器
 */
const createUpdateListener = () => {
  return EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const newContent = update.state.doc.toString()
      content.value = newContent
      emit('update:modelValue', newContent)
      emit('change', newContent)
      
      // 更新修改状态
      isModified.value = true
      
      // 更新应用状态
      if (appStore.currentDocument) {
        appStore.updateCurrentDocument({ content: newContent })
      }
    }
    
    // 更新光标位置和选中文本
    const cursor = update.state.selection.main.head
    const line = update.state.doc.lineAt(cursor)
    cursorPosition.value = {
      line: line.number,
      column: cursor - line.from + 1
    }
    
    // 更新选中文本
    const selection = update.state.selection.main
    if (selection.from !== selection.to) {
      selectedText.value = update.state.doc.sliceString(selection.from, selection.to)
    } else {
      selectedText.value = ''
    }
  })
}

/**
 * 创建编辑器主题
 */
const createEditorTheme = () => {
  return EditorView.theme({
    '&': {
      height: '100%',
      fontSize: `${settings.value.fontSize}px`,
      fontFamily: settings.value.fontFamily,
      lineHeight: settings.value.lineHeight.toString()
    },
    '.cm-content': {
      padding: '16px',
      minHeight: '100%'
    },
    '.cm-focused': {
      outline: 'none'
    },
    '.cm-editor': {
      height: '100%'
    },
    '.cm-scroller': {
      height: '100%'
    },
    '.cm-line': {
      lineHeight: settings.value.lineHeight.toString()
    }
  })
}

/**
 * 初始化可视化编辑器
 */
const initVisualEditor = async () => {
  if (!visualEditorRef.value) return
  
  // 清空容器
  visualEditorRef.value.innerHTML = ''
  
  // 创建可编辑的内容区域
  const editableDiv = document.createElement('div')
  editableDiv.contentEditable = 'true'
  editableDiv.className = `
    visual-editor-content p-6 outline-none
    prose prose-gray dark:prose-invert max-w-none
    text-gray-900 dark:text-gray-100
  `.trim()
  
  // 设置样式以确保正确的滚动行为
  editableDiv.style.minHeight = '100%'
  editableDiv.style.width = '100%'
  editableDiv.style.boxSizing = 'border-box'
  editableDiv.style.display = 'block'
  editableDiv.style.backgroundColor = 'transparent'
  
  // 设置初始内容
  if (content.value) {
    editableDiv.innerHTML = renderedMarkdown.value
  } else {
    editableDiv.innerHTML = '<p>开始编写您的文档...</p>'
  }
  
  // 保存光标位置的辅助函数
  const saveCursorPosition = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return null
    
    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editableDiv)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    
    return {
      offset: preCaretRange.toString().length,
      container: range.endContainer,
      containerOffset: range.endOffset
    }
  }
  
  // 恢复光标位置的辅助函数
  const restoreCursorPosition = (cursorInfo) => {
    if (!cursorInfo) return
    
    const selection = window.getSelection()
    if (!selection) return
    
    try {
      // 创建一个文本节点遍历器
      const walker = document.createTreeWalker(
        editableDiv,
        NodeFilter.SHOW_TEXT,
        null
      )
      
      let currentOffset = 0
      let targetNode = null
      let targetOffset = 0
      
      // 遍历所有文本节点，找到目标位置
      while (walker.nextNode()) {
        const textNode = walker.currentNode
        const textLength = textNode.textContent.length
        
        if (currentOffset + textLength >= cursorInfo.offset) {
          targetNode = textNode
          targetOffset = cursorInfo.offset - currentOffset
          break
        }
        
        currentOffset += textLength
      }
      
      // 如果找到目标节点，设置光标位置
      if (targetNode) {
        const range = document.createRange()
        range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent.length))
        range.collapse(true)
        
        selection.removeAllRanges()
        selection.addRange(range)
      } else {
        // 如果没找到，将光标放在末尾
        const range = document.createRange()
        range.selectNodeContents(editableDiv)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    } catch (e) {
      console.warn('恢复光标位置失败:', e)
      // 备用方案：将光标放在末尾
      try {
        const range = document.createRange()
        range.selectNodeContents(editableDiv)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      } catch (fallbackError) {
        console.warn('备用光标恢复也失败:', fallbackError)
      }
    }
  }
  
  // 防抖渲染标志
  let renderTimeout = null
  let isRendering = false
  
  // 实时渲染Markdown的函数
  const renderMarkdownToHTML = (markdownText) => {
    // 简化的实时Markdown渲染，专门用于可视化编辑器
    let html = markdownText
    
    // 处理标题
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // 处理粗体和斜体 - 关键修复
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // 处理行内代码
    html = html.replace(/`(.*?)`/g, '<code>$1</code>')
    
    // 处理链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // 处理换行
    html = html.replace(/\n/g, '<br>')
    
    // 如果内容为空，显示占位符
    if (!html.trim()) {
      html = '<p>开始编写您的文档...</p>'
    }
    
    return html
  }
  
  // 添加输入事件监听器
  const handleInput = () => {
    // 获取纯文本内容（Markdown格式）
    const textContent = editableDiv.innerText || editableDiv.textContent || ''
    
    // 更新内容状态
    content.value = textContent
    emit('update:modelValue', textContent)
    emit('change', textContent)
    
    // 更新修改状态
    isModified.value = true
    
    // 更新应用状态
    if (appStore.currentDocument) {
      appStore.updateCurrentDocument({ content: textContent })
    }
  }
  
  // 带跳过渲染参数的输入处理函数
   const handleInputWithSkip = (skipRendering = false) => {
     handleInput()
     
     // 如果跳过渲染（比如在Enter键处理中），直接返回
     if (skipRendering || isRendering) return
    
    // 清除之前的渲染定时器
    if (renderTimeout) {
      clearTimeout(renderTimeout)
    }
    
    // 实时渲染，减少延迟时间
    renderTimeout = setTimeout(() => {
      // 获取当前编辑器的文本内容
      const textContent = editableDiv.innerText || editableDiv.textContent || ''
      
      // 使用简化的实时渲染函数
      const renderedHTML = renderMarkdownToHTML(textContent)
      
      if (renderedHTML !== editableDiv.innerHTML) {
        isRendering = true
        
        // 保存当前光标位置
        const cursorInfo = saveCursorPosition()
        
        // 更新HTML内容
        editableDiv.innerHTML = renderedHTML
        
        // 恢复光标位置
        if (cursorInfo) {
          // 使用 requestAnimationFrame 确保DOM更新完成后再恢复光标
          requestAnimationFrame(() => {
            restoreCursorPosition(cursorInfo)
            isRendering = false
          })
        } else {
          isRendering = false
        }
      }
      renderTimeout = null
    }, 50) // 大幅减少延迟时间，提供更实时的体验
  }
  
  // 添加事件监听器
  editableDiv.addEventListener('input', handleInput)
  editableDiv.addEventListener('paste', () => {
    // 处理粘贴事件，延迟处理以确保内容已更新
    setTimeout(handleInput, 10)
  })
  
  // 添加键盘事件监听器
  editableDiv.addEventListener('keydown', (e) => {
    // 处理Enter键换行
    if (e.key === 'Enter') {
      e.preventDefault()
      
      // 获取当前光标位置
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        
        // 创建换行符
        const br = document.createElement('br')
        const textNode = document.createTextNode('\n')
        
        // 插入换行
        range.deleteContents()
        range.insertNode(textNode)
        range.insertNode(br)
        
        // 将光标移动到换行后的位置
        range.setStartAfter(textNode)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
        
        // 更新内容，但跳过渲染以避免光标重置
        handleInputWithSkip(true)
      }
      return
    }
    
    // 处理特殊键盘快捷键
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        // 移除 Ctrl+S 处理，避免与 EditorView.vue 中的保存逻辑冲突
        case 'b':
          e.preventDefault()
          document.execCommand('bold')
          handleInput()
          break
        case 'i':
          e.preventDefault()
          document.execCommand('italic')
          handleInput()
          break
      }
    }
  })
  
  // 将编辑器添加到容器
  visualEditorRef.value.appendChild(editableDiv)
  
  // 存储引用以便后续使用
  visualEditorView.value = {
    dom: editableDiv,
    destroy: () => {
      editableDiv.removeEventListener('input', handleInput)
      if (visualEditorRef.value?.contains(editableDiv)) {
        visualEditorRef.value.removeChild(editableDiv)
      }
    },
    focus: () => editableDiv.focus(),
    state: {
      doc: {
        toString: () => content.value
      }
    }
  } as any
}

/**
 * 初始化源码编辑器
 */
const initSourceEditor = async () => {
  if (!sourceEditorRef.value) return
  
  // 创建编辑器状态
  const state = EditorState.create({
    doc: content.value,
    extensions: [
      basicSetup,
      markdown(),
      createAutocompletion(),
      highlightSelectionMatches(),
      keymap.of([
        ...completionKeymap,
        ...searchKeymap,
        indentWithTab
      ]),
      isDarkMode.value ? oneDark : [],
      createUpdateListener(),
      createEditorTheme()
    ]
  })
  
  // 创建编辑器视图
  sourceEditorView.value = new EditorView({
    state,
    parent: sourceEditorRef.value
  })
}

/**
 * 销毁编辑器
 */
const destroyEditors = () => {
  if (visualEditorView.value) {
    visualEditorView.value.destroy()
    visualEditorView.value = undefined
  }
  if (sourceEditorView.value) {
    sourceEditorView.value.destroy()
    sourceEditorView.value = undefined
  }
}

/**
 * 获取当前活动的编辑器
 */
const getCurrentEditor = (): EditorView | undefined => {
  return editMode.value === 'visual' ? visualEditorView.value : sourceEditorView.value
}

/**
 * 切换编辑模式
 */
const switchEditMode = async (mode: EditMode) => {
  if (editMode.value === mode) return
  
  // 保存当前内容
  const currentEditor = getCurrentEditor()
  if (currentEditor) {
    if (editMode.value === 'visual' && visualEditorView.value?.dom) {
      // 从可视化编辑器获取内容
      const htmlContent = (visualEditorView.value.dom as HTMLElement).innerHTML
      content.value = convertHtmlToMarkdown(htmlContent)
    } else if (editMode.value === 'source' && sourceEditorView.value) {
      // 从源码编辑器获取内容
      content.value = sourceEditorView.value.state.doc.toString()
    }
  }
  
  // 销毁当前编辑器
  if (editMode.value === 'visual' && visualEditorView.value) {
    visualEditorView.value.destroy()
    visualEditorView.value = undefined
  } else if (editMode.value === 'source' && sourceEditorView.value) {
    sourceEditorView.value.destroy()
    sourceEditorView.value = undefined
  }
  
  editMode.value = mode
  
  // 等待DOM更新
  await nextTick()
  
  // 初始化新模式的编辑器
  if (mode === 'visual') {
    await initVisualEditor()
  } else {
    await initSourceEditor()
  }
}

/**
 * 插入文本
 * 
 * @param before 前缀文本
 * @param after 后缀文本
 */
const insertText = (before: string, after: string = '') => {
  if (editMode.value === 'visual') {
    // 可视化模式下的文本插入
    const editableDiv = visualEditorView.value?.dom as HTMLElement
    if (!editableDiv) return
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    
    // 创建新的文本节点
    const newText = before + selectedText + after
    const textNode = document.createTextNode(newText)
    
    // 替换选中的内容
    range.deleteContents()
    range.insertNode(textNode)
    
    // 设置新的选择范围
    const newRange = document.createRange()
    newRange.setStart(textNode, before.length)
    newRange.setEnd(textNode, before.length + selectedText.length)
    selection.removeAllRanges()
    selection.addRange(newRange)
    
    // 触发输入事件以更新内容
    editableDiv.dispatchEvent(new Event('input', { bubbles: true }))
    editableDiv.focus()
  } else {
    // 源码模式下的文本插入
    const editor = sourceEditorView.value
    if (!editor) return
    
    const selection = editor.state.selection.main
    const selectedText = editor.state.doc.sliceString(selection.from, selection.to)
    
    const newText = before + selectedText + after
    
    editor.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: newText
      },
      selection: {
        anchor: selection.from + before.length,
        head: selection.from + before.length + selectedText.length
      }
    })
    
    editor.focus()
  }
}

/**
 * 插入标题
 * 
 * @param level 标题级别
 */
const insertHeading = (level: number) => {
  const prefix = '#'.repeat(level) + ' '
  insertText(prefix)
}

/**
 * 插入代码块
 */
const insertCodeBlock = () => {
  insertText('```\n', '\n```')
}

/**
 * 插入表格
 */
const insertTable = () => {
  const table = '| 表头1 | 表头2 | 表头3 |\n|-------|-------|-------|\n| 内容1 | 内容2 | 内容3 |\n'
  insertText(table)
}

/**
 * 插入链接
 */
const insertLink = () => {
  insertText('[链接文本](', ')')
}

/**
 * 切换预览
 */
const togglePreview = () => {
  showPreview.value = !showPreview.value
}

/**
 * 切换全屏
 */
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

/**
 * 保存文档
 */
const saveDocument = () => {
  emit('save', content.value)
  isModified.value = false
  
  if (appStore.currentDocument) {
    appStore.markDocumentAsSaved()
  }
}

/**
 * 预览区域滚动处理
 */
const onPreviewScroll = () => {
  if (isScrollSyncing.value) return
  // 这里可以实现滚动同步逻辑
  // 由于实现复杂度较高，暂时保留接口
}

// 监听主题变化
watch(isDarkMode, async () => {
  // 重新初始化编辑器以应用新主题
  destroyEditors()
  await nextTick()
  if (editMode.value === 'visual') {
    await initVisualEditor()
  } else {
    await initSourceEditor()
  }
})

// 监听外部内容变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
    
    // 更新当前活动编辑器的内容
    if (editMode.value === 'visual' && visualEditorView.value?.dom) {
      // 可视化编辑器：直接更新DOM内容
      const editableDiv = visualEditorView.value.dom as HTMLElement
      editableDiv.innerHTML = renderedMarkdown.value
    } else if (editMode.value === 'source' && sourceEditorView.value) {
      // 源码编辑器：使用CodeMirror 6 API
      const transaction = sourceEditorView.value.state.update({
        changes: {
          from: 0,
          to: sourceEditorView.value.state.doc.length,
          insert: newValue
        }
      })
      sourceEditorView.value.dispatch(transaction)
    }
  }
})

// 键盘快捷键
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      // 移除 Ctrl+S 处理，避免与 EditorView.vue 中的保存逻辑冲突
      case 'b':
        if (editMode.value === 'visual') {
          event.preventDefault()
          insertText('**', '**')
        }
        break
      case 'i':
        if (editMode.value === 'visual') {
          event.preventDefault()
          insertText('*', '*')
        }
        break
      case 'k':
        if (editMode.value === 'visual') {
          event.preventDefault()
          insertText('`', '`')
        }
        break
      case 'p':
        event.preventDefault()
        togglePreview()
        break
      case 'm':
        event.preventDefault()
        switchEditMode(editMode.value === 'visual' ? 'source' : 'visual')
        break
    }
  }
}

// 生命周期
onMounted(async () => {
  // 确保内容已设置
  if (props.modelValue) {
    content.value = props.modelValue
  }
  
  // 初始化默认编辑器
  await initVisualEditor()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  destroyEditors()
  document.removeEventListener('keydown', handleKeydown)
})

// 暴露方法
defineExpose({
  insertText,
  insertHeading,
  insertCodeBlock,
  insertTable,
  insertLink,
  saveDocument,
  togglePreview,
  toggleFullscreen,
  switchEditMode
})
</script>

<style scoped>
.markdown-editor {
  background-color: #ffffff;
}

.dark .markdown-editor {
  background-color: #111827;
}

.editor-toolbar {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.preview-pane {
  overflow: hidden;
}

/* Markdown预览样式 */
:deep(.markdown-preview) {
  color: #111827;
}

.dark :deep(.markdown-preview) {
  color: #f3f4f6;
}

:deep(.markdown-preview h1) {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark :deep(.markdown-preview h1) {
  border-bottom-color: #374151;
}

:deep(.markdown-preview h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark :deep(.markdown-preview h2) {
  border-bottom-color: #374151;
}

:deep(.markdown-preview h3) {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

:deep(.markdown-preview h4) {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

:deep(.markdown-preview h5) {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

:deep(.markdown-preview h6) {
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

:deep(.markdown-preview p) {
  margin-bottom: 1rem;
  line-height: 1.625;
}

:deep(.markdown-preview code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

.dark :deep(.markdown-preview code) {
  background-color: #1f2937;
}

:deep(.markdown-preview pre) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.dark :deep(.markdown-preview pre) {
  background-color: #1f2937;
}

:deep(.markdown-preview pre code) {
  background-color: transparent;
  padding: 0;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

:deep(.markdown-preview blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  font-style: italic;
  color: #4b5563;
  margin-bottom: 1rem;
  background-color: #f9fafb;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.dark :deep(.markdown-preview blockquote) {
  color: #9ca3af;
  background-color: #1f2937;
}

:deep(.markdown-preview ul) {
  list-style-type: disc;
  list-style-position: inside;
  margin-bottom: 1rem;
  padding-left: 1rem;
}

:deep(.markdown-preview ul > * + *) {
  margin-top: 0.25rem;
}

:deep(.markdown-preview ol) {
  list-style-type: decimal;
  list-style-position: inside;
  margin-bottom: 1rem;
  padding-left: 1rem;
}

:deep(.markdown-preview ol > * + *) {
  margin-top: 0.25rem;
}

:deep(.markdown-preview li) {
  line-height: 1.625;
}

:deep(.markdown-preview table) {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #d1d5db;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.dark :deep(.markdown-preview table) {
  border-color: #4b5563;
}

:deep(.markdown-preview th),
:deep(.markdown-preview td) {
  border: 1px solid #d1d5db;
  padding: 0.75rem;
  text-align: left;
}

.dark :deep(.markdown-preview th),
.dark :deep(.markdown-preview td) {
  border-color: #4b5563;
}

:deep(.markdown-preview th) {
  background-color: #f3f4f6;
  font-weight: 600;
}

.dark :deep(.markdown-preview th) {
  background-color: #1f2937;
}

:deep(.markdown-preview a) {
  color: #2563eb;
  text-decoration: none;
}

:deep(.markdown-preview a:hover) {
  text-decoration: underline;
}

.dark :deep(.markdown-preview a) {
  color: #60a5fa;
}

:deep(.markdown-preview img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

:deep(.markdown-preview hr) {
  border-color: #d1d5db;
  margin: 1.5rem 0;
}

.dark :deep(.markdown-preview hr) {
  border-color: #4b5563;
}

/* 代码高亮样式 */
:deep(.markdown-preview .hljs) {
  background-color: #f3f4f6;
}

.dark :deep(.markdown-preview .hljs) {
  background-color: #1f2937;
}

:deep(.markdown-preview .hljs-comment),
:deep(.markdown-preview .hljs-quote) {
  color: #6b7280;
}

.dark :deep(.markdown-preview .hljs-comment),
.dark :deep(.markdown-preview .hljs-quote) {
  color: #9ca3af;
}

:deep(.markdown-preview .hljs-keyword),
:deep(.markdown-preview .hljs-selector-tag),
:deep(.markdown-preview .hljs-subst) {
  color: #7c3aed;
}

.dark :deep(.markdown-preview .hljs-keyword),
.dark :deep(.markdown-preview .hljs-selector-tag),
.dark :deep(.markdown-preview .hljs-subst) {
  color: #a78bfa;
}

:deep(.markdown-preview .hljs-number),
:deep(.markdown-preview .hljs-literal),
:deep(.markdown-preview .hljs-variable),
:deep(.markdown-preview .hljs-template-variable),
:deep(.markdown-preview .hljs-tag .hljs-attr) {
  color: #2563eb;
}

.dark :deep(.markdown-preview .hljs-number),
.dark :deep(.markdown-preview .hljs-literal),
.dark :deep(.markdown-preview .hljs-variable),
.dark :deep(.markdown-preview .hljs-template-variable),
.dark :deep(.markdown-preview .hljs-tag .hljs-attr) {
  color: #60a5fa;
}

:deep(.markdown-preview .hljs-string),
:deep(.markdown-preview .hljs-doctag) {
  color: #059669;
}

.dark :deep(.markdown-preview .hljs-string),
.dark :deep(.markdown-preview .hljs-doctag) {
  color: #34d399;
}

:deep(.markdown-preview .hljs-title),
:deep(.markdown-preview .hljs-section),
:deep(.markdown-preview .hljs-selector-id) {
  color: #dc2626;
}

.dark :deep(.markdown-preview .hljs-title),
.dark :deep(.markdown-preview .hljs-section),
.dark :deep(.markdown-preview .hljs-selector-id) {
  color: #f87171;
}
</style>