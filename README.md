# 🛡️ Sistem Pelayanan NSN - Puskod Baranahan Kemhan

Sistem informasi terintegrasi untuk proses kodifikasi materiil pertahanan (NSN) di **Pusat Kodifikasi, Baranahan, Kementerian Pertahanan RI**. Dirancang untuk meningkatkan transparansi dan kecepatan proses kodifikasi secara digital.

---

## 🚀 Fitur Utama

* **Real-time Monitoring:** Pantau progres kodifikasi via timeline transparan bagi Mitra dan Petugas.
* **Role-Based Access Control (RBAC):** Proteksi akses ketat untuk Admin, Kataloger, Valtakod, dan Mitra.
* **Automated Excel Extraction:** Fitur otomatisasi pembacaan data materiil langsung dari file Excel.
* **Operational Dashboard:** Monitoring antrean berkas dan beban kerja petugas secara real-time.
* **Audit Kinerja Pegawai:** Rekam jejak aktivitas digital setiap personil Puskod berdasarkan log sistem.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router & Turbopack)
* **Database:** Oracle Database XE 21c (via Docker)
* **Containerization:** Docker & Docker Compose
* **Security:** JWT (jose), BcryptJS
* **Styling:** Tailwind CSS

---

## ⚙️ Panduan Setup Local (Docker Workflow)

Proyek ini menggunakan Docker untuk manajemen database Oracle. Ikuti langkah berikut untuk memulai:

### 1. Konfigurasi Environment
Buat file `.env` di root folder proyek dan sesuaikan dengan kredensial yang ada di `docker-compose.yml`:

```env
# Database Configuration
DB_USER=system
DB_PASSWORD=PasswordPuskod123
DB_CONNECTION_STRING=localhost:1521/xe

# Security
JWT_SECRET=rahasia_puskod_kemhan_2026

# Application Path
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Jalankan Kontainer Database
Pastikan Docker Desktop Anda sudah aktif, lalu jalankan:

```bash
docker-compose up
```
> **Catatan:** Pada penggunaan pertama, tunggu 1-2 menit hingga Oracle selesai melakukan inisialisasi internal.

### 3. Instalasi Dependensi Lokal
Instal paket Node.js yang dibutuhkan:

```bash
npm install
```

### 4. Menjalankan Aplikasi
Jalankan server pengembangan:

```bash
npm run dev
```
Aplikasi akan tersedia di http://localhost:3000.

---

## 📂 Struktur Penting

* `src/app`: Routing dan Server Components.
* `src/components`: Komponen UI (TrackRecord, Modals, Form).
* `src/app/auth-actions.ts`: Kumpulan Server Actions untuk logika database.
* `public/uploads/results`: Lokasi penyimpanan file PDF (Sertifikat, BA, Kontrak).
* `public/uploads/permohonan`: Lokasi penyimpanan file upload awal pendaftaran permohonan.

---

## 📝 Troubleshooting

Jika mengalami error **"Failed to fetch"** saat upload file besar, pastikan Anda telah menaikkan `bodySizeLimit` di file `next.config.ts`.

---
© 2026 Pusat Kodifikasi - Kemhan RI