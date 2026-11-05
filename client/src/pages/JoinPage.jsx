import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  KeyRound,
  Loader2,
  QrCode,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import Pawn from "../components/Pawn";
import { joinGameSession } from "../utils/sessionApi";
import { getLocalMode } from "../utils/runtime";

const sanitizeCode = (value) =>
  String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 5);

const sanitizeName = (value) => String(value ?? "").replace(/[<>{}]/g, "").slice(0, 14);

export default function JoinPage({ initialCode = "", onBack, onJoined, onHost }) {
  const [code, setCode] = useState(sanitizeCode(initialCode));
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const localMode = getLocalMode();

  useEffect(() => {
    setCode(sanitizeCode(initialCode));
  }, [initialCode]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (code.length < 5) {
      setError("Kode sesi terdiri dari 5 huruf/angka. Minta kode kepada penyelenggara.");
      return;
    }
    if (!name.trim()) {
      setError("Isi nama panggilan dulu, ya.");
      return;
    }

    setLoading(true);
    try {
      const result = await joinGameSession(code, name.trim());
      onJoined({
        code,
        playerId: result.playerId,
        playerToken: result.playerToken,
        state: result.state,
      });
    } catch (requestError) {
      setError(requestError.message || "Gagal bergabung. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh">
      <PageHeader onBack={onBack} backLabel="Peran" />

      <main id="main-content" className="mx-auto w-full max-w-5xl px-4 pb-12 pt-1 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">
            <QrCode size={14} strokeWidth={3} aria-hidden="true" /> Gabung permainan
          </span>
          <h1 className="h1-display mt-2 text-balance">Masukkan kode sesi</h1>
          <p className="lead mx-auto mt-2 text-[1rem]">
            Minta kode 5 huruf atau pindai QR dari penyelenggara. Setelah bergabung,
            kamu akan mendapat bidak dan menunggu giliran.
          </p>
          {localMode && (
            <p className="mx-auto mt-3 max-w-xl rounded border border-line bg-gold-soft px-3 py-2 text-[0.8rem] font-semibold leading-snug text-ink-2">
              <strong className="text-ink">Mode demo Vercel:</strong> buka tab pemain
              lewat tombol <em>“Buka tab pemain”</em> di layar penyelenggara, di
              browser yang sama.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_340px] md:items-start">
          <form onSubmit={submit} className="panel overflow-hidden shadow-float">
            <div className="poleng h-3" aria-hidden="true" />
            <div className="p-5 sm:p-6">
              <label htmlFor="session-code" className="label">
                Kode sesi
              </label>
              <div className="relative mt-1.5">
                <KeyRound
                  size={20}
                  strokeWidth={2.6}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3"
                  aria-hidden="true"
                />
                <input
                  id="session-code"
                  value={code}
                  onChange={(event) => setCode(sanitizeCode(event.target.value))}
                  maxLength={5}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="BALI7"
                  className="field !min-h-[64px] !pl-11 text-center font-display !text-[1.9rem] font-bold tracking-[0.3em]"
                  aria-describedby="code-help"
                  required
                />
              </div>
              <p id="code-help" className="mt-1 text-[0.76rem] font-semibold text-ink-3">
                Kode biasanya ditampilkan di layar penyelenggara.
              </p>

              <div className="mt-4">
                <label htmlFor="join-name" className="label">
                  Nama panggilan
                </label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="grid h-12 w-12 shrink-0 place-items-end overflow-hidden rounded-full border-2 border-ink bg-teal-soft">
                    <Pawn variant="female" color="#0B6B5D" className="h-[92%] w-auto translate-y-[8%]" />
                  </span>
                  <input
                    id="join-name"
                    value={name}
                    onChange={(event) => setName(sanitizeName(event.target.value))}
                    maxLength={14}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Contoh: Ayu"
                    className="field"
                    aria-describedby="name-help"
                    required
                  />
                </div>
                <p id="name-help" className="mt-1 text-[0.76rem] font-semibold text-ink-3">
                  Maksimal 14 huruf. Jangan tulis nama lengkap atau alamat.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-3 rounded border-2 border-accent bg-accent-soft p-2.5 text-[0.84rem] font-bold text-ink"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="mt-4 w-full"
                icon={loading ? Loader2 : ArrowRight}
                iconPosition="right"
                disabled={loading || code.length < 5 || !name.trim()}
              >
                {loading ? "Bergabung..." : "Gabung ke sesi"}
              </Button>

              <p className="mt-3 flex items-start gap-1.5 text-[0.78rem] font-semibold leading-snug text-ink-2">
                <ShieldCheck size={16} strokeWidth={2.8} className="mt-0.5 shrink-0 text-teal" aria-hidden="true" />
                Tidak ada akun dan tidak ada data pribadi. Nama hanya dipakai selama sesi.
              </p>
            </div>
            <div className="poleng h-3" aria-hidden="true" />
          </form>

          <aside className="space-y-3">
            <div className="panel-soft p-4">
              <span className="eyebrow">
                <ClipboardList size={13} strokeWidth={3} aria-hidden="true" /> Cara bergabung
              </span>
              <ol className="mt-2 space-y-2.5 text-[0.85rem] font-semibold leading-snug text-ink-2">
                <li className="flex gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink bg-gold font-display text-[0.75rem] font-bold text-ink">1</span>
                  Minta kode 5 huruf atau pindai QR dari penyelenggara.
                </li>
                <li className="flex gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink bg-gold font-display text-[0.75rem] font-bold text-ink">2</span>
                  Tulis nama panggilan. Kamu akan mendapat bidak berwarna.
                </li>
                <li className="flex gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink bg-gold font-display text-[0.75rem] font-bold text-ink">3</span>
                  Tunggu penyelenggara memulai dan memberi angka dadu.
                </li>
              </ol>
            </div>

            <div className="rounded border border-line bg-surface p-3 text-[0.8rem] leading-snug text-ink-2">
              <p className="flex items-center gap-1.5 font-display text-[0.95rem] font-bold text-ink">
                <UserRound size={15} strokeWidth={2.8} aria-hidden="true" /> Kamu penyelenggara?
              </p>
              <p className="mt-1">Buat sesi baru, lalu bagikan kode atau QR kepada pemain.</p>
              <button
                type="button"
                onClick={onHost}
                className="mt-2 inline-flex items-center gap-1 text-[0.82rem] font-bold text-accent underline underline-offset-2"
              >
                Buat sesi penyelenggara <ArrowRight size={14} strokeWidth={3} aria-hidden="true" />
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
