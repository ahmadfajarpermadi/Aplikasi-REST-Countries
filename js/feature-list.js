// Fitur 1 — TODO (dikerjakan tim, branch feature/daftar-pencarian).
// Tugas: daftar semua negara + pencarian nama + pagination.
// - Pencarian memakai parameter ?q= di sisi server (lihat api.js: fetchCountryList).
// - Pagination memakai limit/offset dan penanda data.meta.more dari API.
// - Tampilkan tiap negara sebagai kartu (bendera, nama, region, ibu kota, populasi).
// - Fungsi di bawah ini adalah kontrak antarmuka: app.js memanggil listHtml()
//   dan paginationHtml(). Isi implementasinya, jangan ubah nama fungsinya.

export function listHtml(_countries, _favorites) {
  return '<p class="empty">TODO Fitur 1: daftar negara + pencarian + pagination belum diimplementasikan.</p>';
}

export function paginationHtml(_meta, _offset, _limit) {
  return '';
}
