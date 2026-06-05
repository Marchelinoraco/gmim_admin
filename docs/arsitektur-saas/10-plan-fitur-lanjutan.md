# 10 · Plan Fitur Lanjutan

> **Status:** Plan (belum dieksekusi) · **Disusun:** 2026-06-05 · **Revisi:** 2026-06-05 (+F-5)
> Dokumen ini merekam 5 rencana fitur berdasarkan permintaan pengguna.
> Eksekusi mengikuti prioritas yang disepakati.

---

## Ikhtisar

| # | Fitur | Komponen terpengaruh | Prioritas |
|---|-------|----------------------|-----------|
| **F-1** | Cash Basis Accounting | `pemasukan` model, form input, rekap | Tinggi |
| **F-2** | Slug otomatis + Lokasi gereja | Registrasi, `gereja` model | Sedang |
| **F-3** | Arsitektur trial → langganan berbayar | Billing, data retention | Tinggi |
| **F-4** | Menu "Transaksi Belum Diterima" | Sidebar, view baru | Sedang |
| **F-5** | Multi-Pos Kas (Tunai/Bank/Midtrans) | Model data, form, rekap, mutasi antar pos | Tinggi |
| **F-6** | Reversal / Koreksi ber-audit | `pemasukan`/`pengeluaran`/`mutasi_kas`, audit log | Tinggi |

> **F-5 erat dengan F-1.** Cash basis (F-1) menentukan *kapan* kas dihitung;
> multi-pos (F-5) menentukan *di mana* kas itu berada. Idealnya dirancang bersama.

---

## Keputusan Final (2026-06-05) — MENGIKAT

> Keputusan ini menutup ambiguitas desain sebelum implementasi. Mengikat untuk F-1…F-6.

| # | Keputusan | Konsekuensi |
|---|-----------|-------------|
| **KP-1** | **Pos kas dipilih saat KONFIRMASI diterima**, bukan saat input. | Transaksi "belum diterima" (F-1) tidak terikat pos manapun. `pos_kas_id` diisi di menu F-4 saat bendahara konfirmasi kas masuk. Form input pemasukan **tidak** punya dropdown pos; form konfirmasi (F-4) yang punya. |
| **KP-2** | **Saldo pos tidak boleh minus — tolak keras.** | Pengeluaran > saldo pos ditolak (422). Bendahara harus buat mutasi (transfer antar pos) dulu. Berlaku juga untuk pengeluaran tunai langsung. |
| **KP-3** | **Data wilayah dibatasi Sulawesi Utara.** | Provinsi terkunci "Sulawesi Utara"; user pilih kab/kota & kecamatan saja. Dataset kecil, dimuat dari backend. Filter dilepas bila ekspansi nasional. |
| **KP-4** | **Reversal/koreksi ber-audit masuk scope (F-6).** | Tidak ada hard-delete diam-diam untuk transaksi keuangan. Koreksi = entry pembalik yang tercatat di audit. Lihat F-6. |

### Catatan teknis yang mengikat (tutup gap)

- **Pengeluaran selalu pilih pos saat input** (beda dari pemasukan) — uang keluar pasti dari pos yang sudah ada saldonya. Dropdown pos + tampil saldo, divalidasi KP-2.
- **Tutup buku menyimpan saldo SEMUA pos** sebagai snapshot akhir periode; saldo awal periode berikutnya = saldo akhir tiap pos (bukan satu angka global).
- **Backfill migrasi cerdas:** pemasukan `sumber=midtrans` + `settled` → pos **Midtrans**; sisanya → pos **Tunai**.
- **Tenant isolation wajib:** `pos_kas` & `mutasi_kas` memakai trait `BelongsToGereja` + masuk uji isolasi CI (sama seperti tabel finance lain).
- **Feature flag** `multi_pos_kas` agar F-1+F-5 bisa diaktifkan bertahap per gereja & mudah di-rollback.

---

## F-1 · Cash Basis Accounting

### Latar Belakang

Kondisi nyata di gereja: penatua mengumpulkan persembahan saat ibadah kolom,
lalu **menyerahkan ke bendahara beberapa hari kemudian**. Dengan pendekatan saat ini,
semua pemasukan yang `approved` langsung dihitung ke saldo — padahal uang fisiknya
belum ada di tangan bendahara.

**Cash basis** mensyaratkan: transaksi baru masuk ke saldo ketika kas **benar-benar
berpindah tangan** (diterima atau dikeluarkan secara fisik).

