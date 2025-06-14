import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import browser from 'webextension-polyfill'
import { CopyFunction, PageContext } from '../lib/types'
import { storage } from '../lib/storage'
import { executeCopyFunction } from '../lib/templates'
import '../../app.css'

function Popup() {
  const [functions, setFunctions] = useState<CopyFunction[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState<string | null>(null)

  useEffect(() => {
    loadFunctions()
  }, [])

  const loadFunctions = async () => {
    try {
      const funcs = await storage.getFunctions()
      setFunctions(funcs)
    } catch (error) {
      console.error('Failed to load functions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async (func: CopyFunction) => {
    setExecuting(func.id)
    
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) throw new Error('No active tab')
      
      // Check if we can access the tab
      if (tab.url?.startsWith('moz-extension://') || 
          tab.url?.startsWith('chrome-extension://') ||
          tab.url?.startsWith('about:') ||
          tab.url?.startsWith('chrome://')) {
        throw new Error('Cannot run functions on extension or system pages')
      }
      
      let context: PageContext
      try {
        // Try to get page context from content script
        context = await browser.tabs.sendMessage(tab.id, { action: 'getPageContext' }) as PageContext
      } catch (error) {
        // If content script is not available, inject it first
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/content/content.js']
        })
        
        // Try again after injection
        context = await browser.tabs.sendMessage(tab.id, { action: 'getPageContext' }) as PageContext
      }
      
      // Execute function using safe executor
      const result = await executeCopyFunction(func, context)
      
      // Copy to clipboard
      if (result.html) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([result.html], { type: 'text/html' }),
            'text/plain': new Blob([result.text || ''], { type: 'text/plain' })
          })
        ])
      } else if (result.text) {
        await navigator.clipboard.writeText(result.text)
      }
      
      // Close popup after successful copy
      window.close()
    } catch (error) {
      console.error('Failed to execute function:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute function'
      alert(errorMessage)
    } finally {
      setExecuting(null)
    }
  }

  const openOptions = () => {
    browser.runtime.openOptionsPage()
  }

  if (loading) {
    return (
      <div className="w-80 h-96 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
        <div className="text-orange-600 font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-80 max-h-96 bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-32.png" alt="concopy" className="w-8 h-8" />
            <h1 className="text-lg font-bold text-orange-700">concopy</h1>
          </div>
          <button
            onClick={openOptions}
            className="p-2 rounded-lg hover:bg-orange-100 transition-colors"
            title="Options"
          >
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-80">
        {functions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-orange-600 mb-4">No functions yet!</p>
            <button
              onClick={openOptions}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create your first function
            </button>
          </div>
        ) : (
          <div className="p-2">
            {functions.map((func) => (
              <button
                key={func.id}
                onClick={() => handleExecute(func)}
                disabled={executing === func.id}
                className="w-full p-3 mb-2 text-left rounded-lg bg-white hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-orange-200"
                style={{
                  backgroundColor: func.backgroundColor || undefined,
                  color: func.textColor || undefined
                }}
              >
                <div className="font-medium">{func.name}</div>
                {func.description && (
                  <div className="text-sm opacity-75 mt-1">{func.description}</div>
                )}
                {executing === func.id && (
                  <div className="text-sm text-orange-600 mt-1">Executing...</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<React.StrictMode><Popup /></React.StrictMode>)