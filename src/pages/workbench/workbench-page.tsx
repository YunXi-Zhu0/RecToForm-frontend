import { ExportActions } from '@/components/export-actions/export-actions'
import { FailedItems } from '@/components/failed-items/failed-items'
import { WorkbenchSection } from '@/components/layout/workbench-section'
import { ModeSwitcher } from '@/components/mode-switcher/mode-switcher'
import { ProgressPanel } from '@/components/progress-panel/progress-panel'
import { ResultTable } from '@/components/result-table/result-table'
import { TemplatePanel } from '@/components/template-panel/template-panel'
import { UploadPanel } from '@/components/upload-panel/upload-panel'
import { API_BASE_URL } from '@/core/config'
import { useWorkbenchState } from '@/hooks/use-workbench-state'

export function WorkbenchPage() {
  const state = useWorkbenchState()

  return (
    <main className="workbench-page">
      <header className="page-header">
        <div>
          <h1>RecToForm 工作台</h1>
          <p>当前优先接通接口层与主流程，页面保持最简可用。</p>
        </div>
        <div className="muted">
          后端地址：<code>{API_BASE_URL}</code>
        </div>
      </header>

      {state.initializationError ? (
        <div className="banner error-banner">
          <span>{state.initializationError}</span>
          <button type="button" onClick={() => void state.reloadInitialization()}>
            重新加载
          </button>
        </div>
      ) : null}

      <WorkbenchSection title="1. 模式切换">
        <ModeSwitcher value={state.mode} onChange={state.changeMode} />
      </WorkbenchSection>

      <WorkbenchSection title="2. 初始化配置">
        {state.isInitializing ? (
          <p>初始化中...</p>
        ) : (
          <TemplatePanel
            mode={state.mode}
            templates={state.templates}
            selectedTemplateId={state.selectedTemplateId}
            onSelectTemplate={state.selectTemplateId}
            templateDetail={state.templateDetail}
            standardFields={state.standardFields}
            isTemplateDetailLoading={state.isTemplateDetailLoading}
            templateDetailError={state.templateDetailError}
          />
        )}
      </WorkbenchSection>

      <WorkbenchSection title="3. 上传并创建任务">
        <div className="stack">
          <UploadPanel
            files={state.uploadFiles.items}
            validationErrors={state.uploadFiles.validationErrors}
            onAddFiles={state.uploadFiles.addFiles}
            onRemoveFile={state.uploadFiles.removeFile}
            onClearFiles={state.uploadFiles.clearFiles}
          />

          {state.submitError ? <p className="error-text">{state.submitError}</p> : null}

          <div className="inline-actions">
            <button
              type="button"
              onClick={() => void state.submitTask()}
              disabled={
                state.isInitializing ||
                state.isSubmittingTask ||
                state.isPolling ||
                state.uploadFiles.files.length === 0
              }
            >
              {state.isSubmittingTask ? '提交中...' : '创建识别任务'}
            </button>
          </div>
        </div>
      </WorkbenchSection>

      <WorkbenchSection title="4. 任务进度">
        <ProgressPanel
          taskId={state.taskId}
          taskStatus={state.taskStatus}
          taskStage={state.taskStage}
          taskProgress={state.taskProgress}
          taskSnapshot={state.taskSnapshot}
          isPolling={state.isPolling}
          resultError={state.resultError}
        />
      </WorkbenchSection>

      <WorkbenchSection title="5. 结果预览">
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
      </WorkbenchSection>

      <WorkbenchSection title="6. 失败项">
        <FailedItems items={state.failedItems} />
      </WorkbenchSection>

      <WorkbenchSection title="7. 下载与导出">
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
      </WorkbenchSection>
    </main>
  )
}