### Perubahan Model Data

```sql
-- Tambah ke tabel pemasukan
ALTER TABLE pemasukan ADD COLUMN
  status_kas ENUM('sudah_diterima','belum_diterima')
  NOT NULL DEFAULT 'sudah_diterima';

ALTER TABLE pemasukan ADD COLUMN
  tanggal_diterima DATE NULL;

-- Tambah ke tabel pengeluaran
ALTER TABLE pengeluaran ADD COLUMN
  status_kas ENUM('sudah_dikeluarkan','belum_dikeluarkan')
  NOT NULL DEFAULT 'sudah_dikeluarkan';

ALTER TABLE pengeluaran ADD COLUMN
  tanggal_dikeluarkan DATE NULL;
```

> `DEFAULT 'sudah_diterima'` agar data lama tidak terpengaruh — semua transaksi
> lama diasumsikan sudah diterima secara fisik.

### Aturan Saldo Cash Basis

```
Saldo kas = Σ pemasukan (status=approved/settled AND status_kas=sudah_diterima)
          − Σ pengeluaran (status_kas=sudah_dikeluarkan)
```

| Kondisi | Masuk saldo? |
|---------|-------------|
| Pemasukan approved + sudah_diterima | ✓ Ya |
| Pemasukan approved + **belum_diterima** | ✗ Tidak (dicatat tapi belum kas) |
| Pemasukan pending | ✗ Tidak (belum disetujui) |
| Pengeluaran + sudah_dikeluarkan | ✓ Dikurangkan |
| Pengeluaran + **belum_dikeluarkan** | ✗ Tidak dikurangkan |

### Perubahan Form Input Pemasukan

Tambah **satu toggle** di `FormPemasukanManual.vue`:

```
┌─────────────────────────────────────────────┐
│  Status Penerimaan Kas                       │
│  ● Uang sudah diterima bendahara             │
│  ○ Uang belum diterima (catat dulu)          │
└─────────────────────────────────────────────┘
```

- Default: **sudah diterima** (alur normal)
- Jika "belum diterima": `tanggal_diterima = null`
- Bendahara dapat **konfirmasi penerimaan** dari menu F-4 (Transaksi Belum Diterima)
  → `status_kas = 'sudah_diterima'`, `tanggal_diterima = hari ini`

### Perubahan List & Rekap

- **Daftar Pemasukan**: tambah kolom "Kas" dengan badge "Diterima" (hijau) / "Belum" (kuning)
- **Filter TabelPemasukan**: tambah chip filter status kas di samping filter status approval
- **Rekap Mingguan/Bulanan**: hanya hitung `status_kas = 'sudah_diterima'`
- **Dashboard summary**: saldo mengikuti aturan cash basis
- **Arus Kas**: tampilkan dua angka — "Dicatat" vs "Kas Masuk Nyata"

### Migration Laravel

```php
// File: 2026_06_XX_000001_add_status_kas_to_pemasukan_pengeluaran.php
Schema::table('pemasukan', function (Blueprint $table) {
    $table->enum('status_kas', ['sudah_diterima', 'belum_diterima'])
          ->default('sudah_diterima')->after('status');
    $table->date('tanggal_diterima')->nullable()->after('status_kas');
});

Schema::table('pengeluaran', function (Blueprint $table) {
    $table->enum('status_kas', ['sudah_dikeluarkan', 'belum_dikeluarkan'])
          ->default('sudah_dikeluarkan')->after('keterangan');
    $table->date('tanggal_dikeluarkan')->nullable()->after('status_kas');
});
```

---

## F-2 · Slug Otomatis + Lokasi Gereja

### Latar Belakang

Dua gereja bisa bernama sama di kecamatan berbeda (mis. "GMIM Sion" di Tomohon
dan "GMIM Sion" di Manado). Slug manual rawan duplikat. Solusi: **slug dibangkitkan
otomatis** dari kombinasi nama gereja + kode wilayah + ID pendek, sehingga unik
secara struktural.

Selain itu, lokasi gereja (provinsi/kab/kecamatan) berguna untuk:
- Filtering oleh Super Admin
- Pengelompokan gereja per wilayah di dashboard admin
- Verifikasi bahwa gereja memang GMIM (wilayah Sulawesi Utara)

### Perubahan Model Data

