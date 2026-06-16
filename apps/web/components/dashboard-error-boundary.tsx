"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Error al cargar el dashboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {this.state.error?.message || "Ha ocurrido un error inesperado"}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              >
                Reintentar
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
