import { requestJson } from '@/api/client'
import { API_PREFIX } from '@/core/constants'
import type { TemplateDetail, TemplateSummary } from '@/types/templates'

export function getTemplates(signal?: AbortSignal): Promise<TemplateSummary[]> {
  return requestJson<TemplateSummary[]>(`${API_PREFIX}/templates`, { signal })
}

export function getTemplateDetail(
  templateId: string,
  signal?: AbortSignal,
): Promise<TemplateDetail> {
  return requestJson<TemplateDetail>(`${API_PREFIX}/templates/${templateId}`, {
    signal,
  })
}
