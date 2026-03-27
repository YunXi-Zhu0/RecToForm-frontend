import type { StandardFieldsResponse } from '@/types/standard-fields'
import type { ProcessingMode } from '@/types/common'
import type { TemplateDetail, TemplateSummary } from '@/types/templates'

interface TemplatePanelProps {
  mode: ProcessingMode
  templates: TemplateSummary[]
  selectedTemplateId: string | null
  onSelectTemplate: (templateId: string) => void
  templateDetail: TemplateDetail | null
  standardFields: StandardFieldsResponse | null
  isTemplateDetailLoading: boolean
  templateDetailError: string | null
}

export function TemplatePanel({
  mode,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  templateDetail,
  standardFields,
  isTemplateDetailLoading,
  templateDetailError,
}: TemplatePanelProps) {
  if (mode === 'standard_edit') {
    return (
      <div className="stack">
        <p>
          标准字段版本：<strong>{standardFields?.version ?? '-'}</strong>
        </p>
        <p>
          默认缺失值：<code>{standardFields?.default_missing_value ?? ''}</code>
        </p>
        <p>字段数：{standardFields?.fields.length ?? 0}</p>
        <div className="tag-list">
          {standardFields?.fields.map((field) => (
            <span key={field} className="tag">
              {field}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (templates.length === 0) {
    return <p className="muted">当前没有可用模板。</p>
  }

  return (
    <div className="stack">
      <label className="field">
        <span>模板</span>
        <select
          value={selectedTemplateId ?? ''}
          onChange={(event) => onSelectTemplate(event.currentTarget.value)}
        >
          {templates.map((template) => (
            <option key={template.template_id} value={template.template_id}>
              {template.template_name} ({template.template_version})
            </option>
          ))}
        </select>
      </label>

      {isTemplateDetailLoading ? <p>模板详情加载中...</p> : null}
      {templateDetailError ? <p className="error-text">{templateDetailError}</p> : null}

      {templateDetail ? (
        <div className="stack">
          <p>
            模板 ID：<code>{templateDetail.template_id}</code>
          </p>
          <p>
            版本：{templateDetail.template_version} / Mapping{' '}
            {templateDetail.mapping_version}
          </p>
          <p>推荐字段：</p>
          <div className="tag-list">
            {templateDetail.recommended_field_ids.map((fieldId) => (
              <span key={fieldId} className="tag">
                {templateDetail.default_header_labels[fieldId] ?? fieldId}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
