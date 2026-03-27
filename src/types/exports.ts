import type { TableRow } from '@/types/common'

export interface StandardFieldsExportRequest {
  headers: string[]
  rows: TableRow[]
  filename?: string
}

export interface StandardFieldsExportResponse {
  export_id: string
  filename: string
  download_url: string
}
