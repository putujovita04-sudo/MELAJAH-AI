# MELAJAH AI

Game ular tangga edukasi budaya Bali untuk siswa SD kelas 3–6. Permainan dipandu **penyelenggara** lewat kode/QR; pemain bergabung dari perangkat masing-masing, menunggu angka dadu, menjawab soal, dan dinilai **Juri AI**.

Bukan mockup — seluruh alur sesi, papan 100 kotak, dadu, giliran, penilaian, dan hasil akhir berfungsi.

## Daftar isi

- [Peran](#peran)
- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Persyaratan](#persyaratan)
- [Instalasi](#instalasi)
- [Konfigurasi AI](#konfigurasi-ai)
- [Menjalankan aplikasi](#menjalankan-aplikasi)
- [Cara bermain](#cara-bermain)
- [Papan 10×10](#papan-1010)
- [Aturan skor](#aturan-skor)
- [Sesi dan keamanan](#sesi-dan-keamanan)
- [Struktur proyek](#struktur-proyek)
- [API](#api)
- [Pengujian](#pengujian)
- [Deployment](#deployment)
- [Build produksi](#build-produksi)
- [Pemecahan masalah](#pemecahan-masalah)

## Peran

| | Pemain | Penyelenggara |
|---|---|---|
| Bidak & posisi | Ya | **Tidak** |
| Skor & peringkat | Ya | **Tidak** |
| Melempar/memberi angka dadu | **Tidak** | Ya |
| Mengubah posisi | **Tidak** | Tidak (server yang menghitung) |
| Menjawab soal | Ya | Tidak |
| Melihat kunci jawaban | Tidak (sampai dinilai) | Ya |
| Menilai manual | **Tidak** | Ya |
| Membuat sesi, kode, QR | Tidak | Ya |
| Mengakhiri permainan | Tidak | Ya |

Penyelenggara adalah pengendali permainan dan juri. Ia **tidak boleh menjadi pemain**, tidak punya bidak, posisi, skor, atau peringkat. Pemain tidak bisa melempar dadu sendiri, memasukkan angka dadu, mengubah posisi, atau mengubah hasil penilaian.

## Fitur

- **Sesi multi-perangkat** dengan kode 5 karakter dan QR; pemain bergabung lewat nama panggilan.
- **Papan 10×10 (100 kotak)** pola zigzag klasik; START petak 1 dan FINISH petak 100.
- **15 tangga + 15 ular** dengan titik awal/akhir unik, tidak bertabrakan, dan **tetap selama satu sesi**.
- 20 petak soal dengan warna berbeda; kotak ular, kotak tangga, START, FINISH, dan kotak biasa punya warna sendiri.
- **Penyelenggara memberi angka dadu** lewat tombol 1–6 atau “Acak dadu”. Pemain hanya menunggu.
- **Giliran otomatis**: setelah satu pemain menyelesaikan giliran, sistem berpindah ke pemain berikutnya sesuai urutan yang diatur penyelenggara.
- **Lobby**: penyelenggara melihat pemain yang bergabung, mengatur urutan dengan panah, dan menghapus pemain sebelum mulai.
- **Soal & Juri AI**: pilihan ganda dan jawaban singkat; AI menilai makna, dengan fallback kata kunci.
- **Tinjauan penyelenggara**: melihat pertanyaan, jawaban pemain, skor AI, kunci, dan penjelasan; dapat memberi **nilai manual**, melewati soal, atau melanjutkan giliran.
- **Penilaian manual** memakai aturan skor yang sama (80–100, 50–79, 0–49).
- **Halaman hasil** untuk host dan pemain: juara, peringkat, skor, jumlah benar/hampir/salah.
- **Bidak orang berpakaian adat Bali** (pria udeng, perempuan kebaya) dengan animasi berjalan, efek tangga/ular, dan highlight petak.
- **Penyelenggara membuat soal** dari bank budaya Bali (filter kategori) atau unggah materi `.txt/.md/.csv/.json/.pdf`.
- Responsif untuk ponsel, tablet, dan laptop; target sentuh besar, fokus keyboard, `aria-live`, dan dialog dengan focus trap.
- Efek suara gamelan ringan (Web Audio) yang bisa dimatikan.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React 18, Vite 6, Tailwind CSS 3 |
| Animasi | Framer Motion |
| Ikon | Lucide React |
| QR | `qrcode.react` |
| Backend | Node.js, Express 4 |
| Sesi | In-memory store + token host/pemain |
| Upload | Multer 2 |
| PDF | `pdf-parse` + ekstraktor cadangan |
| AI | API gaya OpenAI (OpenAI, DeepSeek, Groq, dsb.) |

## Persyaratan

- Node.js **20+** (diuji pada Node 24).
- npm 10+.
- Tidak perlu database. Sesi dan materi disimpan sementara di memori server.

## Instalasi

```bash
cd melajah-ai
npm install
cp .env.example .env
npm run dev
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:4100>
- Health check: <http://localhost:4100/api/health>

> Port default 4100 karena port 3001 di mesin pengembangan sudah dipakai aplikasi lain. Ubah `PORT` di `.env` dan proxy di `client/vite.config.js` bila perlu.

Untuk membuka dari ponsel di jaringan yang sama, jalankan Vite dengan host aktif (sudah diset `host: true`) dan akses lewat alamat IP laptop, mis. `http://192.168.1.10:5173`. QR akan mengikuti alamat yang dipakai host.

## Konfigurasi AI

API key **hanya** disimpan di server. Frontend tidak pernah menerimanya.

```env
AI_API_KEY=sk-xxxxxxxx
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_TIMEOUT_MS=15000

SESSION_TTL_MS=21600000
VERDICT_AUTO_MS=10000
```

Contoh penyedia:

| Penyedia | `AI_BASE_URL` | Contoh model |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |

Tanpa API key:

- Soal dinilai dengan pencocokan kata kunci di server.
- Soal dari materi dibuat dengan ekstraksi kalimat lokal.
- Frontend juga punya fallback jika backend mati.
- UI menampilkan “Mode lokal” / “Dicek dari kunci jawaban”.

## Menjalankan aplikasi

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Backend (4100) + frontend (5173) |
| `npm run dev:server` | Hanya backend |
| `npm run dev:client` | Hanya Vite |
| `npm test` | Unit test papan, skor, sesi, fallback, bank soal |
| `npm run build` | Build frontend ke `client/dist` |
| `npm start` | Server produksi (menyajikan `client/dist` bila ada) |

## Cara bermain

### Penyelenggara

1. Pilih **Penyelenggara** di halaman peran.
2. Pilih sumber soal:
   - **Bank soal budaya Bali** — 40 soal, filter kategori.
   - **Materi sendiri** — unggah file, buat 12 soal, periksa pratinjau.
3. Tentukan kapasitas maksimal pemain (2–4), lalu tekan **Buat sesi & kode**.
4. Bagikan **kode 5 karakter** atau **QR** ke pemain.
5. Atur urutan giliran dengan panah; hapus pemain bila perlu.
6. Tekan **Mulai permainan** (minimal 2 pemain).
7. Saat giliran pemain, beri angka dadu 1–6 atau tekan **Acak dadu**.
8. Jika pemain berhenti di petak soal, tunggu jawabannya. Setelah AI menilai, tinjau skor; kamu bisa:
   - **Terapkan nilai manual** (0–100 + komentar),
   - **Lanjut sekarang**, atau
   - biarkan sistem lanjut otomatis setelah 10 detik.
   - **Lewati (nilai 0)** jika soal perlu dilewati.
9. Tekan **Akhiri sesi** kapan saja; pemenang ditentukan dari posisi tertinggi.

### Pemain

1. Buka tautan/QR dari penyelenggara atau pilih **Pemain**, lalu masukkan kode.
2. Tulis nama panggilan (maks. 14 huruf), bergabung, dan tunggu penyelenggara memulai.
3. Saat giliranmu, **tunggu angka dadu dari penyelenggara**. Tidak ada tombol dadu untuk pemain.
4. Jika berhenti di petak soal, jawab pertanyaan. Jawaban dikirim ke server; AI menilai maknanya.
5. Lihat skor dan komentar, lalu giliran otomatis berpindah.
6. Pemain pertama yang mencapai **petak 100** menjadi juara.

## Papan 10×10

- 100 kotak, nomor 1–100 pola zigzag.
- **START** di petak 1, **FINISH** di petak 100.
- **15 tangga** dan **15 ular** (30 jalur).
- Semua 60 titik awal/akhir unik; tidak ada yang menyentuh START, FINISH, atau petak soal. Posisi tetap untuk satu sesi.
- Warna kotak:
  - krem/putih: kotak biasa
  - merah muda: kotak soal (ikon buku)
  - kuning: titik tangga (ikon panah naik)
  - hijau: titik ular (ikon panah turun)
  - teal: START
  - emas: FINISH
- Nomor kotak selalu dirender di atas ilustrasi ular/tangga agar tetap terbaca.

Konfigurasi ada di `shared/board.js` dan dipakai bersama client/server, sehingga server dan tampilan tidak pernah berbeda.

## Aturan skor

Satu sumber: `shared/scoreRules.js`, dipakai server untuk menghitung posisi.

| Skor | Hasil | Akibat |
|---|---|---|
| 80–100 | Benar | Bonus maju 2 petak; tangga aktif; ular tidak aktif |
| 50–79 | Hampir benar | Tetap di tempat; tangga aktif; ular tidak aktif |
| 0–49 | Belum tepat | Mundur 1 petak; ular aktif; tangga tidak aktif |

Setelah skor diterapkan, server memeriksa tangga/ular, memperbarui posisi, lalu otomatis memindahkan giliran. Satu jawaban tidak memicu soal kedua.

## Sesi dan keamanan

- **Token host** dibuat saat sesi dibuat; semua aksi penyelenggara (dadu, mulai, override, hapus pemain, urutkan, akhiri) memerlukan header `x-session-token`.
- **Token pemain** dibuat saat join; hanya pemain yang sedang mendapat giliran yang dapat mengirim jawaban.
- Endpoint publik tidak pernah memuat token host/pemain, dan tidak memuat kunci jawaban sebelum dinilai.
- Nama panggilan hanya disimpan di memori sesi. Tidak ada akun, database, atau data pribadi.
- Sesi disimpan di memori (default 6 jam) dan hilang saat server restart. Host/pemain dapat memulihkan tampilan setelah refresh selama server masih hidup (token disimpan di `sessionStorage` tab).
- Rate limit 600 permintaan/menit per IP untuk API (polling sesi tetap ringan).
- Prompt injection: jawaban pemain dan materi diperlakukan sebagai data; prompt melarang mengikuti instruksi di dalamnya; respons AI divalidasi.
- Upload maksimal 5 MB, hanya ekstensi tertentu.

## Struktur proyek

```
melajah-ai/
├── client/
│   └── src/
│       ├── components/          # Board 10x10, Pawn, Dice, QuestionModal,
│       │                        # SessionResult, Modal, QR/lobby, dll.
│       ├── config/
│       │   ├── boardConfig.js   # re-export konfigurasi papan bersama
│       │   ├── players.js       # palet bidak
│       │   └── scoreRules.js    # re-export aturan skor bersama
│       ├── data/questions.json  # 40 soal, 5 kategori
│       ├── hooks/
│       │   ├── useSessionPolling.js
│       │   └── useSound.js
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── StartPage.jsx
│       │   ├── JoinPage.jsx
│       │   ├── HostPage.jsx         # buat sesi + sumber soal
│       │   ├── HostGamePage.jsx     # lobby, dadu, juri, hasil
│       │   └── PlayerGamePage.jsx   # gabung, tunggu dadu, jawab
│       ├── utils/               # sessionApi, board, storage, questions
│       ├── App.jsx
│       └── index.css
├── shared/
│   ├── board.js                 # 100 kotak, 15 tangga, 15 ular
│   ├── players.js
│   └── scoreRules.js
├── server/
│   └── src/
│       ├── config/ai.js         # env, AI, TTL sesi
│       ├── controllers/
│       │   ├── materialController.js
│       │   └── sessionController.js
│       ├── routes/
│       │   ├── apiRoutes.js     # upload materi
│       │   └── sessionRoutes.js # sesi, dadu, jawaban, hasil
│       ├── services/
│       │   ├── sessionService.js    # otoritas permainan
│       │   ├── sessionStore.js
│       │   ├── judgeService.js
│       │   ├── fallbackJudge.js
│       │   ├── questionGenerator.js
│       │   ├── questionService.js
│       │   ├── materialStore.js
│       │   ├── textExtract.js
│       │   └── aiService.js
│       ├── utils/pdfText.js
│       ├── app.js
│       └── index.js
├── samples/materi-budaya-bali.txt
├── tests/gameLogic.test.mjs
├── .env.example
└── README.md
```

## API

### Sesi

| Method | Path | Keterangan |
|---|---|---|
| `POST` | `/api/sessions` | Buat sesi. Body `{maxPlayers, categories?, difficulty?, materialId?}` |
| `GET` | `/api/sessions/:code` | State publik untuk pemain |
| `GET` | `/api/sessions/:code/host` | State host; header `x-session-token` |
| `POST` | `/api/sessions/:code/join` | `{name}` → `{playerId, playerToken, state}` |
| `POST` | `/api/sessions/:code/start` | Mulai sesi (host) |
| `POST` | `/api/sessions/:code/dice` | `{value?}` 1–6 atau acak (host) |
| `POST` | `/api/sessions/:code/answer` | `{playerId, playerToken, answer}` |
| `POST` | `/api/sessions/:code/skip` | Lewati soal, nilai 0 (host) |
| `POST` | `/api/sessions/:code/override` | `{score, comment}` nilai manual (host) |
| `POST` | `/api/sessions/:code/resolve` | Lanjutkan hasil sekarang (host) |
| `POST` | `/api/sessions/:code/end` | Akhiri sesi (host) |
| `POST` | `/api/sessions/:code/players/remove` | `{playerId}` (host, lobby) |
| `POST` | `/api/sessions/:code/order` | `{order}` (host, lobby) |

Contoh:

```bash
curl -X POST http://localhost:4100/api/sessions \
  -H 'Content-Type: application/json' \
  -d '{"maxPlayers":4,"categories":["tari-musik","upacara"]}'

curl -X POST http://localhost:4100/api/sessions/CFD93/join \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ayu"}'

curl -X POST http://localhost:4100/api/sessions/CFD93/dice \
  -H 'Content-Type: application/json' \
  -H 'x-session-token: <host-token>' \
  -d '{"value":3}'
```

### Juri dan materi

- Penilaian dilakukan di dalam alur sesi. Server mengambil kunci dari bank/materi kanonik, bukan dari klien.
- `POST /api/materials` — multipart field `file`. Mengembalikan soal materi + `materialId`.
- `GET /api/health` — status AI dan jumlah bank soal.

Respons juri divalidasi: skor angka 0–100, komentar dibersihkan dan dibatasi, sumber `ai`/`kunci`/`lokal`/`manual`.

## Pengujian

```bash
npm test
```

Mencakup:

- aturan skor dan urutan bonus → tangga/ular;
- papan 10×10: 15 tangga + 15 ular, 60 titik unik, tidak menyentuh START/FINISH/petak soal;
- bank 40 soal, 5 kategori, kunci ada di opsi;
- fallback makna “Hari raya Nyepi” → benar;
- prompt injection tidak mendapat skor tinggi;
- sesi: join, board tetap, host memberi dadu, token tidak bocor, pemain tidak bisa memberi dadu;
- generator materi lokal tanpa API key.

Uji API manual dapat dilakukan dengan `curl` pada endpoint di atas.

## Deployment

### Kenapa GitHub Pages / static hosting tidak bisa langsung

MELAJAH AI bukan situs statis. Frontend React membutuhkan backend Express untuk:

- membuat dan menyimpan sesi,
- kode/QR dan daftar pemain,
- memberi angka dadu dan memvalidasi giliran,
- menyimpan jawaban dan memanggil Juri AI,
- menyimpan nilai manual dan hasil akhir.

GitHub Pages, Netlify static, dan Vercel static hanya menyajikan HTML/JS. Jika hanya frontend yang di-deploy, backend Express tidak berjalan. Pada Vercel, aplikasi otomatis beralih ke **mode demo lokal** (lihat di bawah) agar tetap bisa dicoba. Untuk permainan multi-perangkat penuh, backend Node tetap harus di-deploy.

### Render — disarankan (satu Node service)

Repo sudah menyertakan `render.yaml`.

1. Buka [Render Dashboard](https://dashboard.render.com/) → **New → Blueprint**.
2. Hubungkan repo `putujovita04-sudo/MELAJAH-AI`.
3. Render membaca `render.yaml`:
   - Build: `npm ci --include=dev && npm run build`
   - Start: `npm start`
   - Health check: `/api/health`
4. Isi `AI_API_KEY` di Environment (opsional; kosongkan untuk mode lokal).
5. Deploy. Frontend dan API berada di URL yang sama.

> **Jika New → Blueprint meminta pembayaran:** Blueprint adalah fitur workspace/infrastruktur, dan `plan: free` di `render.yaml` hanya berlaku untuk instance komputasi — bukan jaminan alur Blueprint gratis. Jika akunmu diminta billing, lewati Blueprint dan buat **Web Service manual** (langkah di bawah). Yang gratis adalah **Free web instance**, bukan fitur Blueprint-nya. Jika Render tetap meminta kartu untuk service baru, gunakan alternatif seperti Koyeb, Railway, Fly.io, atau VPS.

Alternatif manual di Render:

- Runtime: **Node**
- Build Command: `npm ci --include=dev && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Environment: `NODE_ENV=production`

### Docker / VPS

```bash
docker build -t melajah-ai .
docker run -p 4100:4100 --env-file .env melajah-ai
```

Buka `http://localhost:4100`. Express menyajikan API dan `client/dist`.

### Vercel — mode demo lokal otomatis

Repo sudah menyertakan `vercel.json`. Jika Vercel hanya menjalankan frontend:

- Semua state sesi disimpan di `localStorage` browser.
- Bank soal tetap berfungsi; AI memakai penilaian kata kunci lokal.
- Penyelenggara membuat sesi, lalu menekan **Buka tab pemain** untuk setiap pemain.
- Pemain harus berada di **browser/perangkat yang sama**; kode/QR tidak dapat dipakai dari HP lain.
- Materi sendiri dan AI server tidak tersedia di mode ini.

Untuk pemain di perangkat berbeda, deploy backend Node (Render/Koyeb/Railway/VPS), lalu set `VITE_API_URL` di Vercel dan `CLIENT_ORIGIN` di backend.

### Frontend dan backend terpisah

Jika frontend di Vercel/Netlify dan backend di Render/Railway:

- Deploy backend sebagai Node service.
- Set `VITE_API_URL=https://backend-anda` saat build frontend.
- Set `CLIENT_ORIGIN=https://frontend-anda` di backend.
- Jangan gunakan Vercel/Netlify Functions untuk backend ini karena sesi disimpan di memori dan akan hilang/berbeda antar-instance.

### Catatan penting sesi

Sesi disimpan **di memori proses**. Gunakan **satu instance** backend dan jangan biarkan instance tidur saat permainan berlangsung. Render free tier bisa tidur setelah tidak aktif, sehingga sesi hilang. Untuk kelas yang berjalan lama, gunakan instance always-on atau tambahkan Redis sebagai session store.

## Build produksi

```bash
npm run build
NODE_ENV=production npm start
```

Server menyajikan `client/dist` pada port yang sama (default 4100). Static serving juga aktif saat `client/dist` ada, meskipun `NODE_ENV` tidak diset. Untuk deployment multi-domain, atur `CLIENT_ORIGIN`.

## Keamanan data pribadi

- Hanya nama panggilan; tidak ada akun, email, alamat, atau nomor telepon.
- Tidak menulis nama siswa ke database/disk.
- Token sesi disimpan di `sessionStorage` tab untuk pemulihan refresh.
- File materi diproses di memori dan kedaluwarsa (default 2 jam).
- API key AI hanya di `.env` server.

## Pemecahan masalah

| Masalah | Solusi |
|---|---|
| `EADDRINUSE` 4100 | Ubah `PORT` di `.env` dan proxy Vite |
| Pemain tidak bisa join | Periksa kode, kapasitas sesi, dan apakah sesi sudah dimulai |
| Host kehilangan kendali setelah refresh | Token host disimpan per tab; buka tab yang sama atau buat sesi baru |
| Sesi hilang setelah server restart | Sesi in-memory; buat sesi baru |
| QR tidak bisa dibuka dari ponsel | Akses host lewat IP LAN (bukan `localhost`), lalu tampilkan QR baru |
| AI error/timeout | Cek `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`; fallback tetap berjalan |
| PDF gagal | PDF hasil scan tidak punya teks; simpan ulang `.txt`/`.md` |
| Suara tidak muncul | Browser memblokir audio sebelum interaksi; klik dulu lalu nyalakan suara |

## Kredit

Proyek edukasi. Font **Baloo 2** dan **Nunito** dari Google Fonts; ikon **Lucide**; ilustrasi pura, gunung, gamelan, ular, dan bidak dibuat sebagai SVG orisinal di proyek.
