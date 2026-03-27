import { ACCEPTED_FILE_INPUT, MAX_UPLOAD_FILES } from '@/core/constants'
import type { UploadFileItem } from '@/types/workbench'

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
  return (
    <div className="stack">
      <label className="file-picker">
        <span>选择发票文件</span>
        <input
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
      </label>

      <div className="inline-actions">
        <span>
          已选择 {files.length} / {MAX_UPLOAD_FILES} 个文件
        </span>
        <button type="button" onClick={onClearFiles} disabled={files.length === 0}>
          清空
        </button>
      </div>

      {validationErrors.length > 0 ? (
        <ul className="message-list error-list">
          {validationErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ul className="file-list">
          {files.map((item) => (
            <li key={item.id} className="file-item">
              <div>
                <strong>{item.file.name}</strong>
                <div className="muted">
                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
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

              <button type="button" onClick={() => onRemoveFile(item.id)}>
                移除
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">支持图片与 PDF，单文件不超过 10MB，单次最多 50 个文件。</p>
      )}
    </div>
  )
}
