import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  Cpu,
  Equal,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { CATEGORY_MAP } from "../utils/questions";
import { resolveBoardOutcome } from "../config/scoreRules";
import { cn } from "../utils/cn";

const CATEGORY_STYLE = {
  accent: "bg-accent-soft",
  gold: "bg-gold-soft",
  leaf: "bg-leaf-soft",
  sky: "bg-sky-soft",
  teal: "bg-teal-soft",
};

const OUTCOME_STYLE = {
  correct: {
    text: "text-teal",
    stroke: "#0B6B5D",
    bg: "bg-teal-soft",
    icon: ArrowUp,
    message: "Jawaban benar!",
  },
  near: {
    text: "text-ink",
    stroke: "#B97A0B",
    bg: "bg-gold-soft",
    icon: Equal,
    message: "Hampir benar!",
  },
  wrong: {
    text: "text-accent",
    stroke: "#C8401F",
    bg: "bg-accent-soft",
    icon: ArrowDown,
    message: "Belum tepat",
  },
};

function ScoreRing({ score, outcome }) {
  const style = OUTCOME_STYLE[outcome] ?? OUTCOME_STYLE.near;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="relative grid h-28 w-28 shrink-0 place-items-center">
      <svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#E8D4B4" strokeWidth="8" />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={style.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="relative text-center">
        <span className={cn("block font-display text-[2.2rem] font-extrabold leading-none", style.text)}>
          {score}
        </span>
        <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-ink-2">
          dari 100
        </span>
      </div>
    </div>
  );
}

function EvaluatingState({ isComputer, playerName }) {
  return (
    <div className="mt-5 rounded border-2 border-dashed border-line bg-surface-2/50 p-5" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-gold">
          <Loader2 size={22} strokeWidth={2.6} className="animate-spin" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-[1.15rem] font-bold leading-tight">
            {isComputer ? `${playerName} sedang menjawab...` : "AI Juri sedang menilai jawabanmu..."}
          </p>
          <p className="text-[0.88rem] text-ink-2">
            {isComputer
              ? "Komputer memilih jawaban. Tunggu sebentar, ya."
              : "Juri membaca makna jawaban, bukan hanya mencocokkan kata."}
          </p>
        </div>
      </div>
      {!isComputer && (
        <div className="mt-4 space-y-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-5/6 rounded" />
          <div className="skeleton h-3 w-2/3 rounded" />
        </div>
      )}
    </div>
  );
}

