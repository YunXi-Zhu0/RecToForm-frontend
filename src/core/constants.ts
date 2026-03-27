import type { ProcessingMode, TaskStage, TaskStatus } from '@/types/common'

export const API_PREFIX = '/api/v1'

export const MAX_UPLOAD_FILES = 50
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
export const POLLING_INTERVAL_MS = 2500
export const DEFAULT_EXTRA_INSTRUCTIONS: string[] = []
export const DEFAULT_EXPORT_FILENAME = 'standard_fields_export.xlsx'
export const ACCEPTED_FILE_INPUT = 'image/*,.pdf,application/pdf'

export const PROCESSING_MODES: ProcessingMode[] = ['template', 'standard_edit']

export const TERMINAL_TASK_STATUSES: TaskStatus[] = [
  'succeeded',
  'partially_succeeded',
  'failed',
]

export const MODE_LABELS: Record<ProcessingMode, string> = {
  template: '模板模式',
  standard_edit: '标准字段模式',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  queued: '排队中',
  running: '处理中',
  succeeded: '处理成功',
  partially_succeeded: '部分成功',
  failed: '处理失败',
}

export const TASK_STAGE_LABELS: Record<TaskStage, string> = {
  '': '等待更新',
  queued: '进入队列',
  running: '处理中',
  file_preprocessing: '文件预处理',
  llm_processing: '识别处理中',
  assembling_results: '结果组装',
  excel_generating: 'Excel 生成中',
  succeeded: '处理成功',
  partially_succeeded: '部分成功',
  failed: '处理失败',
}
