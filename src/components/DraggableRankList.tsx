'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
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
  maxRanks?: number
}

function SortableItem({ id, index, ruledOut }: { id: string; index: number; ruledOut?: boolean }) {
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
    touchAction: 'none' as const,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 rounded-lg px-4 py-3
        cursor-grab active:cursor-grabbing select-none
        ${isDragging ? 'shadow-lg z-10 opacity-90' : ''}
        ${ruledOut
          ? 'bg-gray-50 border border-dashed border-gray-300'
          : 'bg-white border border-gray-200'
        }
        ${isDragging && !ruledOut ? 'border-indigo-300' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      {ruledOut ? (
        <span className="text-gray-300 text-sm w-6 text-center">--</span>
      ) : (
        <span className="text-indigo-600 font-bold text-sm w-6 text-center">{index + 1}</span>
      )}
      <span className={`flex-1 font-medium ${ruledOut ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
        {id}
      </span>
      <svg className={`w-5 h-5 ${ruledOut ? 'text-gray-200' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
      </svg>
    </div>
  )
}

function DroppableZone({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id })
  return <div ref={setNodeRef}>{children}</div>
}

export default function DraggableRankList({ options, onSubmit, loading, maxRanks }: DraggableRankListProps) {
  const [ranked, setRanked] = useState(() =>
    maxRanks && maxRanks < options.length ? options.slice(0, maxRanks) : options
  )
  const [ruledOut, setRuledOut] = useState<string[]>(() =>
    maxRanks && maxRanks < options.length ? options.slice(maxRanks) : []
  )
  const rankedFull = !!maxRanks && ranked.length >= maxRanks

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const isActiveRanked = ranked.includes(activeId)
    const isActiveRuledOut = ruledOut.includes(activeId)

    const isOverRanked = ranked.includes(overId) || overId === 'ranked-zone'
    const isOverRuledOut = ruledOut.includes(overId) || overId === 'ruled-out-zone'

    // Same zone reorder
    if (isActiveRanked && isOverRanked && overId !== 'ranked-zone') {
      if (activeId !== overId) {
        setRanked(prev => {
          const oldIndex = prev.indexOf(activeId)
          const newIndex = prev.indexOf(overId)
          return arrayMove(prev, oldIndex, newIndex)
        })
      }
      return
    }

    if (isActiveRuledOut && isOverRuledOut && overId !== 'ruled-out-zone') {
      if (activeId !== overId) {
        setRuledOut(prev => {
          const oldIndex = prev.indexOf(activeId)
          const newIndex = prev.indexOf(overId)
          return arrayMove(prev, oldIndex, newIndex)
        })
      }
      return
    }

    // Cross-zone: ranked → ruled out
    if (isActiveRanked && isOverRuledOut) {
      setRanked(prev => prev.filter(id => id !== activeId))
      if (overId === 'ruled-out-zone') {
        setRuledOut(prev => [...prev, activeId])
      } else {
        setRuledOut(prev => {
          const targetIndex = prev.indexOf(overId)
          const next = [...prev]
          next.splice(targetIndex, 0, activeId)
          return next
        })
      }
      return
    }

    // Cross-zone: ruled out → ranked (blocked when at max)
    if (isActiveRuledOut && isOverRanked) {
      if (rankedFull) return
      setRuledOut(prev => prev.filter(id => id !== activeId))
      if (overId === 'ranked-zone') {
        setRanked(prev => [...prev, activeId])
      } else {
        setRanked(prev => {
          const targetIndex = prev.indexOf(overId)
          const next = [...prev]
          next.splice(targetIndex, 0, activeId)
          return next
        })
      }
      return
    }
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Ranked zone */}
        <DroppableZone id="ranked-zone">
          <SortableContext items={ranked} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {ranked.map((item, index) => (
                <SortableItem key={item} id={item} index={index} />
              ))}
              {ranked.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-lg px-4 py-6 text-center text-sm text-gray-400">
                  Drag options here to rank them
                </div>
              )}
            </div>
          </SortableContext>
        </DroppableZone>

        {maxRanks && (
          <p className="text-xs text-indigo-600 text-center font-medium">
            You can rank up to {maxRanks} option{maxRanks !== 1 ? 's' : ''}.
          </p>
        )}

        <p className="text-xs text-gray-400 text-center">
          Drag to reorder.{!rankedFull && ' Drag below to rule out.'}
        </p>

        <button
          onClick={() => onSubmit(ranked)}
          disabled={loading || ranked.length === 0}
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

        {/* Ruled-out zone */}
        <DroppableZone id="ruled-out-zone">
          <SortableContext items={ruledOut} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {ruledOut.length > 0 && (
                <p className="text-xs text-gray-400 text-center mt-2">
                  Ruled out — won&apos;t count
                </p>
              )}
              {ruledOut.map((item, index) => (
                <SortableItem key={item} id={item} index={index} ruledOut />
              ))}
            </div>
          </SortableContext>
        </DroppableZone>
      </DndContext>
    </div>
  )
}
