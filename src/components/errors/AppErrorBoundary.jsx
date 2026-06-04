import { Component } from 'react'
import ErrorPageContent from './ErrorPageContent'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
    this.handleRetry = this.handleRetry.bind(this)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[Wenando] Uncaught UI error:', error, info)
  }

  handleRetry() {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPageContent code="500" onRetry={this.handleRetry} />
    }

    return this.props.children
  }
}