```sql
ALTER TABLE gereja ADD COLUMN provinsi      VARCHAR(100) NULL;
ALTER TABLE gereja ADD COLUMN kabupaten_kota VARCHAR(100) NULL;
ALTER TABLE gereja ADD COLUMN kecamatan     VARCHAR(100) NULL;
-- slug tetap ada, tapi sekarang di-generate otomatis, tidak diisi user
```

### Aturan Generate Slug

```
slug = {nama_gereja_slugified}-{kode_kecamatan}-{6char_ulid}

Contoh:
  Nama gereja   : "GMIM Sion Tomohon"
  Kecamatan     : "tomohon-tengah"
  ULID 6 char   : "a3k9m2"
  → slug        : "sion-tomohon-tengah-a3k9m2"

Contoh konflik (nama sama, kecamatan sama):
  Nama gereja   : "GMIM Sion Tomohon"  (ke-2)
  → slug        : "sion-tomohon-tengah-b7x1n9"  (ULID berbeda → tetap unik)
```

**Fungsi slugify:**
```
1. Ambil kata bermakna dari nama (hilangkan "GMIM", "Gereja", "Jemaat")
2. Lowercase + replace spasi → "-"
3. Hilangkan karakter non-alphanumeric
4. Concat kecamatan-slug + "-" + 6 karakter dari Str::ulid()
```

### Perubahan Frontend (RegisterView)

**Hapus** field "Alamat Gereja (slug)" dari tampilan UI.

**Tambah** 2 dropdown cascade (Provinsi terkunci — KP-3):

```
┌────────────────────────────────────┐
│  Provinsi   : Sulawesi Utara (tetap)│  ← terkunci, tidak bisa diubah
│  Kabupaten/Kota *    [dropdown ▼]  │  ← pilihan kab/kota di Sulut
│  Kecamatan *         [dropdown ▼]  │  ← aktif setelah kab/kota dipilih
└────────────────────────────────────┘
  Slug dibuat otomatis — tidak ditampilkan ke user.
```

