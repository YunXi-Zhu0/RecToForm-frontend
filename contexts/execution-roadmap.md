# RecToForm Frontend Execution Roadmap

## Phase 1

Goal: initialization, upload, async task loop, preview.

### Modules to create

- `src/types/*`
- `src/core/constants.ts`
- `src/core/errors.ts`
- `src/core/validators.ts`
- `src/api/templates.ts`
- `src/api/standard-fields.ts`
- `src/api/tasks.ts`
- `src/workflows/initialize-workbench-flow.ts`
- `src/workflows/create-task-flow.ts`
- `src/workflows/resolve-task-result-flow.ts`
- `src/hooks/use-task-polling.ts`
- `src/hooks/use-upload-files.ts`
- `src/pages/workbench/workbench-page.tsx`
- initial presentational components

### Acceptance

- Init requests for templates and standard fields run on page load
- Mode switch works
- Upload validation works locally
- Task creation works with correct multipart contract
- Polling stops on terminal state
- Result preview works for both modes
- Failed items render explicitly

## Phase 2

Goal: editable table and export for `standard_edit`.

### Modules to extend

- `src/components/result-table/*`
- `src/api/exports.ts`
- `src/workflows/export-standard-fields-flow.ts`
- state handling for editable headers and rows

### Acceptance

- Users can edit cells and headers
- Users can delete and reorder columns
- Export payload comes from current table state
- Download uses backend returned `download_url`

## Phase 3

Goal: resilience and UX completion.

### Focus

- draft persistence
- failed item filtering
- retry-friendly status presentation
- custom export filename
- restore original recognition values

## Implementation Heuristics

- Prefer discriminated unions for mode-specific result types
- Keep side effects inside workflows/hooks, not components
- Separate transport types from UI state types when needed
- Build read-only preview first, then editable table
- Treat duplicate upload handling as a first-class flow, not a toast-only case

## Known Risks

- Table library choice can force rewrites later if copy/paste and column ops are weak
- Polling and result readiness timing can create race conditions if state machine is loose
- Mixed mode handling can become messy without strong type separation

## Next Concrete Step

Start phase 1 by creating domain types and API wrappers, then replace the default `App.tsx` with a workbench entry component.
