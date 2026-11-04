import { BookOpen, Flag, Landmark, MoveDown, MoveUp } from "lucide-react";

const Item = ({ children }) => (
  <span className="inline-flex items-center gap-1">{children}</span>
);

export default function BoardLegend({ compact = false }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.7rem] font-bold text-ink-2">
      <Item>
        <span className="grid h-4 w-4 place-items-center rounded border border-ink bg-accent text-surface">
          <BookOpen size={9} strokeWidth={3} aria-hidden="true" />
        </span>
        Soal
      </Item>
      <Item>
        <span className="grid h-4 w-4 place-items-center rounded border border-[#B97A0B] bg-gold-soft text-[#8A5A00]">
          <MoveUp size={9} strokeWidth={3.5} aria-hidden="true" />
        </span>
        Tangga
      </Item>
      <Item>
        <span className="grid h-4 w-4 place-items-center rounded border border-leaf bg-leaf-soft text-leaf">
          <MoveDown size={9} strokeWidth={3.5} aria-hidden="true" />
        </span>
        Ular
      </Item>
      <Item>
        <span className="grid h-4 w-4 place-items-center rounded border border-ink bg-teal text-surface">
          <Flag size={8} strokeWidth={3} aria-hidden="true" />
        </span>
        START
      </Item>
      <Item>
        <span className="grid h-4 w-4 place-items-center rounded border border-ink bg-gold text-ink">
          <Landmark size={8} strokeWidth={3} aria-hidden="true" />
        </span>
        FINISH
      </Item>
      {!compact && <span className="text-ink-3">10×10 · 100 petak · 15 tangga · 15 ular</span>}
    </div>
  );
}
