/**
 * 格式化工具
 * 
 * 提供常用的数据格式化功能
 */

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string, format: 'relative' | 'full' | 'short' = 'relative'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (format === 'relative') {
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes <= 1 ? '刚刚' : `${minutes} 分钟前`
      }
      return `${hours} 小时前`
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days} 天前`
    } else if (days < 30) {
      const weeks = Math.floor(days / 7)
      return `${weeks} 周前`
    } else if (days < 365) {
      const months = Math.floor(days / 30)
      return `${months} 个月前`
    } else {
      const years = Math.floor(days / 365)
      return `${years} 年前`
    }
  } else if (format === 'full') {
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } else {
    return d.toLocaleDateString('zh-CN')
  }
}

/**
 * 格式化数字
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals)
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%'
  const percent = (value / total) * 100
  return `${percent.toFixed(decimals)}%`
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 格式化路径
 */
export function formatPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/')
}
