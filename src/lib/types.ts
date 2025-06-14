export interface CopyFunction {
  id: string
  name: string
  description: string
  code: string
  urlPattern?: string
  backgroundColor?: string
  textColor?: string
  createdAt: number
  updatedAt: number
  templateId?: string
  customOptions?: Record<string, unknown>
}

export interface PageContext {
  title: string
  url: string
  selection: string
  content: string
  meta: {
    description?: string
    keywords?: string
    author?: string
    [key: string]: string | undefined
  }
}

export interface FunctionResult {
  text?: string
  html?: string
}

export interface StorageData {
  functions: CopyFunction[]
  settings: {
    theme: 'light' | 'dark' | 'auto'
    defaultFormat: 'text' | 'html'
  }
}