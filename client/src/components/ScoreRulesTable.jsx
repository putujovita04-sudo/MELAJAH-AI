import { ArrowDown, ArrowUp, Equal } from "lucide-react";
import { SCORE_TABLE } from "../config/scoreRules";

const ICONS = {
  correct: ArrowUp,
  near: Equal,
  wrong: ArrowDown,
};

const STYLES = {
  correct: "bg-teal-soft",
  near: "bg-gold-soft",
  wrong: "bg-accent-soft",
};

export default function ScoreRulesTable({ compact = false }) {
  return (
    <div className="overflow-hidden rounded border-2 border-ink bg-surface">
      <table className="w-full border-collapse text-left text-[0.92rem]">
        <caption className="sr-only">Aturan skor dan akibatnya</caption>
        <thead>
          <tr className="border-b-2 border-ink bg-surface-2">
            <th scope="col" className="px-3 py-2 font-display text-[0.95rem]">Skor</th>
            <th scope="col" className="px-3 py-2 font-display text-[0.95rem]">Hasil</th>
            <th scope="col" className="px-3 py-2 font-display text-[0.95rem]">Akibat</th>
          </tr>
        </thead>
        <tbody>
          {SCORE_TABLE.map((rule) => {
            const Icon = ICONS[rule.id];
            return (
              <tr key={rule.id} className={`border-b border-line last:border-0 ${STYLES[rule.id]}`}>
                <td className="whitespace-nowrap px-3 py-2 font-display font-bold">
                  {rule.id === "wrong" ? "0–49" : `${rule.min}–${rule.max}`}
                </td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Icon size={15} strokeWidth={3} aria-hidden="true" />
                    {rule.label}
                  </span>
                </td>
                <td className="px-3 py-2 font-semibold text-ink-2">
                  {compact ? (
                    <span>
                      {rule.bonusSteps > 0 ? `Maju ${rule.bonusSteps} petak` : rule.bonusSteps < 0 ? "Mundur 1 petak" : "Tetap di tempat"}
                      {rule.id === "near" ? ", tangga aktif" : ""}
                      {rule.id === "wrong" ? ", ular aktif" : ""}
                    </span>
                  ) : (
                    <span>
                      {rule.bonusSteps > 0 && `Bonus maju ${rule.bonusSteps} petak. `}
                      {rule.bonusSteps < 0 && "Mundur 1 petak. "}
                      {rule.bonusSteps === 0 && "Tetap di tempat. "}
                      {rule.allowLadder && "Tangga aktif. "}
                      {rule.allowSnake && "Ular aktif. "}
                      {rule.id === "correct" && "Ular tidak berlaku."}
                      {rule.id === "near" && "Ular tidak berlaku."}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
