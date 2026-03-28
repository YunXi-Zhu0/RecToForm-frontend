import { useEffect, useState } from 'react'

import { ExportActions } from '@/components/export-actions/export-actions'
import { FailedItems } from '@/components/failed-items/failed-items'
import { IntakePreview } from '@/components/intake-preview/intake-preview'
import { ModeSwitcher } from '@/components/mode-switcher/mode-switcher'
import { ProgressPanel } from '@/components/progress-panel/progress-panel'
import { ResultTable } from '@/components/result-table/result-table'
import { TemplatePanel } from '@/components/template-panel/template-panel'
import { UploadFileList } from '@/components/upload-file-list/upload-file-list'
import { UploadPanel } from '@/components/upload-panel/upload-panel'
import { formatTaskStatus } from '@/core/formatters'
import { useWorkbenchState } from '@/hooks/use-workbench-state'

export function WorkbenchPage() {
  const state = useWorkbenchState()
  const [isUploadSelectorVisible, setIsUploadSelectorVisible] = useState(true)
  const isProcessing = state.isSubmittingTask || state.isPolling
  const hasFiles = state.uploadFiles.files.length > 0
  const hasResult = state.taskResult !== null
  const hasFailedItems = state.failedItems.length > 0
  const canSubmit =
    hasFiles &&
    (state.mode !== 'template' || state.selectedTemplate !== null) &&
    !state.isInitializing &&
    !state.isSubmittingTask &&
    !state.isPolling
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

  useEffect(() => {
    if (!hasFiles) {
      setIsUploadSelectorVisible(true)
    }
  }, [hasFiles])

  function handleAddFiles(files: FileList | File[]): void {
    state.uploadFiles.addFiles(files)
    setIsUploadSelectorVisible(false)
  }

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
          当前阶段把工作台拆成左侧模板区、中间上传与预演区、右侧文件清单区。上传后中间会直接切换成拟生成表格的样式预览，便于继续补充文件或开始处理。
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

      <section className="workbench-studio">
        <section className="surface-card workbench-column workbench-column--left">
          <div className="surface-card__header">
            <div>
              <span className="panel-kicker">处理配置</span>
              <h3>模式与模板</h3>
            </div>
            <span className="metric-chip">
              {state.mode === 'template' ? '模板模式' : '标准字段模式'}
            </span>
          </div>

          <ModeSwitcher
            value={state.mode}
            onChange={state.changeMode}
            disabled={isProcessing}
          />

          <TemplatePanel
            mode={state.mode}
            templates={state.templates}
            selectedTemplateId={state.selectedTemplateId}
            onSelectTemplate={state.selectTemplateId}
            templateDetail={state.templateDetail}
            standardFields={state.standardFields}
            isTemplateDetailLoading={state.isTemplateDetailLoading}
            templateDetailError={state.templateDetailError}
            disabled={isProcessing}
          />
        </section>

        <section
          className={
            isProcessing
              ? 'surface-card workbench-column workbench-column--center intake-stage-card is-processing'
              : 'surface-card workbench-column workbench-column--center intake-stage-card'
          }
        >
          <div className="intake-stage-card__content">
            <div className="intake-stage-card__header">
              <div>
                <span className="panel-kicker">中间舞台</span>
                <h3>{hasFiles ? '上传后模板预演' : '文件上传框'}</h3>
              </div>
              <span className="metric-chip">
                {hasFiles ? `${state.uploadFiles.files.length} 个文件已入列` : '等待文件'}
              </span>
            </div>

            {!hasFiles || isUploadSelectorVisible ? (
              <UploadPanel
                filesCount={state.uploadFiles.items.length}
                validationErrors={state.uploadFiles.validationErrors}
                onAddFiles={handleAddFiles}
              />
            ) : (
              <IntakePreview
                mode={state.mode}
                selectedTemplate={state.selectedTemplate}
                templateDetail={state.templateDetail}
                standardFields={state.standardFields}
                uploadFileNames={state.uploadFiles.items.map((item) => item.file.name)}
                isTemplateDetailLoading={state.isTemplateDetailLoading}
                templateDetailError={state.templateDetailError}
                onBack={() => setIsUploadSelectorVisible(true)}
              />
            )}

            {state.submitError ? (
              <div className="inline-notice inline-notice--error">
                {state.submitError}
              </div>
            ) : null}

            <div className="intake-stage-card__footer">
              <div className="intake-stage-card__summary">
                <span className="metric-chip">
                  {hasFiles ? `${state.uploadFiles.files.length} 个待处理文件` : '等待文件'}
                </span>
                <span className="metric-chip">
                  {state.mode === 'template'
                    ? state.selectedTemplate?.template_name ?? '待选模板'
                    : `${state.standardFields?.fields.length ?? 0} 个标准字段`}
                </span>
              </div>

              <button
                type="button"
                className="button-primary intake-stage-card__submit"
                onClick={() => void state.submitTask()}
                disabled={!canSubmit}
              >
                {state.isSubmittingTask ? '提交任务中...' : '开始处理'}
              </button>
            </div>
          </div>

          {isProcessing ? (
            <div className="intake-stage-card__overlay">
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
        </section>

        <section className="surface-card workbench-column workbench-column--right">
          <UploadFileList
            files={state.uploadFiles.items}
            onRemoveFile={state.uploadFiles.removeFile}
            onClearFiles={state.uploadFiles.clearFiles}
            disabled={isProcessing}
          />
        </section>
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
