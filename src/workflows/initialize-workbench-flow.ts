import { getStandardFields } from '@/api/standard-fields'
import { getTemplateDetail, getTemplates } from '@/api/templates'
import type { WorkbenchInitializationData } from '@/types/workbench'

export async function initializeWorkbenchFlow(): Promise<WorkbenchInitializationData> {
  const [templates, standardFields] = await Promise.all([
    getTemplates(),
    getStandardFields(),
  ])
  const selectedTemplateId = templates[0]?.template_id ?? null
  const templateDetail = selectedTemplateId
    ? await getTemplateDetail(selectedTemplateId)
    : null

  return {
    templates,
    selectedTemplateId,
    templateDetail,
    standardFields,
  }
}
