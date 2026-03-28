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
    return (
      <div className="empty-state">
        结果完成后可在这里下载或导出 Excel。
      </div>
    )
  }

  if (isTemplateTaskResult(result)) {
    return (
      <div className="export-panel">
        <div className="export-panel__header">
          <div>
            <span className="panel-kicker">导出下载</span>
            <h3>模板模式交付</h3>
          </div>
          <span className="metric-chip metric-chip--success">可下载</span>
        </div>
        <p className="muted">
          模板模式下无需二次导出，直接下载后端生成的 Excel 文件即可。
        </p>
        <a
          className="button-primary button-link"
          href={result.excel_download_url}
          target="_blank"
          rel="noreferrer"
        >
          下载 Excel
        </a>
      </div>
    )
  }

  return (
    <div className="export-panel">
      <div className="export-panel__header">
        <div>
          <span className="panel-kicker">导出下载</span>
          <h3>标准字段导出</h3>
        </div>
        <span
          className={
            isExporting
              ? 'metric-chip metric-chip--warning'
              : exportDownloadUrl
                ? 'metric-chip metric-chip--success'
                : 'metric-chip'
          }
        >
          {isExporting ? '导出中' : exportDownloadUrl ? '可下载' : '待导出'}
        </span>
      </div>

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
        className="button-primary"
        onClick={() => {
          onCommitExportFilename(inputValue)
          onExport(inputValue)
        }}
        disabled={isExporting}
      >
        {isExporting ? '导出中...' : '导出并下载 Excel'}
      </button>
      {exportDownloadUrl ? (
        <a
          className="button-secondary button-link"
          href={exportDownloadUrl}
          target="_blank"
          rel="noreferrer"
        >
          下载导出文件 ({exportFilename})
        </a>
      ) : null}
      {exportError ? (
        <div className="inline-notice inline-notice--error">{exportError}</div>
      ) : null}
    </div>
  )
}
