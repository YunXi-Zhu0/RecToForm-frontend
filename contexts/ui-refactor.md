# RecToForm UI 表现层重构实施方案

## 1. 目标与边界

本轮聚焦前端 UI 表现层重构，不改动既有业务接口契约、状态机逻辑和模式边界。目标是在保留当前 `template` 与 `standard_edit` 双模式流程的前提下，将现有“顺序表单页”升级为符合 [`docs/前端UI样式.md`](/home/yunxi-zhu/projects/RecToForm-fronted/docs/前端UI样式.md) 的“深色未来感智能识别工作台”。

本次方案覆盖：

- 页面整体视觉语言与设计 token
- 工作台布局重组
- 核心组件样式重构
- 状态与动效体系
- 响应式与验收标准

本次方案不主动变更：

- API 请求与数据流
- 轮询时序与任务状态判定规则
- `Handsontable` 的核心编辑能力
- 导出与下载业务逻辑

## 2. 当前页面与目标页面的主要差距

基于当前代码现状：

- [`src/pages/workbench/workbench-page.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/pages/workbench/workbench-page.tsx) 仍按 `1-7` 线性章节平铺，缺少“单一共享工作区”
- [`src/index.css`](/home/yunxi-zhu/projects/RecToForm-fronted/src/index.css) 为浅色后台样式，缺少深色主背景、科技感层次、状态高亮与品牌感
- 上传、进度、模板、结果、导出彼此割裂，未形成任务流舞台
- 模式切换仍是普通按钮组，模板选择仍是普通下拉，缺少引导性
- 任务处理中仅有原生 `progress`，未体现“处理中态”的沉浸式反馈
- 结果区已有 `Handsontable` 能力，但未形成视觉主舞台，也未区分只读预览与编辑态的氛围

## 3. 设计方向与实现原则

### 3.1 统一视觉方向

采用“深色未来感工作台”方向：

- 主背景：深蓝黑 / 石墨黑
- 功能高亮：青蓝、冰蓝、荧光绿
- 面板：半透明深色面板 + 细描边 + 微发光
- 重点锚点：品牌头部、当前模式、任务进度、结果导出

### 3.2 实现原则

- 只重构表现层，不破坏现有数据流
- 优先收敛为一套全局 token，再局部重构组件
- 保持模式边界清晰：`template` 只读预览，`standard_edit` 可编辑
- 强化任务阶段感：上传 -> 模板确认 -> 分析处理中 -> 结果预览/导出
- 动效服务信息反馈，不做展示型堆砌

## 4. 页面重构总方案

### 4.1 页面结构重组

将现有页面改造为以下结构：

1. 顶部品牌头部
2. 中央共享工作区
3. 底部辅助信息区
4. 左下角固定“帮助中心”入口

对应到代码层，建议将 [`src/pages/workbench/workbench-page.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/pages/workbench/workbench-page.tsx) 从“多个顺序 section”改为“页面外壳 + 主舞台 + 辅助区域”。

### 4.2 中央共享工作区

共享工作区为本次改造核心，承载四个阶段：

1. 上传文件
2. 选择模板 / 全字段模式
3. 分析处理中
4. 结果预览与编辑

实现要求：

- 使用稳定尺寸的主舞台容器，减少高度跳变
- 通过状态切换控制内部内容，而不是让用户在多个零散区块中来回扫描
- 处理中叠加半透明雾化遮罩和中央进度组件
- 结果完成后直接切换到结果表格区

### 4.3 辅助信息区

主舞台下方保留两个辅助区：

- `failed_items` 面板
- 下载 / 导出面板

这样既保留当前业务模块边界，也不打断中部主流程。

## 5. 样式架构与文件拆分建议

### 5.1 全局样式入口

以 [`src/index.css`](/home/yunxi-zhu/projects/RecToForm-fronted/src/index.css) 作为全局 token 与基础层入口，新增：

- 颜色变量
- 字体变量
- 阴影、边框、模糊、发光变量
- 页面背景纹理与渐变层
- 按钮、输入框、标签、滚动条的基础规范

### 5.2 组件样式组织

建议将页面样式从“单文件堆叠”逐步收敛为“页面壳 + 组件域”：

- `src/index.css`：token、全局 reset、通用控件样式
- `src/pages/workbench/workbench-page.tsx`：页面结构重排
- 当前组件继续保留在原目录，优先通过语义类名增强样式挂载点

如果后续样式继续复杂化，可再考虑补充：

- `src/pages/workbench/workbench-page.css`
- `src/components/*/*.css`

本轮优先不扩大 CSS 文件数量，先完成结构和类名体系整理。

## 6. 组件级改造清单

### 6.1 页面头部

目标：

- 突出 `RecToForm`
- 增加英文副标题与当前模式状态
- 展示 API 状态位或任务状态位

改造点：

- 替换当前普通标题区
- 增加品牌区、状态区、说明区三层结构
- 加入横向描边、弱光晕和数据舱标题感

### 6.2 模式切换区

关联文件：

- [`src/components/mode-switcher/mode-switcher.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/components/mode-switcher/mode-switcher.tsx)

改造方向：

- 从普通按钮组改为“模式卡片切换器”
- 每个模式展示名称、简述、适用场景
- 激活态以高亮描边、状态条、背景辉光表现

### 6.3 模板引导区

关联文件：

- [`src/components/template-panel/template-panel.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/components/template-panel/template-panel.tsx)

改造方向：

- `template` 模式下由下拉框升级为模板卡片列表
- 每个模板卡片展示名称、版本、推荐字段摘要
- 卡片下方补一行表头预览区
- `standard_edit` 模式下显示“全字段返回”说明卡，而不是字段 tag 堆叠

