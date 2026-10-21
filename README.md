# Peta CCTV Bandar Lampung

Peta interaktif lokasi CCTV Kota Bandar Lampung dengan live streaming, memakai data terbuka
**Seribu Wajah** (Diskominfo Kota Bandar Lampung).

Live: https://benbask.github.io/cctv-bdl/

## Cara kerja

1. Daftar kamera diambil saat halaman dibuka dari API publik Seribu Wajah:
   `GET https://api-newseribuwajah.bandarlampungkota.go.id/cctvs` (header `x-api-key`).
   Data berisi nama, kategori, alamat, koordinat, status, dan `streamUrl`.
2. Marker digambar di Leaflet (di-cluster agar 260+ titik tetap ringan).
3. Saat marker diklik, stream HLS `https://seribuwajah.bandarlampungkota.go.id/cctv_<id>/index.m3u8`
   diputar lewat [hls.js](https://github.com/video-dev/hls.js) di panel overlay.

Tidak ada proses build: satu file `index.html`, langsung di-deploy ke GitHub Pages
lewat `.github/workflows/static.yml`.

## Catatan soal sumber stream

- Angka `cctv_<id>` pada URL stream = `id` kamera dari API.
- Server stream memakai *cookie challenge* (`?cookieCheck=1`), jadi hls.js dikonfigurasi
  dengan `xhrSetup: xhr => xhr.withCredentials = true`.
- Halaman pemutar resmi mereka dilindungi `Content-Security-Policy: frame-ancestors`,
  sehingga **tidak bisa** di-iframe. Karena itu stream diputar sendiri dengan hls.js.
- Host `stream-newseribuwajah...` (host asli di field `streamUrl`) menolak akses langsung
  dengan `401`, jadi selalu pakai path `cctv_<id>/index.m3u8` di host utama.

## Menjalankan lokal

```bash
# dari folder ini
python -m http.server 8080
# buka http://localhost:8080
```

Halaman harus dibuka lewat `http://` (bukan `file://`) agar cookie challenge dan
permintaan lintas-origin berjalan normal.

## Memperbarui data kamera

```bash
node scripts/fetch-cameras.js
```

Script ini mengambil ulang daftar kamera dari API dan menimpa `cameras.json`.
Jalankan setiap kali ada kamera baru / berubah, lalu commit hasilnya.

## Deploy

GitHub Pages repo ini memakai *Deploy from a branch* (`main` / root), jadi setiap
push otomatis menerbitkan ulang situs. Workflow `static.yml` disediakan sebagai
alternatif deploy manual (Actions → "Deploy static content to Pages" → Run workflow).
