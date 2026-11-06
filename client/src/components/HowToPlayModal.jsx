import { Dices, KeyRound, MessageCircleQuestion, Sparkles, Trophy, Users } from "lucide-react";
import Modal from "./Modal";
import ScoreRulesTable from "./ScoreRulesTable";
import Button from "./Button";

const STEPS = [
  {
    icon: KeyRound,
    title: "Penyelenggara buat sesi",
    text: "Pilih sumber soal, tentukan jumlah pemain, lalu bagikan kode atau QR.",
  },
  {
    icon: Users,
    title: "Pemain bergabung",
    text: "Pemain membuka tautan/QR, menulis nama panggilan, dan mendapat bidak.",
  },
  {
    icon: Dices,
    title: "Dadu dari penyelenggara",
    text: "Saat giliranmu, tunggu penyelenggara memberi angka dadu. Pemain tidak melempar sendiri.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Jawab soal",
    text: "Berhenti di petak soal? Jawab pertanyaan; jawabanmu akan dinilai dengan ramah.",
  },
  {
    icon: Sparkles,
    title: "Penyelenggara meninjau",
    text: "Penyelenggara melihat jawaban dan skor, lalu bisa memberi nilai manual jika perlu.",
  },
  {
    icon: Trophy,
    title: "Capai petak 100",
    text: "Pemain pertama yang mencapai FINISH petak 100 menjadi juara sesi.",
  },
];

export default function HowToPlayModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="howto-title" panelClassName="max-w-3xl">
      <div className="poleng h-3" aria-hidden="true" />
      <div className="p-5 sm:p-7">
        <span className="eyebrow">
          <Sparkles size={15} strokeWidth={3} aria-hidden="true" /> Panduan bermain
        </span>
        <h2 id="howto-title" className="h2-display mt-2">
          Cara bermain MELAJAH AI
        </h2>
        <p className="lead mt-2 text-[1rem]">
          Satu penyelenggara mengendalikan jalannya permainan. Pemain bergabung lewat
          kode, menunggu angka dadu, lalu menjawab soal budaya Bali.
        </p>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <div key={step.title} className="panel-soft flex gap-3 p-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded border-2 border-ink bg-gold text-ink">
                <step.icon size={19} strokeWidth={2.6} aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-[1rem] font-bold leading-tight">
                  {index + 1}. {step.title}
                </p>
                <p className="mt-1 text-[0.84rem] leading-snug text-ink-2">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 font-display text-[1.15rem] font-bold">Aturan skor</p>
          <ScoreRulesTable />
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded border border-line bg-teal-soft p-3 text-[0.9rem] text-ink-2">
          <Users size={19} strokeWidth={2.6} className="mt-0.5 shrink-0 text-teal" aria-hidden="true" />
          <p>
            <strong className="text-ink">Pembagian peran:</strong> penyelenggara tidak
            memiliki bidak, posisi, skor, atau peringkat. Pemain tidak bisa melempar
            dadu atau mengubah posisi; semua gerakan divalidasi server.
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Mengerti, ayo main!
          </Button>
        </div>
      </div>
      <div className="poleng h-3" aria-hidden="true" />
    </Modal>
  );
}
