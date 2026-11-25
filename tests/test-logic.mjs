// Uji kerangka awal: hanya plumbing (klien API + utilitas + stub fitur).
// Uji fitur 1-4 ditulis tim masing-masing saat mengerjakan fiturnya.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildDetailUrl,
  buildListUrl,
  normalizeCountry,
  parseDetailResponse,
  parseListResponse,
} from '../js/api.js';
import {
  computeStats,
  flagImageUrl,
  formatNumber,
  sortCountries,
} from '../js/utils.js';
import { listHtml, paginationHtml } from '../js/feature-list.js';
import { filterBarHtml, REGIONS, SORT_OPTIONS } from '../js/feature-filter.js';
import { detailHtml } from '../js/feature-detail.js';
import { loadFavorites, statsHtml, toggleFavorite } from '../js/feature-favorites.js';

const fixture = JSON.parse(
  readFileSync(new URL('./fixtures/countries.json', import.meta.url), 'utf-8'),
);

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  OK     ${name}`);
  } catch (err) {
    console.error(`  GAGAL  ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

// --- Parsing + normalisasi (data fixture asli) ---
test('parseListResponse fixture: 9 negara + meta total 254', () => {
  const { countries, meta } = parseListResponse(fixture.list_response);
  assert.equal(countries.length, 9);
  assert.equal(meta.total, 254);
});

test('parseDetailResponse Indonesia: nama, ibu kota, kode, populasi', () => {
  const c = parseDetailResponse(fixture.detail_idn_response);
  assert.equal(c.name, 'Indonesia');
  assert.equal(c.capital, 'Jakarta');
  assert.equal(c.alpha3, 'IDN');
  assert.equal(c.region, 'Asia');
  assert.equal(c.population, 290125073);
});

test('normalizeCountry record kosong: default aman, bukan undefined', () => {
  const c = normalizeCountry({});
  assert.equal(c.name, 'Tanpa nama');
  assert.equal(c.population, 0);
  assert.deepEqual(c.languages, []);
  assert.equal(c.detailKey, '');
});

test('parseListResponse bentuk salah: throw', () => {
  assert.throws(() => parseListResponse({}), /Format respons/);
});

// --- URL builder ---
test('buildListUrl memuat q, region, limit, offset', () => {
  const url = buildListUrl({ q: 'indo', region: 'Asia', limit: 25, offset: 0 });
  assert.match(url, /q=indo/);
  assert.match(url, /region=Asia/);
  assert.match(url, /limit=25/);
  assert.match(url, /response_fields=/);
});

test('buildDetailUrl kode alpha-3 vs nama', () => {
  assert.match(buildDetailUrl('IDN'), /codes\.alpha_3\/IDN/);
  assert.match(buildDetailUrl('Indonesia'), /names\.common\/Indonesia/);
});

// --- Utilitas ---
test('formatNumber id-ID: 290125073 -> 290.125.073', () => {
  assert.equal(formatNumber(290125073), '290.125.073');
});

test('flagImageUrl: url_png, fallback CDN, kosong', () => {
  assert.equal(flagImageUrl({ flagPng: 'https://x/y.png', alpha2: 'ID' }), 'https://x/y.png');
  assert.equal(
    flagImageUrl({ flagPng: '', alpha2: 'ID' }),
    'https://flags.restcountries.com/v5/w320/id.png',
  );
  assert.equal(flagImageUrl({ flagPng: '', alpha2: '' }), '');
});

test('sortCountries: nama A-Z dan populasi terbanyak', () => {
  const { countries } = parseListResponse(fixture.list_response);
  const byName = sortCountries(countries, 'nama-az');
  assert.equal(byName[0].name, 'Abkhazia');
  const byPop = sortCountries(countries, 'populasi-desc');
  assert.equal(byPop[0].name, 'Algeria');
});

test('computeStats: total, dimuat, favorit', () => {
  const { countries, meta } = parseListResponse(fixture.list_response);
  const s = computeStats(meta, countries, new Set());
  assert.equal(s.total, 254);
  assert.equal(s.loaded, 9);
  assert.equal(s.favoriteCount, 0);
  assert.equal(s.mostPopulous.name, 'Algeria');
});

// --- Stub fitur: kontrak antarmuka masih ada, isi TODO ---
test('stub Fitur 1-4 mengembalikan penanda TODO', () => {
  assert.match(listHtml([], new Set()), /TODO Fitur 1/);
  assert.equal(paginationHtml({}, 0, 25), '');
  assert.match(filterBarHtml({}), /TODO Fitur 2/);
  assert.match(detailHtml({}, false), /TODO Fitur 3/);
  assert.match(statsHtml({}, false), /TODO Fitur 4/);
});

test('stub Fitur 2: konstanta region + sorting lengkap', () => {
  assert.ok(REGIONS.includes('Asia'));
  assert.ok(REGIONS.includes('Europe'));
  assert.equal(SORT_OPTIONS.length, 4);
});

test('stub Fitur 4: favorit awal kosong', () => {
  const fav = loadFavorites();
  assert.equal(fav.size, 0);
  assert.equal(toggleFavorite(fav, 'IDN').size, 0);
});

console.log(`\nHasil: ${passed} lolos`);
