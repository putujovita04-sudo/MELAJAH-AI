import {
  ArrowRight,
  BookOpen,
  Flame,
  Landmark,
  LayoutGrid,
  Music2,
  Play,
  Shirt,
  Sparkles,
  Upload,
  Utensils,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import Button from "../components/Button";
import BalineseScene from "../components/BalineseScene";
import { CATEGORIES } from "../utils/questions";

const CATEGORY_ICONS = {
  music: Music2,
  flame: Flame,
  utensils: Utensils,
  shirt: Shirt,
  landmark: Landmark,
};

const CATEGORY_STYLES = {
  accent: "bg-accent-soft",
  gold: "bg-gold-soft",
  leaf: "bg-leaf-soft",
  sky: "bg-sky-soft",
  teal: "bg-teal-soft",
};

const EXAMPLES = {
  "tari-musik": "Barong, Legong, Kecak, gamelan",
  upacara: "Galungan, Nyepi, Ngaben, Saraswati",
  makanan: "Lawar, babi guling, jaja Bali",
  pakaian: "Endek, udeng, kamen, ukiran",
  "bahasa-tempat": "Aksara, sapaan, pura, Tanah Lot",
};

export default function LandingPage({ onStart, onHost, onHowTo }) {
  return (
    <div className="min-h-svh">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Logo showTagline compact className="min-w-0" />
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onHowTo} className="btn btn-ghost hidden sm:inline-flex">
            Cara bermain
          </button>
          <Button variant="primary" size="sm" icon={Play} onClick={onStart}>
            Mulai
          </Button>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section className="grid items-center gap-8 pb-10 pt-3 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:pb-16 lg:pt-7">
          <div>
            <span className="inline-flex items-center gap-2 rounded border-2 border-ink bg-gold px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.13em] shadow-sticker">
              <Sparkles size={14} strokeWidth={3} aria-hidden="true" />
              Game edukasi budaya Bali
            </span>

            <h1 className="h1-display mt-4 text-balance">
              Serunya{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-accent">berpetualang</span>
                <svg
                  viewBox="0 0 320 18"
                  className="absolute -bottom-1.5 left-0 h-3 w-full text-gold"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M4 12c58-8 126-9 312-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              mengenal budaya Bali
            </h1>

            <p className="lead mt-5">
              Bergabung dengan kode, jalan di peta 10×10, dan jawab soal tentang tari,
              upacara, makanan, pakaian, serta tempat khas Bali. Juri AI akan memberi
              nilai ramah untuk setiap jawabanmu.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button variant="primary" icon={Play} onClick={onStart} className="text-[1.28rem]">
                Mulai bermain
              </Button>
              <Button variant="secondary" icon={BookOpen} onClick={onHowTo}>
                Cara bermain
              </Button>
            </div>

            <dl className="mt-7 grid max-w-md grid-cols-3 gap-3 border-t-2 border-dashed border-line pt-4">
              <div>
                <dt className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                  Soal
                </dt>
                <dd className="font-display text-[1.55rem] font-bold leading-none">40+</dd>
              </div>
              <div>
                <dt className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                  Kategori
                </dt>
                <dd className="font-display text-[1.55rem] font-bold leading-none">5</dd>
              </div>
              <div>
                <dt className="text-[0.66rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                  Juri
                </dt>
                <dd className="font-display text-[1.55rem] font-bold leading-none">AI</dd>
              </div>
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -left-2 top-10 z-20 hidden rotate-[-8deg] rounded border-2 border-ink bg-surface px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide shadow-sticker sm:block">
              15 tangga · 15 ular
            </div>
            <div className="absolute -right-2 top-4 z-20 rotate-6 rounded border-2 border-ink bg-teal px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-surface shadow-sticker">
              AI Juri ramah
            </div>
            <motion.div
              initial={{ opacity: 0, y: 18, rotate: 1.5 }}
              animate={{ opacity: 1, y: 0, rotate: -1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="panel relative overflow-hidden bg-surface p-2.5 shadow-float sm:p-3.5"
            >
              <div className="flex items-center justify-between gap-2 px-1 pb-2">
                <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-ink-2">
                  <LayoutGrid size={13} strokeWidth={3} aria-hidden="true" /> Peta petualangan
                </span>
                <span className="chip !border-ink/15 bg-gold-soft !text-[0.62rem]">10 × 10 · 100 petak</span>
              </div>
              <BalineseScene />
            </motion.div>
            <div className="absolute -bottom-3 left-6 z-20 -rotate-3 rounded border-2 border-ink bg-surface px-3 py-1.5 text-[0.72rem] font-extrabold shadow-sticker">
              Ayo main bersama!
            </div>
          </div>
        </section>

        <section aria-labelledby="kategori-title" className="border-t-2 border-dashed border-line py-9">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <span className="eyebrow">
                <Landmark size={14} strokeWidth={3} aria-hidden="true" /> Lima pintu budaya
              </span>
              <h2 id="kategori-title" className="h2-display mt-1 text-[2rem] sm:text-[2.4rem]">
                Yang akan kamu temukan
              </h2>
            </div>
            <p className="max-w-sm text-[0.9rem] font-semibold text-ink-2">
              Soal diacak setiap permainan, jadi tidak selalu muncul pertanyaan yang sama.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-5">
            {CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category.icon] ?? Landmark;
              return (
                <div
                  key={category.id}
                  className={`rounded border-2 border-ink/15 p-3 ${CATEGORY_STYLES[category.color]}`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded border-2 border-ink bg-surface">
                    <Icon size={18} strokeWidth={2.6} aria-hidden="true" />
                  </span>
                  <h3 className="mt-2 font-display text-[1.02rem] font-bold leading-tight">
                    {category.label}
                  </h3>
                  <p className="mt-1 text-[0.74rem] font-semibold leading-snug text-ink-2">
                    {EXAMPLES[category.id]}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10 overflow-hidden rounded border-2 border-ink bg-teal text-surface shadow-float">
          <div className="relative p-5 sm:p-7">
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[10px] border-surface/10" aria-hidden="true" />
            <div className="absolute -bottom-12 right-16 h-28 w-28 rounded-full border-[8px] border-gold/20" aria-hidden="true" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded bg-surface/15 px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.12em]">
                  <Users size={13} strokeWidth={3} aria-hidden="true" /> Untuk guru & penyelenggara
                </span>
                <h2 className="mt-2 font-display text-[1.75rem] font-bold leading-tight sm:text-[2rem]">
                  Bikin soal dari materi pelajaranmu sendiri
                </h2>
                <p className="mt-1.5 max-w-lg text-[0.94rem] leading-relaxed text-surface/90">
                  Unggah catatan atau ringkasan materi, lalu biarkan MELAJAH AI menyusun
                  soal budaya dan pengetahuan umum untuk dimainkan bersama siswa.
                </p>
              </div>
              <Button variant="gold" icon={Upload} onClick={onHost} className="shrink-0">
                Coba penyelenggara
              </Button>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-start justify-between gap-3 border-t-2 border-line py-6 text-[0.78rem] font-semibold text-ink-2 sm:flex-row sm:items-center">
          <Logo compact />
          <p className="max-w-md text-pretty">
            Dibuat untuk belajar budaya Bali dengan gembira. Tanpa akun dan tanpa data
            pribadi — cukup nama panggilan.
          </p>
          <button type="button" onClick={onHowTo} className="link-underline font-bold text-ink">
            Cara bermain
          </button>
        </footer>
      </main>
    </div>
  );
}
