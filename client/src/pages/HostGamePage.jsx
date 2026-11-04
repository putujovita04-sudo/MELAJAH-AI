import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Clipboard,
  Dices,
  KeyRound,
  Loader2,
  LogOut,
  PencilLine,
  Play,
  Plus,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Avatar from "../components/Avatar";
import Dice from "../components/Dice";
import Board from "../components/Board";
import BoardLegend from "../components/BoardLegend";
import PlayerScoreCard from "../components/PlayerScoreCard";
import GameLog from "../components/GameLog";
import Modal from "../components/Modal";
import SessionResult from "../components/SessionResult";
import { useSessionPolling } from "../hooks/useSessionPolling";
import {
  buildJoinUrl,
  endGameSession,
  overrideSessionVerdict,
  removeSessionPlayer,
  reorderSessionPlayers,
  resolveSessionVerdict,
  sendDice,
  skipSessionQuestion,
  startGameSession,
} from "../utils/sessionApi";
import { cn } from "../utils/cn";

const TURN_LABEL = {
  lobby: "Menunggu pemain",
  ready: "Menunggu angka dadu",
  question: "Menunggu jawaban",
  judging: "AI menilai jawaban",
  verdict: "Meninjau hasil",
  finished: "Selesai",
};

function HostNotice({ game }) {
  const Icon = game.lastMove?.effect?.type === "ladder"
    ? ArrowUp
    : game.lastMove?.effect?.type === "snake"
      ? ArrowDown
      : Sparkles;
  return (
    <div className="flex min-h-[48px] items-start gap-2.5 rounded border-2 border-ink bg-surface px-3 py-2" role="status" aria-live="polite">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded border border-ink bg-gold-soft">
        <Icon size={15} strokeWidth={2.8} aria-hidden="true" />
      </span>
      <p className="text-[0.82rem] font-bold leading-snug">{game.notice}</p>
    </div>
  );
}

