import { ExportActions } from '@/components/export-actions/export-actions'
import { FailedItems } from '@/components/failed-items/failed-items'
import { ModeSwitcher } from '@/components/mode-switcher/mode-switcher'
import { ProgressPanel } from '@/components/progress-panel/progress-panel'
import { ResultTable } from '@/components/result-table/result-table'
import { UploadPanel } from '@/components/upload-panel/upload-panel'
import { formatTaskStatus } from '@/core/formatters'
import { useWorkbenchState } from '@/hooks/use-workbench-state'

export function WorkbenchPage() {
  const state = useWorkbenchState()
  const isProcessing = state.isSubmittingTask || state.isPolling
  const hasFiles = state.uploadFiles.files.length > 0
  const hasResult = state.taskResult !== null
  const hasFailedItems = state.failedItems.length > 0
  const systemState = state.initializationError
    ? '连接异常'
    : state.isInitializing
      ? '初始化中'
      : isProcessing
        ? '处理中'
        : '就绪'
  const systemTone = state.initializationError
    ? 'error'
    : state.isInitializing
      ? 'warning'
      : isProcessing
        ? 'info'
        : 'success'
  const templatePreviewHeaders =
    state.templateDetail === null
      ? []
      : state.templateDetail.recommended_field_ids
          .map(
            (fieldId) => state.templateDetail?.default_header_labels[fieldId] ?? fieldId,
          )
          .slice(0, 6)
  const standardFieldPreview = state.standardFields?.fields.slice(0, 6) ?? []

  return (
    <main className="workbench-page">
      <header className="brand-header">
        <div className="brand-header__brand">
          <span className="brand-header__eyebrow">轻松整理发票</span>
          <h1>RecToForm</h1>
        </div>

        <div className="brand-header__meta">
          <span className={`status-pill status-pill--${systemTone}`}>
            {systemState}
          </span>
          <span className="metric-chip">
            {state.taskStatus === null ? '等待上传' : formatTaskStatus(state.taskStatus)}
          </span>
        </div>
      </header>

      <section className="hero-copy">
        <p>
          上传票据后，在同一张卡片里选择处理模式并直接启动任务。处理中会对当前区域做虚化遮罩，
          只保留进度与轮盘。
        </p>
      </section>

      {state.initializationError ? (
        <div className="banner">
          <span>{state.initializationError}</span>
          <button
            type="button"
            className="button-secondary"
            onClick={() => void state.reloadInitialization()}
          >
            重新加载
          </button>
        </div>
      ) : null}

      <section className="intake-shell">
        <div className={isProcessing ? 'intake-card is-processing' : 'intake-card'}>
          <div className="intake-card__base">
            <div className="intake-card__intro">
              <span className="panel-kicker">上传区域</span>
              <h2>先上传文件，再配置处理方式。</h2>
              <p className="muted">
                简化成单一路径，不预先展开多余控制区。上传完成后再显示模式与模板配置。
              </p>
            </div>

            <UploadPanel
              files={state.uploadFiles.items}
              validationErrors={state.uploadFiles.validationErrors}
              onAddFiles={state.uploadFiles.addFiles}
              onRemoveFile={state.uploadFiles.removeFile}
              onClearFiles={state.uploadFiles.clearFiles}
            />

            {hasFiles ? (
              <section className="intake-config">
                <div className="intake-config__header">
                  <div>
                    <span className="panel-kicker">处理方式</span>
                    <h3>选择处理模式</h3>
                  </div>
                  <span className="metric-chip">{state.uploadFiles.files.length} 个文件</span>
                </div>

                <ModeSwitcher value={state.mode} onChange={state.changeMode} />

                {state.mode === 'template' ? (
                  <div className="compact-config">
                    <label className="field">
                      <span>输出模板</span>
                      <select
                        value={state.selectedTemplateId ?? ''}
                        onChange={(event) => state.selectTemplateId(event.target.value)}
                      >
                        <option value="">请选择模板</option>
                        {state.templates.map((template) => (
                          <option
                            key={template.template_id}
                            value={template.template_id}
                          >
                            {template.template_name} · v{template.template_version}
                          </option>
                        ))}
                      </select>
                    </label>

                    {state.selectedTemplate ? (
                      <div className="compact-stat-grid">
                        <div className="compact-stat">
                          <span className="muted">当前模板</span>
                          <strong>{state.selectedTemplate.template_name}</strong>
                        </div>
                        <div className="compact-stat">
                          <span className="muted">模板版本</span>
                          <strong>v{state.selectedTemplate.template_version}</strong>
                        </div>
                        <div className="compact-stat">
                          <span className="muted">映射版本</span>
                          <strong>{state.selectedTemplate.mapping_version}</strong>
                        </div>
                      </div>
                    ) : null}

                    {state.isTemplateDetailLoading ? (
                      <div className="inline-notice">模板详情加载中...</div>
                    ) : null}
                    {state.templateDetailError ? (
                      <div className="inline-notice inline-notice--error">
                        {state.templateDetailError}
                      </div>
                    ) : null}
                    {templatePreviewHeaders.length > 0 ? (
                      <div className="compact-preview">
                        <span className="muted">推荐表头预览</span>
                        <div className="tag-list">
                          {templatePreviewHeaders.map((label) => (
                            <span key={label} className="tag">
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="compact-config">
                    <div className="compact-stat-grid">
                      <div className="compact-stat">
                        <span className="muted">字段版本</span>
                        <strong>{state.standardFields?.version ?? '-'}</strong>
                      </div>
                      <div className="compact-stat">
                        <span className="muted">字段数量</span>
                        <strong>{state.standardFields?.fields.length ?? 0}</strong>
                      </div>
                      <div className="compact-stat">
                        <span className="muted">默认缺失值</span>
                        <strong>{state.standardFields?.default_missing_value ?? ''}</strong>
                      </div>
                    </div>

                    {standardFieldPreview.length > 0 ? (
                      <div className="compact-preview">
                        <span className="muted">标准字段预览</span>
                        <div className="tag-list">
                          {standardFieldPreview.map((field) => (
                            <span key={field} className="tag">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </section>
            ) : null}

            {state.submitError ? (
              <div className="inline-notice inline-notice--error">
                {state.submitError}
              </div>
            ) : null}

            <div className="intake-card__footer">
              <div className="intake-card__summary">
                <span className="metric-chip">
                  {hasFiles ? `${state.uploadFiles.files.length} 个待处理文件` : '等待文件'}
                </span>
                {hasFiles ? (
                  <span className="metric-chip">
                    {state.mode === 'template'
                      ? state.selectedTemplate?.template_name ?? '待选模板'
                      : `${state.standardFields?.fields.length ?? 0} 个标准字段`}
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                className="button-primary intake-card__submit"
                onClick={() => void state.submitTask()}
                disabled={
                  state.isInitializing ||
                  state.isSubmittingTask ||
                  state.isPolling ||
                  !hasFiles
                }
              >
                {state.isSubmittingTask ? '提交任务中...' : '开始处理'}
              </button>
            </div>
          </div>

          {isProcessing ? (
            <div className="intake-card__overlay">
              <ProgressPanel
                taskId={state.taskId}
                taskStatus={state.taskStatus}
                taskStage={state.taskStage}
                taskProgress={state.taskProgress}
                taskSnapshot={state.taskSnapshot}
                isPolling={state.isPolling}
                resultError={state.resultError}
                isPreparing={state.isSubmittingTask && state.taskId === null}
              />
            </div>
          ) : null}
        </div>
      </section>

      {hasResult || hasFailedItems ? (
        <section className="workspace-output">
          <div className="workspace-output__header">
            <div>
              <span className="panel-kicker">处理结果</span>
              <h2>结果预览与导出</h2>
            </div>
            {state.taskResult ? (
              <span className="metric-chip">
                {state.taskResult.mode === 'template' ? '模板预览' : '标准字段编辑'}
              </span>
            ) : null}
          </div>

          <div className="workspace-output__grid">
            {state.taskResult ? (
              <section className="surface-card">
                <ResultTable
                  result={state.taskResult}
                  editableHeaders={state.editableHeaders}
                  editableRows={state.editableRows}
                  canRestoreOriginal={state.canRestoreOriginal}
                  draftSavedAt={state.draftSavedAt}
                  didRestorePersistedDraft={state.didRestorePersistedDraft}
                  onTableChange={state.replaceEditableTable}
                  onRestoreOriginal={state.restoreOriginalTable}
                  onDeleteColumn={state.deleteColumn}
                  onMoveColumn={state.moveColumn}
                />
              </section>
            ) : null}

            {state.taskResult ? (
              <section className="surface-card surface-card--aside">
                <ExportActions
                  result={state.taskResult}
                  exportDownloadUrl={state.exportDownloadUrl}
                  exportFilename={state.exportFilename}
                  exportError={state.exportError}
                  isExporting={state.isExporting}
                  onCommitExportFilename={state.commitExportFilename}
                  onExport={(filename) => {
                    state.commitExportFilename(filename)
                    void state.exportStandardFields(filename)
                  }}
                />
              </section>
            ) : null}

            {hasFailedItems ? (
              <section className="surface-card surface-card--warning workspace-output__failures">
                <div className="surface-card__header">
                  <span className="panel-kicker">失败项</span>
                  <h3>失败项</h3>
                </div>
                <FailedItems items={state.failedItems} />
              </section>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  )
}
