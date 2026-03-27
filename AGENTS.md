# RecToForm Frontend Agent Guide

## Project Goal

This is a frontend project based on Vite + React + TypeScript. It integrates with the invoice recognition backend and is responsible for completing the following end-to-end workflow:

1. Initialize the template list and standard fields
2. Select the processing mode
3. Upload multiple invoice files and create an asynchronous task
4. Poll task status and progress
5. Fetch the result JSON and render it
6. Download or export Excel based on the selected mode

The backend currently supports two modes:

- `template`: the backend generates the final Excel directly from the selected template, and the frontend is responsible for upload, polling, preview, and download
- `standard_edit`: the backend returns recognition results for the full set of standard fields, and the frontend is responsible for table editing, revision, and export

## Tech Stack And Runtime

- This project uses the `Vite + React + TypeScript` stack
- Frontend runtime: React 19, TypeScript, Vite
- Node.js requirement: `Node 20`
- Entry point: `src/main.tsx`
- Current page entry: `src/App.tsx`
- Common commands:
  - `npm run dev`
  - `npm run build`
  - `npm run lint`

## Recommended Frontend Architecture

Although the final product is mainly centered on a single workbench page, the code should still be organized with clear boundaries:

```text
src/
  api/
  assets/
  components/
  core/
  hooks/
  pages/
  types/
  workflows/
  App.tsx
  main.tsx
```

Recommended responsibilities:

- `pages`: page-level composition only; the main page should be a single workbench page
- `components`: presentation-oriented UI blocks such as mode switchers, upload panels, progress panels, result tables, and export actions
- `api`: backend request modules grouped by resource, such as templates, standard fields, tasks, and exports
- `workflows`: business flow orchestration such as task creation, polling, result fetching, and export pipelines
- `hooks`: reusable stateful logic and UI interaction hooks
- `core`: shared constants, configuration, utilities, and error parsing infrastructure
- `types`: strict frontend types aligned with backend response fields
- `App.tsx`: keep it as a lightweight entry component and delegate the main screen to the workbench page

The goal is to avoid packing all business logic into a single page file even when the product remains a single-page workbench.

## Page And Interaction Layout

The page should be organized as a single-page workbench. The preferred regions are:

1. Mode switching area
2. Template or standard field initialization area
3. File upload area
4. Task progress area
5. Result table area
6. Export and download action area

Recommended user flow:

1. Request the template list and standard fields in parallel on page initialization
2. Let the user switch between `template` and `standard_edit`
3. Prepare upload configuration based on the selected mode
4. Create the task and enter polling immediately without waiting for synchronous results
5. Fetch `/result` after the task finishes
6. In template mode, download directly; in custom mode, allow editing before export

## Backend API Contract

- Service prefix: `/api/v1`
- Health check: `GET /health`
- Template list: `GET /api/v1/templates`
- Template detail: `GET /api/v1/templates/{template_id}`
- Standard fields: `GET /api/v1/standard-fields`
- Create task: `POST /api/v1/tasks`
- Query task: `GET /api/v1/tasks/{task_id}`
- Get result: `GET /api/v1/tasks/{task_id}/result`
- Template mode download: `GET /api/v1/tasks/{task_id}/excel`
- Custom mode export: `POST /api/v1/exports/standard-fields`
- Export file download: `GET /api/v1/exports/standard-fields/{export_id}`

## Core Implementation Rules

### 1. Task Creation

- `POST /api/v1/tasks` must use `multipart/form-data`
- `config` must be a JSON string, not a nested object
- The file field name must always be repeated `files`

Mode-specific configuration:

- `template` mode must include `template_id`
- `standard_edit` mode must not include `template_id`

### 2. Task Polling

- Control the polling interval within 2 to 3 seconds
- Stop polling when `status` is `succeeded`, `partially_succeeded`, or `failed`
- `status` controls the global UI state
- `stage` is used to display the detailed processing stage
- If `/result` returns `409 Conflict`, it means the result is not ready yet, and the frontend should continue polling the task status endpoint

The currently visible status and stage values include:

- `queued`
- `running`
- `file_preprocessing`
- `llm_processing`
- `assembling_results`
- `excel_generating`
- `succeeded`
- `partially_succeeded`
- `failed`

### 3. Template Mode

