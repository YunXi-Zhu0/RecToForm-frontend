import { PROCESSING_MODES } from '@/core/constants'
import { formatMode } from '@/core/formatters'
import type { ProcessingMode } from '@/types/common'

interface ModeSwitcherProps {
  value: ProcessingMode
  onChange: (mode: ProcessingMode) => void
  disabled?: boolean
}

export function ModeSwitcher({
  value,
  onChange,
  disabled = false,
}: ModeSwitcherProps) {
  return (
    <div className="mode-switcher" role="tablist" aria-label="处理模式切换">
      {PROCESSING_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          className={
            mode === value
              ? 'mode-switcher__card is-active'
              : 'mode-switcher__card'
          }
          onClick={() => onChange(mode)}
          role="tab"
          aria-selected={mode === value}
          disabled={disabled}
        >
          <strong className="mode-switcher__title">{formatMode(mode)}</strong>
        </button>
      ))}
    </div>
  )
}
