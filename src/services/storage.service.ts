/**
 * 存储服务
 * 
 * 封装 localStorage 和 IndexedDB 操作
 */

import { STORAGE_KEYS, INDEXED_DB_NAME, INDEXED_DB_VERSION, INDEXED_DB_STORES } from '@/constants'

/**
 * LocalStorage 服务
 */
export class LocalStorageService {
  /**
   * 设置值
   */
  static set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.error(`LocalStorage set error for key "${key}":`, error)
      throw new Error(`Failed to save to localStorage: ${key}`)
    }
  }

  /**
   * 获取值
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`LocalStorage get error for key "${key}":`, error)
      return null
    }
  }

  /**
   * 删除值
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`LocalStorage remove error for key "${key}":`, error)
    }
  }

  /**
   * 清空所有
   */
  static clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('LocalStorage clear error:', error)
    }
  }

  /**
   * 检查是否存在
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }
}

/**
 * IndexedDB 服务
 */
export class IndexedDBService {
  private static db: IDBDatabase | null = null

  /**
   * 打开数据库
   */
  static async open(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建对象存储
        if (!db.objectStoreNames.contains(INDEXED_DB_STORES.HANDLES)) {
          db.createObjectStore(INDEXED_DB_STORES.HANDLES)
        }
      }
    })
  }

  /**
   * 关闭数据库
   */
  static close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }

  /**
   * 保存数据
   */
  static async save<T>(storeName: string, key: string, value: T): Promise<void> {
    const db = await this.open()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.put(value, key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 获取数据
   */
  static async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.open()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => {
        const result = request.result
        resolve(result || null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 删除数据
   */
  static async delete(storeName: string, key: string): Promise<void> {
    const db = await this.open()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 清空存储
   */
  static async clear(storeName: string): Promise<void> {
    const db = await this.open()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

/**
 * 存储服务导出
 */
export const storageService = {
  localStorage: LocalStorageService,
  indexedDB: IndexedDBService
}
