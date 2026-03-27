import { useState } from 'react'

import {
  buildWeakFileSignature,
  findWeakDuplicateSignatures,
  validateUploadSelection,
} from '@/core/validators'
import type { UploadFileItem } from '@/types/workbench'

function buildFileItem(file: File): UploadFileItem {
  return {
    id: crypto.randomUUID(),
    file,
    localWarnings: [],
    isServerDuplicate: false,
  }
}

function decorateItems(items: UploadFileItem[]): UploadFileItem[] {
  const duplicateSignatures = findWeakDuplicateSignatures(
    items.map((item) => item.file),
  )

  return items.map((item) => ({
    ...item,
    localWarnings: duplicateSignatures.has(buildWeakFileSignature(item.file))
      ? ['本地检测到可能重复文件，后端会再次按内容校验。']
      : [],
  }))
}

export function useUploadFiles() {
  const [items, setItems] = useState<UploadFileItem[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  function addFiles(fileList: FileList | File[]): void {
    const nextFiles = Array.from(fileList)
    const validation = validateUploadSelection(nextFiles, items.length)

    setValidationErrors(validation.errors)

    if (validation.acceptedFiles.length === 0) {
      return
    }

    setItems((currentItems) =>
      decorateItems([
        ...currentItems,
        ...validation.acceptedFiles.map((file) => buildFileItem(file)),
      ]),
    )
  }

  function removeFile(fileId: string): void {
    setItems((currentItems) =>
      decorateItems(currentItems.filter((item) => item.id !== fileId)),
    )
  }

  function clearFiles(): void {
    setItems([])
    setValidationErrors([])
  }

  function clearServerDuplicateMarks(): void {
    setItems((currentItems) =>
      decorateItems(
        currentItems.map((item) => ({
          ...item,
          isServerDuplicate: false,
        })),
      ),
    )
  }

  function markServerDuplicates(fileNames: string[]): void {
    const duplicateNameSet = new Set(fileNames)

    setItems((currentItems) =>
      decorateItems(
        currentItems.map((item) => ({
          ...item,
          isServerDuplicate: duplicateNameSet.has(item.file.name),
        })),
      ),
    )
  }

  return {
    items,
    files: items.map((item) => item.file),
    validationErrors,
    addFiles,
    removeFile,
    clearFiles,
    clearServerDuplicateMarks,
    markServerDuplicates,
  }
}
