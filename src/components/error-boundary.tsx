'use client';
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-8">
          <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="text-red-400 font-semibold text-lg mb-2">Something went wrong</p>
            <p className="text-zinc-400 text-sm mb-6">{this.state.error?.message ?? 'An unexpected error occurred'}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2.5 px-4 rounded-lg border border-zinc-700 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
