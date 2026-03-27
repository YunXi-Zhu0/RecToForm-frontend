import type { TableRow } from '@/types/common'
import type { StandardFieldsResponse } from '@/types/standard-fields'
import type { TaskResultResponse, TaskStatusResponse } from '@/types/tasks'
import type { TemplateDetail, TemplateSummary } from '@/types/templates'

export interface UploadFileItem {
  id: string
  file: File
  localWarnings: string[]
  isServerDuplicate: boolean
}

export interface EditableTableState {
  headers: string[]
  rows: TableRow[]
}

export interface WorkbenchInitializationData {
  templates: TemplateSummary[]
  selectedTemplateId: string | null
  templateDetail: TemplateDetail | null
  standardFields: StandardFieldsResponse
}

export interface WorkbenchTaskState {
  taskId: string | null
  taskSnapshot: TaskStatusResponse | null
  taskResult: TaskResultResponse | null
}
