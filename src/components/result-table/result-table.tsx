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
  canRestoreOriginal: boolean
  hideStageHeader?: boolean
  onTableChange: (table: string[][]) => void
  onRestoreOriginal: () => void
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
  canRestoreOriginal,
  hideStageHeader = false,
  onTableChange,
  onRestoreOriginal,
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
    return (
      <div className="result-stage result-stage--empty">
        <span className="panel-kicker">结果区域</span>
        <h3>结果主舞台待命中</h3>
        <p className="muted">
          任务完成后，这里会切换为结果预览或可编辑表格，承接最终校对与导出动作。
        </p>
      </div>
    )
  }

  if (isTemplateTaskResult(result)) {
    return (
      <div className="result-stage">
        <div className="result-stage__intro">
          {hideStageHeader ? null : (
            <div className="result-stage__header">
              <div>
                <span className="panel-kicker">模板预览</span>
                <h3>模板模式结果预览</h3>
              </div>
              <div className="result-stage__summary">
                <span className="metric-chip">{result.preview_headers.length} 列</span>
                <span className="metric-chip">{result.preview_rows.length} 行</span>
                <span className="metric-chip metric-chip--success">只读预览</span>
              </div>
            </div>
          )}

        </div>

        <div className="result-stage__table result-stage__table--preview">
          <div className="table-wrap result-grid-shell result-grid-shell--preview">
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
        </div>
      </div>
    )
  }

  const selectedColumnLabel =
    activeSelectedColumnIndex === null
      ? '未选择'
      : editableHeaders[activeSelectedColumnIndex]?.trim() ||
        `未命名列 ${activeSelectedColumnIndex + 1}`
  const editableTableHeight = 420

  return (
    <div className="result-stage">
      <div className="result-stage__intro">
        {hideStageHeader ? null : (
          <div className="result-stage__header">
            <div>
              <span className="panel-kicker">可编辑表格</span>
              <h3>标准字段校对工作区</h3>
            </div>
            <div className="result-stage__summary">
              <span className="metric-chip">{editableHeaders.length} 列</span>
              <span className="metric-chip">{editableRows.length} 行</span>
              <span className="metric-chip metric-chip--info">可编辑</span>
            </div>
          </div>
        )}

        <div className="result-grid-toolbar">
          <div className="inline-notice inline-notice--accent result-grid-toolbar__notice">
            首行就是导出列名，可直接编辑。选中任意单元格后可移动或删除当前列。
          </div>
          <div className="inline-actions">
            <span className="tag">当前列：{selectedColumnLabel}</span>
            <div className="header-actions">
              <button
                type="button"
                onClick={onRestoreOriginal}
                disabled={!canRestoreOriginal}
              >
                恢复原始识别值
              </button>
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
                  activeSelectedColumnIndex === null ||
                  editableHeaders.length <= 1
                }
              >
                删除当前列
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="result-stage__table result-stage__table--editable">
        <div className="table-wrap result-grid-shell result-grid-shell--editable">
          <HotTable
            ref={hotRef}
            data={editableTableData}
            rowHeaders={renderRowHeader}
            colHeaders={false}
            width="100%"
            height={editableTableHeight}
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
    </div>
  )
}
