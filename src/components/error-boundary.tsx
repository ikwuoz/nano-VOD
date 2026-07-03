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
        <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
          <div style={{ maxWidth: 360, width: '100%', background: 'var(--surface-1)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              Something went wrong
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 500,
                background: 'var(--surface-2)', color: 'var(--text-primary)',
                height: 40, borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
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
