import { useDeferredValue, useState } from 'react'

import type { FailedItem } from '@/types/tasks'

interface FailedItemsProps {
  items: FailedItem[]
}

function normalizeFilterValue(value: string): string {
  return value.trim().toLowerCase()
}

export function FailedItems({ items }: FailedItemsProps) {
  const [keyword, setKeyword] = useState('')
  const [selectedReason, setSelectedReason] = useState<string>('all')
  const deferredKeyword = useDeferredValue(keyword)
  const normalizedKeyword = normalizeFilterValue(deferredKeyword)
  const reasonCounts = new Map<string, number>()

  items.forEach((item) => {
    reasonCounts.set(item.error_message, (reasonCounts.get(item.error_message) ?? 0) + 1)
  })

  const filteredItems = items.filter((item) => {
    if (selectedReason !== 'all' && item.error_message !== selectedReason) {
      return false
    }

    if (normalizedKeyword === '') {
      return true
    }

    return (
      item.file_name.toLowerCase().includes(normalizedKeyword) ||
      item.error_message.toLowerCase().includes(normalizedKeyword)
    )
  })

  if (items.length === 0) {
    return (
      <div className="empty-state empty-state--warning">
        当前没有失败项，异常面板保持空闲。
      </div>
    )
  }

  return (
    <div className="failed-items-panel">
      <div className="failed-items-summary">
        <div className="failed-items-stat">
          <strong>{items.length}</strong>
          <span className="muted">失败文件</span>
        </div>
        <div className="failed-items-stat">
          <strong>{reasonCounts.size}</strong>
          <span className="muted">失败原因</span>
        </div>
        <div className="failed-items-stat">
          <strong>{filteredItems.length}</strong>
          <span className="muted">当前筛选结果</span>
        </div>
      </div>

      <div className="failed-items-toolbar">
        <label className="field">
          <span>搜索失败项</span>
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="按文件名或错误信息筛选"
          />
        </label>

        <div className="field">
          <span>按原因聚合</span>
          <div className="tag-list">
            <button
              type="button"
              className={selectedReason === 'all' ? 'tag-button is-active' : 'tag-button'}
              onClick={() => setSelectedReason('all')}
            >
              全部 ({items.length})
            </button>
            {Array.from(reasonCounts.entries()).map(([reason, count]) => (
              <button
                key={reason}
                type="button"
                className={
                  selectedReason === reason ? 'tag-button is-active' : 'tag-button'
                }
                onClick={() => setSelectedReason(reason)}
              >
                {reason} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          当前筛选条件下没有匹配的失败项。
        </div>
      ) : (
        <ul className="failed-items-list">
          {filteredItems.map((item) => (
            <li key={`${item.file_id}-${item.file_name}`} className="failed-items-list__item">
              <div className="failed-items-list__meta">
                <strong>{item.file_name}</strong>
                <span className="metric-chip metric-chip--error">失败项</span>
              </div>
              <span>{item.error_message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
