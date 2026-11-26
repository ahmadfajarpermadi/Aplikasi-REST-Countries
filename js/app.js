// Bootstrap aplikasi: Jelajah Negara — REST Client
// Mengintegrasikan Fitur 2 (Filter Region & Sorting oleh Johannes Rivano)
// Dilengkapi Pagination lengkap (menjelajah seluruh 254 negara per halaman)
import { fetchCountryList, hasRealKey, isDemoMode, PAGE_SIZE } from './api.js';
import { filterBarHtml, sortCountries } from './feature-filter.js';
import { flagImageUrl, formatNumber, escapeHtml } from './utils.js';

const view = document.getElementById('view');
const statusEl = document.getElementById('status');

const state = {
  region: '',
  sort: 'nama-az',
  limit: 24,
  offset: 0,
  loading: false,
  countries: [],
  meta: { total: 0, count: 0, limit: 24, offset: 0, more: false },
};

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

function countryCardHtml(c) {
  const flagSrc = flagImageUrl(c);
  const flagEl = flagSrc
    ? `<img src="${escapeHtml(flagSrc)}" alt="Bendera ${escapeHtml(c.name)}" class="card-flag" loading="lazy">`
    : `<div class="card-flag card-flag--empty">${escapeHtml(c.emoji || '🏳️')}</div>`;

  return `
    <article class="card">
      ${flagEl}
      <div class="card-content">
        <h3 style="margin: 0.6rem 0 0.3rem; font-size: 1.05rem;">${escapeHtml(c.name)}</h3>
        <p class="card-meta"><strong>Region:</strong> ${escapeHtml(c.region || '-')}</p>
        <p class="card-meta"><strong>Ibu kota:</strong> ${escapeHtml(c.capital || '-')}</p>
        <p class="card-meta"><strong>Populasi:</strong> ${formatNumber(c.population)} jiwa</p>
      </div>
    </article>
  `;
}

function renderPaginationHtml(meta, offset, limit) {
  const total = meta && typeof meta.total === 'number' ? meta.total : 0;
  if (total <= limit) return '';

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  const startItem = offset + 1;
  const endItem = Math.min(offset + limit, total);

  // Buat tombol nomor halaman (maksimal 5 nomor di sekitar halaman aktif)
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';

  const pageButtons = pages.map((p) => {
    const isActive = p === currentPage ? 'class="page-btn is-active" aria-current="page"' : 'class="page-btn"';
    return `<button type="button" ${isActive} data-page="${p}">${p}</button>`;
  }).join('');

  return `
    <nav class="pagination" aria-label="Navigasi Halaman Negara">
      <div class="pagination-info">
        Menampilkan <strong>${startItem}–${endItem}</strong> dari <strong>${total}</strong> negara
        (Halaman <strong>${currentPage}</strong> dari <strong>${totalPages}</strong>)
      </div>
      <div class="pagination-controls">
        <button type="button" class="pagination-btn" id="pagination-prev" data-page="${currentPage - 1}" ${prevDisabled} title="Halaman sebelumnya">
          ◀ Sebelumnya
        </button>
        <div class="pagination-pages">
          ${pageButtons}
        </div>
        <button type="button" class="pagination-btn" id="pagination-next" data-page="${currentPage + 1}" ${nextDisabled} title="Halaman berikutnya">
          Berikutnya ▶
        </button>
      </div>
    </nav>
  `;
}

function renderUI() {
  const sorted = sortCountries(state.countries, state.sort);
  const filterHtml = filterBarHtml(state);
  const paginationHtmlContent = renderPaginationHtml(state.meta, state.offset, state.limit);

  const total = state.meta && typeof state.meta.total === 'number' ? state.meta.total : sorted.length;
  const regionInfo = state.region
    ? `di region <strong>${escapeHtml(state.region)}</strong>`
    : 'di semua region';

  const currentPage = Math.floor(state.offset / state.limit) + 1;
  const totalPages = Math.ceil(total / state.limit) || 1;

  const infoBadge = `
    <div class="filter-info-badge">
      <span>
        Total <strong>${total}</strong> negara ${regionInfo}
        ${total > state.limit ? `— Halaman <strong>${currentPage}/${totalPages}</strong>` : ''}
      </span>
      <span style="font-size: 0.85rem; color: #55606e;">${isDemoMode() ? 'Mode Demo' : 'Live API'}</span>
    </div>
  `;

  const cardsHtml = sorted.length > 0
    ? `<div class="grid">${sorted.map(countryCardHtml).join('')}</div>`
    : `<p class="empty">Tidak ada negara yang ditemukan untuk filter ini.</p>`;

  view.innerHTML = `
    <div class="feature-badge" style="margin-bottom: 0.75rem; font-size: 0.85rem; color: #55606e;">
    <strong>Fitur 2 Aktif:</strong> Filter Region &amp; Sorting (oleh Johannes Rivano)
    </div>
    ${filterHtml}
    ${infoBadge}
    ${cardsHtml}
    ${paginationHtmlContent}
  `;

  attachEvents();
}

function attachEvents() {
  const regionSelect = document.getElementById('filter-region');
  const sortSelect = document.getElementById('sort-select');
  const resetBtn = document.getElementById('filter-reset-btn');

  if (regionSelect) {
    regionSelect.addEventListener('change', (e) => {
      state.region = e.target.value;
      state.offset = 0; // Reset ke halaman 1 saat region diubah
      loadData();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      renderUI();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.region = '';
      state.sort = 'nama-az';
      state.offset = 0; // Reset ke halaman 1
      loadData();
    });
  }

  // Event listener tombol-tombol pagination
  const paginationControls = document.querySelector('.pagination-controls');
  if (paginationControls) {
    paginationControls.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-page]');
      if (!btn || btn.disabled) return;

      const targetPage = Number(btn.getAttribute('data-page'));
      const currentPage = Math.floor(state.offset / state.limit) + 1;
      if (!targetPage || targetPage === currentPage) return;

      state.offset = (targetPage - 1) * state.limit;
      loadData();

      // Scroll halus ke atas menuju container view
      const viewEl = document.getElementById('view');
      if (viewEl) {
        window.scrollTo({
          top: viewEl.getBoundingClientRect().top + window.scrollY - 20,
          behavior: 'smooth',
        });
      }
    });
  }
}

async function loadData() {
  statusEl.textContent = 'Memuat data negara…';
  statusEl.classList.remove('status--error');
  try {
    const params = { limit: state.limit, offset: state.offset };
    if (state.region) params.region = state.region;

    const res = await fetchCountryList(params);
    state.countries = res.countries || [];
    state.meta = res.meta || { total: state.countries.length, count: state.countries.length, limit: state.limit, offset: state.offset };
    statusEl.textContent = '';
    renderUI();
  } catch (err) {
    statusEl.textContent = `Gagal memuat data: ${err.message}`;
    statusEl.classList.add('status--error');
  }
}

if (!hasRealKey() && !isDemoMode()) {
  view.innerHTML = setupNoticeHtml();
} else {
  loadData();
}
