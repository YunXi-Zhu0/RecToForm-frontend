import { useEffect, useState } from 'react'

import {
  isTemplateTaskResult,
  type TaskResultResponse,
} from '@/types/tasks'

interface ExportActionsProps {
  result: TaskResultResponse | null
  exportDownloadUrl: string | null
  exportFilename: string
  exportError: string | null
  isExporting: boolean
  onCommitExportFilename: (filename: string) => void
  onExport: (filename: string) => void
}

export function ExportActions({
  result,
  exportDownloadUrl,
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

  if (result === null) {
    return <p className="muted">结果完成后可在这里下载或导出。</p>
  }

  if (isTemplateTaskResult(result)) {
    return (
      <div className="stack">
        <a href={result.excel_download_url} target="_blank" rel="noreferrer">
          下载模板模式 Excel
        </a>
      </div>
    )
  }

  return (
    <div className="stack">
      <label className="field">
        <span>导出文件名</span>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={() => onCommitExportFilename(inputValue)}
          placeholder="standard_fields_export.xlsx"
        />
      </label>
      <p className="muted">留空时使用后端默认文件名。</p>
      <button
        type="button"
        onClick={() => {
          onCommitExportFilename(inputValue)
          onExport(inputValue)
        }}
        disabled={isExporting}
      >
        {isExporting ? '导出中...' : '导出标准字段 Excel'}
      </button>
      {exportDownloadUrl ? (
        <a href={exportDownloadUrl} target="_blank" rel="noreferrer">
          下载导出文件 ({exportFilename})
        </a>
      ) : null}
      {exportError ? <p className="error-text">{exportError}</p> : null}
    </div>
  )
}
