'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { logger } from '@/lib/monitoring/logger'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorId: string
}

/**
 * Root error boundary.
 * Catches unhandled React render errors, reports them via logger,
 * and displays a user-friendly Arabic recovery UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorId: '' }
  }

  static getDerivedStateFromError(): State {
    const errorId = Math.random().toString(36).slice(2, 8).toUpperCase()
    return { hasError: true, errorId }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('Unhandled render error caught by ErrorBoundary', {
      message: error.message,
      stack: error.stack?.slice(0, 500),
      componentStack: info.componentStack?.slice(0, 500),
      errorId: this.state.errorId,
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorId: '' })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-sm">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>

            <h1 className="text-lg font-extrabold text-primary-950 mb-2">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              نعتذر، واجهت المنصة مشكلة مؤقتة. يمكنك المحاولة مجدداً أو إعادة تحميل الصفحة.
            </p>

            <button
              onClick={this.handleRetry}
              className="w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة المحاولة</span>
            </button>

            <p className="text-[10px] text-muted-foreground mt-4">
              رمز الخطأ: <code className="font-mono">{this.state.errorId}</code>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
