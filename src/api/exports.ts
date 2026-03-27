import { buildAbsoluteUrl, requestJson } from '@/api/client'
import { API_PREFIX } from '@/core/constants'
import type {
  StandardFieldsExportRequest,
  StandardFieldsExportResponse,
} from '@/types/exports'

export function createStandardFieldsExport(
  payload: StandardFieldsExportRequest,
  signal?: AbortSignal,
): Promise<StandardFieldsExportResponse> {
  return requestJson<StandardFieldsExportResponse>(
    `${API_PREFIX}/exports/standard-fields`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    },
  )
}

export function getStandardFieldsExportDownloadUrl(exportId: string): string {
  return buildAbsoluteUrl(`${API_PREFIX}/exports/standard-fields/${exportId}`)
}