**Data wilayah (KP-3 — dibatasi Sulut):** ambil subset Sulawesi Utara dari
[`cahyadsn/wilayah`](https://github.com/cahyadsn/wilayah), simpan sebagai seed di
backend (tabel `wilayah` atau JSON kecil ~50KB). Endpoint:
- `GET /wilayah/kabupaten` → daftar kab/kota Sulut
- `GET /wilayah/kecamatan?kabupaten=` → kecamatan per kab/kota

Jauh lebih ringan dari load 3MB JSON nasional. Filter Sulut dilepas bila ekspansi.

### Perubahan Backend (AuthController::register)

```php
// Slug tidak lagi dari request, dibangkitkan di server
$slugBase = Str::slug(
    preg_replace('/\b(GMIM|Gereja|Jemaat)\b/i', '', $validated['namaGereja'])
);
$kecamatanSlug = Str::slug($validated['kecamatan']);
$shortId       = strtolower(substr(Str::ulid(), -6));

$slug = "{$slugBase}-{$kecamatanSlug}-{$shortId}";

// Validasi tetap: slug harus unik di DB (sangat kecil kemungkinan collision)
while (Gereja::where('slug', $slug)->exists()) {
    $slug = "{$slugBase}-{$kecamatanSlug}-" . strtolower(substr(Str::ulid(), -6));
}
```

**Request payload registrasi** berubah:
```json
{
  "namaGereja": "GMIM Sion Tomohon",
  "provinsi":   "Sulawesi Utara",
  "kabupatenKota": "Kota Tomohon",
  "kecamatan":  "Tomohon Tengah",
  "nama": "Yohanes Manoppo",
  "email": "y@gmim.app",
  "password": "..."
}
```

---

## F-3 · Arsitektur Trial → Langganan Berbayar (Data Preservation)

### Prinsip

> **Data tidak pernah hilang karena status langganan.** Upgrade = bayar dan lanjut,
> bukan daftar ulang.

### State Machine Lengkap

```
[Daftar Gratis]
       │
       ▼
   trial (14 hari) ──────────────────────── bayar ──► active
       │                                                  │
  trial habis                                        jatuh tempo
       │                                                  │
       ▼                                                  ▼
   expired ◄──── grace 7 hari ──── past_due ──── bayar ──► active
       │
  data tetap ada (read-only), tidak dihapus
       │
  [Upgrade: buat tagihan → bayar → active]
       │
       ▼
   active (data lama tetap, lanjut dari mana berhenti)
```

### Yang Dijamin Tersimpan Saat Trial Berakhir

| Data | Perilaku |
|------|----------|
| Pemasukan & pengeluaran | Tetap ada, read-only |
| Kategori persembahan/pengeluaran | Tetap ada |
| Aset & pegawai | Tetap ada |
| Konfigurasi Midtrans | Tetap ada |
| Akun pengguna | Tetap aktif (bisa login, tapi hanya read) |
| Slug & URL gereja | **Tidak berubah** — `/g/sion-tomohon-tengah-a3k9m2` tetap sama |

### Alur Upgrade dari Expired → Active

```
1. User login → redirect ke /g/{slug}/billing (karena expired, 402 dari API)
2. Billing page tampilkan pilihan paket
3. User pilih paket → POST /gereja/{g}/langganan/checkout
4. Tagihan dibuat → Midtrans Snap token (akun platform)
5. User bayar → webhook → langganan.status = 'active'
6. Akses penuh kembali — semua data lama terbuka
7. Dashboard langsung menampilkan riwayat transaksi sebelumnya
```

### Tidak Perlu Subdomain Sekarang (KF-2)

Path `/g/{slug}` sudah cukup sebagai identitas workspace gereja.
Slug tidak berubah saat upgrade → URL tidak berubah → bookmark/link tetap valid.

Subdomain (`sion-tomohon-tengah-a3k9m2.gmim-keuangan.id`) adalah Fase 7 yang
ditunda. Saat subdomain diaktifkan kelak, slug yang sama digunakan sebagai
subdomain prefix — tidak ada migrasi data.

### Retention Policy (Hard Delete)

```
expired > 90 hari tanpa pembayaran
    → kirim email "Data akan dihapus dalam 30 hari"
expired > 120 hari
    → soft delete semua transaksi (deleted_at diisi)
expired > 365 hari
    → hard delete (GDPR/UU PDP compliance)
```

Job: `EksporDataTenantJob` dikirim sebelum hard delete → email link download.

---

## F-4 · Menu "Transaksi Belum Diterima"

### Posisi di Sidebar

```
LAPORAN
  ├── Arus Kas
  ├── Rekap Mingguan
  ├── Rekap Bulanan
  └── Belum Diterima  ← baru (di bawah Rekap Bulanan)
```

Badge counter merah di sidebar jika ada transaksi belum diterima (mirip badge Persetujuan).

### Isi Halaman

Halaman `TransaksiBelumDiterimaView.vue` menampilkan dua tabel:

**Tabel 1 — Pemasukan belum diterima:**

| Tanggal catat | Kategori | Nama Persembahan | Jumlah | Dicatat oleh | Aksi |
|---------------|----------|------------------|--------|--------------|------|
| 05/06/2026 | Persembahan Kolom | Kolom 1 | Rp 200.000 | Pnt. Markus | [✓ Konfirmasi Terima] |

**Tabel 2 — Pengeluaran belum dikeluarkan:**

| Tanggal rencana | Kategori | Jumlah | Keterangan | Aksi |
|-----------------|----------|--------|------------|------|
| 07/06/2026 | Operasional | Rp 500.000 | Beli ATK | [✓ Konfirmasi Keluar] |

**Tombol "Konfirmasi Terima/Keluar":**
- Muncul popup: "Konfirmasi penerimaan kas Rp 200.000 — tanggal diterima: [date picker]"
- Klik OK → `PATCH /gereja/{g}/pemasukan/{id}/konfirmasi-kas` → `status_kas = 'sudah_diterima'`, `tanggal_diterima = req.tanggal`
- Transaksi hilang dari daftar ini → masuk ke saldo kas

### Summary di Atas Tabel

```
┌────────────────┬───────────────────────┐
│ Belum masuk kas│  Rp X.XXX.XXX         │  ← total pemasukan belum diterima
│ Belum keluar kas│ Rp X.XXX.XXX         │  ← total pengeluaran belum dikeluarkan
│ Posisi kas nyata│ Rp X.XXX.XXX         │  ← saldo cash basis saat ini
└────────────────┴───────────────────────┘
```

### Endpoint Baru

| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/gereja/{g}/transaksi-pending-kas` | List pemasukan + pengeluaran yang belum kas |
| `PATCH` | `/gereja/{g}/pemasukan/{id}/konfirmasi-kas` | Tandai pemasukan sudah diterima |
| `PATCH` | `/gereja/{g}/pengeluaran/{id}/konfirmasi-kas` | Tandai pengeluaran sudah dikeluarkan |

---

## F-5 · Multi-Pos Kas (Tunai / Bank / Midtrans)

### Latar Belakang

Bendahara gereja tidak memegang satu kantong uang — ada **3 pos kas** yang berbeda:

| Pos | Bentuk | Contoh |
|-----|--------|--------|
| **Tunai** | Uang fisik di tangan/brankas bendahara | Persembahan kolom yang baru disetor |
| **Rekening Bank** | Saldo di rekening gereja | BSG (Bank Sulut Go) |
| **Midtrans** | Saldo pembayaran online sebelum dicairkan | Persembahan via QRIS/transfer online |

Saat ini sistem hanya tahu "total saldo" tanpa tahu **di mana** uang berada. Padahal
bendahara perlu tahu: berapa tunai yang ada, berapa di rekening, berapa di Midtrans
yang belum dicairkan. Ini krusial untuk rekonsiliasi dan transparansi.

### Konsep Inti

```
┌─────────────────────────────────────────────────────────┐
│  Saldo Total Gereja = Σ saldo semua pos                 │
│                                                          │
│  ┌──────────┐   ┌──────────────┐   ┌──────────────┐     │
│  │  Tunai   │   │ Rekening BSG │   │  Midtrans    │     │
│  │ Rp 2 jt  │   │  Rp 15 jt    │   │  Rp 800 rb   │     │
│  └──────────┘   └──────────────┘   └──────────────┘     │
│       ▲                ▲                  ▲              │
│   pemasukan/       pemasukan/         pemasukan          │
│   pengeluaran      pengeluaran        online (settled)   │
│   tunai            transfer           ↓ dicairkan        │
│       └──── transfer antar pos ───────┘ ke rekening      │
└─────────────────────────────────────────────────────────┘
```

### Perubahan Model Data

**Tabel baru `pos_kas`:**

```php
Schema::create('pos_kas', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('gereja_id');
    $table->string('nama');                    // "Tunai", "Rekening BSG", "Midtrans"
    $table->enum('tipe', ['tunai', 'bank', 'midtrans']);
    $table->string('nama_bank')->nullable();   // "Bank Sulut Go"
    $table->string('nomor_rekening')->nullable();
    $table->bigInteger('saldo_awal')->default(0); // saldo saat gereja mulai pakai sistem
    $table->boolean('is_aktif')->default(true);
    $table->unsignedSmallInteger('urutan')->default(0);
    $table->timestamps();
    $table->foreign('gereja_id')->references('id')->on('gereja')->cascadeOnDelete();
});
```

**Tambah kolom ke `pemasukan` dan `pengeluaran`:**

```php
$table->string('pos_kas_id')->nullable()->after('gereja_id');
$table->foreign('pos_kas_id')->references('id')->on('pos_kas')->nullOnDelete();
```

> `nullable` agar data lama tidak rusak. Migrasi data lama: assign ke pos "Tunai"
> default (`UPDATE pemasukan SET pos_kas_id = <id-tunai> WHERE pos_kas_id IS NULL`).

**Tabel baru `mutasi_kas` (transfer antar pos):**

```php
Schema::create('mutasi_kas', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('gereja_id');
    $table->date('tanggal');
    $table->string('pos_asal_id');       // dari pos mana
    $table->string('pos_tujuan_id');     // ke pos mana
    $table->bigInteger('jumlah');
    $table->bigInteger('biaya_admin')->default(0); // biaya transfer/admin bank
    $table->text('keterangan')->nullable();
    $table->string('dicatat_oleh')->nullable();
    $table->timestamps();
    $table->foreign('gereja_id')->references('id')->on('gereja')->cascadeOnDelete();
    $table->foreign('pos_asal_id')->references('id')->on('pos_kas');
    $table->foreign('pos_tujuan_id')->references('id')->on('pos_kas');
});
```

### Kenapa Transfer Antar Pos TERPISAH dari Pemasukan/Pengeluaran?

> **Ini keputusan arsitektur paling penting di F-5.**

Transfer antar pos (mis. tarik tunai dari rekening) **tidak mengubah total kas gereja** —
uang hanya pindah tempat. Jika dicatat sebagai pengeluaran + pemasukan biasa, akan
**double-count** di rekap dan merusak laporan.

| Jenis | Saldo total gereja | Saldo pos |
|-------|-------------------|-----------|
| Pemasukan | **Naik** | Pos tujuan naik |
| Pengeluaran | **Turun** | Pos asal turun |
| **Mutasi (transfer)** | **Tetap** | Pos asal turun, pos tujuan naik |
| Mutasi + biaya admin | Turun sebesar biaya | Asal turun (jumlah+biaya), tujuan naik (jumlah) |

### Rumus Saldo per Pos

```
Saldo pos X = saldo_awal(X)
            + Σ pemasukan   (pos_kas_id = X, status_kas = sudah_diterima)    [F-1]
            − Σ pengeluaran (pos_kas_id = X, status_kas = sudah_dikeluarkan) [F-1]
            + Σ mutasi_masuk  (pos_tujuan_id = X)
            − Σ mutasi_keluar (pos_asal_id = X, termasuk biaya_admin)
