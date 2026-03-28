import type { CSSProperties } from 'react'

import { formatTaskStage, formatTaskStatus } from '@/core/formatters'
import type { TaskStage, TaskStatus } from '@/types/common'
import type { TaskStatusResponse } from '@/types/tasks'

interface ProgressPanelProps {
  taskId: string | null
  taskStatus: TaskStatus | null
  taskStage: TaskStage | null
  taskProgress: number
  taskSnapshot: TaskStatusResponse | null
  isPolling: boolean
  resultError: string | null
  isPreparing?: boolean
}

export function ProgressPanel({
  taskId,
  taskStatus,
  taskStage,
  taskProgress,
  taskSnapshot,
  isPolling,
  resultError,
  isPreparing = false,
}: ProgressPanelProps) {
  const progressValue = Math.max(0, Math.min(100, taskProgress))
  const statusTone =
    isPreparing
      ? 'info'
      : taskStatus === 'failed'
      ? 'error'
      : taskStatus === 'partially_succeeded'
        ? 'warning'
        : taskStatus === 'succeeded'
          ? 'success'
          : 'info'
  const wheelStyle = {
    '--progress': `${Math.max(progressValue, isPreparing ? 12 : 0)}%`,
  } as CSSProperties

  if (
    taskId === null &&
    taskSnapshot === null &&
    !isPolling &&
    !isPreparing &&
    resultError === null
  ) {
    return (
      <div className="progress-panel progress-panel--idle">
        <div className="progress-panel__header">
          <span className="panel-kicker">处理进度</span>
          <span className="status-pill status-pill--idle">等待中</span>
        </div>
        <h3>任务尚未启动</h3>
        <p className="muted">
          任务创建后，这里会显示状态、阶段和处理进度。
        </p>
      </div>
    )
  }

  return (
    <div className="progress-panel">
      <div className="progress-panel__header">
        <span className="panel-kicker">处理进度</span>
        <span className={`status-pill status-pill--${statusTone}`}>
          {isPreparing ? '提交中' : formatTaskStatus(taskStatus)}
        </span>
      </div>

      <div className="progress-panel__body">
        <div className="progress-wheel" style={wheelStyle}>
          <span className="progress-wheel__ring" />
          <span className="progress-wheel__center">
            {isPreparing ? '...' : `${progressValue}%`}
          </span>
        </div>

        <div className="progress-panel__headline">
          <h3>{isPreparing ? '正在创建任务' : formatTaskStage(taskStage)}</h3>
          <p className="muted">
            {isPreparing ? (
              '正在上传文件并向后端创建异步任务。'
            ) : (
              <>
                任务 ID：<code>{taskId ?? '-'}</code>
              </>
            )}
          </p>
        </div>
      </div>

      {!isPreparing ? (
        <div
          className="progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressValue}
        >
          <span style={{ width: `${progressValue}%` }} />
        </div>
      ) : null}

      {(isPolling || isPreparing) ? (
        <p className="progress-panel__hint">
          {isPreparing ? '正在建立任务，请稍候。' : '正在轮询任务状态并等待结果落盘...'}
        </p>
      ) : null}

      {taskSnapshot ? (
        <div className="progress-grid">
          <div className="progress-stat">
            <span className="muted">已处理</span>
            <strong>
              {taskSnapshot.processed_files} / {taskSnapshot.total_files}
            </strong>
          </div>
          <div className="progress-stat">
            <span className="muted">成功</span>
            <strong>{taskSnapshot.succeeded_files}</strong>
          </div>
          <div className="progress-stat">
            <span className="muted">失败</span>
            <strong>{taskSnapshot.failed_files}</strong>
          </div>
          <div className="progress-stat">
            <span className="muted">状态</span>
            <strong>{formatTaskStatus(taskSnapshot.status)}</strong>
          </div>
        </div>
      ) : null}

      {taskSnapshot?.error_message ? (
        <div className="inline-notice inline-notice--error">
          {taskSnapshot.error_message}
        </div>
      ) : null}
      {resultError ? (
        <div className="inline-notice inline-notice--error">{resultError}</div>
      ) : null}
    </div>
  )
}
