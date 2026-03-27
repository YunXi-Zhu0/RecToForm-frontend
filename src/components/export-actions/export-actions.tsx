import type { TaskResultResponse } from '@/types/tasks'

interface ExportActionsProps {
  result: TaskResultResponse | null
  exportDownloadUrl: string | null
  exportFilename: string
  exportError: string | null
  isExporting: boolean
  onExport: () => void
}

export function ExportActions({
  result,
  exportDownloadUrl,
  exportFilename,
  exportError,
  isExporting,
  onExport,
}: ExportActionsProps) {
  if (result === null) {
    return <p className="muted">结果完成后可在这里下载或导出。</p>
  }

  if (result.mode === 'template') {
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
      <button type="button" onClick={onExport} disabled={isExporting}>
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
