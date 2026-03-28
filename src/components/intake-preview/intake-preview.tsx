import type { CSSProperties } from 'react'

import type { ProcessingMode } from '@/types/common'
import type { StandardFieldsResponse } from '@/types/standard-fields'
import type { TemplateDetail, TemplateSummary } from '@/types/templates'

interface IntakePreviewProps {
  mode: ProcessingMode
  selectedTemplate: TemplateSummary | null
  templateDetail: TemplateDetail | null
  standardFields: StandardFieldsResponse | null
  uploadFileNames: string[]
  isTemplateDetailLoading: boolean
  templateDetailError: string | null
  onBack: () => void
}

function buildPreviewHeaders(
  mode: ProcessingMode,
  templateDetail: TemplateDetail | null,
  standardFields: StandardFieldsResponse | null,
): string[] {
  if (mode === 'standard_edit') {
    return (standardFields?.fields ?? []).slice(0, 6)
  }

  const templateHeaders =
    templateDetail?.recommended_field_ids.map(
      (fieldId) => templateDetail.default_header_labels[fieldId] ?? fieldId,
    ) ?? []

  return ['源文件', ...templateHeaders].slice(0, 6)
}

export function IntakePreview({
  mode,
  selectedTemplate,
  templateDetail,
  standardFields,
  uploadFileNames,
  isTemplateDetailLoading,
  templateDetailError,
  onBack,
}: IntakePreviewProps) {
  const headers = buildPreviewHeaders(mode, templateDetail, standardFields)
  const displayHeaders =
    headers.length > 0 ? headers : ['示例列 1', '示例列 2', '示例列 3', '示例列 4']
  const previewFiles = uploadFileNames.slice(0, 4)
  const previewRows = previewFiles.length > 0 ? previewFiles : ['待处理文件 A', '待处理文件 B']
  const gridStyle = {
    '--preview-columns': displayHeaders.length,
  } as CSSProperties
  const panelTitle = mode === 'template' ? '模板结构预演' : '标准字段预演'
  const panelDescription =
    mode === 'template'
      ? selectedTemplate
        ? `${selectedTemplate.template_name} 的表头和行形态会在正式识别后按该结构输出。`
        : '先在左侧选择模板，再预演表格结构。'
      : '标准字段模式下，中间区域会先展示待返回的字段排布。'

  return (
    <div className="intake-preview">
      <div className="intake-preview__header">
        <div>
          <span className="panel-kicker">预览区域</span>
          <h3>{panelTitle}</h3>
          <p className="muted">{panelDescription}</p>
        </div>

        <button type="button" className="button-secondary" onClick={onBack}>
          返回补充文件
        </button>
      </div>

      {isTemplateDetailLoading ? (
        <div className="inline-notice">模板详情加载中，正在准备预演表头...</div>
      ) : null}
      {templateDetailError ? (
        <div className="inline-notice inline-notice--error">{templateDetailError}</div>
      ) : null}
      {mode === 'template' && selectedTemplate === null ? (
        <div className="empty-state empty-state--warning">
          <p>左侧还没有选模板。选定模板后，这里会显示对应的表头和虚拟表格。</p>
        </div>
      ) : (
        <div className="intake-preview__board">
          <div className="intake-preview__meta">
            <span className="tag">
              {mode === 'template'
                ? selectedTemplate?.template_name ?? '待选模板'
                : `字段版本 ${standardFields?.version ?? '-'}`}
            </span>
            <span className="tag">{uploadFileNames.length} 个待处理文件</span>
            <span className="tag">仅展示虚拟表格样式</span>
          </div>

          <div className="intake-preview-grid" style={gridStyle}>
            <div className="intake-preview-grid__row intake-preview-grid__row--header">
              {displayHeaders.map((header) => (
                <div key={header} className="intake-preview-grid__cell">
                  {header}
                </div>
              ))}
            </div>

            {previewRows.map((fileName, rowIndex) => (
              <div
                key={`${fileName}-${rowIndex}`}
                className="intake-preview-grid__row"
              >
                {displayHeaders.map((header, columnIndex) => (
                  <div
                    key={`${fileName}-${header}`}
                    className={
                      columnIndex === 0 && mode === 'template'
                        ? 'intake-preview-grid__cell intake-preview-grid__cell--file'
                        : 'intake-preview-grid__cell intake-preview-grid__cell--skeleton'
                    }
                  >
                    {columnIndex === 0 && mode === 'template' ? (
                      fileName
                    ) : (
                      <span
                        className="intake-preview-grid__skeleton"
                        style={{
                          width: `${56 + ((rowIndex + columnIndex) % 3) * 14}%`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
