import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUp,
  Check,
  Clock3,
  Dices,
  DoorOpen,
  KeyRound,
  Loader2,
  MapPin,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Avatar from "../components/Avatar";
import Board from "../components/Board";
import BoardLegend from "../components/BoardLegend";
import Dice from "../components/Dice";
import GameLog from "../components/GameLog";
import PlayerScoreCard from "../components/PlayerScoreCard";
import QuestionModal from "../components/QuestionModal";
import SessionResult from "../components/SessionResult";
import Button from "../components/Button";
import { useSessionPolling } from "../hooks/useSessionPolling";
import { useSound } from "../hooks/useSound";
import { answerQuestion } from "../utils/sessionApi";
import { cn } from "../utils/cn";

const phaseText = (state, me) => {
  const current = state.players.find((player) => player.id === state.currentPlayerId);
  if (!current) return "Menunggu pemain...";
  if (state.phase === "ready") {
    return me?.id === current.id
      ? "Giliranmu! Tunggu angka dadu dari penyelenggara."
      : `Menunggu giliran ${current.name}.`;
  }
  if (state.phase === "question") {
    return me?.id === current.id
      ? "Jawab soal budaya Bali yang muncul."
      : `${current.name} sedang menjawab soal.`;
  }
  if (state.phase === "judging") return `AI Juri menilai jawaban ${current.name}...`;
  if (state.phase === "verdict") return `Meninjau hasil ${current.name}...`;
  return "Menunggu penyelenggara.";
};

