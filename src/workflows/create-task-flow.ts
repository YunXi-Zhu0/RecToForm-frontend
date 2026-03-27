import { createTask } from '@/api/tasks'
import { DEFAULT_EXTRA_INSTRUCTIONS } from '@/core/constants'
import { AppError } from '@/core/errors'
import type { ProcessingMode } from '@/types/common'
import type { CreateTaskResponse } from '@/types/tasks'
import type { TemplateSummary } from '@/types/templates'

interface CreateTaskFlowInput {
  mode: ProcessingMode
  files: File[]
  selectedTemplate: TemplateSummary | null
  extraInstructions?: string[]
}

export async function createTaskFlow({
  mode,
  files,
  selectedTemplate,
  extraInstructions = DEFAULT_EXTRA_INSTRUCTIONS,
}: CreateTaskFlowInput): Promise<CreateTaskResponse> {
  if (mode === 'template') {
    if (selectedTemplate === null) {
      throw new AppError('模板模式下必须选择模板。')
    }

    return createTask({
      files,
      config: {
        mode,
        template_id: selectedTemplate.template_id,
        template_version: selectedTemplate.template_version,
        extra_instructions: extraInstructions,
      },
    })
  }

  return createTask({
    files,
    config: {
      mode,
      extra_instructions: extraInstructions,
    },
  })
}
