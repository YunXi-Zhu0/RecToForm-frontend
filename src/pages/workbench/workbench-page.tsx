import { useState } from 'react'

import { ExportActions } from '@/components/export-actions/export-actions'
import { FailedItems } from '@/components/failed-items/failed-items'
import { IntakePreview } from '@/components/intake-preview/intake-preview'
import { ModeSwitcher } from '@/components/mode-switcher/mode-switcher'
import { ProgressPanel } from '@/components/progress-panel/progress-panel'
import { ResultTable } from '@/components/result-table/result-table'
import { TemplatePanel } from '@/components/template-panel/template-panel'
import { UploadFileList } from '@/components/upload-file-list/upload-file-list'
import { UploadPanel } from '@/components/upload-panel/upload-panel'
import { useWorkbenchState } from '@/hooks/use-workbench-state'
import {
  isStandardEditTaskResult,
  isTemplateTaskResult,
} from '@/types/tasks'

function ReturnArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M8.25 5.25 3.5 10l4.75 4.75M4 10h12.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  )
}

export function WorkbenchPage() {
  const state = useWorkbenchState()
  const [isUploadSelectorVisible, setIsUploadSelectorVisible] = useState(true)
  const isProcessing = state.isSubmittingTask || state.isPolling
  const isControlLocked = isProcessing || state.taskResult !== null
  const hasFiles = state.uploadFiles.files.length > 0
  const hasResult = state.taskResult !== null
  const hasFailedItems = state.failedItems.length > 0
  const shouldShowUploadSelector = !hasFiles || isUploadSelectorVisible
  const canSubmit =
    hasFiles &&
    (state.mode !== 'template' || state.selectedTemplate !== null) &&
    !state.isInitializing &&
    !state.isSubmittingTask &&
    !state.isPolling

  function handleAddFiles(files: FileList | File[]): void {
    state.uploadFiles.addFiles(files)
    setIsUploadSelectorVisible(false)
  }

  return (
    <main className="workbench-page">
      <header className="brand-header">
        <div className="brand-header__brand">
          <h1>RecToForm</h1>
        </div>
      </header>

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
            disabled={isControlLocked}
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
            disabled={isControlLocked}
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
            {hasResult ? (
              <>
                <div className="intake-stage-card__header">
                  <div>
                    <h3>
                      {state.taskResult !== null &&
                      isStandardEditTaskResult(state.taskResult)
                        ? '标准字段结果预览'
                        : '模板结果预览'}
                    </h3>
                  </div>
                  <div className="intake-stage-card__summary">
                    <span className="metric-chip">
                      {state.taskResult !== null &&
                      isTemplateTaskResult(state.taskResult)
                        ? `${state.taskResult.preview_rows.length} 行结果`
                        : `${state.editableRows.length} 行结果`}
                    </span>
                    <span className="metric-chip">
                      {state.taskResult !== null &&
                      isTemplateTaskResult(state.taskResult)
                        ? `${state.taskResult.preview_headers.length} 列`
                        : `${state.editableHeaders.length} 列`}
                    </span>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => {
                        state.resetTaskSession()
                        setIsUploadSelectorVisible(false)
                      }}
                    >
                      返回并预览字段
                    </button>
                  </div>
                </div>

                <div className="intake-stage-card__result">
                  <ResultTable
                    result={state.taskResult}
                    editableHeaders={state.editableHeaders}
                    editableRows={state.editableRows}
                    canRestoreOriginal={state.canRestoreOriginal}
                    hideStageHeader
                    onTableChange={state.replaceEditableTable}
                    onRestoreOriginal={state.restoreOriginalTable}
                    onDeleteColumn={state.deleteColumn}
                    onMoveColumn={state.moveColumn}
                  />
                </div>

                {state.taskResult !== null &&
                isTemplateTaskResult(state.taskResult) ? (
                  <div className="intake-stage-card__footer intake-stage-card__footer--result">
                    <a
                      className="button-primary button-link"
                      href={state.taskResult.excel_download_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      下载 Excel
                    </a>
                  </div>
                ) : (
                  <div className="intake-stage-card__result-actions">
                    <ExportActions
                      exportFilename={state.exportFilename}
                      exportError={state.exportError}
                      isExporting={state.isExporting}
                      onCommitExportFilename={state.commitExportFilename}
                      onExport={(filename) => {
                        state.commitExportFilename(filename)
                        void state.exportStandardFields(filename)
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="intake-stage-card__header">
                  <div>
                    <h3>表格字段预览与编辑</h3>
                    <p className="muted">
                      表头和行数据会在正式识别后按该结构输出。
                    </p>
                  </div>
                  {!shouldShowUploadSelector ? (
                    <button
                      type="button"
                      className="button-secondary intake-stage-card__return-button"
                      onClick={() => setIsUploadSelectorVisible(true)}
                    >
                      <span className="intake-stage-card__return-icon">
                        <ReturnArrowIcon />
                      </span>
                      继续上传文件
                    </button>
                  ) : null}
                </div>

                {state.submitError ? (
                  <div className="inline-notice inline-notice--error">
                    {state.submitError}
                  </div>
                ) : null}

                {state.resultError ? (
                  <div className="inline-notice inline-notice--error">
                    {state.resultError}
                  </div>
                ) : null}

                <div className="intake-stage-card__preview-workspace">
                  {shouldShowUploadSelector ? (
                    <UploadPanel
                      filesCount={state.uploadFiles.items.length}
                      validationErrors={state.uploadFiles.validationErrors}
                      onAddFiles={handleAddFiles}
                      onReturnToPreview={
                        hasFiles ? () => setIsUploadSelectorVisible(false) : undefined
                      }
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
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {!hasResult ? (
            <div className="intake-stage-card__footer intake-stage-card__footer--action">
              <button
                type="button"
                className="button-primary intake-stage-card__submit"
                onClick={() => void state.submitTask()}
                disabled={!canSubmit}
              >
                {state.isSubmittingTask ? '提交任务中...' : '开始处理'}
              </button>
            </div>
          ) : null}

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
          />
        </section>
      </section>

      {hasFailedItems ? (
        <section className="workspace-failures surface-card surface-card--warning">
          <div className="workspace-failures__header">
            <div>
              <span className="panel-kicker">失败项</span>
              <h2>异常文件明细</h2>
            </div>
            <span className="metric-chip metric-chip--error">
              {state.failedItems.length} 个异常文件
            </span>
          </div>
          <FailedItems items={state.failedItems} />
        </section>
      ) : null}
    </main>
  )
}
