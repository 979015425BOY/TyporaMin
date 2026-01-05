/**
 * 日志工具
 * 
 * 提供统一的日志记录功能
 */

import { getConfig } from '@/config'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private enabled: boolean
  private logLevel: LogLevel

  constructor() {
    const config = getConfig()
    this.enabled = config.enableLogger
    this.logLevel = config.logLevel
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    
    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...args)
        break
      case 'info':
        console.info(prefix, message, ...args)
        break
      case 'warn':
        console.warn(prefix, message, ...args)
        break
      case 'error':
        console.error(prefix, message, ...args)
        break
    }
  }

  debug(message: string, ...args: any[]): void {
    this.formatMessage('debug', message, ...args)
  }

  info(message: string, ...args: any[]): void {
    this.formatMessage('info', message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.formatMessage('warn', message, ...args)
  }

  error(message: string, ...args: any[]): void {
    this.formatMessage('error', message, ...args)
  }
}

export const logger = new Logger()
