import React from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { CopyFunction } from '../lib/types'

interface FunctionListProps {
  functions: CopyFunction[]
  selectedFunction?: CopyFunction | null
  onSelect: (func: CopyFunction) => void
  onEdit: (func: CopyFunction) => void
  onDelete: (id: string) => void
  onDuplicate: (func: CopyFunction) => void
  onExport: (func: CopyFunction) => void
  onReorder: (functions: CopyFunction[]) => void
}

export default function FunctionList({ functions, selectedFunction, onSelect, onEdit, onDelete, onDuplicate, onExport, onReorder }: FunctionListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(functions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onReorder(items)
  }
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Functions</h2>
          {functions.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Drag to reorder
            </div>
          )}
        </div>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {functions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No functions yet
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="functions">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="p-2"
                >
                  {functions.map((func, index) => (
                    <Draggable key={func.id} draggableId={func.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                            selectedFunction?.id === func.id
                              ? 'bg-orange-100 border-2 border-orange-300'
                              : snapshot.isDragging
                              ? 'bg-blue-50 border-2 border-blue-300 shadow-lg'
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                          }`}
                          onClick={() => !snapshot.isDragging && onSelect(func)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2 flex-1">
                              <div 
                                {...provided.dragHandleProps}
                                className="mt-1 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                title="Drag to reorder"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-800">{func.name}</h3>
                                {func.description && (
                                  <p className="text-sm text-gray-600 mt-1">{func.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEdit(func)
                                }}
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDuplicate(func)
                                }}
                                className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                                title="Duplicate"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onExport(func)
                                }}
                                className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                                title="Share"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(func.id)
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}