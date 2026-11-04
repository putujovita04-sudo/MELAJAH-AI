import { cn } from "../utils/cn";

export default function Logo({ className = "", showTagline = false, compact = false }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid shrink-0 place-items-center rounded border-2 border-ink bg-gold",
          compact ? "h-10 w-10" : "h-12 w-12",
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className={compact ? "h-6 w-6" : "h-7 w-7"}>
          <path
            d="M5 27h22M8 27V14l8-7 8 7v13"
            fill="none"
            stroke="#2A1B12"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path d="M13 27v-7h6v7" fill="#C8401F" stroke="#2A1B12" strokeWidth="2" />
          <path d="M16 3v5M12 10h8" stroke="#2A1B12" strokeWidth="2" strokeLinecap="round" />
          <circle cx="25" cy="8" r="3.4" fill="#FFF6E6" stroke="#2A1B12" strokeWidth="1.8" />
        </svg>
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
            Belajar budaya Bali sambil bermain
          </span>
        )}
      </span>
    </div>
  );
}
