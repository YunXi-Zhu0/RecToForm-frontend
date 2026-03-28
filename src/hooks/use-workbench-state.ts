import { startTransition, useEffect, useEffectEvent, useState } from 'react'

import { getTemplateDetail } from '@/api/templates'
import {
  clearStandardEditDraft,
  readStandardEditDraft,
  writeStandardEditDraft,
} from '@/core/drafts'
import { toAppError } from '@/core/errors'
import type { ProcessingMode, TaskStage, TaskStatus } from '@/types/common'
import type { StandardFieldsResponse } from '@/types/standard-fields'
import {
  isStandardEditTaskResult,
  type TaskResultResponse,
  type TaskStatusResponse,
} from '@/types/tasks'
import type { TemplateDetail, TemplateSummary } from '@/types/templates'
import type { WorkbenchInitializationData } from '@/types/workbench'
import { createTaskFlow } from '@/workflows/create-task-flow'
import { exportStandardFieldsFlow } from '@/workflows/export-standard-fields-flow'
import { initializeWorkbenchFlow } from '@/workflows/initialize-workbench-flow'
import { useTaskPolling } from '@/hooks/use-task-polling'
import { useUploadFiles } from '@/hooks/use-upload-files'

function cloneRows(rows: string[][]): string[][] {
  return rows.map((row) => [...row])
}

function normalizeEditableValue(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function splitEditableTable(table: string[][]): {
  headers: string[]
  rows: string[][]
} {
  if (table.length === 0) {
    return {
      headers: [],
      rows: [],
    }
  }

  const [headerRow, ...dataRows] = table
  const headers = headerRow.map(normalizeEditableValue)

  return {
    headers,
    rows: dataRows.map((row) =>
      Array.from({ length: headers.length }, (_, columnIndex) =>
        normalizeEditableValue(row[columnIndex]),
      ),
    ),
  }
}

function areStringArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false
  }

  return left.every((value, index) => value === right[index])
}

