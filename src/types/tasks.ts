import type { ProcessingMode, TableRow, TaskStage, TaskStatus } from '@/types/common'

export interface FailedItem {
  file_id: string
  file_name: string
  error_message: string
}

export interface TemplateTaskConfig {
  mode: 'template'
  template_id: string
  template_version?: string
  extra_instructions: string[]
}

export interface StandardEditTaskConfig {
  mode: 'standard_edit'
  extra_instructions: string[]
}

export type CreateTaskConfig = TemplateTaskConfig | StandardEditTaskConfig

export interface CreateTaskResponse {
  task_id: string
  status: TaskStatus
  mode: ProcessingMode
  total_files: number
  duplicate_files: string[]
}

export interface TaskStatusResponse {
  task_id: string
  mode: ProcessingMode
  status: TaskStatus
  stage: TaskStage
  total_files: number
  processed_files: number
  succeeded_files: number
  failed_files: number
  progress_percent: number
  error_message: string
}

interface BaseTaskResult {
  task_id: string
  mode: ProcessingMode
  status: Extract<TaskStatus, 'succeeded' | 'partially_succeeded' | 'failed'>
  failed_items: FailedItem[]
}

export interface TemplateTaskResult extends BaseTaskResult {
  mode: 'template'
  preview_headers: string[]
  preview_rows: TableRow[]
  excel_download_url: string
}

export interface StandardEditTaskResult extends BaseTaskResult {
  mode: 'standard_edit'
  standard_fields: string[]
  rows: TableRow[]
}

export type TaskResultResponse = TemplateTaskResult | StandardEditTaskResult
