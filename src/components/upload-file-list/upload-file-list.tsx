import { buildWeakFileSignature } from '@/core/validators'
import type { UploadFileItem } from '@/types/workbench'

interface UploadFileListProps {
  files: UploadFileItem[]
  onRemoveFile: (fileId: string) => void
  canRemoveSuccessfulFiles?: boolean
}

function formatFileSize(size: number): string {
  if (size < 1024 * 1024) {
    return `${Math.max(size / 1024, 0.1).toFixed(1)}KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

function getFileStatus(item: UploadFileItem): {
  icon: 'success' | 'error'
  toneClassName: string
} {
  if (item.isServerDuplicate) {
    return {
      icon: 'error',
      toneClassName: 'is-error',
    }
  }

  if (item.localWarnings.length > 0) {
    return {
      icon: 'error',
      toneClassName: 'is-error',
    }
  }

  return {
    icon: 'success',
    toneClassName: 'is-success',
  }
}

function buildDuplicateHintMap(files: UploadFileItem[]): Map<string, string> {
  const hintMap = new Map<string, string>()
  const groups = new Map<string, number[]>()

  files.forEach((item, index) => {
    const key = item.isServerDuplicate ? `server:${item.file.name}` : `local:${buildWeakFileSignature(item.file)}`

    if (item.isServerDuplicate || item.localWarnings.length > 0) {
      const current = groups.get(key) ?? []
      current.push(index)
      groups.set(key, current)
    }
  })

  groups.forEach((indexes) => {
    if (indexes.length === 1) {
      hintMap.set(files[indexes[0]].id, '与已有文件重复')
      return
    }

    if (indexes.length < 2) {
      return
    }

    indexes.forEach((index, position) => {
      const targetIndex =
        position > 0 ? indexes[0] : indexes.find((value) => value !== index) ?? indexes[0]

      hintMap.set(files[index].id, `与${targetIndex + 1}重复`)
    })
  })

  return hintMap
}

function FileDocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3.75h7.2l5.05 5.05V19.5A1.75 1.75 0 0 1 17.5 21.25h-10A1.75 1.75 0 0 1 5.75 19.5v-14A1.75 1.75 0 0 1 7.5 3.75Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M14.25 3.75v4.5h4.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9 12.25h6M9 16h6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function StatusIcon({ status }: { status: 'success' | 'error' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {status === 'success' ? (
        <path
          d="m8.4 12.3 2.35 2.35 4.85-5.1"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      ) : (
        <path
          d="m8.75 8.75 6.5 6.5m0-6.5-6.5 6.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      )}
    </svg>
  )
}

function RemovableSuccessStatusButton({
  fileName,
  onRemove,
}: {
  fileName: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      className="file-status file-status--button file-status--removable is-success"
      aria-label={`删除文件 ${fileName}`}
      onClick={onRemove}
    >
      <span className="file-status__icon file-status__icon--idle">
        <StatusIcon status="success" />
      </span>
      <span className="file-status__icon file-status__icon--hover">
        <StatusIcon status="error" />
      </span>
    </button>
  )
}

export function UploadFileList({
  files,
  onRemoveFile,
  canRemoveSuccessfulFiles = true,
}: UploadFileListProps) {
  const duplicateHintMap = buildDuplicateHintMap(files)

  return (
    <div className="upload-file-sidebar">
      {files.length === 0 ? (
        <div className="upload-file-sidebar__empty">
          <p>暂无文件</p>
        </div>
      ) : (
        <div className="upload-file-sidebar__table" role="table" aria-label="上传文件清单">
          <div className="upload-file-sidebar__scroll-region">
            <div className="upload-file-sidebar__table-head" role="row">
              <span className="upload-file-sidebar__head-cell upload-file-sidebar__head-cell--index">
                序号
              </span>
              <span className="upload-file-sidebar__head-cell upload-file-sidebar__head-cell--name">
                文件名
              </span>
              <span className="upload-file-sidebar__head-cell upload-file-sidebar__head-cell--size">
                大小
              </span>
              <span className="upload-file-sidebar__head-cell upload-file-sidebar__head-cell--status">
                状态
              </span>
            </div>

            <ul className="upload-file-sidebar__list">
              {files.map((item, index) => {
                const status = getFileStatus(item)
                const duplicateHint = duplicateHintMap.get(item.id) ?? ''

                return (
                  <li
                    key={item.id}
                    className={`upload-file-entry ${status.toneClassName}`}
                    role="row"
                  >
                    <div className="upload-file-entry__cell upload-file-entry__cell--index">
                      <span>{index + 1}</span>
                    </div>

                    <div className="upload-file-entry__cell upload-file-entry__cell--name">
                      <div className="upload-file-entry__file">
                        <span className="upload-file-entry__file-icon">
                          <FileDocumentIcon />
                        </span>
                        <strong title={item.file.name}>{item.file.name}</strong>
                      </div>
                    </div>

                    <div className="upload-file-entry__cell upload-file-entry__cell--size">
                      <span>{formatFileSize(item.file.size)}</span>
                    </div>

                    <div className="upload-file-entry__cell upload-file-entry__cell--status">
                      {status.icon === 'error' ? (
                        <button
                          type="button"
                          className={`file-status file-status--button ${status.toneClassName}`}
                          aria-label={`删除重复文件 ${item.file.name}`}
                          onClick={() => onRemoveFile(item.id)}
                        >
                          <StatusIcon status={status.icon} />
                        </button>
                      ) : canRemoveSuccessfulFiles ? (
                        <RemovableSuccessStatusButton
                          fileName={item.file.name}
                          onRemove={() => onRemoveFile(item.id)}
                        />
                      ) : (
                        <span className={`file-status ${status.toneClassName}`}>
                          <StatusIcon status={status.icon} />
                        </span>
                      )}
                      {duplicateHint ? (
                        <span className={`file-status__hint ${status.toneClassName}`}>
                          {duplicateHint}
                        </span>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
