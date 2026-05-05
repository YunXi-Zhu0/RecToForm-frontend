import { ErrorBoundary } from '@/components/error-boundary/error-boundary'
import { WorkbenchPage } from '@/pages/workbench/workbench-page'

function App() {
  return (
    <ErrorBoundary>
      <WorkbenchPage />
    </ErrorBoundary>
  )
}

export default App
