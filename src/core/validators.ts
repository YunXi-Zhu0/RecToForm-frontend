import { MAX_FILE_SIZE_BYTES, MAX_UPLOAD_FILES } from '@/core/constants'
import type { TableRow } from '@/types/common'

export interface UploadValidationResult {
  acceptedFiles: File[]
  errors: string[]
}

function hasSupportedFileType(file: File): boolean {
  if (file.type.startsWith('image/')) {
    return true
  }

  if (file.type === 'application/pdf') {
    return true
  }

  return file.name.toLowerCase().endsWith('.pdf')
}

export function buildWeakFileSignature(file: File): string {
  return [file.name, file.size, file.lastModified, file.type].join(':')
}

export function validateUploadSelection(
  nextFiles: File[],
  currentCount: number,
): UploadValidationResult {
  const acceptedFiles: File[] = []
  const errors: string[] = []
  const remainingSlots = Math.max(MAX_UPLOAD_FILES - currentCount, 0)

  if (remainingSlots === 0) {
    return {
      acceptedFiles,
      errors: [`最多只能上传 ${MAX_UPLOAD_FILES} 个文件。`],
    }
  }

  nextFiles.forEach((file) => {
    if (acceptedFiles.length >= remainingSlots) {
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`文件 ${file.name} 超过 10MB 限制。`)
      return
    }

    if (!hasSupportedFileType(file)) {
      errors.push(`文件 ${file.name} 不是图片或 PDF。`)
      return
    }

    acceptedFiles.push(file)
  })

  if (nextFiles.length > remainingSlots) {
    errors.push(`本次最多还能添加 ${remainingSlots} 个文件，超出部分已忽略。`)
  }

  return { acceptedFiles, errors }
}

export function findWeakDuplicateSignatures(files: File[]): Set<string> {
  const counts = new Map<string, number>()

  files.forEach((file) => {
    const signature = buildWeakFileSignature(file)
    counts.set(signature, (counts.get(signature) ?? 0) + 1)
  })

  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([signature]) => signature),
  )
}

export function validateExportTable(headers: string[], rows: TableRow[]): string[] {
  if (headers.length === 0) {
    return ['导出前至少保留一列。']
  }

  const blankHeader = headers.find((header) => header.trim() === '')
  if (blankHeader !== undefined) {
    return ['导出列名不能为空。']
  }

  if (rows.length === 0) {
    return ['导出前至少保留一行结果。']
  }

  const invalidRow = rows.find((row) => row.length !== headers.length)
  if (invalidRow !== undefined) {
    return ['表格列数与行数据长度不一致，暂时不能导出。']
  }

  return []
}
