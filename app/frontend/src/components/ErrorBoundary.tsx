import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="p-8 text-center font-mono">
            <p>Algo deu errado. Tente recarregar a página.</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 border border-ink px-4 py-2 dark:border-ink-dark"
            >
              Tentar novamente
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
