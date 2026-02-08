'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface OptionEditorProps {
  options: string[]
  onChange: (options: string[]) => void
}

export default function OptionEditor({ options, onChange }: OptionEditorProps) {
  const [newOption, setNewOption] = useState('')

  function addOption() {
    const trimmed = newOption.trim()
    if (!trimmed) return
    if (options.includes(trimmed)) return
    onChange([...options, trimmed])
    setNewOption('')
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index))
  }

  function moveOption(index: number, direction: -1 | 1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= options.length) return
    const updated = [...options]
    const [item] = updated.splice(index, 1)
    updated.splice(newIndex, 0, item)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {options.map((option, i) => (
          <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <span className="text-gray-400 text-sm font-mono w-5">{i + 1}</span>
            <span className="flex-1 text-gray-900">{option}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveOption(i, -1)}
                disabled={i === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1"
                aria-label="Move up"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveOption(i, 1)}
                disabled={i === options.length - 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-1"
                aria-label="Move down"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="text-red-400 hover:text-red-600 p-1"
                aria-label="Remove option"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newOption}
          onChange={e => setNewOption(e.target.value)}
          placeholder="Add an option..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addOption()
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={addOption} disabled={!newOption.trim()}>
          Add
        </Button>
      </div>
    </div>
  )
}
