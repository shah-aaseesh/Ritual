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
        <div className="min-h-screen bg-[#09090D] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-[#121217] rounded-3xl p-8 border border-white/10 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF3B30]/20 to-rose-900/10 text-[#FF3B30] border border-[#FF3B30]/20 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-white">
                Application Exception Recovered
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ritual encountered an unexpected rendering error. You can reload or reset your local state.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-2xl bg-[#09090D] text-left overflow-x-auto text-[11px] font-mono text-zinc-300 border border-white/10 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black text-xs font-black flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-black" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetState}
                className="py-3 px-4 rounded-xl bg-[#181822] hover:bg-[#20202c] text-zinc-300 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
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
