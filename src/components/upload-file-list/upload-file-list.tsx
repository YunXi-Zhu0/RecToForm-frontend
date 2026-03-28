import type { UploadFileItem } from '@/types/workbench'

interface UploadFileListProps {
  files: UploadFileItem[]
  onRemoveFile: (fileId: string) => void
  onClearFiles: () => void
  disabled?: boolean
}

function formatFileSize(size: number): string {
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

function getFileKindLabel(file: File): string {
  if (file.type.includes('pdf')) {
    return 'PDF'
  }

  if (file.type.startsWith('image/')) {
    return '图片'
  }

  const extension = file.name.split('.').pop()
  return extension ? extension.toUpperCase() : '文件'
}

export function UploadFileList({
  files,
  onRemoveFile,
  onClearFiles,
  disabled = false,
}: UploadFileListProps) {
  const duplicateCount = files.filter(
    (item) => item.isServerDuplicate || item.localWarnings.length > 0,
  ).length

  return (
    <div className="upload-file-sidebar">
      <div className="upload-file-sidebar__header">
        <div className="upload-file-sidebar__summary">
          <span className="panel-kicker">文件清单</span>
          <h3>当前上传内容</h3>
          <p className="muted">文件名、大小与重复状态会集中显示在这里。</p>
        </div>

        <button
          type="button"
          className="button-ghost"
          onClick={onClearFiles}
          disabled={files.length === 0 || disabled}
        >
          清空
        </button>
      </div>

      <div className="upload-file-sidebar__stats">
        <span className="metric-chip">{files.length} 个文件</span>
        <span className="metric-chip">
          {duplicateCount > 0 ? `${duplicateCount} 个待确认` : '未发现重复'}
        </span>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <p>上传后的文件会显示在这里，便于逐个移除和检查重复状态。</p>
        </div>
      ) : (
        <ul className="upload-file-sidebar__list">
          {files.map((item) => (
            <li
              key={item.id}
              className={
                item.isServerDuplicate
                  ? 'upload-file-entry is-duplicate'
                  : item.localWarnings.length > 0
                    ? 'upload-file-entry is-warning'
                    : 'upload-file-entry'
              }
            >
              <div className="upload-file-entry__content">
                <div className="upload-file-entry__header">
                  <strong>{item.file.name}</strong>
                  <button
                    type="button"
                    className="upload-file-entry__remove"
                    aria-label={`移除 ${item.file.name}`}
                    onClick={() => onRemoveFile(item.id)}
                    disabled={disabled}
                  >
                    ×
                  </button>
                </div>

                <div className="upload-file-entry__facts">
                  <span className="metric-chip">{getFileKindLabel(item.file)}</span>
                  <span className="metric-chip">{formatFileSize(item.file.size)}</span>
                  <span
                    className={
                      item.isServerDuplicate
                        ? 'metric-chip metric-chip--error'
                        : item.localWarnings.length > 0
                          ? 'metric-chip metric-chip--warning'
                          : 'metric-chip metric-chip--success'
                    }
                  >
                    {item.isServerDuplicate
                      ? '后端重复'
                      : item.localWarnings.length > 0
                        ? '本地疑似重复'
                        : '已加入任务'}
                  </span>
                </div>

                {item.localWarnings.map((warning) => (
                  <div key={warning} className="warning-text">
                    {warning}
                  </div>
                ))}
                {item.isServerDuplicate ? (
                  <div className="error-text">后端判定为重复文件，请处理后再提交。</div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
