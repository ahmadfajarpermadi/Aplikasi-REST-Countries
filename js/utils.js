// Fungsi bantu murni (tanpa DOM) — dipakai aplikasi dan diuji Node.

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function formatNumber(n) {
  return new Intl.NumberFormat('id-ID').format(Number(n) || 0);
}

export function formatAreaKm(km) {
  if (!km) return '-';
  return `${formatNumber(km)} km²`;
}

// Gambar bendera: pakai url_png dari API, kalau kosong bangun dari Flag CDN
// (gratis, tanpa key) memakai alpha-2 huruf kecil.
export function flagImageUrl(country) {
  if (country.flagPng) return country.flagPng;
  if (country.alpha2) {
    return `https://flags.restcountries.com/v5/w320/${country.alpha2.toLowerCase()}.png`;
  }
  return '';
}

// API v5 tidak menyediakan parameter sort (lihat docs "Sort order"),
// jadi pengurutan dilakukan di sisi klien.
export function sortCountries(list, sortKey) {
  const arr = [...list];
  switch (sortKey) {
    case 'nama-za':
      return arr.sort((a, b) => b.name.localeCompare(a.name, 'id'));
    case 'populasi-desc':
      return arr.sort((a, b) => b.population - a.population);
    case 'populasi-asc':
      return arr.sort((a, b) => a.population - b.population);
    case 'nama-az':
    default:
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'id'));
  }
}

export function computeStats(meta, loaded, favorites) {
  const mostPopulous = loaded.reduce(
    (max, c) => (c.population > (max ? max.population : -1) ? c : max),
    null,
  );
  return {
    total: meta && typeof meta.total === 'number' ? meta.total : 0,
    loaded: loaded.length,
    favoriteCount: favorites ? favorites.size : 0,
    mostPopulous,
  };
}
