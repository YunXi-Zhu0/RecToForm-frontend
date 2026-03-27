# RecToForm Frontend Project Context

## Purpose

Build a single-page invoice recognition workbench on top of the current `Vite + React 19 + TypeScript` app.

## Current Repository Status

- Alias `@/* -> src/*` is already configured
- `src/App.tsx` is still the default Vite sample page
- No business modules exist yet under `src/`
- `contexts/` is empty before this summary

## Product Modes

### `template`

- Requires `template_id`
- Backend generates final Excel
- Frontend handles selection, upload, polling, preview, download
- Result shape uses `preview_headers`, `preview_rows`, `excel_download_url`, `failed_items`
- First preview column is source file and stays read-only

### `standard_edit`

- Must not send `template_id`
- Backend returns full standard field recognition result
- Frontend handles editing, column operations, export
- Result shape uses `standard_fields`, `rows`, `failed_items`
- Export payload must be rebuilt from current frontend table state

## API Invariants

- Prefix: `/api/v1`
- `POST /tasks` uses `multipart/form-data`
- `config` is a JSON string, not nested form fields
- File field name is always repeated `files`
- Poll every 2-3 seconds
- Stop polling on `succeeded`, `partially_succeeded`, `failed`
- If `/tasks/{task_id}/result` returns `409`, continue polling task status
- Template download prefers `excel_download_url` from result
- Standard edit export must use returned `download_url`

## Validation Invariants

- Max 50 files per task
- Max 10MB per file
- Image and PDF only
- Backend is final authority on duplicates
- If backend returns `detail.duplicate_files`:
  - do not enter polling state
  - keep current selected files
  - mark duplicate items in upload list

## Error Invariants

Common backend error:

```json
{ "detail": "error message" }
```

Duplicate file special case:

```json
{
  "detail": {
    "message": "Duplicate files are not allowed.",
    "duplicate_files": ["a.png", "b.png"]
  }
}
```

Need a single parser in `core/errors.ts`.

## Data Invariants

- Missing value default is `""`
- Never coerce missing values to `null`
- `failed_items` must always be surfaced in UI
- Task may finish as `partially_succeeded`

## Minimum State Model

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

## Recommended Source Layout

```text
src/
  api/
  components/
  core/
  hooks/
  pages/
  types/
  workflows/
```

## Immediate Build Order

1. Define strict API/domain types
2. Implement shared constants, validators, error parser
3. Implement API modules
4. Implement task workflow and polling hook
5. Replace `App.tsx` with workbench page entry
6. Build shared page sections
7. Deliver phase 1 end-to-end flow
8. Add editable table and export flow for `standard_edit`

## Non-Negotiables

- Keep `App.tsx` lightweight
- Use `@/...` imports internally
- Do not parse downloaded xlsx for preview
- Do not call `/tasks/{task_id}/excel` in `standard_edit`
- Do not hand-build export download URLs
- Do not rename backend fields in API-layer types
