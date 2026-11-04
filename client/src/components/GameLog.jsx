import { ScrollText } from "lucide-react";
import { cn } from "../utils/cn";

const TONES = {
  ink: "bg-ink-3",
  teal: "bg-teal",
  accent: "bg-accent",
  gold: "bg-gold",
};

export default function GameLog({ log }) {
  const items = log.slice(-4);
  return (
    <section className="panel-soft p-3" aria-label="Catatan perjalanan">
      <p className="flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
        <ScrollText size={13} strokeWidth={3} aria-hidden="true" /> Catatan perjalanan
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2 text-[0.78rem] leading-snug text-ink-2">
            <span
              className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", TONES[item.tone] ?? TONES.ink)}
              aria-hidden="true"
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
