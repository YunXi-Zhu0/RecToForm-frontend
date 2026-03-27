import { PROCESSING_MODES } from '@/core/constants'
import { formatMode } from '@/core/formatters'
import type { ProcessingMode } from '@/types/common'

interface ModeSwitcherProps {
  value: ProcessingMode
  onChange: (mode: ProcessingMode) => void
}

export function ModeSwitcher({ value, onChange }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher">
      {PROCESSING_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          className={mode === value ? 'is-active' : undefined}
          onClick={() => onChange(mode)}
        >
          {formatMode(mode)}
        </button>
      ))}
    </div>
  )
}
