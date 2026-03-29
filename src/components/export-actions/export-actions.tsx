import { useEffect, useState } from 'react'

interface ExportActionsProps {
  exportFilename: string
  exportError: string | null
  isExporting: boolean
  onCommitExportFilename: (filename: string) => void
  onExport: (filename: string) => void
}

export function ExportActions({
  exportFilename,
  exportError,
  isExporting,
  onCommitExportFilename,
  onExport,
}: ExportActionsProps) {
  const [inputValue, setInputValue] = useState(exportFilename)

  useEffect(() => {
    setInputValue(exportFilename)
  }, [exportFilename])

  return (
    <div className="export-panel">
      <div className="export-panel__dock">
        <label className="export-panel__field">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onBlur={() => onCommitExportFilename(inputValue)}
            placeholder="请输入文件名..."
            aria-label="导出文件名"
          />
        </label>
        <button
          type="button"
          className="export-panel__submit"
          onClick={() => {
            onCommitExportFilename(inputValue)
            onExport(inputValue)
          }}
          disabled={isExporting}
        >
          {isExporting ? '导出中...' : '导出表格'}
        </button>
      </div>
      {exportError ? (
        <div className="inline-notice inline-notice--error">{exportError}</div>
      ) : null}
    </div>
  )
}
