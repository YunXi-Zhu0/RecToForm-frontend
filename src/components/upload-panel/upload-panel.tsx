import { ACCEPTED_FILE_INPUT, MAX_UPLOAD_FILES } from '@/core/constants'
import type { UploadFileItem } from '@/types/workbench'
import { useRef, useState } from 'react'

interface UploadPanelProps {
  files: UploadFileItem[]
  validationErrors: string[]
  onAddFiles: (files: FileList | File[]) => void
  onRemoveFile: (fileId: string) => void
  onClearFiles: () => void
}

export function UploadPanel({
  files,
  validationErrors,
  onAddFiles,
  onRemoveFile,
  onClearFiles,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

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

  return (
    <div className="upload-panel">
      <div
        className={isDragActive ? 'upload-dropzone is-drag-active' : 'upload-dropzone'}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragActive(true)
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragActive(false)

          if (event.dataTransfer.files.length > 0) {
            onAddFiles(event.dataTransfer.files)
          }
        }}
      >
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          multiple
          accept={ACCEPTED_FILE_INPUT}
          onChange={(event) => {
            if (event.currentTarget.files !== null) {
              onAddFiles(event.currentTarget.files)
            }

            event.currentTarget.value = ''
          }}
        />

        <div className="upload-dropzone__visual" aria-hidden="true">
          <span className="upload-dropzone__halo" />
          <span className="upload-dropzone__glyph">+</span>
        </div>

        <div className="upload-dropzone__content">
          <span className="panel-kicker">上传文件</span>
          <h3>拖拽或点击上传发票文件</h3>
          <p className="muted">
            支持图片与 PDF。文件加入后，处理模式会直接在当前区域展开。
          </p>
        </div>

        <div className="upload-dropzone__actions">
          <button
            type="button"
            className="button-primary"
            onClick={() => inputRef.current?.click()}
          >
            选择文件
          </button>
        </div>

        <div className="upload-dropzone__limits">
          <span className="metric-chip">图片 / PDF</span>
          <span className="metric-chip">单文件 10MB</span>
          <span className="metric-chip">单次最多 50 个</span>
        </div>
      </div>

      <div className="upload-panel__toolbar">
        <div className="upload-panel__summary">
          <span className="muted">已选择文件</span>
          <strong>
            {files.length} / {MAX_UPLOAD_FILES}
          </strong>
        </div>

        <button
          type="button"
          className="button-ghost"
          onClick={onClearFiles}
          disabled={files.length === 0}
        >
          清空文件
        </button>
      </div>

      {validationErrors.length > 0 ? (
        <ul className="message-list message-list--error">
          {validationErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ul className="upload-file-list">
          {files.map((item) => (
            <li key={item.id} className="upload-file-card">
              <div className="upload-file-card__main">
                <div className="upload-file-card__meta">
                  <strong>{item.file.name}</strong>
                  <div className="upload-file-card__facts">
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
                        ? '重复文件'
                        : item.localWarnings.length > 0
                          ? '待确认'
                          : '已加入任务'}
                    </span>
                  </div>
                </div>

                {item.localWarnings.map((warning) => (
                  <div key={warning} className="warning-text">
                    {warning}
                  </div>
                ))}
                {item.isServerDuplicate ? (
                  <div className="error-text">后端判定为重复文件</div>
                ) : null}
              </div>

              <button
                type="button"
                className="button-ghost"
                onClick={() => onRemoveFile(item.id)}
              >
                移除
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
