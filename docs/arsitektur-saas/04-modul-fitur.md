# 04 · Modul Fitur

> Detail fungsional: **Dashboard grafik**, **Aset Gereja**, **Arus Kas + Tutup Buku**, **Gaji/Honor**, **Konfigurasi Midtrans oleh Bendahara**, dan **perbaikan Landing Page**.

Frontend gereja (`gmim_manage`) sudah memakai **Vue 3 + Pinia + Chart.js + vue-chartjs + jsPDF**. Semua modul di bawah memanfaatkan stack yang sudah ada.

---

## 1. Dashboard Keuangan dengan Grafik

**Kondisi sekarang:** `DashboardKeuanganView` hanya punya `SummaryCards` + `RecentTransactions`. Tambahkan grafik.

### 1.1 Komponen grafik baru

| Komponen | Jenis | Isi |
| --- | --- | --- |
| `BarChartMingguan.vue` | Bar (grouped) | Per minggu (mis. 8 minggu terakhir): **biru = pemasukan**, **merah = pengeluaran** |
| `BarChartBulanan.vue` | Bar (grouped) | Per bulan (12 bulan): **biru = pemasukan**, **merah = pengeluaran** |
| `KasGerejaCard.vue` / `LineKas.vue` | Kartu + Line | **Kas gereja** (saldo berjalan): saldo = Σ pemasukan_counted − Σ pengeluaran |
| `KomposisiKategori.vue` (opsional) | Doughnut | Proporsi pemasukan/pengeluaran per kategori |

**Warna baku** (sesuai permintaan): pemasukan `#2563eb` (biru / `brand-600`), pengeluaran `#dc2626` (merah). Konsisten di semua chart & legend.

### 1.2 Aturan data

- Hanya pemasukan **counted** yang dihitung: `status = approved` (manual) **atau** `status = settled/approved` (midtrans). Sesuai aturan saldo yang sudah disepakati.
- Toggle periode: **Mingguan / Bulanan / Tahunan**.
- Sumber data: endpoint agregat baru `GET /gereja/{gereja}/dashboard/grafik?range=weekly|monthly` (mengembalikan label + seri pemasukan + seri pengeluaran + saldo berjalan), agar agregasi dilakukan di DB (efisien), bukan di browser.

### 1.3 Sketsa layout dashboard

```
┌───────────────────────────────────────────────────────────┐
│  [Saldo Kas]   [Pemasukan bln ini]   [Pengeluaran bln ini] │  ← SummaryCards (sudah ada)
├──────────────────────────────┬────────────────────────────┤
│  Bar Mingguan (biru/merah)   │  Kas Gereja (line saldo)    │
├──────────────────────────────┴────────────────────────────┤
│  Bar Bulanan (biru/merah, 12 bulan)                        │
├──────────────────────────────┬────────────────────────────┤
│  Komposisi Kategori (doughnut)│  Transaksi Terbaru (ada)   │
└──────────────────────────────┴────────────────────────────┘
```

---

## 2. Aset Gereja

