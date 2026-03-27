import type { FailedItem } from '@/types/tasks'

interface FailedItemsProps {
  items: FailedItem[]
}

export function FailedItems({ items }: FailedItemsProps) {
  if (items.length === 0) {
    return <p className="muted">当前没有失败项。</p>
  }

  return (
    <ul className="message-list error-list">
      {items.map((item) => (
        <li key={`${item.file_id}-${item.file_name}`}>
          <strong>{item.file_name}</strong>：{item.error_message}
        </li>
      ))}
    </ul>
  )
}
