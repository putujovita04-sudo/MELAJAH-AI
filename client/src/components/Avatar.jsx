import Pawn from "./Pawn";
import { cn } from "../utils/cn";

export default function Avatar({ player, size = "md", className = "", showRing = false }) {
  const sizes = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-end overflow-hidden rounded-full border-2",
        sizes[size] ?? sizes.md,
        showRing && "ring-4 ring-gold",
        className,
      )}
      style={{
        backgroundColor: player?.soft ?? "#FBE1D8",
        borderColor: player?.color ?? "#C8401F",
      }}
      aria-hidden="true"
    >
      <Pawn
        variant={player?.gender ?? "male"}
        color={player?.color ?? "#C8401F"}
        className="h-[92%] w-auto translate-y-[8%]"
      />
    </span>
  );
}
