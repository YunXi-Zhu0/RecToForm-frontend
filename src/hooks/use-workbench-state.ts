import { startTransition, useEffect, useEffectEvent, useState } from 'react'

import { getTemplateDetail } from '@/api/templates'
import { DEFAULT_EXPORT_FILENAME } from '@/core/constants'
import { toAppError } from '@/core/errors'
import type { ProcessingMode, TaskStage, TaskStatus } from '@/types/common'
import type { StandardFieldsResponse } from '@/types/standard-fields'
import type { TaskResultResponse, TaskStatusResponse } from '@/types/tasks'
import type { TemplateDetail, TemplateSummary } from '@/types/templates'
import { createTaskFlow } from '@/workflows/create-task-flow'
import { exportStandardFieldsFlow } from '@/workflows/export-standard-fields-flow'
import { initializeWorkbenchFlow } from '@/workflows/initialize-workbench-flow'
import { useTaskPolling } from '@/hooks/use-task-polling'
import { useUploadFiles } from '@/hooks/use-upload-files'

function cloneRows(rows: string[][]): string[][] {
  return rows.map((row) => [...row])
}

export function useWorkbenchState() {
  const uploadFiles = useUploadFiles()

  const [isInitializing, setIsInitializing] = useState(true)
  const [initializationError, setInitializationError] = useState<string | null>(
    null,
  )
  const [mode, setMode] = useState<ProcessingMode>('template')
  const [templates, setTemplates] = useState<TemplateSummary[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [templateDetail, setTemplateDetail] = useState<TemplateDetail | null>(null)
  const [templateDetailError, setTemplateDetailError] = useState<string | null>(
    null,
  )
  const [isTemplateDetailLoading, setIsTemplateDetailLoading] = useState(false)
  const [standardFields, setStandardFields] =
    useState<StandardFieldsResponse | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [taskStage, setTaskStage] = useState<TaskStage | null>(null)
  const [taskProgress, setTaskProgress] = useState(0)
  const [taskSnapshot, setTaskSnapshot] = useState<TaskStatusResponse | null>(null)
  const [taskResult, setTaskResult] = useState<TaskResultResponse | null>(null)
  const [failedItems, setFailedItems] = useState<TaskResultResponse['failed_items']>(
    [],
  )
  const [editableHeaders, setEditableHeaders] = useState<string[]>([])
  const [editableRows, setEditableRows] = useState<string[][]>([])
  const [exportId, setExportId] = useState<string | null>(null)
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null)
  const [exportFilename, setExportFilename] = useState(DEFAULT_EXPORT_FILENAME)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [resultError, setResultError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isPollingEnabled, setIsPollingEnabled] = useState(false)

  const selectedTemplate =
    templates.find((template) => template.template_id === selectedTemplateId) ?? null

  function resetTaskOutputs(): void {
    setTaskId(null)
    setTaskStatus(null)
    setTaskStage(null)
    setTaskProgress(0)
    setTaskSnapshot(null)
    setTaskResult(null)
    setFailedItems([])
    setEditableHeaders([])
    setEditableRows([])
    setExportId(null)
    setExportDownloadUrl(null)
    setExportFilename(DEFAULT_EXPORT_FILENAME)
    setSubmitError(null)
    setResultError(null)
    setExportError(null)
    setIsPollingEnabled(false)
  }

  const initializeFromServer = useEffectEvent(async () => {
    setIsInitializing(true)
    setInitializationError(null)

    try {
      const data = await initializeWorkbenchFlow()

      startTransition(() => {
        setTemplates(data.templates)
        setSelectedTemplateId(data.selectedTemplateId)
        setTemplateDetail(data.templateDetail)
        setStandardFields(data.standardFields)
        setMode('template')
      })
    } catch (error) {
      setInitializationError(toAppError(error).message)
    } finally {
      setIsInitializing(false)
    }
  })

  useEffect(() => {
    void initializeFromServer()
  }, [])

  useEffect(() => {
    if (selectedTemplateId === null) {
      setTemplateDetail(null)
      return
    }

    if (templateDetail?.template_id === selectedTemplateId) {
      return
    }

    let disposed = false
    setIsTemplateDetailLoading(true)
    setTemplateDetailError(null)

    void (async () => {
      try {
        const detail = await getTemplateDetail(selectedTemplateId)

        if (disposed) {
          return
        }

        setTemplateDetail(detail)
      } catch (error) {
        if (disposed) {
          return
        }

        setTemplateDetailError(toAppError(error).message)
      } finally {
        if (!disposed) {
          setIsTemplateDetailLoading(false)
        }
      }
    })()

    return () => {
      disposed = true
    }
  }, [selectedTemplateId, templateDetail?.template_id])

  function handleTaskStatus(snapshot: TaskStatusResponse): void {
    setTaskSnapshot(snapshot)
    setTaskId(snapshot.task_id)
    setTaskStatus(snapshot.status)
    setTaskStage(snapshot.stage)
    setTaskProgress(snapshot.progress_percent)
    setResultError(null)
  }

  function handleTaskResult(result: TaskResultResponse): void {
    startTransition(() => {
      setTaskResult(result)
      setFailedItems(result.failed_items)

      if (result.mode === 'standard_edit') {
        setEditableHeaders([...result.standard_fields])
        setEditableRows(cloneRows(result.rows))
      } else {
        setEditableHeaders([])
        setEditableRows([])
      }
    })

    setTaskStatus(result.status)
    setTaskStage(result.status)
    setIsPollingEnabled(false)
  }

  function handleTaskPollingError(error: Error): void {
    setResultError(error.message)
    setIsPollingEnabled(false)
  }

  const { isPolling } = useTaskPolling({
    taskId,
    enabled: isPollingEnabled,
    onStatus: handleTaskStatus,
    onResult: handleTaskResult,
    onError: handleTaskPollingError,
  })

  async function submitTask(): Promise<void> {
    if (uploadFiles.files.length === 0) {
      setSubmitError('请先选择至少一个文件。')
      return
    }

    if (mode === 'template' && selectedTemplate === null) {
      setSubmitError('模板模式下必须先选择模板。')
      return
    }

    setIsSubmittingTask(true)
    setSubmitError(null)
    setResultError(null)
    setExportError(null)
    uploadFiles.clearServerDuplicateMarks()
    resetTaskOutputs()

    try {
      const response = await createTaskFlow({
        mode,
        files: uploadFiles.files,
        selectedTemplate,
      })

      setTaskId(response.task_id)
      setTaskStatus(response.status)
      setTaskStage(response.status)
      setTaskProgress(0)
      setIsPollingEnabled(true)
    } catch (error) {
      const appError = toAppError(error)

      if (appError.duplicateFiles.length > 0) {
        uploadFiles.markServerDuplicates(appError.duplicateFiles)
      }

      setSubmitError(appError.message)
      setIsPollingEnabled(false)
    } finally {
      setIsSubmittingTask(false)
    }
  }

  async function exportStandardFields(): Promise<void> {
    if (taskResult?.mode !== 'standard_edit') {
      return
    }

    setIsExporting(true)
    setExportError(null)

    try {
      const response = await exportStandardFieldsFlow({
        headers: editableHeaders,
        rows: editableRows,
        filename: exportFilename,
      })

      setExportId(response.export_id)
      setExportFilename(response.filename)
      setExportDownloadUrl(response.download_url)
    } catch (error) {
      setExportError(toAppError(error).message)
    } finally {
      setIsExporting(false)
    }
  }

  function changeMode(nextMode: ProcessingMode): void {
    setMode(nextMode)
    uploadFiles.clearServerDuplicateMarks()
    resetTaskOutputs()
  }

  async function reloadInitialization(): Promise<void> {
    setIsInitializing(true)
    setInitializationError(null)

    try {
      const data = await initializeWorkbenchFlow()

      startTransition(() => {
        setTemplates(data.templates)
        setSelectedTemplateId(data.selectedTemplateId)
        setTemplateDetail(data.templateDetail)
        setStandardFields(data.standardFields)
        setMode('template')
      })
    } catch (error) {
      setInitializationError(toAppError(error).message)
    } finally {
      setIsInitializing(false)
    }
  }

  function selectTemplateId(nextTemplateId: string): void {
    setSelectedTemplateId(nextTemplateId || null)
    setTemplateDetailError(null)
  }

  function updateHeader(index: number, value: string): void {
    setEditableHeaders((currentHeaders) =>
      currentHeaders.map((header, headerIndex) =>
        headerIndex === index ? value : header,
      ),
    )
  }

  function updateCell(rowIndex: number, columnIndex: number, value: string): void {
    setEditableRows((currentRows) =>
      currentRows.map((row, currentRowIndex) =>
        currentRowIndex === rowIndex
          ? row.map((cell, currentColumnIndex) =>
              currentColumnIndex === columnIndex ? value : cell,
            )
          : row,
      ),
    )
  }

  function deleteColumn(columnIndex: number): void {
    setEditableHeaders((currentHeaders) =>
      currentHeaders.filter((_, index) => index !== columnIndex),
    )
    setEditableRows((currentRows) =>
      currentRows.map((row) => row.filter((_, index) => index !== columnIndex)),
    )
  }

  function moveColumn(columnIndex: number, direction: 'left' | 'right'): void {
    const targetIndex = direction === 'left' ? columnIndex - 1 : columnIndex + 1

    setEditableHeaders((currentHeaders) => {
      if (targetIndex < 0 || targetIndex >= currentHeaders.length) {
        return currentHeaders
      }

      const nextHeaders = [...currentHeaders]
      ;[nextHeaders[columnIndex], nextHeaders[targetIndex]] = [
        nextHeaders[targetIndex],
        nextHeaders[columnIndex],
      ]
      return nextHeaders
    })

    setEditableRows((currentRows) =>
      currentRows.map((row) => {
        if (targetIndex < 0 || targetIndex >= row.length) {
          return row
        }

        const nextRow = [...row]
        ;[nextRow[columnIndex], nextRow[targetIndex]] = [
          nextRow[targetIndex],
          nextRow[columnIndex],
        ]
        return nextRow
      }),
    )
  }

  return {
    isInitializing,
    initializationError,
    reloadInitialization,
    mode,
    changeMode,
    templates,
    selectedTemplateId,
    selectTemplateId,
    selectedTemplate,
    templateDetail,
    isTemplateDetailLoading,
    templateDetailError,
    standardFields,
    uploadFiles,
    submitTask,
    isSubmittingTask,
    taskId,
    taskStatus,
    taskStage,
    taskProgress,
    taskSnapshot,
    taskResult,
    isPolling,
    failedItems,
    editableHeaders,
    editableRows,
    updateHeader,
    updateCell,
    deleteColumn,
    moveColumn,
    exportStandardFields,
    isExporting,
    exportId,
    exportFilename,
    exportDownloadUrl,
    submitError,
    resultError,
    exportError,
  }
}
