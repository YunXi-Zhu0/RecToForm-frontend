import type { TaskResultResponse } from '@/types/tasks'

interface ResultTableProps {
  result: TaskResultResponse | null
  editableHeaders: string[]
  editableRows: string[][]
  onHeaderChange: (index: number, value: string) => void
  onCellChange: (rowIndex: number, columnIndex: number, value: string) => void
  onDeleteColumn: (index: number) => void
  onMoveColumn: (index: number, direction: 'left' | 'right') => void
}

export function ResultTable({
  result,
  editableHeaders,
  editableRows,
  onHeaderChange,
  onCellChange,
  onDeleteColumn,
  onMoveColumn,
}: ResultTableProps) {
  if (result === null) {
    return <p className="muted">任务完成后会在这里展示结果预览。</p>
  }

  if (result.mode === 'template') {
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {result.preview_headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.preview_rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${row.join('|')}`}>
                {row.map((cell, columnIndex) => (
                  <td key={`${rowIndex}-${columnIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {editableHeaders.map((header, index) => (
              <th key={`${index}-${header}`}>
                <div className="editable-header">
                  <input
                    type="text"
                    value={header}
                    onChange={(event) =>
                      onHeaderChange(index, event.currentTarget.value)
                    }
                  />
                  <div className="header-actions">
                    <button
                      type="button"
                      onClick={() => onMoveColumn(index, 'left')}
                      disabled={index === 0}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveColumn(index, 'right')}
                      disabled={index === editableHeaders.length - 1}
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteColumn(index)}
                      disabled={editableHeaders.length <= 1}
                    >
                      删除列
                    </button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {editableRows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${row.join('|')}`}>
              {row.map((cell, columnIndex) => (
                <td key={`${rowIndex}-${columnIndex}`}>
                  <input
                    type="text"
                    value={cell}
                    onChange={(event) =>
                      onCellChange(rowIndex, columnIndex, event.currentTarget.value)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
