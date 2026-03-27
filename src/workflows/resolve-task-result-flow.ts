import { getTaskResult } from '@/api/tasks'
import { isResultNotReadyError } from '@/core/errors'
import type { TaskResultResponse } from '@/types/tasks'

export type ResolveTaskResultFlowResult =
  | { kind: 'ready'; result: TaskResultResponse }
  | { kind: 'not_ready' }

export async function resolveTaskResultFlow(
  taskId: string,
): Promise<ResolveTaskResultFlowResult> {
  try {
    const result = await getTaskResult(taskId)
    return { kind: 'ready', result }
  } catch (error) {
    if (isResultNotReadyError(error)) {
      return { kind: 'not_ready' }
    }

    throw error
  }
}
