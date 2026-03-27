interface AppErrorOptions {
  status?: number
  detail?: unknown
  duplicateFiles?: string[]
}

interface CreateAppErrorParams {
  status?: number
  detail: unknown
}

const defaultErrorMessage = '请求失败，请稍后重试。'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseDuplicateFiles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string')
}

function parseDetailMessage(detail: unknown): { message: string; duplicateFiles: string[] } {
  if (typeof detail === 'string' && detail.trim()) {
    return { message: detail, duplicateFiles: [] }
  }

  if (isRecord(detail)) {
    const message =
      typeof detail.message === 'string' && detail.message.trim()
        ? detail.message
        : defaultErrorMessage

    return {
      message,
      duplicateFiles: parseDuplicateFiles(detail.duplicate_files),
    }
  }

  return { message: defaultErrorMessage, duplicateFiles: [] }
}

export class AppError extends Error {
  status?: number
  detail?: unknown
  duplicateFiles: string[]

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = 'AppError'
    this.status = options.status
    this.detail = options.detail
    this.duplicateFiles = options.duplicateFiles ?? []
  }
}

export function createAppError({ status, detail }: CreateAppErrorParams): AppError {
  const normalizedDetail =
    isRecord(detail) && 'detail' in detail ? detail.detail : detail
  const parsed = parseDetailMessage(normalizedDetail)

  return new AppError(parsed.message, {
    status,
    detail,
    duplicateFiles: parsed.duplicateFiles,
  })
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message, { detail: error })
  }

  return new AppError(defaultErrorMessage, { detail: error })
}

export function isResultNotReadyError(error: unknown): boolean {
  return toAppError(error).status === 409
}

export function isDuplicateFilesError(error: unknown): boolean {
  return toAppError(error).duplicateFiles.length > 0
}
