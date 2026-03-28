import { ACCEPTED_FILE_INPUT, MAX_UPLOAD_FILES } from '@/core/constants'
import { useRef, useState } from 'react'

interface UploadPanelProps {
  filesCount: number
  validationErrors: string[]
  onAddFiles: (files: FileList | File[]) => void
}

export function UploadPanel({
  filesCount,
  validationErrors,
  onAddFiles,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

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
            if (
              event.currentTarget.files !== null &&
              event.currentTarget.files.length > 0
            ) {
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
          <h3>{filesCount > 0 ? '继续补充发票文件' : '拖拽或点击上传发票文件'}</h3>
          <p className="muted">
            {filesCount > 0
              ? '已保留当前文件队列。继续选择后会自动回到中间预演区。'
              : '支持图片与 PDF。文件加入后，中间区域会切换成模板预演态。'}
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
          <span className="metric-chip">{filesCount} 个已选文件</span>
          <span className="metric-chip">图片 / PDF</span>
          <span className="metric-chip">单文件 10MB</span>
          <span className="metric-chip">单次最多 50 个</span>
        </div>
      </div>

      {validationErrors.length > 0 ? (
        <ul className="message-list message-list--error">
          {validationErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      {filesCount >= MAX_UPLOAD_FILES ? (
        <div className="inline-notice">
          文件数量已达到上限，可先移除右侧文件后再继续补充。
        </div>
      ) : null}
    </div>
  )
}