```

### Saldo Awal Saat Registrasi (Onboarding)

Saat gereja mendaftar, seed 3 pos default + minta saldo awal:

```
Langkah onboarding tambahan (setelah daftar):
┌────────────────────────────────────────────────┐
│  Saldo Kas Awal Gereja                          │
│  (kondisi kas saat mulai pakai sistem ini)      │
│                                                  │
│  💵 Tunai di tangan      : Rp [______]          │
│  🏦 Rekening BSG          : Rp [______]          │
│  📱 Midtrans (jika ada)   : Rp [______]          │
│                                                  │
│  [ Lewati ]            [ Simpan Saldo Awal ]    │
└────────────────────────────────────────────────┘
```

Saldo awal ini menjadi titik nol akuntansi — semua transaksi sesudahnya dihitung
dari sini. Bisa dilewati (default 0) dan diisi belakangan dari menu pengaturan pos.

### Perubahan Form Input (sesuai KP-1)

**Form Pemasukan — TIDAK ada dropdown pos.** Pos baru dipilih saat konfirmasi
diterima (di menu F-4), karena transaksi bisa berstatus "belum diterima" yang belum
terikat pos manapun. Pengecualian: pemasukan via **Midtrans online** otomatis
terikat pos Midtrans saat `settled` (uang memang masuk ke saldo Midtrans).

**Form Konfirmasi Terima (F-4) — di sinilah pos dipilih:**

```
┌─────────────────────────────────────────┐
│  Konfirmasi kas masuk — Rp 200.000       │
│  Tanggal diterima : [__/__/____]         │
│  Masuk ke pos *    :                      │
│    ● 💵 Tunai                            │
│    ○ 🏦 Rekening BSG                      │
│    ○ 📱 Midtrans                         │
└─────────────────────────────────────────┘
```

**Form Pengeluaran — pilih pos saat input** (uang keluar pasti dari pos yang sudah ada saldonya):

```
┌─────────────────────────────────────────┐
│  Ambil dari pos kas *                    │
│  ● 💵 Tunai          (saldo: Rp 2 jt)    │
│  ○ 🏦 Rekening BSG   (saldo: Rp 15 jt)   │
│  ○ 📱 Midtrans       (saldo: Rp 800 rb)  │
└─────────────────────────────────────────┘
```

> Tampilkan saldo tiap pos. **KP-2: tolak keras** jika jumlah > saldo pos (HTTP 422) —
> bendahara harus buat mutasi (transfer antar pos) dulu.

### Form Mutasi Antar Pos (Baru)

```
┌─────────────────────────────────────────────┐
│  Transfer / Mutasi Antar Pos                 │
│                                              │
│  Dari pos *   : [🏦 Rekening BSG      ▼]    │
│  Ke pos *     : [💵 Tunai             ▼]    │
│  Jumlah *     : Rp [_______]                 │
│  Biaya admin  : Rp [_______] (opsional)      │
│  Tanggal *    : [__/__/____]                 │
│  Keterangan   : [Tarik tunai untuk operasional] │
│                                              │
│              [ Batal ]   [ Simpan Mutasi ]   │
└─────────────────────────────────────────────┘
```

### Menu Baru: Rekap Arus Kas per Pos

Posisi sidebar (di bawah Arus Kas yang sudah ada):

```
LAPORAN
  ├── Arus Kas
  ├── Arus Kas per Pos  ← baru
  ├── Rekap Mingguan
  ├── Rekap Bulanan
  └── Belum Diterima    (F-4)
