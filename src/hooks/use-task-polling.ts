import { useEffect, useEffectEvent, useState } from 'react'

import { getTaskStatus } from '@/api/tasks'
import { POLLING_INTERVAL_MS, TERMINAL_TASK_STATUSES } from '@/core/constants'
import { toAppError } from '@/core/errors'
import type { AppError } from '@/core/errors'
import type { TaskResultResponse, TaskStatusResponse } from '@/types/tasks'
import { resolveTaskResultFlow } from '@/workflows/resolve-task-result-flow'

interface UseTaskPollingOptions {
  taskId: string | null
  enabled: boolean
  onStatus: (status: TaskStatusResponse) => void
  onResult: (result: TaskResultResponse) => void
  onError: (error: AppError) => void
  onSettled?: () => void
}

export function useTaskPolling({
  taskId,
  enabled,
  onStatus,
  onResult,
  onError,
  onSettled,
}: UseTaskPollingOptions) {
  const [isPolling, setIsPolling] = useState(false)
  const onStatusEvent = useEffectEvent(onStatus)
  const onResultEvent = useEffectEvent(onResult)
  const onErrorEvent = useEffectEvent(onError)
  const onSettledEvent = useEffectEvent(() => {
    onSettled?.()
  })

  useEffect(() => {
    if (!enabled || taskId === null) {
      setIsPolling(false)
      return
    }

    let disposed = false
    let timeoutId: number | undefined
    setIsPolling(true)

    const scheduleNext = () => {
      timeoutId = window.setTimeout(() => {
        void poll()
      }, POLLING_INTERVAL_MS)
    }

    const poll = async () => {
      try {
        const snapshot = await getTaskStatus(taskId)

        if (disposed) {
          return
        }

        onStatusEvent(snapshot)

        if (TERMINAL_TASK_STATUSES.includes(snapshot.status)) {
          const resolved = await resolveTaskResultFlow(taskId)

          if (disposed) {
            return
          }

          if (resolved.kind === 'ready') {
            setIsPolling(false)
            onResultEvent(resolved.result)
            onSettledEvent()
            return
          }
        }

        scheduleNext()
      } catch (error) {
        if (disposed) {
          return
        }

        setIsPolling(false)
        onErrorEvent(toAppError(error))
        onSettledEvent()
      }
    }

    void poll()

    return () => {
      disposed = true

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [enabled, taskId])

  return { isPolling }
}