export default function HostGamePage({ session, onHome, onNewSession }) {
  const { code, hostToken } = session;
  const { state, setState, error, loading, refresh } = useSessionPolling({
    code,
    hostToken,
    interval: 1200,
  });
  const [busy, setBusy] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [actionError, setActionError] = useState("");
  const [endOpen, setEndOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualScore, setManualScore] = useState("");
  const [manualComment, setManualComment] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(null);

  const joinUrl = useMemo(() => (state ? buildJoinUrl(state.code) : ""), [state?.code]);

  useEffect(() => {
    if (state?.verdict) {
      setManualScore(String(state.verdict.skor));
      setManualComment(state.verdict.komentar ?? "");
    }
  }, [state?.verdict?.at]);

  useEffect(() => {
    if (!state?.autoAdvanceAt || state.phase !== "verdict") {
      setSecondsLeft(null);
      return undefined;
    }
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.ceil((state.autoAdvanceAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [state?.autoAdvanceAt, state?.phase]);

  const run = async (action, onSuccess) => {
    if (busy) return;
    setBusy(true);
    setActionError("");
    try {
      const data = await action();
      if (data?.state) setState(data.state);
      onSuccess?.(data);
    } catch (requestError) {
      setActionError(requestError.message || "Aksi gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const rollForPlayer = (value) => {
    if (busy || state?.phase !== "ready") return;
    setRolling(true);
    run(() => sendDice(code, hostToken, value));
    setTimeout(() => setRolling(false), 750);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(String(state?.code ?? code));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setActionError("Kode tidak bisa disalin otomatis. Tulis kode secara manual.");
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
            <Button variant="primary" onClick={onHome} icon={LogOut}>Ke beranda</Button>
            {onNewSession && <Button variant="secondary" onClick={onNewSession} icon={Plus}>Sesi baru</Button>}
          </div>
        </div>
      </main>
    );
  }

  if (loading && !state) {
    return (
      <main id="main-content" className="grid min-h-svh place-items-center">
        <div className="flex items-center gap-3 font-display text-[1.2rem] font-bold">
          <Loader2 className="animate-spin" size={22} aria-hidden="true" /> Membuka sesi...
        </div>
      </main>
    );
  }

  if (!state) return null;

  if (state.phase === "finished") {
    return (
      <SessionResult
        state={state}
        isHost
        onHome={onHome}
        onNewSession={onNewSession}
      />
    );
  }

  const current = state.players.find((player) => player.id === state.currentPlayerId) ?? null;
  const isLobby = state.phase === "lobby";
  const active = !isLobby;

  return (
    <div className={cn("min-h-svh", active ? "pb-10" : "pb-12")}>
      <PageHeader
        onBack={() => setEndOpen(true)}
        backLabel={isLobby ? "Keluar" : "Akhiri"}
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
              <ShieldCheck size={13} strokeWidth={3} aria-hidden="true" /> Meja penyelenggara
            </span>
            <h1 className="h3-display mt-1 text-[1.8rem] sm:text-[2.15rem]">
              {isLobby ? "Ajak pemain bergabung" : "Kendalikan permainan"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="chip">
              <Users size={13} strokeWidth={3} aria-hidden="true" /> {state.players.length}/{state.maxPlayers} pemain
            </span>
            <span className="chip bg-teal-soft">{TURN_LABEL[state.phase]}</span>
          </div>
        </div>

        {actionError && (
          <div role="alert" className="mt-3 flex items-start gap-2 rounded border-2 border-accent bg-accent-soft p-2.5 text-[0.82rem] font-bold">
            <AlertTriangle size={17} strokeWidth={2.8} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            {actionError}
          </div>
        )}

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <section className="order-2 lg:order-1" aria-label="Papan permainan">
            <div className="mx-auto w-full" style={{ maxWidth: "min(100%, 70svh)" }}>
              {active && <div className="mb-2"><HostNotice game={state} /></div>}
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

          <aside className="order-1 space-y-2.5 lg:order-2 lg:sticky lg:top-4">
            {isLobby ? (
              <>
                <section className="panel overflow-hidden shadow-float" aria-labelledby="join-title">
                  <div className="poleng h-2.5" aria-hidden="true" />
                  <div className="p-4">
                    <span className="eyebrow">
                      <QrCode size={13} strokeWidth={3} aria-hidden="true" /> Kode sesi
                    </span>
                    <h2 id="join-title" className="h4-display mt-1">Bagikan ke pemain</h2>

                    <div className="mt-3 rounded border-2 border-ink bg-gold-soft p-3 text-center">
                      <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-ink-2">
                        Kode sesi
                      </p>
                      <p className="font-display text-[2.35rem] font-extrabold leading-none tracking-[0.18em]">
                        {state.code}
                      </p>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="mt-1.5 inline-flex items-center gap-1 text-[0.76rem] font-bold text-ink-2 underline underline-offset-2"
                      >
                        {copied ? <Check size={13} strokeWidth={3} /> : <Clipboard size={13} strokeWidth={3} />}
                        {copied ? "Kode tersalin" : "Salin kode"}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-center rounded border border-line bg-surface p-2">
                      <QRCodeSVG
                        value={joinUrl}
                        size={168}
                        bgColor="#FFFDF8"
                        fgColor="#2A1B12"
                        level="M"
                        title={`QR untuk bergabung ke sesi ${state.code}`}
                      />
                    </div>
                    <p className="mt-1.5 break-all text-center text-[0.68rem] font-semibold text-ink-3">
                      {joinUrl}
                    </p>
                    <p className="mt-2 text-[0.78rem] leading-snug text-ink-2">
                      Pemain membuka tautan/QR, memasukkan nama panggilan, lalu menunggu
                      penyelenggara memulai.
                    </p>
                  </div>
                  <div className="poleng h-2.5" aria-hidden="true" />
                </section>

                <section className="panel-soft p-3" aria-labelledby="lobby-players-title">
                  <div className="flex items-center justify-between gap-2">
                    <h2 id="lobby-players-title" className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                      Pemain bergabung
                    </h2>
                    <span className="chip !py-0 text-[0.64rem]">
                      {state.players.length}/{state.maxPlayers}
                    </span>
                  </div>
                  {state.players.length === 0 ? (
                    <p className="mt-2 rounded border border-dashed border-line bg-surface p-3 text-center text-[0.8rem] font-semibold text-ink-2">
                      Belum ada pemain. Bagikan kode atau QR di atas.
                    </p>
                  ) : (
                    <ol className="mt-2 space-y-1.5">
                      {state.order.map((playerId, index) => {
                        const player = state.players.find((item) => item.id === playerId);
                        if (!player) return null;
                        return (
                          <li key={player.id} className="flex items-center gap-2 rounded border border-line bg-surface p-2">
                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-ink bg-gold font-display text-[0.65rem] font-bold">
                              {index + 1}
                            </span>
                            <Avatar player={player} size="sm" className="!h-8 !w-8" />
                            <span className="min-w-0 flex-1 truncate font-display text-[0.94rem] font-bold">
                              {player.name}
                            </span>
                            <div className="flex shrink-0 items-center gap-0.5">
                              <button
                                type="button"
                                className="grid h-8 w-8 place-items-center rounded border border-line bg-surface hover:border-ink disabled:opacity-30"
                                onClick={() => {
                                  if (index === 0 || busy) return;
                                  const order = [...state.order];
                                  [order[index - 1], order[index]] = [order[index], order[index - 1]];
                                  run(() => reorderSessionPlayers(code, hostToken, order));
                                }}
                                disabled={index === 0 || busy}
                                aria-label={`Naikkan giliran ${player.name}`}
                              >
                                <ArrowUp size={14} strokeWidth={3} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="grid h-8 w-8 place-items-center rounded border border-line bg-surface hover:border-ink disabled:opacity-30"
                                onClick={() => {
                                  if (index === state.order.length - 1 || busy) return;
                                  const order = [...state.order];
                                  [order[index + 1], order[index]] = [order[index], order[index + 1]];
                                  run(() => reorderSessionPlayers(code, hostToken, order));
                                }}
                                disabled={index === state.order.length - 1 || busy}
                                aria-label={`Turunkan giliran ${player.name}`}
                              >
                                <ArrowDown size={14} strokeWidth={3} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="grid h-8 w-8 place-items-center rounded border border-line bg-surface text-accent hover:border-accent disabled:opacity-30"
                                onClick={() => run(() => removeSessionPlayer(code, hostToken, player.id))}
                                disabled={busy}
                                aria-label={`Hapus ${player.name}`}
                              >
                                <UserMinus size={14} strokeWidth={3} aria-hidden="true" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                  <Button
                    variant="primary"
                    className="mt-3 w-full"
                    icon={busy ? Loader2 : Play}
                    disabled={busy || state.players.length < 2}
                    onClick={() => run(() => startGameSession(code, hostToken))}
                  >
                    {busy ? "Memproses..." : "Mulai permainan"}
                  </Button>
                  {state.players.length < 2 && (
                    <p className="mt-1.5 text-center text-[0.74rem] font-semibold text-ink-3">
                      Minimal 2 pemain untuk memulai.
                    </p>
                  )}
                  <p className="mt-2 text-center text-[0.72rem] font-semibold text-ink-3">
                    Urutan panah menentukan giliran pertama dan seterusnya.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section className="panel overflow-hidden shadow-float" aria-labelledby="dice-title">
                  <div className="flex items-center justify-between gap-2 border-b-2 border-ink bg-surface-2 px-3.5 py-2">
                    <span className="eyebrow !text-[0.64rem]">
                      <Dices size={13} strokeWidth={3} aria-hidden="true" /> Kontrol dadu
                    </span>
                    <span className="chip !border-ink/10 !py-0 text-[0.62rem]">
                      {state.phase === "ready" ? "Siap" : TURN_LABEL[state.phase]}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-center gap-3">
                      {current ? <Avatar player={current} size="lg" showRing /> : null}
                      <div className="min-w-0">
                        <p className="truncate font-display text-[1.25rem] font-bold leading-none">
                          {current?.name ?? "Menunggu pemain"}
                        </p>
                        <p className="mt-1 text-[0.78rem] font-semibold text-ink-2">
                          {current ? `Petak ${current.position} · ${current.score} poin` : "Belum ada giliran"}
                        </p>
                        <p className="mt-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-ink-3">
                          Giliran {state.currentIndex + 1} / {state.players.length}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-4 rounded border border-line bg-base/60 py-2.5">
                      <Dice value={state.lastMove?.dice ?? null} size="md" rolling={rolling} />
                      <div className="max-w-[9rem]">
                        <p className="font-display text-[0.98rem] font-bold leading-tight">
                          {state.phase === "ready" ? "Pilih angka untuk pemain" : "Dadu terkunci"}
                        </p>
                        <p className="mt-0.5 text-[0.72rem] font-semibold leading-snug text-ink-2">
                          Hanya penyelenggara yang boleh memberi angka.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-1.5" role="group" aria-label="Angka dadu manual">
                      {[1, 2, 3, 4, 5, 6].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => rollForPlayer(value)}
                          disabled={busy || state.phase !== "ready"}
                          className="min-h-11 rounded border-2 border-ink/25 bg-surface font-display text-[1.1rem] font-bold transition hover:border-ink hover:bg-gold-soft active:translate-y-0.5 disabled:opacity-40"
                          aria-label={`Beri angka dadu ${value}`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="teal"
                      className="mt-2 w-full"
                      icon={busy ? Loader2 : Dices}
                      disabled={busy || state.phase !== "ready"}
                      onClick={() => rollForPlayer(null)}
                    >
                      {busy ? "Memproses..." : "Acak dadu"}
                    </Button>
                    <p className="mt-2 text-center text-[0.72rem] font-semibold leading-snug text-ink-3">
                      Pemain menunggu angka darimu; mereka tidak punya tombol dadu.
                    </p>
                  </div>
                </section>

                {["question", "judging", "verdict"].includes(state.phase) && (
                  <QuestionPanel
                    state={state}
                    busy={busy}
                    secondsLeft={secondsLeft}
                    manualScore={manualScore}
                    setManualScore={setManualScore}
                    manualComment={manualComment}
                    setManualComment={setManualComment}
                    onSkip={() => run(() => skipSessionQuestion(code, hostToken))}
                    onOverride={() =>
                      run(() =>
                        overrideSessionVerdict(code, hostToken, {
                          score: Number(manualScore),
                          comment: manualComment,
                        }),
                      )
                    }
                    onResolve={() => run(() => resolveSessionVerdict(code, hostToken))}
                  />
                )}

                <section className="panel-soft p-2.5" aria-label="Skor pemain">
                  <div className="mb-1.5 flex items-center justify-between px-0.5">
                    <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                      Pemain
                    </p>
                    <span className="text-[0.64rem] font-bold text-ink-3">host tidak ikut bermain</span>
                  </div>
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

                <Button
                  variant="secondary"
                  className="w-full !text-[0.92rem]"
                  icon={RefreshCw}
                  onClick={refresh}
                >
                  Segarkan tampilan
                </Button>
              </>
            )}
          </aside>
        </div>

        {!isLobby && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.76rem] font-semibold text-ink-3">
            <span>Kode sesi <strong className="text-ink">{state.code}</strong> · pemain bergabung lewat kode/QR</span>
            <button type="button" onClick={() => setEndOpen(true)} className="inline-flex items-center gap-1 font-bold text-accent underline underline-offset-2">
              <LogOut size={14} strokeWidth={3} aria-hidden="true" /> Akhiri sesi
            </button>
          </div>
        )}
      </main>

      <Modal
        open={endOpen}
        onClose={() => setEndOpen(false)}
        labelledBy="host-end-title"
        panelClassName="max-w-md"
      >
        <div className="p-5 sm:p-6">
          <span className="eyebrow">
            <LogOut size={14} strokeWidth={3} aria-hidden="true" /> Keluar sesi
          </span>
          <h2 id="host-end-title" className="h3-display mt-2">
            {isLobby ? "Tinggalkan sesi?" : "Akhiri permainan?"}
          </h2>
          <p className="mt-2 text-ink-2">
            {isLobby
              ? "Sesi akan tetap ada sampai kedaluwarsa, tetapi kamu tidak bisa mengendalikannya lagi dari tab ini."
              : "Penyelenggara dapat mengakhiri kapan saja. Pemenang ditentukan dari posisi tertinggi saat ini."}
          </p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setEndOpen(false)}>Batal</Button>
            {!isLobby && (
              <Button
                variant="primary"
                icon={Trophy}
                disabled={busy}
                onClick={() => run(() => endGameSession(code, hostToken), () => setEndOpen(false))}
              >
                Akhiri & lihat hasil
              </Button>
            )}
            <Button
              variant="ghost"
              icon={LogOut}
              onClick={() => {
                if (isLobby) {
                  onHome();
                } else {
                  run(() => endGameSession(code, hostToken), onHome);
                }
              }}
            >
              {isLobby ? "Ke beranda" : "Akhiri & ke beranda"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function QuestionPanel({
  state,
  busy,
  secondsLeft,
  manualScore,
  setManualScore,
  manualComment,
  setManualComment,
  onSkip,
  onOverride,
  onResolve,
}) {
  const question = state.currentQuestion;
  if (!question) return null;
  return (
    <section className="panel overflow-hidden" aria-labelledby="host-question-title">
      <div className="flex items-center justify-between gap-2 border-b-2 border-ink bg-gold-soft px-3 py-2">
        <span className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
          {question.categoryLabel ?? "Soal"} · Petak {question.tile}
        </span>
        <span className="chip !border-ink/10 !py-0 text-[0.6rem]">
          {question.type === "pilihan" ? "Pilihan ganda" : "Jawaban singkat"}
        </span>
      </div>
      <div className="p-3.5">
        <h2 id="host-question-title" className="font-display text-[1.08rem] font-bold leading-snug">
          {question.question}
        </h2>

        {question.options?.length > 0 && (
          <ul className="mt-2 grid gap-1.5">
            {question.options.map((option, index) => (
              <li
                key={option}
                className={cn(
                  "flex items-start gap-2 rounded border px-2 py-1.5 text-[0.8rem] font-semibold",
                  option === question.answer
                    ? "border-teal bg-teal-soft"
                    : "border-line bg-surface",
                )}
              >
                <span className="font-display font-bold">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1">{option}</span>
                {option === question.answer && <Check size={14} strokeWidth={3} className="text-teal" aria-hidden="true" />}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-2 rounded border border-teal bg-teal-soft p-2 text-[0.8rem] font-semibold text-ink-2">
          <strong className="text-ink">Kunci untuk penyelenggara:</strong> {question.answer}
          {question.explanation && <span className="mt-0.5 block text-[0.74rem]">{question.explanation}</span>}
        </div>

        {state.currentAnswer && (
          <div className="mt-2 rounded border border-line bg-surface p-2">
            <p className="text-[0.62rem] font-extrabold uppercase tracking-wide text-ink-2">
              Jawaban pemain
            </p>
            <p className="mt-0.5 font-bold">{state.currentAnswer}</p>
          </div>
        )}

        {state.phase === "question" && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.78rem] font-semibold text-ink-2" aria-live="polite">
              Menunggu jawaban {state.currentPlayerName}...
            </p>
            <Button variant="secondary" size="sm" onClick={onSkip} disabled={busy} icon={X}>
              Lewati (nilai 0)
            </Button>
          </div>
        )}

        {state.phase === "judging" && (
          <div className="mt-3 flex items-center gap-2 rounded border border-dashed border-line bg-surface-2/50 p-2.5" aria-live="polite">
            <Loader2 size={18} strokeWidth={2.6} className="animate-spin" aria-hidden="true" />
            <p className="text-[0.82rem] font-bold">AI Juri sedang menilai jawaban {state.currentPlayerName}...</p>
          </div>
        )}

        {state.phase === "verdict" && state.verdict && (
          <div className="mt-3" aria-live="polite">
            <div className="flex items-center justify-between gap-2 rounded border-2 border-ink bg-surface-2/60 p-2.5">
              <div>
                <p className="text-[0.62rem] font-extrabold uppercase tracking-wide text-ink-2">
                  Skor AI untuk {state.verdict.playerName}
                </p>
                <p className="font-display text-[2rem] font-extrabold leading-none">
                  {state.verdict.skor}
                  <span className="text-[0.8rem] font-bold text-ink-2"> /100</span>
                </p>
              </div>
              <span className="chip !border-ink/15 bg-gold-soft text-[0.64rem]">
                {state.verdict.source === "ai" ? "AI Juri" : state.verdict.source === "manual" ? "Manual" : "Mode lokal"}
              </span>
            </div>
            <p className="mt-1.5 text-[0.82rem] font-semibold text-ink-2">{state.verdict.komentar}</p>
            <p className="mt-1 text-[0.78rem] font-semibold text-ink-2">
              Kunci: <strong className="text-ink">{state.verdict.kunci}</strong>
            </p>

            <div className="mt-2 rounded border border-line bg-surface p-2.5">
              <label htmlFor="manual-score" className="label !text-[0.68rem]">
                Nilai manual (jika perlu)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="manual-score"
                  type="number"
                  min="0"
                  max="100"
                  value={manualScore}
                  onChange={(event) => setManualScore(event.target.value)}
                  className="field !min-h-10 !w-24 !py-1 text-center font-display text-[1rem]"
                />
                <input
                  type="text"
                  value={manualComment}
                  onChange={(event) => setManualComment(event.target.value)}
                  maxLength={160}
                  placeholder="Komentar singkat..."
                  className="field !min-h-10 !py-1 text-[0.8rem]"
                  aria-label="Komentar nilai manual"
                />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Button variant="secondary" size="sm" icon={PencilLine} disabled={busy || manualScore === "" || Number.isNaN(Number(manualScore))} onClick={onOverride}>
                  Terapkan nilai
                </Button>
                <Button variant="teal" size="sm" icon={Check} disabled={busy} onClick={onResolve}>
                  Lanjut sekarang
                </Button>
              </div>
              <p className="mt-1.5 text-[0.7rem] font-semibold text-ink-3">
                {secondsLeft !== null
                  ? `Otomatis lanjut dalam ${secondsLeft} detik.`
                  : "Menunggu keputusan penyelenggara."}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
