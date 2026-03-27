import { requestJson } from '@/api/client'
import { API_PREFIX } from '@/core/constants'
import type { StandardFieldsResponse } from '@/types/standard-fields'

export function getStandardFields(
  signal?: AbortSignal,
): Promise<StandardFieldsResponse> {
  return requestJson<StandardFieldsResponse>(`${API_PREFIX}/standard-fields`, {
    signal,
  })
}
