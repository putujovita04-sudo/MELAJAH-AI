/**
 * Mode demo lokal hanya berlaku untuk tab/sesi browser saat ini.
 *
 * Sebelumnya flag ini disimpan permanen di localStorage. Akibatnya, satu kali
 * request gagal (mis. sebelum backend dipasang) membuat browser terus memakai
 * mode lokal dan tidak pernah mencoba server lagi — pemain di HP tidak bisa
 * masuk ke room admin. Sekarang cache hanya di memori; setiap load halaman
 * baru akan mencoba server terlebih dahulu.
 */
const LEGACY_KEY = "melajah-local-mode";
let cached = false;

try {
  // Bersihkan flag lama dari versi aplikasi sebelumnya.
  localStorage.removeItem(LEGACY_KEY);
} catch {
  // localStorage bisa diblokir; abaikan.
}

export const getLocalMode = () => cached === true;

export const setLocalMode = (value) => {
  cached = Boolean(value);
};

export const resetLocalMode = () => {
  cached = false;
};
