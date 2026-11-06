import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Check,
  ClipboardList,
  CloudUpload,
  FileText,
  Flame,
  Landmark,
  Loader2,
  Music2,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Sparkles,
  Trash2,
  Users,
  Utensils,
  WandSparkles,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import { CATEGORIES, ALL_QUESTIONS } from "../utils/questions";
import { generateMaterialQuestions, getServerHealth } from "../utils/api";
import { createGameSession } from "../utils/sessionApi";
import { cn } from "../utils/cn";

const ICONS = {
  music: Music2,
  flame: Flame,
  utensils: Utensils,
  shirt: Shirt,
  landmark: Landmark,
};

const STYLES = {
  accent: "bg-accent-soft",
  gold: "bg-gold-soft",
  leaf: "bg-leaf-soft",
  sky: "bg-sky-soft",
  teal: "bg-teal-soft",
};

const ACCEPTED = [".txt", ".md", ".csv", ".json", ".pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function HostPage({ onBack, onSessionCreated }) {
  const [sourceType, setSourceType] = useState("bank");
  const [selectedCategories, setSelectedCategories] = useState(CATEGORIES.map((item) => item.id));
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(null);
  const [health, setHealth] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let active = true;
    getServerHealth().then((data) => {
      if (active) setHealth(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const bankQuestions = useMemo(
    () => ALL_QUESTIONS.filter((question) => selectedCategories.includes(question.category)),
    [selectedCategories],
  );

  const readyCount = sourceType === "bank" ? bankQuestions.length : generated?.questions.length ?? 0;
  const canContinue = sourceType === "bank" ? selectedCategories.length > 0 : Boolean(generated);
  const aiActive = Boolean(health?.ok && health?.aiEnabled);
  const localMode = Boolean(health?.localMode);

  useEffect(() => {
    if (localMode && sourceType === "material") {
      setSourceType("bank");
      setError("Mode demo Vercel hanya mendukung bank soal.");
    }
  }, [localMode, sourceType]);

  const toggleCategory = (id) => {
    setSelectedCategories((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const acceptFile = (candidate) => {
    setError("");
    setGenerated(null);
    if (!candidate) return;
    const extension = candidate.name.slice(candidate.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED.includes(extension)) {
      setError("Format file belum didukung. Gunakan .txt, .md, .csv, .json, atau .pdf.");
      return;
    }
    if (candidate.size > MAX_BYTES) {
      setError("Ukuran file terlalu besar. Maksimal 5 MB.");
      return;
    }
    setFile(candidate);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer?.files?.[0];
    acceptFile(dropped);
  };

  const buildQuestions = async () => {
    if (!file) {
      setError("Pilih file materi terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");
    setGenerated(null);
    try {
      const result = await generateMaterialQuestions(file);
      setGenerated(result);
    } catch (requestError) {
      setError(requestError.message || "Gagal membuat soal. Coba lagi, ya.");
    } finally {
      setLoading(false);
    }
  };

  const resetMaterial = () => {
    setFile(null);
    setGenerated(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const continueToSetup = async () => {
    if (!canContinue || creating) return;
    setCreating(true);
    setError("");
    try {
      const payload =
        sourceType === "bank"
          ? { maxPlayers, categories: selectedCategories, difficulty: "sedang" }
          : { maxPlayers, materialId: generated.materialId };
      const result = await createGameSession(payload);
      onSessionCreated(result);
    } catch (requestError) {
      setError(requestError.message || "Gagal membuat sesi. Coba lagi.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-svh">
      <PageHeader onBack={onBack} backLabel="Peran" />

      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 pb-12 pt-1 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <span className="eyebrow">
              <ClipboardList size={14} strokeWidth={3} aria-hidden="true" /> Meja penyelenggara
            </span>
            <h1 className="h2-display mt-2">Siapkan soal, lalu main bersama</h1>
            <p className="lead mt-2 text-[1rem]">
              {localMode
                ? "Pilih bank soal. Setelah sesi demo dibuat, tambahkan pemain langsung di layar penyelenggara."
                : "Pilih bank soal budaya Bali atau buat soal baru dari materi pelajaranmu. Setelah sesi dibuat, bagikan kode atau QR kepada pemain."}
            </p>
            {localMode && (
              <div className="mt-3 rounded border-2 border-ink bg-gold-soft p-3 text-[0.84rem] font-semibold leading-snug text-ink-2">
                <strong className="text-ink">Mode demo Vercel.</strong> Backend tidak
                terdeteksi, jadi sesi berjalan lokal di browser ini. Kamu bisa
                menambahkan pemain demo langsung dari layar penyelenggara. Untuk
                permainan multi-perangkat, aktifkan backend (Vercel + Upstash Redis).
              </div>
            )}
            {!localMode && health && health.serverless && health.sharedStore === false && (
              <div className="mt-3 rounded border-2 border-accent bg-accent-soft p-3 text-[0.84rem] font-semibold leading-snug text-ink-2">
                <strong className="text-ink">Room lintas perangkat belum aktif.</strong>{" "}
                Hubungkan Upstash Redis ke project Vercel (env{" "}
                <code>UPSTASH_REDIS_REST_URL</code> dan{" "}
                <code>UPSTASH_REDIS_REST_TOKEN</code>), lalu redeploy. Tanpa itu,
                pemain di HP tidak bisa masuk dengan kode room.
              </div>
            )}
          </div>
          <span
            className={cn(
              "chip mt-1 border-ink/15",
              aiActive ? "bg-teal-soft" : "bg-gold-soft",
            )}
            title={
              aiActive
                ? "API AI terhubung. Soal materi akan dibuat dan dinilai oleh AI."
                : "API AI belum dikonfigurasi. Soal materi dibuat dan dinilai dengan mode lokal."
            }
          >
            <span
              className={cn("h-2 w-2 rounded-full", aiActive ? "bg-teal" : "bg-[#B97A0B]")}
              aria-hidden="true"
            />
            {aiActive ? "AI Juri aktif" : localMode ? "Mode demo lokal" : "Mode lokal aktif"}
          </span>
        </div>

        <ol className="mt-5 flex flex-wrap items-center gap-1.5 text-[0.74rem] font-extrabold uppercase tracking-wide">
          <li className="flex items-center gap-1.5 rounded border-2 border-ink bg-gold px-2.5 py-1">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[0.64rem] text-surface">1</span>
            Sumber soal
          </li>
          <li className="hidden h-0.5 w-5 bg-line sm:block" aria-hidden="true" />
          <li className="flex items-center gap-1.5 rounded border border-line bg-surface px-2.5 py-1 text-ink-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-surface-2 text-[0.64rem]">2</span>
            {localMode ? "Tambah pemain" : "Bagikan kode"}
          </li>
          <li className="hidden h-0.5 w-5 bg-line sm:block" aria-hidden="true" />
          <li className="flex items-center gap-1.5 rounded border border-line bg-surface px-2.5 py-1 text-ink-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-surface-2 text-[0.64rem]">3</span>
            Bermain
          </li>
        </ol>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-start">
          <div className="space-y-4">
            <section className="panel p-4 sm:p-5" aria-labelledby="sumber-title">
              <h2 id="sumber-title" className="h4-display">Pilih sumber soal</h2>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSourceType("bank")}
                  aria-pressed={sourceType === "bank"}
                  className={cn(
                    "rounded border-2 p-3 text-left transition",
                    sourceType === "bank"
                      ? "border-ink bg-gold-soft shadow-[0_3px_0_var(--ink)]"
                      : "border-line bg-surface hover:border-ink/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded border-2 border-ink bg-surface">
                      <BookOpenCheck size={20} strokeWidth={2.6} aria-hidden="true" />
                    </span>
                    {sourceType === "bank" && (
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-teal text-surface">
                        <Check size={14} strokeWidth={3.5} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-display text-[1.12rem] font-bold leading-tight">
                    Bank soal budaya Bali
                  </p>
                  <p className="mt-0.5 text-[0.8rem] font-semibold leading-snug text-ink-2">
                    40 soal siap pakai dalam 5 kategori. Diacak setiap permainan.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!localMode) setSourceType("material");
                  }}
                  aria-pressed={sourceType === "material"}
                  disabled={localMode}
                  className={cn(
                    "rounded border-2 p-3 text-left transition",
                    localMode && "cursor-not-allowed opacity-50",
                    sourceType === "material"
                      ? "border-ink bg-teal-soft shadow-[0_3px_0_var(--ink)]"
                      : "border-line bg-surface hover:border-ink/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded border-2 border-ink bg-surface">
                      <CloudUpload size={20} strokeWidth={2.6} aria-hidden="true" />
                    </span>
                    {sourceType === "material" && (
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-teal text-surface">
                        <Check size={14} strokeWidth={3.5} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-display text-[1.12rem] font-bold leading-tight">
                    Materi sendiri
                  </p>
                  <p className="mt-0.5 text-[0.8rem] font-semibold leading-snug text-ink-2">
                    {localMode
                      ? "Butuh backend Node. Di demo Vercel, gunakan bank soal."
                      : "Unggah catatan atau ringkasan, lalu buat soal dari isinya."}
                  </p>
                </button>
              </div>

              {sourceType === "bank" ? (
                <div className="mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="label !inline">Pilih kategori</p>
                    <span className="chip">
                      {selectedCategories.length}/{CATEGORIES.length} kategori · {bankQuestions.length} soal
                    </span>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {CATEGORIES.map((category) => {
                      const Icon = ICONS[category.icon] ?? Landmark;
                      const selected = selectedCategories.includes(category.id);
                      const count = ALL_QUESTIONS.filter(
                        (question) => question.category === category.id,
                      ).length;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          aria-pressed={selected}
                          className={cn(
                            "flex items-center gap-2.5 rounded border-2 px-2.5 py-2 text-left transition",
                            selected
                              ? "border-ink bg-surface shadow-[0_2px_0_var(--line)]"
                              : "border-line bg-surface/50 opacity-65 hover:opacity-100",
                          )}
                        >
                          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded border border-ink/20", STYLES[category.color])}>
                            <Icon size={16} strokeWidth={2.6} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-[0.95rem] font-bold leading-tight">
                              {category.label}
                            </span>
                            <span className="text-[0.7rem] font-semibold text-ink-2">{count} soal</span>
                          </span>
                          <span
                            className={cn(
                              "grid h-5 w-5 shrink-0 place-items-center rounded border-2",
                              selected ? "border-ink bg-teal text-surface" : "border-line bg-surface",
                            )}
                            aria-hidden="true"
                          >
                            {selected && <Check size={12} strokeWidth={4} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedCategories.length === 0 && (
                    <p className="mt-2 text-[0.8rem] font-bold text-accent">
                      Pilih minimal satu kategori untuk melanjutkan.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "rounded border-2 border-dashed p-4 text-center transition",
                      dragging ? "border-accent bg-accent-soft" : "border-line bg-surface-2/40",
                    )}
                  >
                    <CloudUpload size={30} strokeWidth={2.2} className="mx-auto text-ink-2" aria-hidden="true" />
                    <p className="mt-2 font-display text-[1.05rem] font-bold">
                      Tarik file ke sini atau pilih dari perangkat
                    </p>
                    <p className="mt-0.5 text-[0.78rem] font-semibold text-ink-2">
                      .txt, .md, .csv, .json, atau .pdf · maksimal 5 MB
                    </p>
                    <input
                      ref={inputRef}
                      id="material-file"
                      type="file"
                      accept={ACCEPTED.join(",")}
                      className="sr-only"
                      onChange={(event) => acceptFile(event.target.files?.[0])}
                    />
                    <label htmlFor="material-file" className="btn btn-secondary btn-sm mt-3 cursor-pointer">
                      <FileText size={17} strokeWidth={2.6} aria-hidden="true" />
                      Pilih file materi
                    </label>
                  </div>

                  {file && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 rounded border border-line bg-surface p-2.5">
                      <FileText size={18} strokeWidth={2.4} className="shrink-0 text-teal" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.86rem] font-bold">{file.name}</p>
                        <p className="text-[0.72rem] font-semibold text-ink-2">{formatSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={resetMaterial}
                        className="btn btn-ghost btn-sm !min-h-9 !px-2"
                        aria-label="Hapus file"
                      >
                        <Trash2 size={16} strokeWidth={2.6} aria-hidden="true" />
                      </button>
                      <Button
                        variant="teal"
                        size="sm"
                        icon={loading ? Loader2 : WandSparkles}
                        onClick={buildQuestions}
                        disabled={loading}
                      >
                        {loading ? "Menyusun soal..." : generated ? "Buat ulang soal" : "Buat soal"}
                      </Button>
                    </div>
                  )}

                  {loading && (
                    <div className="mt-3 rounded border border-line bg-surface-2/50 p-3" aria-live="polite">
                      <div className="flex items-center gap-2">
                        <Loader2 size={18} strokeWidth={2.6} className="animate-spin" aria-hidden="true" />
                        <p className="font-display text-[1rem] font-bold">Membaca materi dan menyusun soal...</p>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="skeleton h-3 w-full rounded" />
                        <div className="skeleton h-3 w-4/5 rounded" />
                        <div className="skeleton h-3 w-2/3 rounded" />
                      </div>
                    </div>
                  )}

                  {error && (
                    <div role="alert" className="mt-2 flex items-start gap-2 rounded border-2 border-accent bg-accent-soft p-2.5 text-[0.84rem] font-semibold">
                      <AlertTriangle size={18} strokeWidth={2.8} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                      <span>{error}</span>
                    </div>
                  )}

                  {generated && (
                    <div className="mt-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="label !inline flex items-center gap-1.5">
                          <Sparkles size={14} strokeWidth={3} aria-hidden="true" /> Pratinjau soal
                        </p>
                        <span className="chip border-ink/15 bg-teal-soft">
                          <Check size={12} strokeWidth={3} aria-hidden="true" /> {generated.questions.length} soal siap
                        </span>
                      </div>
                      {generated.notice && (
                        <p className="mt-1.5 rounded border border-line bg-gold-soft/70 px-2.5 py-1.5 text-[0.78rem] font-semibold text-ink-2">
                          {generated.notice}
                        </p>
                      )}
                      <ol className="mt-2 space-y-1.5">
                        {generated.questions.slice(0, 6).map((question, index) => (
                          <li key={question.id ?? index} className="rounded border border-line bg-surface p-2.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="chip !py-0 text-[0.6rem]">
                                {question.type === "pilihan" ? "Pilihan ganda" : "Jawaban singkat"}
                              </span>
                              <span className="text-[0.68rem] font-bold uppercase tracking-wide text-ink-3">
                                {question.categoryLabel ?? "Materi sendiri"}
                              </span>
                            </div>
                            <p className="mt-1 text-[0.86rem] font-bold leading-snug">{question.question}</p>
                            <p className="mt-0.5 text-[0.78rem] font-semibold text-teal">
                              Kunci: {question.answer}
                            </p>
                          </li>
                        ))}
                      </ol>
                      {generated.questions.length > 6 && (
                        <p className="mt-1.5 text-[0.76rem] font-semibold text-ink-3">
                          +{generated.questions.length - 6} soal lainnya akan dipakai saat bermain.
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={buildQuestions}
                        className="mt-2 inline-flex items-center gap-1 text-[0.8rem] font-bold text-ink-2 underline underline-offset-2"
                      >
                        <RefreshCw size={13} strokeWidth={3} aria-hidden="true" /> Buat variasi soal baru
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="flex items-start gap-2 rounded border border-line bg-surface/80 p-3 text-[0.8rem] leading-snug text-ink-2">
              <ShieldCheck size={18} strokeWidth={2.6} className="mt-0.5 shrink-0 text-teal" aria-hidden="true" />
              <p>
                File materi hanya diproses di server dan disimpan sementara di memori
                untuk keperluan penilaian. Tidak ada akun, tidak ada data pribadi siswa,
                dan file tidak ditampilkan ke publik.
              </p>
            </div>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-4">
            <div className="panel overflow-hidden shadow-float">
              <div className="poleng h-3" aria-hidden="true" />
              <div className="p-4">
                <span className="eyebrow">
                  <Sparkles size={13} strokeWidth={3} aria-hidden="true" /> Siap dimainkan
                </span>
                <h2 className="h4-display mt-1">
                  {sourceType === "bank" ? "Bank budaya Bali" : generated ? "Soal materi sendiri" : "Belum ada soal"}
                </h2>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded border border-line bg-surface-2/60 p-2.5">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-wide text-ink-2">Soal</p>
                    <p className="font-display text-[1.7rem] font-bold leading-none">{readyCount}</p>
                  </div>
                  <div className="rounded border border-line bg-surface-2/60 p-2.5">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-wide text-ink-2">Pemain maks.</p>
                    <p className="font-display text-[1.7rem] font-bold leading-none">{maxPlayers}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="label flex items-center gap-1.5">
                    <Users size={13} strokeWidth={3} aria-hidden="true" /> Kapasitas pemain (maks.)
                  </p>
                  <div className="mt-1.5 flex gap-1.5">
                    {[2, 3, 4].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMaxPlayers(value)}
                        aria-pressed={maxPlayers === value}
                        className={cn(
                          "min-h-10 flex-1 rounded border-2 font-display text-[1rem] font-bold transition",
                          maxPlayers === value
                            ? "border-ink bg-accent text-surface shadow-[0_2px_0_var(--ink)]"
                            : "border-ink/20 bg-surface hover:border-ink",
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-[0.82rem] font-semibold leading-snug text-ink-2">
                  {sourceType === "bank"
                    ? `Soal dipilih dari ${selectedCategories.length} kategori. Semua soal diacak dan dinilai juri AI.`
                    : generated
                      ? "Soal dibuat dari materi yang kamu unggah. Kamu bisa melihat kunci jawabannya di pratinjau."
                      : "Unggah materimu dan tekan “Buat soal” untuk melihat pratinjau sebelum bermain."}
                </p>

                <Button
                  variant="primary"
                  className="mt-4 w-full"
                  icon={creating ? Loader2 : ArrowRight}
                  iconPosition="right"
                  disabled={!canContinue || creating}
                  onClick={continueToSetup}
                >
                  {creating ? "Membuat sesi..." : localMode ? "Buat sesi demo" : "Buat sesi & kode"}
                </Button>
                {!canContinue && (
                  <p className="mt-1.5 text-center text-[0.74rem] font-semibold text-ink-3">
                    {sourceType === "bank" ? "Pilih minimal satu kategori." : "Buat soal dari materi dulu."}
                  </p>
                )}
                {error && (
                  <p role="alert" className="mt-2 rounded border border-accent bg-accent-soft p-2 text-[0.78rem] font-bold text-ink">
                    {error}
                  </p>
                )}
              </div>
              <div className="poleng h-3" aria-hidden="true" />
            </div>

            <div className="rounded border border-line bg-surface p-3 text-[0.8rem] leading-relaxed text-ink-2">
              <strong className="font-display text-[0.95rem] text-ink">Tips untuk guru</strong>
              <p className="mt-1">
                Gunakan file ringkasan 1–2 halaman agar soal lebih fokus. Setelah bermain,
                ajak siswa mendiskusikan jawaban yang belum tepat.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
