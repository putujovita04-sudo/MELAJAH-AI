import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import Logo from "./Logo";

export default function PageHeader({
  onBack,
  backLabel = "Kembali",
  muted,
  onToggleSound,
  right,
  compactLogo = false,
}) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary btn-sm shrink-0"
            aria-label={backLabel}
            title={backLabel}
          >
            <ArrowLeft size={20} strokeWidth={2.6} aria-hidden="true" />
            <span className="hidden sm:inline">{backLabel}</span>
          </button>
        )}
        <Logo compact={compactLogo} className="min-w-0" />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {right}
        {typeof muted === "boolean" && onToggleSound && (
          <button
            type="button"
            onClick={onToggleSound}
            className="btn btn-secondary btn-sm h-11 w-11 !px-0"
            aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
            aria-pressed={!muted}
            title={muted ? "Nyalakan suara" : "Matikan suara"}
          >
            {muted ? (
              <VolumeX size={19} strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <Volume2 size={19} strokeWidth={2.4} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
