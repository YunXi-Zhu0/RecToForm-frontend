import { buildAbsoluteUrl, requestJson } from '@/api/client'
import { API_PREFIX } from '@/core/constants'
import type {
  CreateTaskConfig,
  CreateTaskResponse,
  TaskResultResponse,
  TaskStatusResponse,
} from '@/types/tasks'

interface CreateTaskRequest {
  config: CreateTaskConfig
  files: File[]
  signal?: AbortSignal
}

export function createTask({
  config,
  files,
  signal,
}: CreateTaskRequest): Promise<CreateTaskResponse> {
  const formData = new FormData()
  formData.append('config', JSON.stringify(config))

  files.forEach((file) => {
    formData.append('files', file)
  })

  return requestJson<CreateTaskResponse>(`${API_PREFIX}/tasks`, {
    method: 'POST',
    body: formData,
    signal,
  })
}

export function getTaskStatus(
  taskId: string,
  signal?: AbortSignal,
): Promise<TaskStatusResponse> {
  return requestJson<TaskStatusResponse>(`${API_PREFIX}/tasks/${taskId}`, {
    signal,
  })
}

export function getTaskResult(
  taskId: string,
  signal?: AbortSignal,
): Promise<TaskResultResponse> {
  return requestJson<TaskResultResponse>(
    `${API_PREFIX}/tasks/${taskId}/result`,
    { signal },
  )
}

export function getTaskExcelDownloadUrl(taskId: string): string {
  return buildAbsoluteUrl(`${API_PREFIX}/tasks/${taskId}/excel`)
}
