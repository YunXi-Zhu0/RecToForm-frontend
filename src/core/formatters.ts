import { MODE_LABELS, TASK_STAGE_LABELS, TASK_STATUS_LABELS } from '@/core/constants'
import type { ProcessingMode, TaskStage, TaskStatus } from '@/types/common'

export function formatMode(mode: ProcessingMode): string {
  return MODE_LABELS[mode]
}

export function formatTaskStatus(status: TaskStatus | null): string {
  if (status === null) {
    return '未开始'
  }

  return TASK_STATUS_LABELS[status]
}

export function formatTaskStage(stage: TaskStage | null): string {
  if (stage === null) {
    return '等待任务'
  }

  return TASK_STAGE_LABELS[stage]
}

export function formatDraftSavedAt(savedAt: string | null): string {
  if (savedAt === null) {
    return '尚未保存'
  }

  const date = new Date(savedAt)

  if (Number.isNaN(date.getTime())) {
    return '刚刚'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
