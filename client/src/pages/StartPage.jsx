import { ArrowRight, ClipboardPenLine, ShieldCheck, Sparkles, Users } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Logo from "../components/Logo";
import Pawn from "../components/Pawn";

export default function StartPage({ onBack, onPlayer, onHost, onHowTo }) {
  return (
    <div className="min-h-svh">
      <PageHeader onBack={onBack} backLabel="Beranda" />

      <main id="main-content" className="mx-auto w-full max-w-5xl px-4 pb-12 pt-2 sm:px-6 sm:pt-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">
            <Sparkles size={14} strokeWidth={3} aria-hidden="true" /> Selamat datang
          </span>
          <h1 className="h1-display mt-2 text-balance">Mau masuk sebagai siapa?</h1>
          <p className="lead mx-auto mt-3 text-[1.05rem]">
            Pemain bergabung dengan kode dari penyelenggara. Penyelenggara mengatur sesi,
            memberi angka dadu, dan menjadi juri — tanpa ikut menjadi pemain.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={onPlayer}
            className="group panel relative overflow-hidden p-5 text-left transition-transform hover:-translate-y-1 hover:shadow-sticker active:translate-y-0.5 sm:p-6"
          >
            <span
              className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-teal-soft"
              aria-hidden="true"
            />
            <div className="relative flex items-start justify-between gap-3">
              <span className="grid h-12 w-12 place-items-center rounded border-2 border-ink bg-teal text-surface">
                <Users size={25} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-gold transition group-hover:translate-x-1">
                <ArrowRight size={21} strokeWidth={3} aria-hidden="true" />
              </span>
            </div>

            <div className="relative mt-4 flex items-end gap-1">
              <Pawn variant="male" color="#C8401F" className="h-16 w-auto" />
              <Pawn variant="female" color="#0B6B5D" className="h-16 w-auto -translate-x-2" />
            </div>

            <h2 className="relative mt-2 font-display text-[1.85rem] font-bold leading-none">
              Pemain
            </h2>
            <p className="relative mt-1.5 text-[0.95rem] leading-relaxed text-ink-2">
              Aku mau bergabung ke sesi, berjalan di peta, dan menjawab soal budaya Bali.
            </p>
            <ul className="relative mt-3 space-y-1 text-[0.85rem] font-semibold text-ink-2">
              <li>• Gabung dengan kode atau QR dari penyelenggara</li>
              <li>• Bidak dengan warna berbeda, giliran bergantian</li>
              <li>• Menunggu angka dadu dari penyelenggara</li>
            </ul>
            <span className="relative mt-4 inline-flex items-center gap-1 font-display text-[1.05rem] font-bold text-teal">
              Gabung permainan <ArrowRight size={17} strokeWidth={3} aria-hidden="true" />
            </span>
          </button>

          <button
            type="button"
            onClick={onHost}
            className="group panel relative overflow-hidden p-5 text-left transition-transform hover:-translate-y-1 hover:shadow-sticker active:translate-y-0.5 sm:p-6"
          >
            <span
              className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gold-soft"
              aria-hidden="true"
            />
            <div className="relative flex items-start justify-between gap-3">
              <span className="grid h-12 w-12 place-items-center rounded border-2 border-ink bg-gold text-ink">
                <ClipboardPenLine size={25} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-gold transition group-hover:translate-x-1">
                <ArrowRight size={21} strokeWidth={3} aria-hidden="true" />
              </span>
            </div>

            <div className="relative mt-4 flex h-16 items-center gap-2">
              <span className="grid h-14 w-12 place-items-center rounded border-2 border-ink bg-surface shadow-sticker">
                <span className="font-display text-[1.6rem] font-bold text-accent">?</span>
              </span>
              <span className="grid h-14 w-12 place-items-center rounded border-2 border-ink bg-surface-2 shadow-sticker">
                <span className="font-display text-[1.6rem] font-bold text-teal">?</span>
              </span>
              <span className="grid h-14 w-12 place-items-center rounded border-2 border-ink bg-accent text-surface shadow-sticker">
                <Sparkles size={19} strokeWidth={2.6} aria-hidden="true" />
              </span>
            </div>

            <h2 className="relative mt-2 font-display text-[1.85rem] font-bold leading-none">
              Penyelenggara
            </h2>
            <p className="relative mt-1.5 text-[0.95rem] leading-relaxed text-ink-2">
              Aku mau membuat sesi, membagikan kode, dan mengendalikan jalannya permainan.
            </p>
            <ul className="relative mt-3 space-y-1 text-[0.85rem] font-semibold text-ink-2">
              <li>• Membuat sesi & membagikan kode/QR</li>
              <li>• Memberi angka dadu dan mengatur giliran</li>
              <li>• Menilai jawaban; tidak ikut menjadi pemain</li>
            </ul>
            <span className="relative mt-4 inline-flex items-center gap-1 font-display text-[1.05rem] font-bold text-accent">
              Buat sesi penyelenggara <ArrowRight size={17} strokeWidth={3} aria-hidden="true" />
            </span>
          </button>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded border border-line bg-surface/80 px-4 py-3 sm:flex-row">
          <p className="flex items-center gap-2 text-[0.82rem] font-semibold text-ink-2">
            <ShieldCheck size={18} strokeWidth={2.6} className="shrink-0 text-teal" aria-hidden="true" />
            Tidak perlu akun dan tidak ada data pribadi. Cukup nama panggilan.
          </p>          <button type="button" onClick={onHowTo} className="link-underline shrink-0 text-[0.85rem] font-bold">
            Baca cara bermain
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <Logo compact />
        </div>
      </main>
    </div>
  );
}
