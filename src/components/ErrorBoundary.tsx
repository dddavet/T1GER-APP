import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error', error, errorInfo);
  }

  private retry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090B] p-5 text-white">
        <section role="alert" className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#121216] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF8A2B]">T1GER · RECOVERY</p>
          <h1 className="mt-3 text-2xl font-bold">We hit an unexpected problem.</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">Your saved learning progress is safe. Try returning to the app; if the issue continues, reload this session.</p>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-4 rounded-xl border border-white/8 bg-black/25 p-3 text-xs text-zinc-400">
              <summary className="cursor-pointer font-semibold text-zinc-300">Developer details</summary>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words font-mono">{this.state.error.message}</pre>
            </details>
          )}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={this.retry} className="t1ger-primary-button min-h-12 text-sm font-bold text-black">Try again</button>
            <button type="button" onClick={() => window.location.reload()} className="t1ger-secondary-button min-h-12 text-sm font-bold">Reload app</button>
          </div>
        </section>
      </main>
    );
  }
}
