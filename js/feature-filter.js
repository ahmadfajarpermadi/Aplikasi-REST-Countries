// Fitur 2 — Filter Region + Sorting
// Dikerjakan oleh: Johannes Rivano Fashella Febriyanto (JohannesRivanoFF)
// Branch: feature/filter-sorting
//
// Tugas:
// - Filter berdasarkan region (Africa, Americas, Asia, Europe, Oceania, Antarctic)
// - Sorting di sisi klien (Nama A–Z, Nama Z–A, Populasi Terbanyak, Populasi Tersedikit)
// - UI yang bersih, modern, responsif, dan mudah dipahami

import { sortCountries } from './utils.js';

export const REGIONS = [
  'Africa',
  'Americas',
  'Asia',
  'Europe',
  'Oceania',
  'Antarctic',
];

export const REGION_LABELS = {
  Africa: 'Afrika',
  Americas: 'Amerika',
  Asia: 'Asia',
  Europe: 'Eropa',
  Oceania: 'Oseania',
  Antarctic: 'Antartika',
};

export const SORT_OPTIONS = [
  { value: 'nama-az', label: 'Nama A–Z', icon: '' },
  { value: 'nama-za', label: 'Nama Z–A', icon: '' },
  { value: 'populasi-desc', label: 'Populasi terbanyak', icon: '📈' },
  { value: 'populasi-asc', label: 'Populasi tersedikit', icon: '📉' },
];

export { sortCountries };

/**
 * Memfilter daftar negara berdasarkan region.
 * Bila region kosong (''), mengembalikan semua negara.
 *
 * @param {Array} countries - Array data objek negara
 * @param {string} region - Nama region (misal: 'Asia', 'Europe')
 * @returns {Array} Daftar negara yang sudah difilter
 */
export function filterCountriesByRegion(countries = [], region = '') {
  if (!Array.isArray(countries)) return [];
  if (!region) return [...countries];
  const target = String(region).toLowerCase().trim();
  return countries.filter(
    (c) => c && typeof c.region === 'string' && c.region.toLowerCase() === target,
  );
}

/**
 * Menerapkan filter region dan pengurutan (sorting) sekaligus.
 *
 * @param {Array} countries - Array data objek negara
 * @param {Object} options - { region, sort }
 * @returns {Array} Daftar negara terfilter dan terurut
 */
export function applyFilterAndSort(countries = [], { region = '', sort = 'nama-az' } = {}) {
  const filtered = filterCountriesByRegion(countries, region);
  return sortCountries(filtered, sort);
}

/**
 * Menghasilkan markup HTML untuk komponen Filter Region dan Sorting.
 *
 * @param {Object} state - State saat ini, misal: { region: 'Asia', sort: 'populasi-desc' }
 * @returns {string} String HTML filter bar
 */
export function filterBarHtml(state = {}) {
  const currentRegion = state?.region || state?.currentRegion || '';
  const currentSort = state?.sort || state?.currentSort || 'nama-az';

  const regionOptionsHtml = REGIONS.map((reg) => {
    const isSelected = reg.toLowerCase() === currentRegion.toLowerCase() ? 'selected' : '';
    const localized = REGION_LABELS[reg] ? `${REGION_LABELS[reg]} (${reg})` : reg;
    return `<option value="${reg}" ${isSelected}>${localized}</option>`;
  }).join('');

  const sortOptionsHtml = SORT_OPTIONS.map((opt) => {
    const isSelected = opt.value === currentSort ? 'selected' : '';
    const icon = opt.icon ? `${opt.icon} ` : '';
    return `<option value="${opt.value}" ${isSelected}>${icon}${opt.label}</option>`;
  }).join('');

  const isFiltered = Boolean(currentRegion || (currentSort && currentSort !== 'nama-az'));
  const resetBtnHtml = isFiltered
    ? `<button type="button" class="filter-reset-btn" id="filter-reset-btn" title="Kembalikan ke semua region dan nama A–Z">
         <span aria-hidden="true">↺</span> Reset Filter
       </button>`
    : '';

  return `
    <div class="filter-bar" role="group" aria-label="Filter dan Pengurutan Negara">
      <div class="filter-group">
        <label for="filter-region" class="filter-label">
          <span class="filter-icon" aria-hidden="true"></span>
          <span>Region:</span>
        </label>
        <select id="filter-region" name="region" class="filter-select" aria-label="Pilih Region">
          <option value="">Semua Region</option>
          ${regionOptionsHtml}
        </select>
      </div>

      <div class="filter-group">
        <label for="sort-select" class="filter-label">
          <span class="filter-icon" aria-hidden="true"></span>
          <span>Urutan:</span>
        </label>
        <select id="sort-select" name="sort" class="filter-select" aria-label="Pilih Urutan">
          ${sortOptionsHtml}
        </select>
      </div>

      ${resetBtnHtml}
    </div>
  `.trim();
}
