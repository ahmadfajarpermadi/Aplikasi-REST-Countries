# Jelajah Negara — REST Client (KERANGKA AWAL)

Kerangka awal (init project) aplikasi web untuk menjelajah data 254 negara
memakai [REST Countries API v5](https://restcountries.com/). Dibuat untuk
tugas **Git Workflow & GitHub Projects** (dosen: Rudy Eko Prasetya, M.Kom.).

> Ini HANYA kerangka. Empat fitur di bawah masih TODO dan dikerjakan tim
> di branch masing-masing. Jangan kerjakan fitur orang lain.

Teknologi: **HTML + CSS + JavaScript vanilla saja** — tanpa build step,
tanpa framework, tanpa dependensi. Cukup jalankan lewat server lokal.

## Yang sudah ada (plumbing)

- `js/api.js` — klien API v5 + normalisasi respons + mode demo (`?demo=1`).
- `js/utils.js` — format angka, sorting, URL bendera.
- `js/config.example.js` — contoh konfigurasi key.
- `js/app.js` — bootstrap minimal: membuktikan koneksi API lalu menampilkan
  daftar tugas tim.
- `tests/fixtures/countries.json` — data contoh asli (9 negara + Indonesia)
  untuk uji tanpa key.

## Yang masih TODO (dikerjakan tim)

| # | Fitur | File | Branch |
|---|-------|------|--------|
| 1 | Daftar semua negara + pencarian nama (`?q=`) + pagination (`limit`/`offset`) | `js/feature-list.js` | `feature/daftar-pencarian` |
| 2 | Filter berdasarkan region + sorting (nama A–Z/Z–A, populasi) | `js/feature-filter.js` | `feature/filter-sorting` |
| 3 | Halaman detail negara (bendera, ibu kota, bahasa, mata uang, populasi, luas, zona waktu, negara tetangga) | `js/feature-detail.js` | `feature/halaman-detail` |
| 4 | Favorit (localStorage) + statistik ringkas (total, terpadat) | `js/feature-favorites.js` | `feature/favorit-statistik` |

Tiap file fitur berisi komentar TODO + kontrak antarmuka (nama fungsi yang
dipakai `app.js`). Isi implementasinya, jangan ubah nama fungsinya.

## Cara menjalankan

```bash
# 1. Salin contoh konfigurasi, lalu isi API key (lihat bawah)
cp js/config.example.js js/config.js

# 2. Jalankan server lokal dari folder ini
python3 -m http.server 8000

# 3. Buka http://localhost:8000/
```

Tanpa key, aplikasi menampilkan petunjuk penyiapan. Untuk mencoba tanpa
key, buka `http://localhost:8000/?demo=1` — mode demo memakai data contoh
dari `tests/fixtures/countries.json` (bukan data live).

## Cara mengisi API key

REST Countries v5 butuh API key (paket gratis: 1.000 request/bulan,
rate limit 20 request/10 detik).

1. Daftar gratis di <https://restcountries.com/>.
2. Di halaman **API Keys**, salin key Anda.
3. Di halaman yang sama, tambahkan `localhost` ke daftar hostname yang
   diizinkan — kalau tidak, browser memblokir panggilan API (CORS).
4. Isi key ke `js/config.js` (hasil salinan `js/config.example.js`).
5. **Jangan pernah commit `js/config.js`** — file itu sudah ada di
   `.gitignore`. Tiap anggota tim memakai key-nya sendiri.

## Struktur folder

```
.
├── index.html                  # Halaman utama
├── css/style.css               # Gaya
├── js/
│   ├── config.example.js       # Contoh konfigurasi (disalin ke config.js)
│   ├── api.js                  # Klien API v5 + normalisasi + mode demo
│   ├── utils.js                # Format angka, sorting, URL bendera
│   ├── feature-list.js         # TODO Fitur 1: daftar + cari + pagination
│   ├── feature-filter.js       # TODO Fitur 2: filter region + sorting
│   ├── feature-detail.js       # TODO Fitur 3: halaman detail negara
│   ├── feature-favorites.js    # TODO Fitur 4: favorit + statistik
│   └── app.js                  # Bootstrap kerangka (cek koneksi + daftar tugas)
├── package.json                # type: module + script check/test/start
└── tests/
    ├── download-fixture.py     # Pengunduh fixture (pakai konektor, tanpa key di file)
    ├── fixtures/countries.json # Data uji asli: 9 negara + Indonesia
    └── test-logic.mjs          # Uji plumbing kerangka (node tests/test-logic.mjs)
```

## Pengujian

```bash
npm run check   # node --check semua file JS
npm test        # uji plumbing kerangka — 13 uji, semua harus lolos
```

Uji mencakup: parsing + normalisasi respons (fixture asli), URL builder,
utilitas (format angka, URL bendera, sorting, statistik), dan kontrak
antarmuka stub fitur. Uji fitur 1-4 ditulis tim masing-masing saat
mengerjakan fiturnya.

## Catatan API (terverifikasi 25 Nov 2026)

- Base URL: `https://api.restcountries.com`, endpoint `GET /countries/v5`
  (list), `GET /countries/v5?q=teks` (cari), `GET /countries/v5?region=…`
  (filter), `GET /countries/v5/codes.alpha_3/IDN` (detail).
- Respons: `data.objects` (array negara) + `data.meta`
  (`total` 254, `count`, `limit`, `offset`, `more`).
- API **tidak** menyediakan parameter sort — pengurutan dilakukan di sisi
  klien (lihat docs "Sort order").
- Versi lama v1–v4 sudah dimatikan; bangun hanya dengan v5.
- Bendera: `flag.url_png` dari API, fallback ke Flag CDN gratis
  `https://flags.restcountries.com/v5/w320/{alpha_2}.png`.
- Field detail terverifikasi dari data asli (bukan karangan): `languages[]`
  `{name, native_name}`, `currencies[]` `{code, name, symbol}`, `borders[]`
  (kode alpha-3), `area.kilometers`, `timezones[]`, `capitals[]` `{name}`.
- Paket gratis tidak mengembalikan `leaders` (hanya ada di paket berbayar).

## Tim (usulan — sesuaikan dengan kesepakatan tim)

Repo: <https://github.com/ahmadfajarpermadi/Aplikasi-REST-Countries>

| Anggota | Peran | Fitur | Branch |
|---------|-------|-------|--------|
| Permadi (`ahmadfajarpermadi`) | Maintainer (ketua tim, pemilik repo) | Setup repo, Projects + Issues, lindungi `main`, review + merge PR; Fitur 4 — favorit + statistik | `feature/favorit-statistik` |
| Muhammad Dzulhilmi (`MuhammadDzulhilmi`) | Developer | Fitur 3 — halaman detail | `feature/halaman-detail` |
| Johannes Rivano (`JohannesRivanoFF`) | Developer | Fitur 2 — filter region + sorting | `feature/filter-sorting` |
| Muhammad Elfanda (`Muhammad-Elfanda`) | Developer | Fitur 1 — daftar + pencarian | `feature/daftar-pencarian` |

Dosen (`rudyekoprasetya`) diundang sebagai collaborator.

Catatan: tiap anggota **wajib** mengerjakan minimal 1 fitur dan commit
dari akun GitHub-nya sendiri — riwayat commit dan Pull Request dipakai
dosen untuk menilai kontribusi individu. Jangan commit atas nama orang lain.

### Alur GitHub Flow (sesuai materi)

1. Maintainer: buat repo → undang semua anggota + dosen sebagai
   collaborator → Settings → Branches → tambah rule untuk `main`
   (centang "Require a pull request before merging").
2. Maintainer: buat Issues (satu per fitur) → Projects → papan Kanban
   (To Do → In Progress → In Review → Done) → masukkan Issues ke To Do.
3. Developer: `git checkout main && git pull origin main` → pindah kartu
   ke In Progress → `git checkout -b feature/nama-fitur` → kerja →
   `git add . && git commit -m "..." && git push origin feature/nama-fitur`.
4. Developer: buka Pull Request, tautkan Issue (`Closes #1`), minta review.
5. Maintainer: review di tab Files changed → Approve → Merge
   (pilih "Squash and merge" supaya histori rapi). Kartu pindah ke Done.
6. Konflik merge: tarik `main` terbaru ke branch (`git pull origin main`),
   hapus penanda `<<<<`/`====`/`>>>>` secara manual, `git add .`,
   `git commit`, `git push` — PR otomatis ter-update.

## Yang masih kurang / perlu dari tim

- [ ] Undang semua anggota + dosen `rudyekoprasetya` sebagai collaborator
      sejak awal pengerjaan.
- [ ] Lindungi branch `main` (Require a pull request before merging).
- [ ] Buat 4 Issues (satu per fitur) + papan Kanban di Projects.
- [ ] Tiap anggota memakai API key REST Countries-nya sendiri di
      `js/config.js` lokal (jangan saling tukar key, jangan commit key).
- [ ] **Video demo** aplikasi yang sedang berjalan (syarat pengumpulan
      bersama link repo).