```

**Isi halaman `ArusKasPerPosView.vue`:**

Kartu ringkasan tiap pos + tabel mutasi:

```
┌──────────────┬──────────────┬──────────────┐
│  💵 Tunai     │ 🏦 Rek. BSG  │ 📱 Midtrans  │
│  Rp 2.000.000 │ Rp 15.000.000│ Rp 800.000   │
│  ───────────  │ ───────────  │ ───────────  │
│  Awal: 1 jt   │ Awal: 10 jt  │ Awal: 0      │
│  Masuk:+5 jt  │ Masuk:+8 jt  │ Masuk:+2 jt  │
│  Keluar:-4 jt │ Keluar:-3 jt │ Cair: -1.2jt │
└──────────────┴──────────────┴──────────────┘

[ Pilih pos: ▼ ]  [ Periode: ▼ ]

Riwayat Pergerakan Pos "Rekening BSG":
┌────────────┬─────────────────────┬─────────┬─────────┬──────────┐
│  Tanggal   │  Keterangan          │  Masuk  │  Keluar │  Saldo   │
├────────────┼─────────────────────┼─────────┼─────────┼──────────┤
│ 01/06/2026 │ Saldo awal           │  10 jt  │    —    │  10 jt   │
│ 03/06/2026 │ Persembahan transfer │  8 jt   │    —    │  18 jt   │
│ 05/06/2026 │ → Tarik tunai (mutasi)│   —     │  3 jt   │  15 jt   │
└────────────┴─────────────────────┴─────────┴─────────┴──────────┘
```

### Skenario: Tarik Uang dari Rekening untuk Pengeluaran Tunai

Inilah kasus yang user minta di-handle, langkah demi langkah:

```
Kondisi awal:  Rekening BSG = Rp 15 jt,  Tunai = Rp 2 jt