- Use the template list and template detail to initialize read-only column information
- Render results with `preview_headers + preview_rows`
- The first column, `source file`, must keep the API order and remain read-only
- Prefer the `excel_download_url` returned by `/result` for download
- Do not call `/tasks/{task_id}/excel` in `standard_edit` mode

### 4. Custom Header Mode

- Initialize column definitions with `fields` returned by `/standard-fields`
- Render results with `standard_fields + rows`
- The frontend is responsible for editing headers, editing cells, deleting columns, and adjusting order
- When exporting, the frontend must reassemble `headers + rows` from the current table state
- After calling `/exports/standard-fields`, use the `download_url` returned by the response
- Do not construct the export file URL or filename URL manually

### 5. Result And Error Handling

- `failed_items` must be displayed explicitly and must not be swallowed
- The task may be `partially_succeeded`
- Empty values must follow the backend contract, where the default missing value is the empty string `""`
- Do not convert empty strings into `null` on your own

Backend errors usually look like this:

```json
{ "detail": "error message" }
```

Duplicate file errors are a special case:

```json
{
  "detail": {
    "message": "Duplicate files are not allowed.",
    "duplicate_files": ["a.png", "b.png"]
  }
}
```

The frontend needs a unified error parsing and notification strategy.

## Upload Limits

- At most `50` files per task
- Maximum single file size: `10MB`
- Supported file types: images and PDF only
- Duplicate detection is based on file content, not file name

The frontend should perform lightweight local validation, but the backend remains the final source of truth:

- File count
- File size
- Basic file type
- Duplicate upload warning

If the backend returns `detail.duplicate_files`:

- Do not enter the polling state
- Keep the user's current selected files
- Show duplicate status on the corresponding file items

## Recommended State Model

At minimum, maintain the following state:

- `mode`
- `templates`
- `selectedTemplateId`
- `templateDetail`
- `standardFields`
- `uploadFiles`
- `duplicateFiles`
- `taskId`
- `taskStatus`
- `taskStage`
- `taskProgress`
- `taskResult`
- `failedItems`
- `editableHeaders`
- `editableRows`
- `exportId`
- `exportDownloadUrl`

## Implementation Priorities

Phase 1:

1. Mode switching
2. Template and standard field initialization
3. Multi-file upload
4. Task creation and polling
5. Result preview

Phase 2:

1. Custom header editing
2. Copy and paste
3. Column deletion and reordering
4. Custom result export

Phase 3:

1. Failed item filtering and display
2. Table draft persistence
3. Custom export filename
4. Restore original recognition values

## Repository Development Guidance

- `src/App.tsx` is still the default Vite example page and should be replaced by the business workbench later
- Prefer splitting new functionality into clear `components`, `hooks`, `api`, `workflows`, and `types` modules rather than packing everything into `App.tsx`
- API type definitions must stay strictly aligned with backend response fields and should not be renamed arbitrarily or omit critical fields
- Result preview depends on the JSON returned by `/result`; do not try to parse the downloaded Excel file
- When modifying UI or data flow, always check whether the boundary between the two modes is still respected

## Suggested Integration Order

It is recommended to connect the frontend in the following order:

1. `GET /templates` and `GET /standard-fields`
2. `POST /tasks` and `GET /tasks/{task_id}`
3. `GET /tasks/{task_id}/result`
4. For template mode, connect `GET /tasks/{task_id}/excel`
5. For custom mode, connect `POST /exports/standard-fields` and the download endpoint

The goal is to stabilize the `upload + polling + result preview` loop first, and then complete the final export capability.

## Git Commit Conventions

- Commits must follow the Conventional Commits specification
- The commit subject must be written in Chinese
- Commit descriptions must be as detailed as possible and must not be limited to vague titles
- Commit content must clearly include the following information:
  - The core functionality implemented in this change
  - The implementation approach
  - The key workflow, algorithm, or processing pipeline
  - The scope of impact
- Recommended commit subject formats include:
  - `feat: 新增 PDF 发票抽图与视觉模型结构化提取流程`
  - `fix: 修复视觉模型返回非 JSON 时的解析兜底逻辑`
  - `refactor: 拆分文件预处理、视觉识别与 Excel 填表服务`
- If more detail is needed, prefer a multi-line commit message in Chinese
- After completing each relatively independent small module, small feature, or small phase, proactively remind the user whether a `commit` is needed
