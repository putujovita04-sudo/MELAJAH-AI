const COLORS = ["#C8401F", "#0B6B5D", "#F4C24F", "#2B7C9E", "#3F7A3C"];

export default function Confetti({ count = 24 }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{
            left: `${(index * 37) % 100}%`,
            backgroundColor: COLORS[index % COLORS.length],
            animationDelay: `${(index % 8) * 0.28}s`,
            animationDuration: `${3 + (index % 5) * 0.35}s`,
            "--drift": `${((index % 7) - 3) * 24}px`,
            borderRadius: index % 3 === 0 ? "50%" : "3px",
          }}
        />
      ))}
    </div>
  );
}