Langkah 1 — Bendahara buat MUTASI:
  Dari: Rekening BSG  →  Ke: Tunai
  Jumlah: Rp 5 jt,  Biaya admin: Rp 6.500
  ┌─────────────────────────────────────────┐
  │ Rekening BSG : 15 jt − 5 jt − 6.5rb     │
  │             = Rp 9.993.500              │
  │ Tunai        : 2 jt + 5 jt = Rp 7 jt     │
  │ Total gereja : turun Rp 6.500 (biaya)   │  ← hanya biaya admin yang hilang
  └─────────────────────────────────────────┘

Langkah 2 — Bendahara buat PENGELUARAN dari pos Tunai:
  Beli material renovasi: Rp 4 jt, dari pos Tunai
  ┌─────────────────────────────────────────┐
  │ Tunai        : 7 jt − 4 jt = Rp 3 jt     │
  │ Total gereja : turun Rp 4 jt (nyata)    │
  └─────────────────────────────────────────┘

Hasil akhir:  Rekening = Rp 9.993.500,  Tunai = Rp 3 jt
Setiap pergerakan ter-track:  mutasi (1 baris) + pengeluaran (1 baris)
Audit jelas: uang dari rekening → tunai → material renovasi.
```

### Integrasi Midtrans (Settlement / Pencairan)

Uang di pos Midtrans tidak permanen di sana — Midtrans **mencairkan** ke rekening
bank gereja (biasanya T+1/T+2). Ini juga **mutasi**:

```
Pencairan Midtrans:  Midtrans → Rekening BSG
  Jumlah: Rp 800rb,  Biaya Midtrans: Rp 5rb (MDR)
  → Midtrans turun 800rb,  Rekening naik 795rb,  total turun 5rb (biaya)
