export type ProcessingMode = 'template' | 'standard_edit'

export type TaskStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'partially_succeeded'
  | 'failed'

export type TaskStage =
  | ''
  | 'queued'
  | 'running'
  | 'file_preprocessing'
  | 'llm_processing'
  | 'assembling_results'
  | 'excel_generating'
  | 'succeeded'
  | 'partially_succeeded'
  | 'failed'

export type TableRow = string[]
