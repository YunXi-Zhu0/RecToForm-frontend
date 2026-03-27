import { createStandardFieldsExport } from '@/api/exports'
import { DEFAULT_EXPORT_FILENAME } from '@/core/constants'
import { AppError } from '@/core/errors'
import { validateExportTable } from '@/core/validators'
import type { StandardFieldsExportResponse } from '@/types/exports'

interface ExportStandardFieldsFlowInput {
  headers: string[]
  rows: string[][]
  filename?: string
}

export async function exportStandardFieldsFlow({
  headers,
  rows,
  filename = DEFAULT_EXPORT_FILENAME,
}: ExportStandardFieldsFlowInput): Promise<StandardFieldsExportResponse> {
  const errors = validateExportTable(headers, rows)

  if (errors.length > 0) {
    throw new AppError(errors[0], { detail: errors })
  }

  return createStandardFieldsExport({
    headers,
    rows,
    filename,
  })
}
