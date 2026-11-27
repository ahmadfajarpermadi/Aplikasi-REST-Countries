// Fitur 3 — Halaman Detail Negara (branch feature/halaman-detail)
// Dikerjakan oleh: Muhammad Dzulhilmi
import { escapeHtml, formatNumber, formatAreaKm, flagImageUrl } from './utils.js';

function formatLanguages(languages) {
  if (!Array.isArray(languages) || languages.length === 0) return '-';
  return languages
    .map((l) => {
      const name = escapeHtml(l.name);
      const native = l.nativeName && l.nativeName !== l.name
        ? ` <span class="muted">(${escapeHtml(l.nativeName)})</span>`
        : '';
      return `${name}${native}`;
    })
    .join(', ');
}

function formatCurrencies(currencies) {
  if (!Array.isArray(currencies) || currencies.length === 0) return '-';
  return currencies
    .map((c) => {
      const name = escapeHtml(c.name || c.code);
      const code = c.code ? ` (${escapeHtml(c.code)})` : '';
      const symbol = c.symbol ? ` — <strong>${escapeHtml(c.symbol)}</strong>` : '';
      return `${name}${code}${symbol}`;
    })
    .join(', ');
}

function formatBorders(borders) {
  if (!Array.isArray(borders) || borders.length === 0) {
    return '<span class="muted">Tidak ada (negara kepulauan / terisolasi)</span>';
  }
  return borders
    .map((code) => {
      const safeCode = escapeHtml(code);
      return `<a href="#/detail/${encodeURIComponent(code)}" class="chip border-link" data-detail-key="${safeCode}" title="Lihat detail ${safeCode}">${safeCode}</a>`;
    })
    .join('');
}

export function detailHtml(country, isFavorite = false) {
  if (!country) {
    return `
      <a href="#/" class="back" id="detail-back-btn">← Kembali ke Daftar Negara</a>
      <p class="empty">Data detail negara tidak ditemukan.</p>
    `;
  }

  const flagSrc = flagImageUrl(country);
  const flagEl = flagSrc
    ? `<img src="${escapeHtml(flagSrc)}" alt="Bendera ${escapeHtml(country.name)}" class="detail-flag">`
    : `<div class="detail-flag detail-flag--empty">${escapeHtml(country.emoji || '🏳️')}</div>`;

  const favClass = isFavorite ? 'fav-btn is-fav' : 'fav-btn';
  const favText = isFavorite ? '★ Tersimpan di Favorit' : '☆ Tambah ke Favorit';

  const capitalsText = Array.isArray(country.capitals) && country.capitals.length > 0
    ? escapeHtml(country.capitals.join(', '))
    : escapeHtml(country.capital || '-');

  const timezonesText = Array.isArray(country.timezones) && country.timezones.length > 0
    ? escapeHtml(country.timezones.join(', '))
    : '-';

  const continentsText = Array.isArray(country.continents) && country.continents.length > 0
    ? escapeHtml(country.continents.join(', '))
    : '-';

  const callingCodesText = Array.isArray(country.callingCodes) && country.callingCodes.length > 0
    ? escapeHtml(country.callingCodes.join(', '))
    : '-';

  const codeDisplay = [country.alpha2, country.alpha3].filter(Boolean).map(escapeHtml).join(' / ') || '-';

  return `
    <section class="detail-view">
      <a href="#/" class="back" id="detail-back-btn">← Kembali ke Daftar Negara</a>

      <div class="detail">
        ${flagEl}
        <div style="flex: 1; min-width: 240px;">
          <h2>${escapeHtml(country.name)}</h2>
          ${country.officialName ? `<p class="muted" style="margin: 0 0 0.5rem;">${escapeHtml(country.officialName)}</p>` : ''}
          <p style="margin: 0.25rem 0;">
            <strong>Kode ISO:</strong> ${codeDisplay}
            ${country.region ? ` &bull; <strong>Region:</strong> ${escapeHtml(country.region)}` : ''}
            ${country.subregion ? ` (${escapeHtml(country.subregion)})` : ''}
          </p>
          <button type="button" class="${favClass}" id="detail-fav-btn" data-detail-key="${escapeHtml(country.detailKey)}">
            ${favText}
          </button>
        </div>
      </div>

      ${country.flagDescription ? `<p class="muted" style="margin-top: 0.8rem; font-size: 0.92rem;"><strong>Deskripsi Bendera:</strong> ${escapeHtml(country.flagDescription)}</p>` : ''}

      <table class="facts" aria-label="Informasi Detail ${escapeHtml(country.name)}">
        <tbody>
          <tr>
            <th>Ibu Kota</th>
            <td>${capitalsText}</td>
          </tr>
          <tr>
            <th>Populasi</th>
            <td>${formatNumber(country.population)} jiwa</td>
          </tr>
          <tr>
            <th>Luas Wilayah</th>
            <td>${formatAreaKm(country.areaKm)}</td>
          </tr>
          <tr>
            <th>Bahasa</th>
            <td>${formatLanguages(country.languages)}</td>
          </tr>
          <tr>
            <th>Mata Uang</th>
            <td>${formatCurrencies(country.currencies)}</td>
          </tr>
          <tr>
            <th>Benua</th>
            <td>${continentsText}</td>
          </tr>
          <tr>
            <th>Zona Waktu</th>
            <td>${timezonesText}</td>
          </tr>
          <tr>
            <th>Kode Telepon</th>
            <td>${callingCodesText}</td>
          </tr>
          <tr>
            <th>Negara Tetangga</th>
            <td>${formatBorders(country.borders)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}