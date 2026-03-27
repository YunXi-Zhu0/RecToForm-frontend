import { HotTable, type HotTableRef } from '@handsontable/react-wrapper'
import type { CellChange, ChangeSource } from 'handsontable/common'
import { registerAllModules } from 'handsontable/registry'
import type { CellMeta } from 'handsontable/settings'
import { useMemo, useRef, useState } from 'react'

import {
  isStandardEditTaskResult,
  isTemplateTaskResult,
  type TaskResultResponse,
} from '@/types/tasks'

registerAllModules()

interface ResultTableProps {
  result: TaskResultResponse | null
  editableHeaders: string[]
  editableRows: string[][]
  onTableChange: (table: string[][]) => void
  onDeleteColumn: (index: number) => void
  onMoveColumn: (index: number, direction: 'left' | 'right') => void
}

function normalizeCellValue(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function buildEditableTable(headers: string[], rows: string[][]): string[][] {
  return [
    [...headers],
    ...rows.map((row) =>
      Array.from({ length: headers.length }, (_, columnIndex) =>
        normalizeCellValue(row[columnIndex]),
      ),
    ),
  ]
}

function renderRowHeader(rowIndex: number): string {
  return rowIndex === 0 ? '列名' : String(rowIndex)
}

function buildCellMeta(rowIndex: number): CellMeta {
  return {
    className:
      rowIndex === 0 ? 'result-grid__header-row' : 'result-grid__body-row',
  }
}

export function ResultTable({
  result,
  editableHeaders,
  editableRows,
  onTableChange,
  onDeleteColumn,
  onMoveColumn,
}: ResultTableProps) {
  const hotRef = useRef<HotTableRef | null>(null)
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(
    null,
  )

  const editableTableData = useMemo(
    () => buildEditableTable(editableHeaders, editableRows),
    [editableHeaders, editableRows],
  )

  const activeSelectedColumnIndex =
    result === null ||
    !isStandardEditTaskResult(result) ||
    editableHeaders.length === 0 ||
    selectedColumnIndex === null
      ? null
      : Math.min(selectedColumnIndex, editableHeaders.length - 1)

  function syncTableFromInstance(): void {
    const table = hotRef.current?.hotInstance?.getData()

    if (table === undefined) {
      return
    }

    onTableChange(
      table.map((row) =>
        row.map((cell: unknown) => normalizeCellValue(cell)),
      ),
    )
  }

  function handleAfterChange(
    _changes: CellChange[] | null,
    source: ChangeSource,
  ): void {
    if (source === 'loadData' || source === 'updateData') {
      return
    }

    syncTableFromInstance()
  }

  function handleSelectionEnd(
    _row: number,
    column: number,
    _row2: number,
    column2: number,
  ): void {
    const nextColumn = column2 >= 0 ? column2 : column
    setSelectedColumnIndex(nextColumn >= 0 ? nextColumn : null)
  }

  function moveSelectedColumn(direction: 'left' | 'right'): void {
    if (activeSelectedColumnIndex === null) {
      return
    }

    const targetIndex =
      direction === 'left'
        ? activeSelectedColumnIndex - 1
        : activeSelectedColumnIndex + 1

    if (targetIndex < 0 || targetIndex >= editableHeaders.length) {
      return
    }

    onMoveColumn(activeSelectedColumnIndex, direction)
    setSelectedColumnIndex(targetIndex)
  }

  function deleteSelectedColumn(): void {
    if (activeSelectedColumnIndex === null || editableHeaders.length <= 1) {
      return
    }

    onDeleteColumn(activeSelectedColumnIndex)
    setSelectedColumnIndex(
      Math.min(activeSelectedColumnIndex, editableHeaders.length - 2),
    )
  }

  if (result === null) {
    return <p className="muted">任务完成后会在这里展示结果预览。</p>
  }

  if (isTemplateTaskResult(result)) {
    return (
      <div className="table-wrap">
        <table className="result-preview-table">
          <thead>
            <tr>
              {result.preview_headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.preview_rows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${row.join('|')}`}>
                {row.map((cell, columnIndex) => (
                  <td key={`${rowIndex}-${columnIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const selectedColumnLabel =
    activeSelectedColumnIndex === null
      ? '未选择'
      : editableHeaders[activeSelectedColumnIndex]?.trim() ||
        `未命名列 ${activeSelectedColumnIndex + 1}`

  const tableHeight = Math.min(Math.max((editableRows.length + 2) * 40, 240), 560)

  return (
    <div className="stack">
      <div className="result-grid-toolbar">
        <p className="muted">
          首行就是导出列名，可直接编辑。选中任意单元格后可移动或删除当前列，支持
          <code>Ctrl/Cmd + C</code> 与 <code>Ctrl/Cmd + V</code>。
        </p>
        <div className="inline-actions">
          <span className="tag">当前列：{selectedColumnLabel}</span>
          <div className="header-actions">
            <button
              type="button"
              onClick={() => moveSelectedColumn('left')}
              disabled={
                activeSelectedColumnIndex === null ||
                activeSelectedColumnIndex === 0
              }
            >
              左移列
            </button>
            <button
              type="button"
              onClick={() => moveSelectedColumn('right')}
              disabled={
                activeSelectedColumnIndex === null ||
                activeSelectedColumnIndex === editableHeaders.length - 1
              }
            >
              右移列
            </button>
            <button
              type="button"
              onClick={deleteSelectedColumn}
              disabled={
                activeSelectedColumnIndex === null || editableHeaders.length <= 1
              }
            >
              删除当前列
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrap result-grid-shell">
        <HotTable
          ref={hotRef}
          data={editableTableData}
          rowHeaders={renderRowHeader}
          colHeaders={false}
          width="100%"
          height={tableHeight}
          fixedRowsTop={1}
          autoWrapRow={true}
          autoWrapCol={true}
          manualColumnResize={true}
          copyPaste={true}
          contextMenu={['copy', 'cut', '---------', 'undo', 'redo']}
          allowInsertColumn={false}
          allowInsertRow={false}
          allowRemoveColumn={false}
          allowRemoveRow={false}
          outsideClickDeselects={false}
          stretchH="none"
          colWidths={180}
          cells={(rowIndex) => buildCellMeta(rowIndex)}
          themeName="ht-theme-main"
          licenseKey="non-commercial-and-evaluation"
          afterChange={handleAfterChange}
          afterSelectionEnd={handleSelectionEnd}
        />
      </div>
    </div>
  )
}
