import { useLayoutEffect, useRef, useState } from 'react'

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
  disabled?: boolean
}

export function TemplatePanel({
  mode,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  disabled = false,
}: TemplatePanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [stableMinHeight, setStableMinHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (panelRef.current === null) {
      return
    }

    const nextHeight = Math.ceil(panelRef.current.getBoundingClientRect().height)

    if (nextHeight <= 0) {
      return
    }

    setStableMinHeight((currentHeight) => {
      if (currentHeight !== null && nextHeight <= currentHeight) {
        return currentHeight
      }

      return nextHeight
    })
  }, [mode, templates.length])

  const panelStyle =
    stableMinHeight === null ? undefined : { minHeight: `${stableMinHeight}px` }

  if (mode === 'standard_edit') {
    return (
      <div ref={panelRef} className="template-panel" style={panelStyle}>
        <div className="template-panel__hero">
          <span className="panel-kicker">Standard Field Guidance</span>
          <h3>数据列自由组合</h3>
          <p className="muted template-panel__description">
            系统将自动识别发票内所有字段并填入到excel表格中，您可以根据自己需要的内容进行表头编辑、数据选择。
          </p>
        </div>

        {templates.length > 0 ? (
          <div
            className="template-panel__cards template-panel__cards--ghost"
            aria-hidden="true"
          >
            {templates.map((template) => (
              <div key={template.template_id} className="template-card">
                <span className="template-card__eyebrow">
                  {template.template_version}
                </span>
                <strong>{template.template_name}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  if (templates.length === 0) {
    return <p className="empty-state">当前没有可用模板。</p>
  }

  return (
    <div ref={panelRef} className="template-panel" style={panelStyle}>
      <div className="template-panel__hero">
        <span className="panel-kicker">Template Guidance</span>
        <h3>模板选择区</h3>
        <p className="muted template-panel__description">
          选择预置模板后，将仅填写模板内含有的预置字段及其数据
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
            disabled={disabled}
          >
            <span className="template-card__eyebrow">
              {template.template_version}
            </span>
            <strong>{template.template_name}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}
