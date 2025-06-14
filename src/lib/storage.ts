import browser from 'webextension-polyfill'
import { CopyFunction, StorageData } from './types'

const DEFAULT_STORAGE: StorageData = {
  functions: [],
  settings: {
    theme: 'auto',
    defaultFormat: 'text'
  }
}

export const storage = {
  async get(): Promise<StorageData> {
    const data = await browser.storage.sync.get(DEFAULT_STORAGE)
    return { ...DEFAULT_STORAGE, ...data } as StorageData
  },
  
  async set(data: Partial<StorageData>): Promise<void> {
    await browser.storage.sync.set(data)
  },
  
  async getFunctions(): Promise<CopyFunction[]> {
    const data = await this.get()
    return data.functions
  },
  
  async saveFunction(func: CopyFunction): Promise<void> {
    const data = await this.get()
    const index = data.functions.findIndex(f => f.id === func.id)
    
    if (index >= 0) {
      data.functions[index] = { ...func, updatedAt: Date.now() }
    } else {
      data.functions.push({ ...func, createdAt: Date.now(), updatedAt: Date.now() })
    }
    
    await this.set({ functions: data.functions })
  },

  async addFunction(func: CopyFunction): Promise<void> {
    const data = await this.get()
    const newFunc = { 
      ...func, 
      createdAt: Date.now(), 
      updatedAt: Date.now() 
    }
    data.functions.push(newFunc)
    await this.set({ functions: data.functions })
  },

  async updateFunction(func: CopyFunction): Promise<void> {
    const data = await this.get()
    const index = data.functions.findIndex(f => f.id === func.id)
    
    if (index >= 0) {
      data.functions[index] = { ...func, updatedAt: Date.now() }
      await this.set({ functions: data.functions })
    } else {
      throw new Error('Function not found')
    }
  },

  async reorderFunctions(orderedFunctions: CopyFunction[]): Promise<void> {
    await this.set({ functions: orderedFunctions })
  },
  
  async deleteFunction(id: string): Promise<void> {
    const data = await this.get()
    data.functions = data.functions.filter(f => f.id !== id)
    await this.set({ functions: data.functions })
  },
  
  async importFunctions(functions: CopyFunction[]): Promise<void> {
    const data = await this.get()
    const imported = functions.map(f => ({
      ...f,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }))
    data.functions.push(...imported)
    await this.set({ functions: data.functions })
  },
  
  async exportFunctions(): Promise<CopyFunction[]> {
    const data = await this.get()
    return data.functions
  }
}