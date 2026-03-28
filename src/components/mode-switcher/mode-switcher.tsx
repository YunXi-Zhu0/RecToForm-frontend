import { PROCESSING_MODES } from '@/core/constants'
import { formatMode } from '@/core/formatters'
import type { ProcessingMode } from '@/types/common'

interface ModeSwitcherProps {
  value: ProcessingMode
  onChange: (mode: ProcessingMode) => void
  disabled?: boolean
}

const MODE_COPY: Record<
  ProcessingMode,
  {
    description: string
    detail: string
  }
> = {
  template: {
    description: '后端按模板直接生成 Excel。',
    detail: '适合标准化批量处理。',
  },
  standard_edit: {
    description: '返回标准字段结果后再人工校对。',
    detail: '适合改表头、删列和二次整理。',
  },
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
          <div className="mode-switcher__title-row">
            <strong className="mode-switcher__title">{formatMode(mode)}</strong>
            <span className="mode-switcher__state">
              {mode === value ? '当前模式' : '点击切换'}
            </span>
          </div>
          <span className="mode-switcher__description">
            {MODE_COPY[mode].description}
          </span>
          <span className="mode-switcher__detail">{MODE_COPY[mode].detail}</span>
        </button>
      ))}
    </div>
  )
}