Menu baru `Aset` (route `/g/<slug>/aset`). Tabel `aset` lihat [03 §4](./03-model-data.md#4-tabel-baru-aset-aset-gereja).

### 2.1 Halaman & fitur

| View | Fitur |
| --- | --- |
| `AsetListView` | Tabel aset (kode, nama, kategori, nilai perolehan, nilai sekarang, kondisi, lokasi), filter per kategori & kondisi, pencarian, ringkasan **total nilai aset** |
| `AsetTambahView` / `AsetEditView` | Form: nama, kategori, tanggal perolehan, nilai, lokasi, kondisi, foto bukti, keterangan; opsi "catat sebagai pengeluaran" |
| `AsetDetailView` | Detail + riwayat + (opsional) tabel penyusutan |

- **Kategori aset baku**: tanah, bangunan, kendaraan, alat musik, elektronik, inventaris, lainnya.
- **Kartu ringkas**: total aset per kategori untuk laporan kekayaan gereja.
- **Penyusutan** (opsional, fase lanjut): garis lurus dari `nilai_perolehan` & `umur_manfaat_bulan`.

### 2.2 Endpoint

`GET/POST/PUT/DELETE /gereja/{gereja}/aset` (+ `/aset/{id}`), ter-scope tenant + Global Scope.

---

## 3. Arus Kas + Tutup Buku

Menu `Arus Kas` (route `/g/<slug>/arus-kas`) — inti kebutuhan bendahara untuk **tutup buku** akhir bulan/tahun.

### 3.1 Tampilan

| Bagian | Isi |
| --- | --- |
| Ringkasan periode | Saldo awal, total pemasukan, total pengeluaran, **saldo akhir** untuk periode terpilih |
| Per **minggu** | Tabel + bar chart pemasukan/pengeluaran tiap minggu |
| Per **bulan** | Tabel 12 bulan + tren |
| Per **kategori** | Rekap pemasukan per kategori persembahan & pengeluaran per kategori (termasuk "Gaji & Honor") |
| Tutup Buku | Tombol **"Tutup Buku Bulan/Tahun"** → kunci periode (`periode_buku.status = closed`), simpan ringkasan, catat `closed_by`/`closed_at` |

### 3.2 Logika

- Arus kas **diturunkan** dari `pemasukan` (counted) + `pengeluaran` — bukan tabel baru, tabel `periode_buku` hanya menyimpan **snapshot + status closing**.
- Saat tutup buku: hitung & simpan saldo, kunci transaksi periode (edit/hapus ditolak API bila periode `closed`).
- Export PDF/Excel (jsPDF sudah ada) untuk laporan tutup buku bulanan & tahunan.

### 3.3 Endpoint

- `GET /gereja/{gereja}/arus-kas?tipe=bulanan|tahunan&periode=2026-06`
- `POST /gereja/{gereja}/tutup-buku` `{ tipe, periode }` → membuat/menutup `periode_buku`
- `POST /gereja/{gereja}/buka-buku` `{ id }` → membuka kembali (khusus Admin Gereja/Bendahara, ber-audit)

---

## 4. Gaji / Honor Pekerja Gereja

Menu `Gaji & Honor` (route `/g/<slug>/gaji`). Tabel `pegawai` + `pembayaran_gaji` lihat [03 §5](./03-model-data.md#5-tabel-baru-gajihonor).

### 4.1 Sub-fitur

| View | Fitur |
| --- | --- |
| `PegawaiListView` | Master pekerja: nama, jabatan, tipe (gaji tetap/honor), nominal default, rekening, status |
| `GajiPeriodeView` | Pilih periode (mis. bulan) → daftar pembayaran; tombol "Buat pembayaran" massal dari nominal default |
| `GajiDetailView` | Detail pembayaran; tombol **"Tandai Dibayar"** → otomatis buat `pengeluaran` kategori "Gaji & Honor" |

### 4.2 Aturan

- Saat pembayaran `status = dibayar`, sistem membuat `pengeluaran` (tautan `pengeluaran_id`) agar masuk arus kas & laporan tanpa double-input.
- (Opsional) approval: Pelayan/staf membuat draft → Bendahara/Admin Gereja menyetujui sebelum "dibayar".
- Slip gaji/honor bisa diekspor PDF per pegawai per periode.

---

## 5. Konfigurasi Midtrans oleh Bendahara

**Kondisi sekarang:** `gereja_midtrans` ada (server_key terenkripsi) + endpoint `GET /midtrans/client-key`, tetapi **belum ada** endpoint untuk Bendahara **mengisi/mengubah** key. Memori lama menyebut pengaturan key lewat `gmim_admin` saja; permintaan baru: **Bendahara bisa input sendiri**.

### 5.1 Halaman

Menu `Pengaturan → Pembayaran Online (Midtrans)` (route `/g/<slug>/pengaturan/midtrans`), akses **Bendahara/Admin Gereja**.

| Field | Perlakuan |
| --- | --- |
| `client_key` | Boleh ditampilkan/diedit |
| `server_key` | **Write-only** dari sisi UI: ditampilkan ter-mask (`••••1234`), dikirim hanya saat diubah; **tidak pernah** dikembalikan utuh oleh API |
| `merchant_id` | Opsional |
| `is_production` | Toggle Sandbox/Production |
| `is_active` | Aktif/nonaktif pembayaran online |
| Uji koneksi | Tombol "Tes Koneksi" memvalidasi key ke Midtrans tanpa menyimpan plaintext ke FE |

### 5.2 Endpoint baru

| Method | Path | Peran | Catatan |
| --- | --- | --- | --- |
| `GET` | `/gereja/{gereja}/midtrans/config` | Bendahara/Admin Gereja | Kembalikan **masked** (tanpa server_key) |
| `PUT` | `/gereja/{gereja}/midtrans/config` | Bendahara/Admin Gereja | Simpan; `server_key` di-`encrypt` cast |
| `POST` | `/gereja/{gereja}/midtrans/test` | Bendahara/Admin Gereja | Validasi key |

### 5.3 Dukungan Super Admin

Super Admin (di `gmim_admin`) tetap bisa **melihat status** konfigurasi Midtrans tiap gereja (aktif? production? terakhir diubah?) untuk membantu kendala — **tanpa** menampilkan `server_key` plaintext. Lihat [05](./05-keamanan-rbac-midtrans.md).

---

## 6. Perbaikan Landing Page (`gmim_landingpage`)

**Kondisi sekarang:** landing statis bagus, tetapi CTA hanya **"Masuk"** dan **"Hubungi via WhatsApp"** — belum mencerminkan **pendaftaran mandiri SaaS**.

### 6.1 Perubahan CTA & konten

| Area | Sekarang | Usulan |
| --- | --- | --- |
| Hero | "Masuk ke Sistem" + "Pelajari Fitur" | Tambah **"Daftar Gratis"** (utama) + **"Coba Demo"** + "Masuk" |
| Navbar | "Masuk" | "Masuk" + "Daftar" |
| Bagian Paket | sudah ada | Tiap kartu paket → tombol **"Mulai / Daftar"** → `app.gmim-keuangan.id/daftar?paket=...` |
| Alur Penggunaan | 3 langkah generik | Tambah jalur **"Daftar mandiri dalam 3 menit"** vs **"Onboarding dibantu admin"** |
| FAQ | "Hubungi WhatsApp untuk aktivasi" | Perbarui: **bisa daftar sendiri** *atau* minta bantuan admin |
| Kontak | hanya WhatsApp | Pertahankan WhatsApp untuk **onboarding dibantu**, tapi posisikan sebagai alternatif |

### 6.2 Dua jalur registrasi (jelas dipisah)

```
[ Daftar Gratis ]  → self-service (Alur C) → app.gmim-keuangan.id/daftar
[ Hubungi Admin ]  → onboarding dibantu (WhatsApp) → Super Admin buatkan
[ Coba Demo ]      → demo.gmim-keuangan.id (tanpa akun)
```

- Tautkan tombol ke `app.gmim-keuangan.id` (konsisten dengan domain final di [01](./01-arsitektur-multi-tenant.md#domain)).
- Tetap statis (HTML + Tailwind) — hanya update markup/teks/link; tidak perlu framework.

---

## 7. Ringkasan Menu Baru di `gmim_manage`

```
Sidebar gereja:
  • Dashboard            (grafik baru: bar mingguan/bulanan, kas)
  • Pemasukan            (ada)
  • Pengeluaran          (ada)
  • Aset Gereja          ← baru
  • Gaji & Honor         ← baru
  • Arus Kas             ← baru (+ Tutup Buku)
  • Laporan              (ada: mingguan, bulanan; + ekspor tutup buku)
  • Kelola Pengguna      (ada; diperluas peran)
  • Pengaturan
       └ Midtrans        ← baru (input key oleh Bendahara)
```

---

**Lanjut:** [05-keamanan-rbac-midtrans.md](./05-keamanan-rbac-midtrans.md) — isolasi, hak akses, dan keamanan key.
