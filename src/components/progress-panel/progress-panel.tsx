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
}

export function ProgressPanel({
  taskId,
  taskStatus,
  taskStage,
  taskProgress,
  taskSnapshot,
  isPolling,
  resultError,
}: ProgressPanelProps) {
  return (
    <div className="stack">
      <p>
        任务 ID：<code>{taskId ?? '-'}</code>
      </p>
      <p>状态：{formatTaskStatus(taskStatus)}</p>
      <p>阶段：{formatTaskStage(taskStage)}</p>
      <p>进度：{taskProgress}%</p>
      <progress max={100} value={taskProgress} />
      {isPolling ? <p className="muted">正在轮询任务状态...</p> : null}

      {taskSnapshot ? (
        <div className="progress-grid">
          <span>总文件数：{taskSnapshot.total_files}</span>
          <span>已处理：{taskSnapshot.processed_files}</span>
          <span>成功：{taskSnapshot.succeeded_files}</span>
          <span>失败：{taskSnapshot.failed_files}</span>
        </div>
      ) : null}

      {taskSnapshot?.error_message ? (
        <p className="error-text">{taskSnapshot.error_message}</p>
      ) : null}
      {resultError ? <p className="error-text">{resultError}</p> : null}
    </div>
  )
}
