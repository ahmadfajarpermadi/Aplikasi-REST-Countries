// Fitur 2 — TODO (dikerjakan tim, branch feature/filter-sorting).
// Tugas: filter berdasarkan region + sorting (nama A-Z/Z-A, populasi).
// - Filter region dikirim ke API sebagai ?region=... (lihat api.js: fetchCountryList).
// - Sorting dilakukan di sisi klien karena API v5 tidak menyediakan parameter sort.
// - Konstanta di bawah ini sudah benar, pakai apa adanya.

import { sortCountries } from './utils.js';

export const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Antarctic'];

export const SORT_OPTIONS = [
  { value: 'nama-az', label: 'Nama A–Z' },
  { value: 'nama-za', label: 'Nama Z–A' },
  { value: 'populasi-desc', label: 'Populasi terbanyak' },
  { value: 'populasi-asc', label: 'Populasi tersedikit' },
];

export { sortCountries };

export function filterBarHtml(_state) {
  return '<p class="empty">TODO Fitur 2: filter region + sorting belum diimplementasikan.</p>';
}