export default function QuestionModal({
  open,
  question,
  phase,
  player,
  board,
  verdict,
  onSubmit,
  autoAdvanceAt = null,
  submitting = false,
  submissionError = "",
}) {
  const [answer, setAnswer] = useState("");
  const [selected, setSelected] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (open) {
      setAnswer("");
      setSelected("");
    }
  }, [question?.id, open]);

  useEffect(() => {
    if (!autoAdvanceAt || phase !== "verdict") {
      setSecondsLeft(null);
      return undefined;
    }
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.ceil((autoAdvanceAt - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [autoAdvanceAt, phase]);

  const category = question
    ? CATEGORY_MAP[question.category] ?? {
        label: question.categoryLabel ?? "Materi sendiri",
        color: "teal",
      }
    : null;

  const isMcq = question?.type === "pilihan";
  const chosen = isMcq ? selected : answer;
  const isComputer = player?.isComputer;
  const judging = phase === "judging";
  const showVerdict = phase === "verdict" && verdict;

  const resolution = useMemo(() => {
    if (!verdict || !player) return null;
    return resolveBoardOutcome({
      score: verdict.skor,
      position: player.position,
      board,
    });
  }, [verdict, player, board]);

  if (!question) return null;

  const style = verdict ? OUTCOME_STYLE[verdict.outcome] ?? OUTCOME_STYLE.near : null;

  const consequences = [];
  if (resolution) {
    if (resolution.steps > 0) consequences.push(`Bonus maju ${resolution.steps} petak.`);
    if (resolution.steps < 0) consequences.push("Mundur 1 petak.");
    if (resolution.steps === 0) consequences.push("Tetap di petak ini.");
    if (resolution.ladder) consequences.push(`Tangga aktif: naik ke petak ${resolution.ladder.to}.`);
    if (resolution.snake) consequences.push(`Ular aktif: turun ke petak ${resolution.snake.to}.`);
    if (!resolution.ladder && !resolution.snake) {
      consequences.push(`Posisi akhir di petak ${resolution.finalPosition}.`);
    }
  }

  return (
    <Modal open={open} dismissible={false} labelledBy="question-title" panelClassName="max-w-2xl">
      <div className="poleng h-3" aria-hidden="true" />
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2 pr-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("chip border-ink/15", CATEGORY_STYLE[category?.color] ?? "bg-surface")}>
              <BookOpen size={13} strokeWidth={2.8} aria-hidden="true" />
              {category?.label}
            </span>
            <span className="chip">Petak {question.tile}</span>
            <span className="chip">{isMcq ? "Pilihan ganda" : "Jawaban singkat"}</span>
          </div>
        </div>

        <h2 id="question-title" className="h3-display mt-3 text-balance">
          {question.question}
        </h2>

        <AnimatePresence mode="wait" initial={false}>
          {showVerdict ? (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              aria-live="polite"
            >
              <div className="mt-5 flex items-center gap-4 rounded border-2 border-ink bg-surface-2/50 p-4">
                <ScoreRing score={verdict.skor} outcome={verdict.outcome} />
                <div className="min-w-0">
                  <span className={cn("chip border-ink/15", style.bg, style.text)}>
                    <style.icon size={14} strokeWidth={3} aria-hidden="true" />
                    {style.message}
                  </span>
                  <p className="mt-2 font-display text-[1.3rem] font-bold leading-snug">
                    {verdict.komentar}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[0.76rem] font-bold uppercase tracking-wide text-ink-2">
                    {verdict.source === "ai" ? (
                      <>
                        <Sparkles size={13} strokeWidth={3} aria-hidden="true" /> Dinilai AI Juri
                      </>
                    ) : verdict.source === "manual" ? (
                      <>
                        <Check size={13} strokeWidth={3} aria-hidden="true" /> Dinilai penyelenggara
                      </>
                    ) : verdict.source === "kunci" ? (
                      <>
                        <Check size={13} strokeWidth={3} aria-hidden="true" /> Dicek dari kunci jawaban
                      </>
                    ) : (
                      <>
                        <Cpu size={13} strokeWidth={3} aria-hidden="true" /> Mode lokal (kata kunci)
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded border border-line bg-surface p-3">
                  <p className="label">Jawaban yang dicari</p>
                  <p className="mt-0.5 font-display text-[1.15rem] font-bold">
                    {verdict.correctAnswer || verdict.kunci || question.answer}
                  </p>
                </div>
                <div className="rounded border border-line bg-gold-soft p-3">
                  <p className="label flex items-center gap-1.5">
                    <Lightbulb size={13} strokeWidth={3} aria-hidden="true" /> Akibatnya
                  </p>
                  <ul className="mt-1 space-y-0.5 text-[0.88rem] font-semibold leading-snug text-ink-2">
                    {consequences.map((item) => (
                      <li key={item} className="flex gap-1.5">
                        <Check size={14} strokeWidth={3} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-3 rounded border border-line bg-surface p-3 text-[0.92rem] leading-relaxed text-ink-2">
                <strong className="text-ink">Tahukah kamu? </strong>
                {verdict.explanation || verdict.penjelasan || question.explanation}
              </p>

              {verdict.source === "lokal" && (
                <p className="mt-2 text-[0.78rem] leading-snug text-ink-3">
                  Juri AI sedang tidak tersedia. Jawaban tetap dinilai dengan pencocokan kata
                  kunci agar permainan bisa lanjut.
                </p>
              )}

              <div className="mt-5 flex items-center justify-center gap-2 rounded border border-line bg-surface-2/60 px-3 py-2.5 text-center text-[0.84rem] font-bold text-ink-2">
                <Loader2 size={15} strokeWidth={2.6} className="animate-spin" aria-hidden="true" />
                {secondsLeft !== null
                  ? `Giliran berikutnya otomatis dalam ${secondsLeft} detik...`
                  : "Menunggu penyelenggara melanjutkan giliran..."}
              </div>
            </motion.div>
          ) : judging ? (
            <motion.div key="judging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mt-4 rounded border border-line bg-surface-2/60 p-3">
                <p className="label">Jawabanmu</p>
                <p className="mt-0.5 font-bold text-ink">{chosen || "(kosong)"}</p>
              </div>
              <EvaluatingState isComputer={isComputer} playerName={player?.name} />
            </motion.div>
          ) : (
            <motion.div key="answer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {isComputer ? (
                <EvaluatingState isComputer playerName={player?.name} />
              ) : (
                <>
                  {isMcq ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-label="Pilihan jawaban">
                      {question.options.map((option, index) => {
                        const active = selected === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSelected(option)}
                            aria-pressed={active}
                            className={cn(
                              "flex min-h-[56px] items-center gap-3 rounded border-2 px-3 py-2.5 text-left transition",
                              active
                                ? "border-accent bg-accent-soft shadow-[0_3px_0_var(--accent)]"
                                : "border-ink/25 bg-surface hover:border-ink hover:bg-surface-2",
                            )}
                          >
                            <span
                              className={cn(
                                "grid h-8 w-8 shrink-0 place-items-center rounded border-2 font-display text-[0.95rem] font-bold",
                                active ? "border-accent bg-accent text-surface" : "border-ink/30 bg-surface-2 text-ink",
                              )}
                              aria-hidden="true"
                            >
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="font-semibold leading-snug">{option}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <label htmlFor="essay-answer" className="label">
                        Tulis jawabanmu
                      </label>
                      <textarea
                        id="essay-answer"
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value.slice(0, 400))}
                        rows={4}
                        maxLength={400}
                        placeholder="Tulis jawabanmu dengan bahasa sendiri..."
                        className="field mt-1.5 resize-none font-semibold"
                      />
                      <div className="mt-1 flex items-center justify-between gap-2 text-[0.8rem] text-ink-3">
                        <span>Pakai bahasamu sendiri, tidak perlu panjang.</span>
                        <span>{answer.length}/400</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[0.82rem] font-semibold text-ink-2">
                      {player?.name}, giliranmu menjawab.
                    </p>
                    <Button
                      variant="primary"
                      icon={submitting ? Loader2 : Send}
                      iconPosition="right"
                      disabled={!chosen.trim() || submitting}
                      onClick={() => onSubmit(chosen)}
                    >
                      {submitting ? "Mengirim..." : "Kirim jawaban"}
                    </Button>
                  </div>
                  {submissionError && (
                    <p role="alert" className="mt-2 rounded border border-accent bg-accent-soft p-2 text-[0.8rem] font-bold text-ink">
                      {submissionError}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="poleng h-3" aria-hidden="true" />
    </Modal>
  );
}
