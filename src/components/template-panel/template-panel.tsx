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
    const fieldPreview = standardFields?.fields.slice(0, 10) ?? []

    return (
      <div className="template-panel template-panel--standard">
        <div className="template-panel__hero">
          <span className="panel-kicker">All Standard Fields</span>
          <h3>全字段返回模式</h3>
          <p className="muted">
            当前结果会按标准字段全量返回，后续在结果区直接完成列名调整、删列、排序和导出。
          </p>
        </div>

        <div className="template-panel__stats">
          <div className="template-panel__stat">
            <span className="muted">字段版本</span>
            <strong>{standardFields?.version ?? '-'}</strong>
          </div>
          <div className="template-panel__stat">
            <span className="muted">字段数量</span>
            <strong>{standardFields?.fields.length ?? 0}</strong>
          </div>
          <div className="template-panel__stat">
            <span className="muted">默认缺失值</span>
            <strong>
              <code>{standardFields?.default_missing_value ?? ''}</code>
            </strong>
          </div>
        </div>

        <div className="template-panel__preview">
          <div className="template-panel__preview-header">
            <span>字段预览</span>
            <span className="muted">
              {fieldPreview.length < (standardFields?.fields.length ?? 0)
                ? `展示前 ${fieldPreview.length} 个`
                : '当前版本全部字段'}
            </span>
          </div>
          <div className="tag-list">
            {fieldPreview.map((field) => (
              <span key={field} className="tag">
                {field}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (templates.length === 0) {
    return <p className="empty-state">当前没有可用模板。</p>
  }

  const selectedTemplate =
    templates.find((template) => template.template_id === selectedTemplateId) ?? null
  const previewHeaders =
    templateDetail === null
      ? []
      : templateDetail.recommended_field_ids.map(
          (fieldId) => templateDetail.default_header_labels[fieldId] ?? fieldId,
        )

  return (
    <div className="template-panel">
      <div className="template-panel__hero">
        <span className="panel-kicker">Template Guidance</span>
        <h3>模板选择区</h3>
        <p className="muted">
          选择预置模板后，后端会按该模板结构直接组装 Excel，结果区提供只读预览。
        </p>
      </div>

      <div className="template-panel__cards">
        {templates.map((template) => (
          <button
            key={template.template_id}
            type="button"
            className={
              template.template_id === selectedTemplateId
                ? 'template-card is-active'
                : 'template-card'
            }
            onClick={() => onSelectTemplate(template.template_id)}
          >
            <span className="template-card__eyebrow">
              v{template.template_version}
            </span>
            <strong>{template.template_name}</strong>
            <span className="muted">Mapping {template.mapping_version}</span>
            <span className="template-card__state">
              {template.template_id === selectedTemplateId ? '当前模板' : '点击载入'}
            </span>
          </button>
        ))}
      </div>

      {selectedTemplate ? (
        <div className="template-panel__selection">
          <span className="muted">已选模板</span>
          <strong>{selectedTemplate.template_name}</strong>
          <span className="muted">
            v{selectedTemplate.template_version} / Mapping{' '}
            {selectedTemplate.mapping_version}
          </span>
        </div>
      ) : null}

      {isTemplateDetailLoading ? (
        <div className="inline-notice">模板详情加载中...</div>
      ) : null}
      {templateDetailError ? (
        <div className="inline-notice inline-notice--error">
          {templateDetailError}
        </div>
      ) : null}

      {templateDetail ? (
        <div className="template-panel__preview">
          <div className="template-panel__preview-header">
            <span>推荐表头预览</span>
            <span className="muted">
              模板 ID：<code>{templateDetail.template_id}</code>
            </span>
          </div>
          <div className="tag-list">
            {previewHeaders.map((label) => (
              <span key={label} className="tag">
                {label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
