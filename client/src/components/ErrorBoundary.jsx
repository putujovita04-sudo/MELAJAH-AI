import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[MELAJAH] Kesalahan tampilan:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="grid min-h-svh place-items-center px-4">
        <div className="panel max-w-lg p-6 text-center shadow-float">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-accent-soft">
            <AlertTriangle size={26} strokeWidth={2.6} aria-hidden="true" />
          </span>
          <h1 className="h3-display mt-3">Ups, ada yang tersangkut</h1>
          <p className="mt-2 text-ink-2">
            Permainan berhenti sebentar. Muat ulang halaman untuk melanjutkan.
            Progres pertandingan mungkin hilang.
          </p>
          <p className="mt-2 rounded border border-line bg-surface-2/60 p-2 text-left text-[0.75rem] font-mono text-ink-2">
            {String(this.state.error?.message ?? this.state.error)}
          </p>
          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Muat ulang
          </button>
        </div>
      </div>
    );
  }
}
