import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  errorMessage: string | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    errorMessage: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      errorMessage: error.message || '前端页面发生未知错误。',
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled frontend error', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.errorMessage !== null) {
      return (
        <main className="workbench-page">
          <div className="banner">
            <span>{this.state.errorMessage}</span>
            <button
              type="button"
              className="button-secondary"
              onClick={() => window.location.reload()}
            >
              重新加载
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
