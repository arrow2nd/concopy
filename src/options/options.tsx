import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { CopyFunction } from '../lib/types'
import { storage } from '../lib/storage'
import { templateFunctions } from '../lib/templates'
import { getRandomColor } from '../lib/colors'
import FunctionList from '../components/FunctionList'
import FunctionEditor from '../components/FunctionEditor'
import '../../app.css'

function Options() {
  const [functions, setFunctions] = useState<CopyFunction[]>([])
  const [selectedFunction, setSelectedFunction] = useState<CopyFunction | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  useEffect(() => {
    loadFunctions()
    checkUrlImport()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadFunctions = async () => {
    try {
      const funcs = await storage.getFunctions()
      setFunctions(funcs)
    } catch (error) {
      console.error('Failed to load functions:', error)
    }
  }

  const checkUrlImport = async () => {
    try {
      const hash = window.location.hash
      if (!hash.startsWith('#/install?f=')) return
      
      const params = new URLSearchParams(hash.slice(hash.indexOf('?')))
      const encodedData = params.get('f')
      if (!encodedData) return
      
      await importFromEncodedData(encodedData)
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (error) {
      console.error('Failed to import function from URL:', error)
      alert('Failed to import function from URL. Please check the URL and try again.')
    }
  }

  const importFromEncodedData = async (encodedData: string) => {
    try {
      const decodedData = decodeURIComponent(encodedData)
      const decoded = atob(decodedData)
      const functionData = JSON.parse(decoded)
      
      // Use provided colors or generate random ones
      const colors = functionData.theme ? 
        { bg: functionData.theme.backgroundColor, text: functionData.theme.textColor } :
        getRandomColor()
      
      const newFunction: CopyFunction = {
        id: crypto.randomUUID(),
        name: functionData.name || 'Imported Function',
        description: functionData.description || 'Imported from share URL',
        code: functionData.code || '',
        backgroundColor: colors.bg || '#E91E63',
        textColor: colors.text || '#FFFFFF',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      await storage.addFunction(newFunction)
      await loadFunctions()
      alert(`Function "${newFunction.name}" imported successfully!`)
    } catch (error) {
      console.error('Import error:', error)
      throw new Error('Invalid function data')
    }
  }

  const handleNewFunction = () => {
    const randomColor = getRandomColor()
    const newFunction: CopyFunction = {
      id: crypto.randomUUID(),
      name: 'New Function',
      description: 'A new copy function',
      code: templateFunctions['rich-text-link'].code,
      templateId: 'rich-text-link',
      backgroundColor: randomColor.bg,
      textColor: randomColor.text,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setSelectedFunction(newFunction)
    setIsEditing(true)
  }

  const handleEditFunction = (func: CopyFunction) => {
    setSelectedFunction(func)
    setIsEditing(true)
  }

  const handleSaveFunction = async (func: CopyFunction) => {
    try {
      if (functions.find(f => f.id === func.id)) {
        await storage.updateFunction(func)
      } else {
        await storage.addFunction(func)
      }
      await loadFunctions()
      setIsEditing(false)
      setSelectedFunction(null)
    } catch (error) {
      console.error('Failed to save function:', error)
      alert('Failed to save function')
    }
  }

  const handleDeleteFunction = async (id: string) => {
    if (confirm('Are you sure you want to delete this function?')) {
      try {
        await storage.deleteFunction(id)
        await loadFunctions()
        if (selectedFunction?.id === id) {
          setSelectedFunction(null)
          setIsEditing(false)
        }
      } catch (error) {
        console.error('Failed to delete function:', error)
        alert('Failed to delete function')
      }
    }
  }

  const handleDuplicateFunction = async (func: CopyFunction) => {
    const randomColor = getRandomColor()
    const duplicated: CopyFunction = {
      ...func,
      id: crypto.randomUUID(),
      name: `${func.name} (Copy)`,
      backgroundColor: randomColor.bg,
      textColor: randomColor.text,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    try {
      await storage.addFunction(duplicated)
      await loadFunctions()
    } catch (error) {
      console.error('Failed to duplicate function:', error)
      alert('Failed to duplicate function')
    }
  }

  const handleExportFunction = (func: CopyFunction) => {
    const exportData = {
      name: func.name,
      description: func.description,
      code: func.code,
      pattern: func.urlPattern || '',
      theme: {
        textColor: func.textColor || '#FFFFFF',
        backgroundColor: func.backgroundColor || '#E91E63'
      },
      version: 1
    }
    
    const encoded = btoa(JSON.stringify(exportData))
    const url = `${window.location.origin}${window.location.pathname}#/install?f=${encodeURIComponent(encoded)}`
    
    navigator.clipboard.writeText(url).then(() => {
      alert('Share URL copied to clipboard!')
    }).catch(() => {
      prompt('Copy this URL to share the function:', url)
    })
  }

  const handleReorderFunctions = async (orderedFunctions: CopyFunction[]) => {
    try {
      await storage.reorderFunctions(orderedFunctions)
      setFunctions(orderedFunctions)
    } catch (error) {
      console.error('Failed to reorder functions:', error)
      alert('Failed to reorder functions')
    }
  }

  const handleImport = () => {
    setShowImportDialog(true)
  }

  const handleImportFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (Array.isArray(data)) {
          // Import multiple functions
          for (const funcData of data) {
            const randomColor = getRandomColor()
            const func: CopyFunction = {
              id: crypto.randomUUID(),
              name: funcData.name || 'Imported Function',
              description: funcData.description || '',
              code: funcData.code || '',
              backgroundColor: funcData.backgroundColor || randomColor.bg,
              textColor: funcData.textColor || randomColor.text,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
            await storage.addFunction(func)
          }
        } else {
          // Import single function
          const randomColor = getRandomColor()
          const func: CopyFunction = {
            id: crypto.randomUUID(),
            name: data.name || 'Imported Function',
            description: data.description || '',
            code: data.code || '',
            backgroundColor: data.backgroundColor || randomColor.bg,
            textColor: data.textColor || randomColor.text,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
          await storage.addFunction(func)
        }
        
        await loadFunctions()
        alert('Functions imported successfully!')
      } catch (error) {
        console.error('Import error:', error)
        alert('Failed to import file')
      }
    }
    input.click()
    setShowImportDialog(false)
  }

  const handleImportUrl = () => {
    const url = prompt('Enter the concopy share URL:')
    if (!url) {
      setShowImportDialog(false)
      return
    }
    
    try {
      const hashIndex = url.indexOf('#/install?f=')
      if (hashIndex === -1) {
        throw new Error('Invalid share URL')
      }
      
      const params = new URLSearchParams(url.slice(url.indexOf('?')))
      const encodedData = params.get('f')
      if (!encodedData) {
        throw new Error('No function data in URL')
      }
      
      importFromEncodedData(encodedData)
    } catch (error) {
      console.error('URL import error:', error)
      alert('Invalid share URL')
    }
    setShowImportDialog(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img src="/icons/icon-48.png" alt="concopy" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold text-orange-700">concopy</h1>
              <p className="text-orange-600">Copy web content with custom functions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Functions</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleImport}
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                  >
                    Import
                  </button>
                  <button
                    onClick={handleNewFunction}
                    className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                  >
                    New
                  </button>
                </div>
              </div>
              <FunctionList
                functions={functions}
                selectedFunction={selectedFunction}
                onSelect={setSelectedFunction}
                onEdit={handleEditFunction}
                onDelete={handleDeleteFunction}
                onDuplicate={handleDuplicateFunction}
                onExport={handleExportFunction}
                onReorder={handleReorderFunctions}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            {isEditing && selectedFunction ? (
              <FunctionEditor
                function={selectedFunction}
                onSave={handleSaveFunction}
                onCancel={() => {
                  setIsEditing(false)
                  setSelectedFunction(null)
                }}
              />
            ) : selectedFunction ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{selectedFunction.name}</h3>
                    <p className="text-gray-600">{selectedFunction.description}</p>
                  </div>
                  <button
                    onClick={() => handleEditFunction(selectedFunction)}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-gray-100 rounded p-4">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">{selectedFunction.code}</pre>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center py-12">
                  <img src="/icons/icon-128.png" alt="concopy" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No function selected</h3>
                  <p className="text-gray-500 mb-4">Select a function from the list or create a new one</p>
                  <button
                    onClick={handleNewFunction}
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                  >
                    Create New Function
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Import Function</h3>
            <p className="text-gray-600 mb-4">Choose how you want to import:</p>
            <div className="space-y-3">
              <button
                onClick={handleImportFile}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
              >
                <div className="font-medium">From File</div>
                <div className="text-sm text-gray-600">Import from a JSON file</div>
              </button>
              <button
                onClick={handleImportUrl}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
              >
                <div className="font-medium">From Share URL</div>
                <div className="text-sm text-gray-600">Import from a concopy share URL</div>
              </button>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<React.StrictMode><Options /></React.StrictMode>)