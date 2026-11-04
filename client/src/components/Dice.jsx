import { motion } from "framer-motion";

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export default function Dice({ value = null, rolling = false, size = "md", label }) {
  const pips = PIPS[value] ?? [];
  const dims = size === "sm" ? "h-14 w-14" : size === "lg" ? "h-24 w-24 sm:h-28 sm:w-28" : "h-20 w-20";
  const displayLabel = label ?? (value ? `Dadu menunjukkan angka ${value}` : "Dadu belum dilempar");

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className={`relative grid ${dims} shrink-0 grid-cols-3 grid-rows-3 gap-1 rounded border-2 border-ink bg-surface p-2.5 shadow-sticker`}
        animate={
          rolling
            ? {
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 0.94, 1.04, 0.97, 1],
                y: [0, -6, 0, -3, 0],
              }
            : { rotate: 0, scale: 1, y: 0 }
        }
        transition={
          rolling
            ? { duration: 0.62, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 420, damping: 18 }
        }
        role="img"
        aria-label={displayLabel}
      >
        {!value && !rolling && (
          <span className="col-span-3 row-span-3 grid place-items-center font-display text-[1.6rem] font-extrabold text-ink-3">
            ?
          </span>
        )}
        {Array.from({ length: 9 }).map((_, index) => (
          <span key={index} className="grid place-items-center">
            {pips.includes(index) && (
              <span
                className="block rounded-full bg-ink"
                style={{ width: "62%", aspectRatio: "1 / 1" }}
              />
            )}
          </span>
        ))}
      </motion.div>
      <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-ink-2">
        {rolling ? "Diputar..." : value ? `Dadu ${value}` : "Belum ada"}
      </span>
    </div>
  );
}
