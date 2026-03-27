# Phase 2：接入 Handsontable 在线编辑表格

## 1. 本次目标

在 `standard_edit` 模式下，将原本基于原生 `<table> + <input>` 的最小可用编辑表格，升级为基于 `Handsontable` 的在线编辑数据网格，并补齐 Phase 2 目标中的核心能力：

1. 在线编辑二维表
2. 编辑表头
3. 编辑单元格
4. 复制与粘贴
5. 删除列
6. 调整列顺序
7. 基于当前编辑态重新导出 Excel

模板模式 `template` 仍保持只读预览，不混入标准字段编辑逻辑。

## 2. 最终实现结论

本次已经完成 `Handsontable` 接入，`standard_edit` 模式下的结果区现在具备以下能力：

- 使用 `Handsontable` 渲染结果表格
- 首行作为可编辑表头
- 表体单元格可直接编辑
- 支持 `Ctrl/Cmd + C` 与 `Ctrl/Cmd + V`
- 支持选中列后左移、右移
- 支持删除当前列
- 保持从当前 `headers + rows` 状态导出

同时补齐了与编辑能力配套的状态同步策略：

- 前端不再只改单个 input，而是将表格编辑统一回写到 `editableHeaders + editableRows`
- 表格结构变化后，会清空旧的导出下载链接，避免用户下载过期导出结果
- 结果模式判别不再单纯依赖 `result.mode`，而是按返回结构识别 `template` / `standard_edit`

## 3. 关键实现方式

### 3.1 表格渲染策略

`Handsontable` 表格采用“首行即表头”的方式组织数据：

- 第一行：导出时使用的表头
- 后续各行：识别结果数据

这样做的原因是：

- 可以直接在网格内编辑表头
- 列移动和列删除会同时作用于表头和数据行
- 导出时可以自然地重新拆回 `headers + rows`

表格区还提供了列操作工具栏：

- 左移列
- 右移列
- 删除当前列

用户只需要先选中任意单元格，即可对当前列进行操作。

### 3.2 状态同步策略

为了适配 `Handsontable` 的网格型编辑，本次将标准字段模式的编辑状态收敛为“整表回写”：

- 从 `Handsontable` 当前实例读取表格数据
- 将首行拆回 `headers`
- 将后续各行拆回 `rows`
- 统一写回 `use-workbench-state.ts`

这比原来逐个 input 改值更稳定，特别适合：

- 粘贴一整块数据
- 批量覆盖单元格
- 删除列
- 调整列顺序

### 3.3 模式判别修正

在联调过程中发现，如果后端 `/result` 的 `mode` 字段不稳定，前端会错误进入模板预览分支，导致在线编辑失效。

为避免这类问题，本次改为按返回结构判别结果类型：

- 若存在 `preview_headers + preview_rows`，视为模板结果
- 若存在 `standard_fields + rows`，视为标准字段编辑结果

这样即使 `mode` 字段异常，只要返回的数据结构正确，前端仍能进入正确的展示和导出路径。

## 4. 影响到的主要文件

本次 Phase 2 的核心修改集中在以下文件：

- `src/components/result-table/result-table.tsx`
  - 接入 `Handsontable`
  - 定义在线编辑表格的交互与列操作
- `src/hooks/use-workbench-state.ts`
  - 增加整表回写能力
  - 编辑后同步维护 `editableHeaders + editableRows`
  - 结构变化后清理过期导出链接
- `src/components/export-actions/export-actions.tsx`
  - 按结果结构而不是仅按 `mode` 判别导出分支
- `src/types/tasks.ts`
  - 新增结果结构类型守卫
- `src/pages/workbench/workbench-page.tsx`
  - 工作台页面改为透传整表更新回调
- `src/main.tsx`
  - 引入 `Handsontable` 官方样式
- `src/index.css`
  - 增加数据网格主题样式
  - 收窄普通 `<table>` 的样式作用域，避免污染 `Handsontable`

## 5. 本次对 Phase 2 的完成度

对照原计划，当前已完成：

- 可编辑二维表
- 表头编辑
- 单元格编辑
- 复制粘贴
- 删除列
- 调整列顺序
- 自定义导出链路

也就是说，Phase 2 的核心范围已经完成，不再只是“最小可用编辑”，而是已经切换到正式的数据网格方案。

## 6. 验证结果

本次改动已经完成以下验证：

- `npm run lint`
- `npm run build`

构建通过，但需要注意一点：

- 引入 `Handsontable` 后，前端产物体积明显增大，当前构建仍会出现 chunk size warning

这不影响功能正确性，但后续如果继续优化体验，建议将 `Handsontable` 做懒加载或单独拆分 chunk。

## 7. 当前已知限制与后续建议

虽然 Phase 2 已完成，但仍有几个可以继续增强的方向：

- 为 `Handsontable` 做按需加载，降低首屏包体积
- 增加更明确的列选中高亮反馈
- 增加撤销/重做的显式 UI 提示
- 进一步补充移动端下的数据网格交互说明
- 结合 Phase 3 继续补草稿持久化与恢复原始识别值

## 8. 本次落地价值

这次改动的核心价值，不只是“把一个表格库接进来”，而是把 `standard_edit` 模式从简单表单编辑，升级为面向真实表格修订场景的数据网格工作台。

这意味着后续继续做：

- 批量修订
- 草稿缓存
- 更复杂的列操作
- 粘贴导入
- 更稳定的导出链路

都已经有了合适的前端承载基础，而不需要再回退到原生表格方案重构一次。
