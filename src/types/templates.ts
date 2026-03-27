export interface TemplateSummary {
  template_id: string
  template_name: string
  template_version: string
  mapping_version: string
}

export interface TemplateDetail {
  template_id: string
  template_name: string
  template_version: string
  mapping_version: string
  recommended_field_ids: string[]
  default_header_labels: Record<string, string>
}
