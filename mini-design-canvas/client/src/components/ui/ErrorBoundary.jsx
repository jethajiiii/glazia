import { Component } from 'react';

/**
 * Robust React Error Boundary component catching JavaScript errors
 * anywhere in its child component tree and displaying a user-friendly fallback.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production or development, log cleanly without throwing
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              error: this.state.error,
              reset: this.handleReset,
            })
          : this.props.fallback;
      }

      return (
        <div className="error-boundary-container" role="alert" aria-live="assertive">
          <div className="error-boundary-card">
            <div className="error-boundary-icon" aria-hidden="true">
              ⚠️
            </div>
            <h2 className="error-boundary-title">Something went wrong in the editor</h2>
            <p className="error-boundary-desc">
              An unexpected error occurred while rendering the canvas workspace.
              Your data has not been lost.
            </p>

            {this.state.error && (
              <div className="error-boundary-details">
                <code>{this.state.error.message || String(this.state.error)}</code>
              </div>
            )}

            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={this.handleReload}
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
