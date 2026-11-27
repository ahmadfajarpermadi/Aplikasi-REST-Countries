// Uji kerangka awal: plumbing + Fitur 2 (Filter Region & Sorting).
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
import {
  filterBarHtml,
  filterCountriesByRegion,
  applyFilterAndSort,
  REGIONS,
  SORT_OPTIONS,
} from '../js/feature-filter.js';
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

// --- Stub fitur lain yang masih dikerjakan tim ---
test('stub Fitur 1, 3, 4 mengembalikan penanda TODO', () => {
  assert.match(listHtml([], new Set()), /TODO Fitur 1/);
  assert.equal(paginationHtml({}, 0, 25), '');
  assert.match(detailHtml({}, false), /TODO Fitur 3/);
  assert.match(statsHtml({}, false), /TODO Fitur 4/);
});

// --- Fitur 2: Filter Region & Sorting (Johannes Rivano) ---
test('Fitur 2: konstanta region & sort options lengkap', () => {
  assert.ok(REGIONS.includes('Asia'));
  assert.ok(REGIONS.includes('Europe'));
  assert.ok(REGIONS.includes('Africa'));
  assert.ok(REGIONS.includes('Americas'));
  assert.ok(REGIONS.includes('Oceania'));
  assert.ok(REGIONS.includes('Antarctic'));
  assert.equal(SORT_OPTIONS.length, 4);
});

test('Fitur 2: filterBarHtml menghasilkan select region dan select sorting lengkap', () => {
  const html = filterBarHtml();
  assert.ok(html.includes('id="filter-region"'));
  assert.ok(html.includes('id="sort-select"'));
  assert.ok(html.includes('Semua Region'));
  for (const reg of REGIONS) {
    assert.ok(html.includes(`value="${reg}"`));
  }
  for (const opt of SORT_OPTIONS) {
    assert.ok(html.includes(`value="${opt.value}"`));
  }
});

test('Fitur 2: filterBarHtml menandai opsi terpilih sesuai state & menampilkan reset', () => {
  const html = filterBarHtml({ region: 'Asia', sort: 'populasi-desc' });
  assert.ok(html.includes('value="Asia" selected'));
  assert.ok(html.includes('value="populasi-desc" selected'));
  assert.ok(html.includes('id="filter-reset-btn"'));
});

test('Fitur 2: filterCountriesByRegion memfilter daftar berdasarkan region', () => {
  const sample = [
    { name: 'Indonesia', region: 'Asia' },
    { name: 'Jepang', region: 'Asia' },
    { name: 'Jerman', region: 'Europe' },
  ];
  const asia = filterCountriesByRegion(sample, 'Asia');
  assert.equal(asia.length, 2);
  const europe = filterCountriesByRegion(sample, 'Europe');
  assert.equal(europe.length, 1);
  assert.equal(europe[0].name, 'Jerman');
  const all = filterCountriesByRegion(sample, '');
  assert.equal(all.length, 3);
});

test('Fitur 2: applyFilterAndSort memfilter dan mengurutkan secara berurutan', () => {
  const sample = [
    { name: 'Vietnam', region: 'Asia', population: 98000000 },
    { name: 'Indonesia', region: 'Asia', population: 275000000 },
    { name: 'Prancis', region: 'Europe', population: 67000000 },
  ];
  const res = applyFilterAndSort(sample, { region: 'Asia', sort: 'nama-az' });
  assert.equal(res.length, 2);
  assert.equal(res[0].name, 'Indonesia');
  assert.equal(res[1].name, 'Vietnam');

  const resPop = applyFilterAndSort(sample, { region: 'Asia', sort: 'populasi-desc' });
  assert.equal(resPop[0].name, 'Indonesia');
  assert.equal(resPop[1].name, 'Vietnam');
});

test('stub Fitur 4: favorit awal kosong', () => {
  const fav = loadFavorites();
  assert.equal(fav.size, 0);
  assert.equal(toggleFavorite(fav, 'IDN').size, 0);
});

console.log(`\nHasil: ${passed} lolos`);
