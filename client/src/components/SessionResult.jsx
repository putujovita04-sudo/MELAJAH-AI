import {
  CheckCircle2,
  CircleDashed,
  Home,
  KeyRound,
  MapPin,
  Plus,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import PageHeader from "./PageHeader";
import Button from "./Button";
import Avatar from "./Avatar";
import Confetti from "./Confetti";
import { cn } from "../utils/cn";

const orderPlayers = (state) => {
  const players = state?.players ?? [];
  return [...players].sort(
    (a, b) =>
      b.position - a.position ||
      b.score - a.score ||
      a.name.localeCompare(b.name),
  );
};

const messageFor = (winner, viewer, isHost) => {
  if (isHost) {
    return `${winner?.name ?? "Pemain"} mencapai posisi tertinggi. Ajak siswa mendiskusikan jawaban yang belum tepat, lalu buat sesi baru.`;
  }
  if (viewer?.id === winner?.id) {
    return "Kamu menjadi juara sesi ini! Terus cintai dan pelajari budaya Bali, ya.";
  }
  return "Terima kasih sudah bermain dan menjawab dengan berani. Coba lagi di sesi berikutnya!";
};

export default function SessionResult({
  state,
  viewerId = null,
  isHost = false,
  onHome,
  onNewSession,
}) {
  const ranked = orderPlayers(state);
  const winner = state?.winner ?? ranked[0];
  const viewer = viewerId ? state.players.find((player) => player.id === viewerId) : null;
  const totalAnswered = state.players.reduce((sum, player) => sum + player.stats.answered, 0);
  const totalCorrect = state.players.reduce((sum, player) => sum + player.stats.correct, 0);

  return (
    <div className="relative min-h-svh overflow-hidden pb-12">
      <Confetti count={16} />
      <PageHeader onBack={onHome} backLabel="Beranda" />

      <main id="main-content" className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <section className="panel relative overflow-hidden shadow-float">
          <div className="poleng h-3" aria-hidden="true" />
          <div className="p-5 sm:p-8">
            <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto]">
              <div>
                <span className="eyebrow">
                  <Sparkles size={14} strokeWidth={3} aria-hidden="true" /> Permainan selesai
                </span>
                <h1 className="h2-display mt-2">
                  {isHost ? "Hasil sesi" : viewer?.id === winner?.id ? "Selamat, kamu juara!" : "Permainan selesai!"}
                </h1>
                <p className="lead mt-2 max-w-xl text-[1rem]">
                  <strong className="text-ink">{winner?.name}</strong> memimpin di petak{" "}
                  {winner?.position}. {messageFor(winner, viewer, isHost)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="chip border-ink/15 bg-gold-soft">
                    <Trophy size={13} strokeWidth={3} aria-hidden="true" /> Juara: {winner?.name ?? "-"}
                  </span>
                  <span className="chip">
                    <KeyRound size={13} strokeWidth={3} aria-hidden="true" /> Sesi {state.code}
                  </span>
                  <span className="chip">
                    {totalCorrect} jawaban benar dari {totalAnswered} soal
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded border-2 border-ink bg-gold-soft p-3 shadow-sticker sm:flex-col sm:gap-1.5 sm:px-6 sm:text-center">
                <Avatar player={winner} size="xl" showRing />
                <div>
                  <p className="font-display text-[2.4rem] font-extrabold leading-none">
                    {winner?.score ?? 0}
                  </p>
                  <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                    skor juara
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="poleng h-3" aria-hidden="true" />
        </section>

        <section className="mt-5" aria-labelledby="hasil-title">
          <h2 id="hasil-title" className="h3-display text-[1.55rem]">
            Peringkat & skor
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {ranked.map((player, index) => {
              const isChampion = player.id === winner?.id;
              const isViewer = player.id === viewerId;
              return (
                <article
                  key={player.id}
                  className={cn(
                    "rounded border-2 p-3.5",
                    isChampion
                      ? "border-ink bg-gold-soft shadow-sticker"
                      : isViewer
                        ? "border-teal bg-teal-soft"
                        : "border-line bg-surface",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar player={player} size="lg" showRing={isChampion} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="truncate font-display text-[1.2rem] font-bold leading-tight">
                          {player.name}
                        </h3>
                        {isChampion && (
                          <span className="chip !border-ink/15 !py-0 bg-surface text-[0.6rem]">
                            <Trophy size={10} strokeWidth={3} aria-hidden="true" /> Juara
                          </span>
                        )}
                        {isViewer && (
                          <span className="chip !border-ink/15 !py-0 bg-surface text-[0.6rem]">
                            Bidakmu
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[0.76rem] font-semibold text-ink-2">
                        Peringkat {index + 1} · <MapPin size={10} className="inline" aria-hidden="true" />{" "}
                        Petak {player.position}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[1.85rem] font-extrabold leading-none">{player.score}</p>
                      <p className="text-[0.58rem] font-extrabold uppercase tracking-wide text-ink-2">poin</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded bg-teal-soft px-1 py-1.5">
                      <CheckCircle2 size={15} strokeWidth={2.8} className="mx-auto text-teal" aria-hidden="true" />
                      <p className="font-display text-[1.1rem] font-bold leading-none">{player.stats.correct}</p>
                      <p className="text-[0.55rem] font-extrabold uppercase tracking-wide text-ink-2">Benar</p>
                    </div>
                    <div className="rounded bg-gold-soft px-1 py-1.5">
                      <CircleDashed size={15} strokeWidth={2.8} className="mx-auto text-[#B97A0B]" aria-hidden="true" />
                      <p className="font-display text-[1.1rem] font-bold leading-none">{player.stats.near}</p>
                      <p className="text-[0.55rem] font-extrabold uppercase tracking-wide text-ink-2">Hampir</p>
                    </div>
                    <div className="rounded bg-accent-soft px-1 py-1.5">
                      <XCircle size={15} strokeWidth={2.8} className="mx-auto text-accent" aria-hidden="true" />
                      <p className="font-display text-[1.1rem] font-bold leading-none">{player.stats.wrong}</p>
                      <p className="text-[0.55rem] font-extrabold uppercase tracking-wide text-ink-2">Belum</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded border-2 border-ink bg-teal p-4 text-surface sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="font-display text-[1.3rem] font-bold leading-tight">
                {isHost ? "Siap memandu sesi berikutnya?" : "Sampai jumpa di sesi berikutnya!"}
              </p>
              <p className="mt-1 text-[0.86rem] leading-relaxed text-surface/90">
                {isHost
                  ? "Buat sesi baru untuk papan, kode, dan urutan soal yang baru. Pemain akan bergabung dengan kode baru."
                  : "Penyelenggara dapat membuat sesi baru. Minta kode baru untuk bergabung lagi."}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              {isHost && (
                <Button variant="gold" icon={Plus} onClick={onNewSession}>
                  Sesi baru
                </Button>
              )}
              <Button variant="secondary" icon={Home} onClick={onHome} className="!bg-surface !text-ink">
                Beranda
              </Button>
            </div>
          </div>
        </section>

        <p className="mt-4 text-center text-[0.76rem] font-semibold text-ink-3">
          Tidak ada data pribadi yang disimpan. Sesi berakhir ketika halaman ditutup.
        </p>
      </main>
    </div>
  );
}
