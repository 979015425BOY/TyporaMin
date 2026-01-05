/**
 * 验证工具
 * 
 * 提供常用的数据验证功能
 */

/**
 * 验证文件名
 */
export function validateFileName(fileName: string): { valid: boolean; error?: string } {
  if (!fileName || fileName.trim().length === 0) {
    return { valid: false, error: '文件名不能为空' }
  }

  if (fileName.length > 255) {
    return { valid: false, error: '文件名长度不能超过255个字符' }
  }

  // Windows 和 Linux 不允许的字符
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
  if (invalidChars.test(fileName)) {
    return { valid: false, error: '文件名包含非法字符' }
  }

  // 保留名称
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
  const upperName = fileName.toUpperCase().split('.')[0]
  if (reservedNames.includes(upperName)) {
    return { valid: false, error: '文件名不能使用系统保留名称' }
  }

  return { valid: true }
}

/**
 * 验证文件路径
 */
export function validateFilePath(filePath: string): { valid: boolean; error?: string } {
  if (!filePath || filePath.trim().length === 0) {
    return { valid: false, error: '文件路径不能为空' }
  }

  // 检查路径长度
  if (filePath.length > 260) {
    return { valid: false, error: '文件路径长度不能超过260个字符' }
  }

  // 检查非法字符
  const invalidChars = /[<>:"|?\x00-\x1f]/
  if (invalidChars.test(filePath)) {
    return { valid: false, error: '文件路径包含非法字符' }
  }

  return { valid: true }
}

/**
 * 验证工作区名称
 */
export function validateWorkspaceName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: '工作区名称不能为空' }
  }

  if (name.length < 1 || name.length > 50) {
    return { valid: false, error: '工作区名称长度应在1-50个字符之间' }
  }

  return { valid: true }
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证URL格式
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
