// Bootstrap kerangka awal: hanya membuktikan koneksi API bekerja,
// lalu menampilkan daftar tugas tim. Fitur 1-4 masih TODO di file masing-masing.
import { fetchCountryList, hasRealKey, isDemoMode } from './api.js';

const view = document.getElementById('view');
const statusEl = document.getElementById('status');

function setupNoticeHtml() {
  return `
  <section class="notice">
    <h2>API key belum diisi</h2>
    <p>Aplikasi ini memakai REST Countries API v5 yang butuh API key.</p>
    <ol>
      <li>Daftar gratis di <a href="https://restcountries.com/">restcountries.com</a> dan salin API key dari halaman API Keys.</li>
      <li>Di halaman API Keys, tambahkan <code>localhost</code> ke daftar hostname yang diizinkan.</li>
      <li>Salin <code>js/config.example.js</code> menjadi <code>js/config.js</code> lalu isi key Anda di sana.</li>
      <li>Muat ulang halaman ini.</li>
    </ol>
    <p>Atau coba dulu tanpa key: <a href="?demo=1">mode demo (data contoh 10 negara)</a>.</p>
  </section>`;
}

function skeletonHtml(total) {
  return `
  <section class="notice">
    <h2>Kerangka awal siap</h2>
    <p>API terhubung. Total negara di dataset: <strong>${total}</strong>.</p>
    <p>Ini baru kerangka (init project). Empat fitur di bawah masih TODO dan dikerjakan tim di branch masing-masing:</p>
    <ol>
      <li><strong>Fitur 1 — Daftar + pencarian</strong> (<code>js/feature-list.js</code>, branch <code>feature/daftar-pencarian</code>)</li>
      <li><strong>Fitur 2 — Filter region + sorting</strong> (<code>js/feature-filter.js</code>, branch <code>feature/filter-sorting</code>)</li>
      <li><strong>Fitur 3 — Halaman detail</strong> (<code>js/feature-detail.js</code>, branch <code>feature/halaman-detail</code>)</li>
      <li><strong>Fitur 4 — Favorit + statistik</strong> (<code>js/feature-favorites.js</code>, branch <code>feature/favorit-statistik</code>)</li>
    </ol>
    <p>Lihat <code>README.md</code> untuk pembagian kerja dan alur GitHub Flow.</p>
  </section>`;
}

async function checkConnection() {
  statusEl.textContent = 'Menghubungkan ke REST Countries API…';
  try {
    const { meta } = await fetchCountryList({ limit: 1, offset: 0 });
    statusEl.textContent = '';
    view.innerHTML = skeletonHtml(meta.total);
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.classList.add('status--error');
  }
}

if (!hasRealKey() && !isDemoMode()) {
  view.innerHTML = setupNoticeHtml();
} else {
  checkConnection();
}