function areStringMatrixesEqual(left: string[][], right: string[][]): boolean {
  if (left.length !== right.length) {
    return false
  }

  return left.every((row, rowIndex) => areStringArraysEqual(row, right[rowIndex] ?? []))
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
  const [originalEditableHeaders, setOriginalEditableHeaders] = useState<string[]>([])
  const [originalEditableRows, setOriginalEditableRows] = useState<string[][]>([])
  const [editableHeaders, setEditableHeaders] = useState<string[]>([])
  const [editableRows, setEditableRows] = useState<string[][]>([])
  const [exportId, setExportId] = useState<string | null>(null)
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null)
  const [exportFilename, setExportFilename] = useState('')
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const [didRestorePersistedDraft, setDidRestorePersistedDraft] = useState(false)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [resultError, setResultError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isPollingEnabled, setIsPollingEnabled] = useState(false)

  const selectedTemplate =
    templates.find((template) => template.template_id === selectedTemplateId) ?? null

  function invalidateExportArtifacts(): void {
    setExportId(null)
    setExportDownloadUrl(null)
    setExportError(null)
  }

  function resetTaskOutputs(): void {
    clearStandardEditDraft()
    setTaskId(null)
    setTaskStatus(null)
    setTaskStage(null)
    setTaskProgress(0)
    setTaskSnapshot(null)
    setTaskResult(null)
    setFailedItems([])
    setOriginalEditableHeaders([])
    setOriginalEditableRows([])
    setEditableHeaders([])
    setEditableRows([])
    setExportId(null)
    setExportDownloadUrl(null)
    setExportFilename('')
    setDraftSavedAt(null)
    setDidRestorePersistedDraft(false)
    setSubmitError(null)
    setResultError(null)
    setExportError(null)
    setIsPollingEnabled(false)
  }

  function applyInitializationData(data: WorkbenchInitializationData): void {
    const persistedDraft = readStandardEditDraft()

    startTransition(() => {
      setTemplates(data.templates)
      setSelectedTemplateId(data.selectedTemplateId)
      setTemplateDetail(data.templateDetail)
      setStandardFields(data.standardFields)

      if (persistedDraft === null) {
        setMode('template')
        setTaskId(null)
        setTaskStatus(null)
        setTaskStage(null)
        setTaskProgress(0)
        setTaskSnapshot(null)
        setTaskResult(null)
        setFailedItems([])
        setOriginalEditableHeaders([])
        setOriginalEditableRows([])
        setEditableHeaders([])
        setEditableRows([])
        setExportId(null)
        setExportDownloadUrl(null)
        setExportFilename('')
        setSubmitError(null)
        setResultError(null)
        setExportError(null)
        setIsPollingEnabled(false)
        return
      }

      setMode('standard_edit')
      setTaskId(persistedDraft.task_result.task_id)
      setTaskStatus(persistedDraft.task_result.status)
      setTaskStage(persistedDraft.task_result.status)
      setTaskProgress(100)
      setTaskSnapshot(null)
      setTaskResult(persistedDraft.task_result)
      setFailedItems(persistedDraft.task_result.failed_items)
      setOriginalEditableHeaders([...persistedDraft.original_headers])
      setOriginalEditableRows(cloneRows(persistedDraft.original_rows))
      setEditableHeaders([...persistedDraft.editable_headers])
      setEditableRows(cloneRows(persistedDraft.editable_rows))
      setExportFilename(persistedDraft.export_filename)
    })

    setDraftSavedAt(persistedDraft?.saved_at ?? null)
    setDidRestorePersistedDraft(persistedDraft !== null)
  }

  const initializeFromServer = useEffectEvent(async () => {
    setIsInitializing(true)
    setInitializationError(null)

    try {
      const data = await initializeWorkbenchFlow()
      applyInitializationData(data)
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
    if (taskResult === null || !isStandardEditTaskResult(taskResult)) {
      return
    }

    const savedAt = writeStandardEditDraft({
      task_result: taskResult,
      original_headers: originalEditableHeaders,
      original_rows: originalEditableRows,
      editable_headers: editableHeaders,
      editable_rows: editableRows,
      export_filename: exportFilename,
    })

    if (savedAt !== null) {
      setDraftSavedAt(savedAt)
    }
  }, [
    editableHeaders,
    editableRows,
    exportFilename,
    originalEditableHeaders,
    originalEditableRows,
    taskResult,
  ])

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

      if (isStandardEditTaskResult(result)) {
        setOriginalEditableHeaders([...result.standard_fields])
        setOriginalEditableRows(cloneRows(result.rows))
        setEditableHeaders([...result.standard_fields])
        setEditableRows(cloneRows(result.rows))
        setExportFilename('')
        setDraftSavedAt(null)
        setDidRestorePersistedDraft(false)
      } else {
        setOriginalEditableHeaders([])
        setOriginalEditableRows([])
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

  async function exportStandardFields(filenameOverride?: string): Promise<void> {
    if (taskResult === null || !isStandardEditTaskResult(taskResult)) {
      return
    }

    setIsExporting(true)
    setExportError(null)

    try {
      const filename = (filenameOverride ?? exportFilename).trim()
      const response = await exportStandardFieldsFlow({
        headers: editableHeaders,
        rows: editableRows,
        filename: filename === '' ? undefined : filename,
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
      applyInitializationData(data)
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

  function resetTaskSession(): void {
    uploadFiles.clearServerDuplicateMarks()
    resetTaskOutputs()
  }

  function replaceEditableTable(table: string[][]): void {
    const { headers, rows } = splitEditableTable(table)
    invalidateExportArtifacts()
    setEditableHeaders(headers)
    setEditableRows(rows)
  }

  function restoreOriginalTable(): void {
    if (originalEditableHeaders.length === 0) {
      return
    }

    invalidateExportArtifacts()
    setEditableHeaders([...originalEditableHeaders])
    setEditableRows(cloneRows(originalEditableRows))
  }

  function deleteColumn(columnIndex: number): void {
    if (
      columnIndex < 0 ||
      columnIndex >= editableHeaders.length ||
      editableHeaders.length <= 1
    ) {
      return
    }

    invalidateExportArtifacts()
    setEditableHeaders((currentHeaders) =>
      currentHeaders.filter((_, index) => index !== columnIndex),
    )
    setEditableRows((currentRows) =>
      currentRows.map((row) => row.filter((_, index) => index !== columnIndex)),
    )
  }

  function moveColumn(columnIndex: number, direction: 'left' | 'right'): void {
    const targetIndex = direction === 'left' ? columnIndex - 1 : columnIndex + 1

    if (
      columnIndex < 0 ||
      columnIndex >= editableHeaders.length ||
      targetIndex < 0 ||
      targetIndex >= editableHeaders.length
    ) {
      return
    }

    invalidateExportArtifacts()

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

  function commitExportFilename(nextFilename: string): void {
    invalidateExportArtifacts()
    setExportFilename(nextFilename)
  }

  const canRestoreOriginal =
    originalEditableHeaders.length > 0 &&
    (!areStringArraysEqual(editableHeaders, originalEditableHeaders) ||
      !areStringMatrixesEqual(editableRows, originalEditableRows))

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
    resetTaskSession,
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
    draftSavedAt,
    didRestorePersistedDraft,
    editableHeaders,
    editableRows,
    canRestoreOriginal,
    replaceEditableTable,
    restoreOriginalTable,
    deleteColumn,
    moveColumn,
    exportStandardFields,
    isExporting,
    exportId,
    exportFilename,
    commitExportFilename,
    exportDownloadUrl,
    submitError,
    resultError,
    exportError,
  }
}
