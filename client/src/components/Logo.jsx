import { cn } from "../utils/cn";

export default function Logo({ className = "", showTagline = false, compact = false }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded border-2 border-ink bg-[#FBF8F0]",
          compact ? "h-11 w-11" : "h-14 w-14",
        )}
        aria-hidden="true"
      >
        <img
          src="/brand/logo-mark.jpg"
          alt=""
          className="h-full w-full scale-[1.04] object-cover"
          draggable="false"
        />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "flex items-baseline gap-1.5 font-display font-extrabold tracking-tight text-ink",
            compact ? "text-[1.15rem] sm:text-[1.35rem]" : "text-[1.55rem] sm:text-[1.7rem]",
          )}
        >
          MELAJAH
          <span
            className={cn(
              "inline-grid place-items-center rounded border-2 border-ink bg-accent font-display font-bold leading-none text-surface",
              compact ? "h-5 px-1.5 text-[0.58rem] sm:text-[0.6rem]" : "h-6 px-2 text-[0.7rem]",
            )}
          >
            AI
          </span>
        </span>
        {showTagline && (
          <span className="mt-1 hidden text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-2 sm:block">
            Menjawab budaya. Menciptakan masa depan.
          </span>
        )}
      </span>
    </div>
  );
}
