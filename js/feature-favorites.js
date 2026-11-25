// Fitur 4 — TODO (dikerjakan tim, branch feature/favorit-statistik).
// Tugas: favorit (localStorage) + statistik ringkas.
// - Simpan kode negara favorit di localStorage (kunci sudah ditentukan di bawah).
// - Statistik: total negara, jumlah ditampilkan, jumlah favorit, negara terpadat di daftar ini.
// - Fungsi di bawah ini adalah kontrak antarmuka. Isi implementasinya, jangan ubah nama fungsinya.

export const STORAGE_KEY = 'jelajah-negara-favorit-v1';

export function loadFavorites() {
  return new Set();
}

export function saveFavorites(_favorites) {
  // TODO: simpan ke localStorage.
}

export function toggleFavorite(favorites, _key) {
  return new Set(favorites);
}

export function statsHtml(_stats, _demoMode) {
  return '<p class="empty">TODO Fitur 4: favorit + statistik belum diimplementasikan.</p>';
}