### 6.4 上传区

关联文件：

- [`src/components/upload-panel/upload-panel.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/components/upload-panel/upload-panel.tsx)

改造方向：

- 升级为拖拽主入口视觉
- 明确“点击上传 / 拖拽上传 / 选择文件夹上传”三种入口提示
- 文件列表改为状态化条目卡片，显示大小、类型、警告、重复状态
- 加强空态说明与限制条件展示

说明：

浏览器目录上传能力若后续接入，可通过 `webkitdirectory` 增强；本轮方案先预留视觉入口与结构位置。

### 6.5 任务进度区

关联文件：

- [`src/components/progress-panel/progress-panel.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/components/progress-panel/progress-panel.tsx)

改造方向：

- 弃用单纯原生 `progress` 视觉
- 增加主进度条 + 百分比 + 状态徽标 + 指标卡片
- 在处理中阶段提供共享工作区遮罩态
- 阶段文案与 `processed / total`、成功、失败指标形成仪表板布局

### 6.6 结果表格区

关联文件：

- [`src/components/result-table/result-table.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/components/result-table/result-table.tsx)

改造方向：

- 强化为页面最大视觉主舞台
- `template` 模式只读表格做深色表头与高密度预览
- `standard_edit` 模式强化工具栏、草稿状态、当前列状态
- 统一 `Handsontable` 容器边框、阴影、滚动条与焦点态
- 补充“当前为全字段返回模式，可自定义表头”的内嵌提示条

### 6.7 失败项区

关联文件：

- [`src/components/failed-items/failed-items.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/components/failed-items/failed-items.tsx)

改造方向：

- 保持筛选能力
- 视觉上做成故障面板 / 异常摘要
- 强调数量、原因聚合与筛选结果
- 错误项列表采用更高可读性的条目样式

### 6.8 导出区

关联文件：

- [`src/components/export-actions/export-actions.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/components/export-actions/export-actions.tsx)

改造方向：

- 统一为强主按钮区
- 区分 `下载 Excel` 与 `导出并下载 Excel`
- 辅助展示文件名策略、当前结果状态和下载链接反馈

### 6.9 帮助中心入口

本轮需要新增固定入口样式位，建议先在页面壳中直接实现：

- 左下角固定定位
- 图标 + 文案
- 低干扰但始终可见

## 7. 分阶段实施顺序

### Phase 1: 视觉基础层

目标：建立可复用设计 token 和页面外壳。

任务：

- 重写 [`src/index.css`](/home/yunxi-zhu/projects/RecToForm-fronted/src/index.css) 的全局变量与基础样式
- 搭建深色背景、光晕、网格纹理、滚动条和基础按钮规范
- 定义常用状态类：默认、激活、成功、警告、错误、禁用

### Phase 2: 页面骨架层

目标：从线性 section 页面切换到工作台页面。

任务：

- 重组 [`src/pages/workbench/workbench-page.tsx`](/home/yunxi-zhu/projects/RecToForm-fronted/src/pages/workbench/workbench-page.tsx)
- 新增品牌头部、共享工作区、辅助信息区、帮助中心入口
- 将原顺序标题改为任务阶段式呈现

### Phase 3: 核心组件层

目标：完成上传、模式、模板、进度、结果区的主视觉改造。

任务：

- 逐个增强组件类名与结构
- 补足卡片、工具条、状态标签、空态、错误态
- 强化结果区与 `Handsontable` 容器样式

### Phase 4: 状态与动效层

目标：补足工作台体验与任务阶段反馈。

任务：

- 阶段切换淡入、位移、模糊过渡
- 处理中遮罩态
- hover / focus / active 反馈统一

### Phase 5: 响应式与验收层

目标：确保桌面优先、中等屏可用。

任务：

- 处理 `1280px`、`1024px`、`768px` 以下布局变化
- 保证表格横向滚动可用
- 调整帮助中心与辅助区布局

## 8. 状态覆盖要求

样式实现必须覆盖以下状态：

- 初始化加载态
- 初始化失败态
- 空上传态
- 已上传待选模板态
- 模板详情加载态
- 任务进行中态
- 任务失败态
- 部分成功态
- 结果为空态
- 导出中态
- 导出完成态

## 9. 验收标准

完成 UI 重构后，至少满足以下标准：

1. 页面首屏具备明确品牌感，能一眼看出是“智能识别工作台”
2. 页面主流程被收敛到中央共享工作区，不再是顺序表单堆叠
3. 视觉主风格为深色、克制、科技感，而不是通用后台
4. 上传、模板、处理中、结果四阶段切换清晰
5. `Handsontable` 结果区成为主舞台，编辑态与只读态区分明确
6. 失败项与导出区具有独立层级，但不抢主流程焦点
7. 中等屏幕下仍可操作，结果表格可横向滚动

## 10. 风险与约束

- `Handsontable` 默认主题与目标风格差异较大，需要定向覆盖样式
- 若 `workbench-page.tsx` 结构不重排，仅靠 CSS 难以实现共享工作区目标
- 若组件类名语义不足，样式会继续依赖脆弱选择器，应同步补充结构类名
- 上传文件夹能力目前未接入，需要区分“视觉预留”与“功能已实现”

## 11. 下一步执行建议

按本方案开始实际样式改造时，推荐顺序如下：

1. 先改页面骨架和全局 token
2. 再改上传区、模式区、模板区
3. 随后改进度遮罩与结果表格区
4. 最后收尾失败项、导出区、帮助中心和响应式

这样可以先把“工作台形态”建立起来，再补强细节表现。
