// Klien REST Countries API v5.
// Key dibaca dari window.RESTCOUNTRIES_API_KEY (diisi di js/config.js).
// Mode demo (?demo=1) memakai fixture lokal tests/fixtures/countries.json,
// jadi antarmuka bisa dicoba tanpa key.

export const API_BASE = 'https://api.restcountries.com';
export const PAGE_SIZE = 25;

// Field yang diminta untuk daftar (menjaga payload tetap kecil).
export const LIST_FIELDS = [
  'names.common',
  'names.official',
  'codes.alpha_2',
  'codes.alpha_3',
  'capitals',
  'flag.emoji',
  'flag.url_png',
  'region',
  'subregion',
  'population',
].join(',');

export function getApiKey() {
  if (typeof window === 'undefined') return '';
  const key = window.RESTCOUNTRIES_API_KEY;
  return typeof key === 'string' ? key.trim() : '';
}

export function isDemoMode() {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('demo') === '1';
}

export function hasRealKey() {
  const key = getApiKey();
  return key !== '' && key !== 'ISI_API_KEY_ANDA_DI_SINI';
}

// --- Normalisasi -------------------------------------------------------
// Mengubah satu record mentah API menjadi objek datar yang aman dipakai
// antarmuka (field kosong menjadi '' / [] / 0, bukan undefined).
export function normalizeCountry(r = {}) {
  const names = r.names || {};
  const codes = r.codes || {};
  const flag = r.flag || {};
  const area = r.area || {};
  const capitals = Array.isArray(r.capitals) ? r.capitals : [];
  const languages = Array.isArray(r.languages) ? r.languages : [];
  const currencies = Array.isArray(r.currencies) ? r.currencies : [];
  const borders = Array.isArray(r.borders) ? r.borders : [];
  const timezones = Array.isArray(r.timezones) ? r.timezones : [];
  const continents = Array.isArray(r.continents) ? r.continents : [];
  const callingCodes = Array.isArray(r.calling_codes) ? r.calling_codes : [];

  return {
    alpha2: codes.alpha_2 || '',
    alpha3: codes.alpha_3 || '',
    name: names.common || 'Tanpa nama',
    officialName: names.official || '',
    capital: capitals.map((c) => c.name).filter(Boolean).join(', '),
    capitals: capitals.map((c) => c.name).filter(Boolean),
    emoji: flag.emoji || '',
    flagPng: flag.url_png || '',
    flagDescription: flag.description || '',
    region: r.region || '',
    subregion: r.subregion || '',
    population: typeof r.population === 'number' ? r.population : 0,
    areaKm: typeof area.kilometers === 'number' ? area.kilometers : 0,
    timezones,
    languages: languages
      .map((l) => ({
        name: l.name || '',
        nativeName: l.native_name || '',
        code: l.iso639_1 || l.bcp47 || '',
      }))
      .filter((l) => l.name),
    currencies: currencies
      .map((c) => ({ code: c.code || '', name: c.name || '', symbol: c.symbol || '' }))
      .filter((c) => c.code || c.name),
    borders,
    continents,
    callingCodes,
    // Kunci halaman detail: alpha-3 bila ada, kalau kosong pakai nama umum
    // (contoh: Abkhazia tidak punya kode ISO).
    detailKey: codes.alpha_3 || names.common || '',
  };
}

export function parseListResponse(json) {
  if (!json || !json.data || !Array.isArray(json.data.objects)) {
    throw new Error('Format respons API tidak dikenal.');
  }
  return {
    countries: json.data.objects.map(normalizeCountry),
    meta: json.data.meta || { total: 0, count: 0, limit: 0, offset: 0, more: false },
  };
}

export function parseDetailResponse(json) {
  const { countries } = parseListResponse(json);
  if (!countries.length) throw new Error('Negara tidak ditemukan.');
  return countries[0];
}

// --- URL ---------------------------------------------------------------
export function buildListUrl({ q = '', region = '', limit = PAGE_SIZE, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (region) params.set('region', region);
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  params.set('response_fields', LIST_FIELDS);
  return `${API_BASE}/countries/v5?${params.toString()}`;
}

export function buildDetailUrl(key) {
  // alpha-3 (mis. IDN) dibaca lewat codes.alpha_3; nama umum lewat names.common.
  const isCode = /^[A-Za-z]{3}$/.test(key);
  const prop = isCode ? 'codes.alpha_3' : 'names.common';
  return `${API_BASE}/countries/v5/${prop}/${encodeURIComponent(key)}`;
}

// --- Fetch live ----------------------------------------------------------
export function apiErrorMessage(status, body) {
  const detail =
    body && Array.isArray(body.errors) && body.errors[0] ? body.errors[0].message : '';
  if (status === 401) return 'API key tidak dikenal / belum diisi. Periksa js/config.js.';
  if (status === 403)
    return 'Akses ditolak (403). Mungkin kuota bulanan habis atau key belum mengizinkan origin ini.';
  if (status === 404) return 'Tidak ditemukan (404).';
  if (status === 429) return 'Terlalu banyak permintaan (429). Tunggu sebentar lalu coba lagi.';
  return `API mengembalikan HTTP ${status}. ${detail}`;
}

export async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(apiErrorMessage(res.status, body));
  return body;
}

export async function fetchCountryList(params = {}) {
  if (isDemoMode()) return fetchDemoList(params);
  return parseListResponse(await fetchJson(buildListUrl(params)));
}

export async function fetchCountryDetail(key) {
  if (isDemoMode()) return fetchDemoDetail(key);
  return parseDetailResponse(await fetchJson(buildDetailUrl(key)));
}

// --- Mode demo (fixture lokal, tanpa key) --------------------------------
let fixtureCache = null;

async function loadFixture() {
  if (fixtureCache) return fixtureCache;
  const res = await fetch('tests/fixtures/countries.json');
  if (!res.ok) throw new Error('Fixture demo tidak ditemukan.');
  const fx = await res.json();
  const list = fx.list_response.data.objects.map(normalizeCountry);
  const idn = normalizeCountry(fx.detail_idn_response.data.objects[0]);
  const all = [...list];
  if (!all.some((c) => c.alpha3 === idn.alpha3)) all.push(idn);
  fixtureCache = all;
  return all;
}

export async function fetchDemoList({ q = '', region = '', limit = PAGE_SIZE, offset = 0 } = {}) {
  let all = await loadFixture();
  if (q) {
    const needle = q.toLowerCase();
    all = all.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        c.officialName.toLowerCase().includes(needle),
    );
  }
  if (region) all = all.filter((c) => c.region === region);
  const total = all.length;
  const page = all.slice(offset, offset + limit);
  return {
    countries: page,
    meta: { total, count: page.length, limit, offset, more: offset + page.length < total },
  };
}

export async function fetchDemoDetail(key) {
  const all = await loadFixture();
  const found = all.find(
    (c) => c.alpha3 === key || c.name.toLowerCase() === String(key).toLowerCase(),
  );
  if (!found) throw new Error('Negara tidak ditemukan di data demo.');
  return found;
}
