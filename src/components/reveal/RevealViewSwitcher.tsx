'use client'

import Button from '@/components/ui/Button'
import type { RevealViewType } from '@/types/database'

const tabs: { value: RevealViewType; label: string }[] = [
  { value: 'animation', label: 'Animation' },
  { value: 'selection', label: 'How They Voted' },
  { value: 'table', label: 'Results Table' },
]

interface RevealViewSwitcherProps {
  activeView: RevealViewType
  onViewChange: (view: RevealViewType) => void
}

export default function RevealViewSwitcher({ activeView, onViewChange }: RevealViewSwitcherProps) {
  return (
    <div className="flex gap-2 justify-center">
      {tabs.map(tab => (
        <Button
          key={tab.value}
          variant={activeView === tab.value ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
