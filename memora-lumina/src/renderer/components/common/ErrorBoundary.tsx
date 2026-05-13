import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught render error:', error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  private handleRestart = (): void => {
    try {
      this.setState({ hasError: false, error: null });
      window.location.reload();
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  private handleContinue = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;
    const message = this.state.error?.message || 'An unexpected error occurred.';
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary, #0F1117)',
          color: 'var(--text-primary, #F1F5F9)',
          padding: 32,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'rgba(127,29,29,0.18)',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          !
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Something went wrong.</div>
        <div style={{ marginTop: 8, color: 'var(--text-secondary, #94A3B8)', fontSize: 13, maxWidth: 520, textAlign: 'center' }}>
          {message}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button
            onClick={this.handleRestart}
            style={{
              height: 40,
              padding: '0 18px',
              borderRadius: 8,
              background: 'var(--accent-primary, #3B82F6)',
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Restart Memora Lumina
          </button>
          <button
            onClick={this.handleContinue}
            style={{
              height: 40,
              padding: '0 18px',
              borderRadius: 8,
              background: 'var(--surface-elevated, #242836)',
              color: 'var(--text-primary, #F1F5F9)',
              fontWeight: 500,
              fontSize: 14,
              border: '1px solid var(--border-default, #2E3348)',
              cursor: 'pointer',
            }}
          >
            Try to continue
          </button>
        </div>
      </div>
    );
  }
}