export default function PlayerGamePage({ session, onHome, onJoinAgain }) {
  const { code, playerId, playerToken } = session;
  const { state, setState, error, loading } = useSessionPolling({
    code,
    interval: 1000,
  });
  const [submitting, setSubmitting] = useState(false);
  const [diceRolling, setDiceRolling] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { muted, toggleMuted, play } = useSound();
  const lastMoveRef = useRef(null);
  const verdictRef = useRef(null);
  const finishedRef = useRef(false);

  const me = state?.players.find((player) => player.id === playerId) ?? null;
  const current = state?.players.find((player) => player.id === state?.currentPlayerId) ?? null;
  const isMyTurn = Boolean(
    me &&
      current?.id === me.id &&
      state?.phase !== "lobby" &&
      state?.phase !== "finished",
  );
  const showQuestion =
    isMyTurn &&
    ["question", "judging", "verdict"].includes(state?.phase) &&
    Boolean(state?.currentQuestion);

  useEffect(() => {
    if (!state?.lastMove || state.lastMove.id === lastMoveRef.current) return undefined;
    lastMoveRef.current = state.lastMove.id;
    let timer = null;
    if (state.lastMove.dice) {
      setDiceRolling(true);
      timer = setTimeout(() => setDiceRolling(false), 750);
      play("roll");
    }
    if (state.lastMove.effect?.type === "ladder") play("ladder");
    if (state.lastMove.effect?.type === "snake") play("snake");
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state?.lastMove, play]);

  useEffect(() => {
    if (!state?.verdict || state.verdict.at === verdictRef.current) return;
    verdictRef.current = state.verdict.at;
    const score = state.verdict.skor;
    play(score >= 80 ? "correct" : score >= 50 ? "near" : "wrong");
  }, [state?.verdict, play]);

  useEffect(() => {
    if (state?.phase === "finished" && !finishedRef.current) {
      finishedRef.current = true;
      play("win");
    }
  }, [state?.phase, play]);

  const submit = async (answer) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const data = await answerQuestion(code, {
        playerId,
        playerToken,
        answer,
      });
      setState(data.state);
    } catch (requestError) {
      setSubmitError(requestError.message || "Jawaban gagal dikirim. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !state) {
    return (
      <main id="main-content" className="grid min-h-svh place-items-center px-4">
        <div className="panel max-w-md p-6 text-center shadow-float">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-accent-soft">
            <AlertTriangle size={26} strokeWidth={2.6} aria-hidden="true" />
          </span>
          <h1 className="h3-display mt-3">Sesi tidak bisa dibuka</h1>
          <p className="mt-2 text-ink-2">{error.message}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="primary" onClick={onJoinAgain} icon={KeyRound}>Gabung sesi lain</Button>
            <Button variant="secondary" onClick={onHome}>Ke beranda</Button>
          </div>
        </div>
      </main>
    );
  }

  if (loading && !state) {
    return (
      <main id="main-content" className="grid min-h-svh place-items-center">
        <div className="flex items-center gap-3 font-display text-[1.2rem] font-bold">
          <Loader2 className="animate-spin" size={22} aria-hidden="true" /> Menyambung ke sesi...
        </div>
      </main>
    );
  }

  if (!state) return null;

  if (!me) {
    return (
      <main id="main-content" className="grid min-h-svh place-items-center px-4">
        <div className="panel max-w-md p-6 text-center shadow-float">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-gold-soft">
            <DoorOpen size={26} strokeWidth={2.6} aria-hidden="true" />
          </span>
          <h1 className="h3-display mt-3">Kamu tidak ada di sesi ini</h1>
          <p className="mt-2 text-ink-2">
            Mungkin penyelenggara menghapus pemain atau sesi sudah berganti. Minta kode baru.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="primary" onClick={onJoinAgain} icon={KeyRound}>Gabung sesi lain</Button>
            <Button variant="secondary" onClick={onHome}>Beranda</Button>
          </div>
        </div>
      </main>
    );
  }

  if (state.phase === "finished") {
    return (
      <SessionResult
        state={state}
        viewerId={playerId}
        onHome={onHome}
      />
    );
  }

  const isLobby = state.phase === "lobby";
  const status = phaseText(state, me);
  const lastDice = state.lastMove?.dice;
  const myRank = state.ranking.findIndex((player) => player.id === me.id) + 1;

  return (
    <div className="min-h-svh pb-8">
      <PageHeader
        onBack={onHome}
        backLabel="Keluar"
        muted={muted}
        onToggleSound={toggleMuted}
        compactLogo
        right={
          <span className="chip hidden border-ink/15 bg-gold-soft min-[380px]:inline-flex">
            <KeyRound size={13} strokeWidth={3} aria-hidden="true" /> {state.code}
          </span>
        }
      />

      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="eyebrow">
              <MapPin size={13} strokeWidth={3} aria-hidden="true" /> Sesi {state.code}
            </span>
            <h1 className="h3-display mt-1 text-[1.75rem] sm:text-[2.1rem]">
              {isLobby ? "Kamu sudah bergabung" : `Semangat, ${me.name}!`}
            </h1>
          </div>
          <span className={cn("chip", isMyTurn ? "border-accent bg-accent-soft" : "bg-surface")}>
            {isLobby ? "Menunggu mulai" : isMyTurn ? "Giliranmu" : "Menunggu giliran"}
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5 lg:hidden">
          <PlayerScoreCard player={me} active={isMyTurn} compact />
          <div className="rounded border-2 border-line bg-surface p-2">
            <p className="text-[0.6rem] font-extrabold uppercase tracking-wide text-ink-2">Peringkat</p>
            <p className="font-display text-[1.3rem] font-bold leading-none">{myRank} / {state.players.length}</p>
            <p className="mt-0.5 text-[0.68rem] font-semibold text-ink-2">{me.score} poin</p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <section className="order-1 lg:order-1" aria-label="Papan permainan">
            <div className="mx-auto w-full" style={{ maxWidth: "min(100%, 70svh)" }}>
              {!isLobby && (
                <div className="mb-2 flex min-h-[48px] items-center gap-2.5 rounded border-2 border-ink bg-surface px-3 py-2" role="status" aria-live="polite">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded border border-ink bg-gold-soft">
                    {isMyTurn ? <Sparkles size={15} strokeWidth={2.8} aria-hidden="true" /> : <Clock3 size={15} strokeWidth={2.8} aria-hidden="true" />}
                  </span>
                  <p className="text-[0.84rem] font-bold leading-snug">{status}</p>
                </div>
              )}
              <Board
                board={state.board}
                players={state.players}
                currentPlayerId={state.currentPlayerId}
                lastMove={state.lastMove}
              />
              <div className="mt-2">
                <BoardLegend />
              </div>
            </div>
          </section>

          <aside className="order-2 space-y-2.5 lg:order-2 lg:sticky lg:top-4">
            {isLobby ? (
              <>
                <section className="panel overflow-hidden shadow-float">
                  <div className="poleng h-2.5" aria-hidden="true" />
                  <div className="p-4 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-gold">
                      <Check size={28} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <h2 className="h3-display mt-2 text-[1.5rem]">Kamu sudah bergabung!</h2>
                    <p className="mt-1 text-[0.86rem] text-ink-2">
                      Tunggu penyelenggara memulai permainan. Kamu akan mendapat giliran
                      dan angka dadu dari penyelenggara.
                    </p>
                    <div className="mt-3 rounded border border-line bg-gold-soft p-2.5">
                      <p className="text-[0.62rem] font-extrabold uppercase tracking-wide text-ink-2">
                        Kode sesi
                      </p>
                      <p className="font-display text-[1.9rem] font-extrabold leading-none tracking-[0.2em]">
                        {state.code}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-2 text-[0.8rem] font-bold text-ink-2" aria-live="polite">
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      Menunggu penyelenggara memulai...
                    </div>
                  </div>
                  <div className="poleng h-2.5" aria-hidden="true" />
                </section>
                <section className="panel-soft p-3">
                  <h2 className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                    Pemain di sesi ({state.players.length}/{state.maxPlayers})
                  </h2>
                  <div className="mt-2 space-y-1.5">
                    {state.players.map((player) => (
                      <div key={player.id} className="flex items-center gap-2 rounded border border-line bg-surface p-2">
                        <Avatar player={player} size="sm" className="!h-8 !w-8" />
                        <span className="flex-1 truncate font-display text-[0.9rem] font-bold">{player.name}</span>
                        {player.id === me.id && <span className="chip !py-0 text-[0.6rem]">kamu</span>}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="panel overflow-hidden shadow-float">
                  <div className="flex items-center justify-between gap-2 border-b-2 border-ink bg-surface-2 px-3.5 py-2">
                    <span className="eyebrow !text-[0.64rem]">
                      <Dices size={13} strokeWidth={3} aria-hidden="true" /> Giliran sekarang
                    </span>
                    <span className={cn("chip !border-ink/10 !py-0 text-[0.62rem]", isMyTurn ? "bg-accent-soft" : "bg-surface")}>
                      {isMyTurn ? "Kamu" : current?.name ?? "-"}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar player={current ?? me} size="lg" showRing={isMyTurn} />
                      <div className="min-w-0">
                        <p className="truncate font-display text-[1.18rem] font-bold leading-none">
                          {current?.name ?? "-"}
                        </p>
                        <p className="mt-1 text-[0.78rem] font-semibold leading-snug text-ink-2">
                          {status}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-3 rounded border border-line bg-base/60 py-2.5">
                      <Dice value={lastDice ?? null} size="md" rolling={diceRolling} />
                      <div>
                        <p className="font-display text-[0.95rem] font-bold leading-tight">
                          {lastDice ? `Dadu terakhir: ${lastDice}` : "Belum ada dadu"}
                        </p>
                        <p className="mt-0.5 max-w-[10rem] text-[0.72rem] font-semibold leading-snug text-ink-2">
                          Angka dadu hanya diberikan oleh penyelenggara.
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-center gap-1.5 rounded border border-dashed border-line px-2 py-2 text-center text-[0.74rem] font-bold text-ink-2">
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      Menunggu penyelenggara...
                    </div>
                  </div>
                </section>

                <section className="panel-soft p-2.5" aria-labelledby="my-pawn-title">
                  <div className="mb-1.5 flex items-center justify-between px-0.5">
                    <h2 id="my-pawn-title" className="text-[0.64rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                      Bidakmu
                    </h2>
                    <span className="text-[0.64rem] font-bold text-ink-3">tanpa tombol dadu</span>
                  </div>
                  <PlayerScoreCard player={me} active={isMyTurn} />
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5 text-center text-[0.72rem] font-bold text-ink-2">
                    <span className="rounded bg-surface p-1">
                      <MapPin size={11} className="mx-auto" aria-hidden="true" /> Petak {me.position}
                    </span>
                    <span className="rounded bg-surface p-1">
                      <Star size={11} className="mx-auto" aria-hidden="true" /> {me.score} poin
                    </span>
                    <span className="rounded bg-surface p-1">
                      <Trophy size={11} className="mx-auto" aria-hidden="true" /> #{myRank}
                    </span>
                  </div>
                </section>

                <section className="panel-soft p-2.5" aria-label="Pemain lain">
                  <p className="mb-1.5 px-0.5 text-[0.64rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                    Semua pemain
                  </p>
                  <div className="space-y-1.5">
                    {state.ranking.map((player) => (
                      <PlayerScoreCard
                        key={player.id}
                        player={player}
                        active={player.id === state.currentPlayerId}
                      />
                    ))}
                  </div>
                </section>

                <GameLog log={state.log} />

                <div className="flex items-start gap-2 rounded border border-line bg-surface p-3 text-[0.76rem] leading-snug text-ink-2">
                  <ArrowUp size={16} strokeWidth={2.8} className="mt-0.5 shrink-0 text-teal" aria-hidden="true" />
                  <p>
                    Kamu tidak bisa melempar dadu atau mengubah posisi. Semua gerakan
                    diatur penyelenggara dan divalidasi server.
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>

        {!isLobby && state.players.length > 0 && (
          <p className="mt-3 text-center text-[0.74rem] font-semibold text-ink-3">
            Menunggu angka dadu dari penyelenggara · jangan tutup halaman ini
          </p>
        )}
      </main>

      {showQuestion && (
        <QuestionModal
          open
          question={state.currentQuestion}
          phase={state.phase}
          player={me}
          board={state.board}
          verdict={state.verdict}
          autoAdvanceAt={state.autoAdvanceAt}
          onSubmit={submit}
          submitting={submitting}
          submissionError={submitError}
        />
      )}
    </div>
  );
}
