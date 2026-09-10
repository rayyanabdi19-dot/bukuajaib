# BukuAjaib — Buku Tamu Digital Pernikahan Modern

Aplikasi buku tamu digital resepsi pernikahan modern dengan pencatatan tamu instan, cetak struk/label nomor meja, sinkronisasi multi-perangkat real-time, pencatatan amplop/kado, serta dukungan offline-first (PWA).

Aplikasi ini telah dikonfigurasi dan siap untuk di-deploy ke:
- **Cloudflare Pages**
- **Vercel**
- **Google Cloud Run**

---

## 🚀 Panduan Mengatasi "Missing Git Connection" & Deploy

### 1. Mengatasi Notifikasi "Missing Git Connection" di Google AI Studio
Notifikasi *"Missing Git connection"* muncul di AI Studio karena akun GitHub Anda belum terhubung atau repositori tujuan belum dipilih:

1. Di pojok kanan atas tampilan AI Studio, klik menu titik tiga `...` atau ikon **Export / Share**.
2. Pilih opsi **Export to GitHub** (atau **Connect to GitHub**).
3. Otorisasikan izin akun GitHub Anda jika diminta.
4. Buat repositori baru (misalnya `buku-ajaib-wedding`) lalu klik **Export / Push**.
5. Setelah terhubung ke GitHub, repositori Anda siap di-deploy secara otomatis ke Vercel atau Cloudflare Pages setiap kali ada pembaruan kode.

*(Alternatif: Anda juga dapat memilih **Export as ZIP**, ekstrak di komputer Anda, lalu jalankan `git remote add origin <repo-anda>` dan `git push -u origin main`).*

---

### 2. Panduan Deploy ke Vercel

Aplikasi ini sudah menyertakan file konfigurasi `vercel.json`.

1. Kunjungi [vercel.com](https://vercel.com) dan login ke akun Anda.
2. Klik tombol **Add New...** > **Project**.
3. Pilih repositori GitHub `buku-ajaib-wedding` Anda, lalu klik **Import**.
4. Pengaturan build (sudah otomatis terdeteksi):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik tombol **Deploy**.
6. Selesai! Web Anda langsung aktif dengan domain gratis `https://<nama-proyek>.vercel.app`.

---

### 3. Panduan Deploy ke Cloudflare Pages

Aplikasi ini sudah menyertakan `public/_redirects` dan `public/_headers` untuk perutean SPA (Single Page Application) dan caching optimal.

1. Buka dashboard [Cloudflare](https://dash.cloudflare.com/).
2. Di menu samping kiri, klik **Workers & Pages** > **Create application** > tab **Pages**.
3. Pilih opsi **Connect to Git** dan pilih repositori GitHub Anda.
4. Pada form **Build configuration**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Klik **Save and Deploy**.
6. Selesai! Aplikasi Anda aktif dalam hitungan detik di jaringan CDN global Cloudflare `https://<nama-proyek>.pages.dev`.

---

## 🛠️ Pengembangan Lokal (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev

# 3. Build untuk produksi
npm run build

# 4. Jalankan build produksi
npm start
```