```

Opsi: pencairan ini bisa **otomatis dicatat** saat webhook Midtrans `settlement`
diterima, atau dicatat manual oleh bendahara. Rekomendasi MVP: **manual** dulu
(bendahara catat saat lihat dana masuk rekening), otomatis menyusul.

### Endpoint Baru

| Method | Path | Deskripsi |
|--------|------|-----------|
| `GET` | `/gereja/{g}/pos-kas` | List pos + saldo terkini tiap pos |
| `POST` | `/gereja/{g}/pos-kas` | Tambah pos (mis. rekening bank kedua) |
| `PUT` | `/gereja/{g}/pos-kas/{id}` | Edit pos / saldo awal |
| `GET` | `/gereja/{g}/mutasi-kas` | List mutasi antar pos |
| `POST` | `/gereja/{g}/mutasi-kas` | Buat transfer antar pos |
| `GET` | `/gereja/{g}/arus-kas-pos?pos_id=&periode=` | Rekap pergerakan satu pos |

### Dampak ke Fitur Lain

- **Dashboard**: tambah breakdown saldo per pos (3 mini-card di bawah summary saldo)
- **Arus Kas (existing)**: tetap tampilkan total; tambah tab/filter per pos
- **Rekap Mingguan/Bulanan**: opsional tambah kolom pos
- **Export CSV**: tambah kolom `pos_kas` di pemasukan & pengeluaran; export mutasi terpisah

---

## F-6 · Reversal / Koreksi Ber-Audit (KP-4)

### Prinsip

> **Tidak ada hard-delete diam-diam untuk transaksi keuangan.** Koreksi dilakukan
> dengan **entry pembalik** (reversal) yang tercatat di audit — bukan menghapus jejak.
> Ini syarat agar laporan bisa dipertanggungjawabkan ke jemaat & majelis.

### Mekanisme

Setiap pemasukan/pengeluaran/mutasi mendapat dua kolom:

```php
$table->string('reversed_by')->nullable();   // id entry pembalik
$table->string('reverses')->nullable();       // id transaksi yang dibalik
$table->text('alasan_koreksi')->nullable();
```

**Alur koreksi:**

```
Transaksi asli (Rp 200.000) tetap ada, ditandai "dikoreksi"
        │
        ▼
Entry pembalik otomatis (−Rp 200.000) → nilai netto = 0
        │
        ▼
(Opsional) Transaksi pengganti dibuat dengan nilai benar
```

- Saldo & rekap menghitung **netto** (asli + pembalik). Yang dikoreksi → 0.
- Audit log mencatat: siapa mengoreksi, kapan, alasan.
- Transaksi yang sudah masuk **periode tertutup** (tutup buku) tidak bisa dikoreksi
  langsung — koreksi masuk ke periode berjalan (sesuai prinsip akuntansi).

### UI

- Daftar Pemasukan/Pengeluaran: tombol "Koreksi" (ganti "Hapus" untuk transaksi
  yang sudah dihitung ke kas). Hapus hanya untuk transaksi yang belum diterima/pending.
- Modal koreksi: tampilkan nilai asli + input alasan wajib.
- Badge "Dikoreksi" pada transaksi yang sudah dibalik.

### Endpoint

| Method | Path | Deskripsi |
|--------|------|-----------|
| `POST` | `/gereja/{g}/pemasukan/{id}/koreksi` | Buat entry pembalik + alasan |
| `POST` | `/gereja/{g}/pengeluaran/{id}/koreksi` | Buat entry pembalik + alasan |
| `POST` | `/gereja/{g}/mutasi-kas/{id}/koreksi` | Balik transfer antar pos |

---

## Urutan Eksekusi yang Disarankan

```
[Paket 1: migrasi besar, feature flag multi_pos_kas]
F-1 (Cash Basis) + F-5 (Multi-Pos Kas) + F-6 (Reversal)
        └→ F-4 (Belum Diterima — pilih pos saat konfirmasi, KP-1)
              └→ F-2 (Slug + wilayah Sulut)
                    └→ F-3 (retention, sisa)
```

**Alasan urutan:**
- **F-1 + F-5 + F-6 satu paket migrasi** — ketiganya menyentuh `pemasukan`/`pengeluaran`
  & rumus saldo. Satu kali ubah skema, di belakang feature flag `multi_pos_kas`.
- **F-4 setelah paket 1** — di sinilah pos dipilih (KP-1) saat konfirmasi terima.
- **F-2** independen, bisa kapan saja.
- **F-3** sebagian besar sudah berjalan; sisa job retention + email.

> **Migration gabungan (paket 1):** satu migration menambah `status_kas`,
> `tanggal_diterima`, `pos_kas_id`, `reversed_by`, `reverses`, `alasan_koreksi`
> + tabel `pos_kas` & `mutasi_kas`. Satu seeder: 3 pos default/gereja + backfill cerdas
> (midtrans→pos Midtrans, sisanya→Tunai). Semua tabel baru pakai `BelongsToGereja`
> + masuk uji isolasi CI. Aktivasi via flag `multi_pos_kas` per gereja.

---

**Lanjut:** [06-roadmap-implementasi.md](./06-roadmap-implementasi.md) untuk posisi
fitur-fitur ini dalam fase keseluruhan.
