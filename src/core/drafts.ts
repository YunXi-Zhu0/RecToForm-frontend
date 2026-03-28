import type { StandardEditTaskResult } from '@/types/tasks'

const STANDARD_EDIT_DRAFT_STORAGE_KEY = 'rectoform.standard-edit.draft.v1'
const STANDARD_EDIT_DRAFT_VERSION = 1

export interface StandardEditDraftSnapshot {
  version: number
  saved_at: string
  task_result: StandardEditTaskResult
  original_headers: string[]
  original_rows: string[][]
  editable_headers: string[]
  editable_rows: string[][]
  export_filename: string
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isStringMatrix(value: unknown): value is string[][] {
  return Array.isArray(value) && value.every((row) => isStringArray(row))
}

function isStandardEditDraftSnapshot(
  value: unknown,
): value is StandardEditDraftSnapshot {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const snapshot = value as Partial<StandardEditDraftSnapshot>

  return (
    snapshot.version === STANDARD_EDIT_DRAFT_VERSION &&
    typeof snapshot.saved_at === 'string' &&
    typeof snapshot.export_filename === 'string' &&
    typeof snapshot.task_result === 'object' &&
    snapshot.task_result !== null &&
    snapshot.task_result.mode === 'standard_edit' &&
    isStringArray(snapshot.task_result.standard_fields) &&
    isStringMatrix(snapshot.task_result.rows) &&
    isStringArray(snapshot.original_headers) &&
    isStringMatrix(snapshot.original_rows) &&
    isStringArray(snapshot.editable_headers) &&
    isStringMatrix(snapshot.editable_rows)
  )
}

export function readStandardEditDraft(): StandardEditDraftSnapshot | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(STANDARD_EDIT_DRAFT_STORAGE_KEY)

  if (rawValue === null) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown

    if (!isStandardEditDraftSnapshot(parsedValue)) {
      window.localStorage.removeItem(STANDARD_EDIT_DRAFT_STORAGE_KEY)
      return null
    }

    return parsedValue
  } catch {
    window.localStorage.removeItem(STANDARD_EDIT_DRAFT_STORAGE_KEY)
    return null
  }
}

export function writeStandardEditDraft(
  snapshot: Omit<StandardEditDraftSnapshot, 'saved_at' | 'version'>,
): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  const savedAt = new Date().toISOString()

  window.localStorage.setItem(
    STANDARD_EDIT_DRAFT_STORAGE_KEY,
    JSON.stringify({
      ...snapshot,
      version: STANDARD_EDIT_DRAFT_VERSION,
      saved_at: savedAt,
    }),
  )

  return savedAt
}

export function clearStandardEditDraft(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STANDARD_EDIT_DRAFT_STORAGE_KEY)
}
