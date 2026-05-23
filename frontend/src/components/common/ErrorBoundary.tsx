import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

type Props = { children: ReactNode; fallbackMessage?: string }
type State = { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-status-danger/40 bg-status-danger/10 px-6 py-4 text-status-danger">
          <AlertTriangle size={20} />
          <div>
            <p className="font-semibold">{this.props.fallbackMessage ?? 'Что-то пошло не так'}</p>
            <p className="mt-1 text-sm opacity-80">{this.state.error?.message}</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="ml-auto rounded-lg border border-status-danger/30 px-3 py-1 text-xs hover:bg-status-danger/20"
          >
            Повторить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
