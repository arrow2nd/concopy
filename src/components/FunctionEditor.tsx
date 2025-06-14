import React, { useState, useEffect } from 'react'
import { CopyFunction } from '../lib/types'
import { templateFunctions } from '../lib/templates'
import { getRandomColor, getContrastingTextColor } from '../lib/colors'

interface FunctionEditorProps {
  function: CopyFunction
  onSave: (func: CopyFunction) => void
  onCancel: () => void
}

export default function FunctionEditor({ function: func, onSave, onCancel }: FunctionEditorProps) {
  const [name, setName] = useState(func.name)
  const [description, setDescription] = useState(func.description)
  const [selectedTemplate, setSelectedTemplate] = useState(func.templateId || 'rich-text-link')
  const [customCode, setCustomCode] = useState(func.code)
  const [backgroundColor, setBackgroundColor] = useState(func.backgroundColor || '#E91E63')
  const [textColor, setTextColor] = useState(func.textColor || '#FFFFFF')
  const [urlPattern, setUrlPattern] = useState(func.urlPattern || '')

  useEffect(() => {
    // Update code when template changes
    if (selectedTemplate in templateFunctions) {
      setCustomCode(templateFunctions[selectedTemplate as keyof typeof templateFunctions].code)
    }
  }, [selectedTemplate])

  const handleSave = () => {
    const updatedFunction: CopyFunction = {
      ...func,
      name: name.trim() || 'Untitled Function',
      description: description.trim(),
      code: customCode,
      templateId: selectedTemplate,
      backgroundColor,
      textColor,
      urlPattern: urlPattern.trim(),
      updatedAt: Date.now()
    }

    onSave(updatedFunction)
  }

  const handleRandomColors = () => {
    const randomColor = getRandomColor()
    setBackgroundColor(randomColor.bg)
    setTextColor(randomColor.text)
  }

  const handleBackgroundColorChange = (newBgColor: string) => {
    setBackgroundColor(newBgColor)
    // Auto-adjust text color for better contrast
    const contrastingColor = getContrastingTextColor(newBgColor)
    setTextColor(contrastingColor)
  }

  const previewStyle = {
    backgroundColor,
    color: textColor
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">
          {func.id ? 'Edit Function' : 'New Function'}
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Function Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter function name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Pattern (optional)
            </label>
            <input
              type="text"
              value={urlPattern}
              onChange={(e) => setUrlPattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., github.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={2}
            placeholder="Describe what this function does"
          />
        </div>

        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {Object.entries(templateFunctions).map(([id, template]) => (
              <option key={id} value={id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        {/* Code Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Function Code
          </label>
          <textarea
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
            rows={10}
            readOnly={selectedTemplate !== 'custom-template'}
          />
          {selectedTemplate !== 'custom-template' && (
            <p className="text-sm text-gray-500 mt-1">
              This template is read-only. Select &quot;Custom Template&quot; to edit the code.
            </p>
          )}
        </div>

        {/* Styling */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Button Styling
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <button
                  type="button"
                  onClick={handleRandomColors}
                  className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md transition-colors text-sm font-medium"
                  title="Random colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div
            className="inline-block px-4 py-2 rounded-lg font-medium"
            style={previewStyle}
          >
            {name || 'Function Name'}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Save Function
        </button>
      </div>
    </div>
  )
}