import { MapPin, Star } from "lucide-react";
import Avatar from "./Avatar";
import { cn } from "../utils/cn";

export default function PlayerScoreCard({ player, active = false, compact = false }) {
  return (
    <div
      className={cn(
        "rounded border-2 p-2.5 transition-colors",
        active ? "border-ink bg-gold-soft" : "border-line bg-surface",
        compact && "p-2",
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar
          player={player}
          size={compact ? "sm" : "md"}
          className={compact ? "!h-9 !w-9" : undefined}
          showRing={active}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className={cn("truncate font-display font-bold leading-tight", compact ? "text-[0.92rem]" : "text-[1rem]")}>
              {player.name}
            </p>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.72rem] font-bold text-ink-2">
            <span className="inline-flex items-center gap-0.5">
              <MapPin size={11} strokeWidth={3} aria-hidden="true" /> Petak {player.position}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Star size={11} strokeWidth={3} aria-hidden="true" /> {player.score}
            </span>
            {active && <span className="text-[0.62rem] uppercase tracking-wide text-ink">giliran</span>}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[0.62rem] font-extrabold uppercase tracking-wide text-ink-2">
          <span className="rounded bg-teal-soft px-1 py-0.5">✓ {player.stats.correct}</span>
          <span className="rounded bg-gold-soft px-1 py-0.5">≈ {player.stats.near}</span>
          <span className="rounded bg-accent-soft px-1 py-0.5">✕ {player.stats.wrong}</span>
        </div>
      )}
    </div>
  );
}
