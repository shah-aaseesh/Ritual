import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetState = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6 text-charcoal-900 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-mint-200 shadow-card text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-soft">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-forest-950">
                Application Exception Recovered
              </h2>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Ritual encountered an unexpected rendering error. You can reload or reset your local state.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-2xl bg-cream-50 text-left overflow-x-auto text-[11px] font-mono text-charcoal-800 border border-mint-200 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-soft transition active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-mint-300" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetState}
                className="py-3 px-4 rounded-xl bg-cream-50 hover:bg-mint-100 text-charcoal-700 border border-mint-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset State</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
