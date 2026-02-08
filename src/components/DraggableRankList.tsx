'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface DraggableRankListProps {
  options: string[]
  onSubmit: (ranking: string[]) => void
  loading?: boolean
}

function SortableItem({ id, index }: { id: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3
        cursor-grab active:cursor-grabbing select-none
        ${isDragging ? 'shadow-lg border-indigo-300 z-10 opacity-90' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <span className="text-indigo-600 font-bold text-sm w-6 text-center">{index + 1}</span>
      <span className="flex-1 text-gray-900 font-medium">{id}</span>
      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>
    </div>
  )
}

export default function DraggableRankList({ options, onSubmit, loading }: DraggableRankListProps) {
  const [items, setItems] = useState(options)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems(prev => {
        const oldIndex = prev.indexOf(active.id as string)
        const newIndex = prev.indexOf(over.id as string)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem key={item} id={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-xs text-gray-400 text-center">
        Drag to reorder. Top = most preferred.
      </p>

      <button
        onClick={() => onSubmit(items)}
        disabled={loading}
        className={`
          w-full rounded-lg bg-indigo-600 text-white px-6 py-3 text-lg font-medium
          hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center
        `}
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          'Lock in my ranking'
        )}
      </button>
    </div>
  )
}
