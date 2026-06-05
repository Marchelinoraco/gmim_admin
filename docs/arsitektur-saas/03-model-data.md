# 03 · Model Data

> Skema yang sudah ada di `gmim_api`, perubahan yang diperlukan, dan tabel baru untuk **Aset**, **Gaji/Honor**, **Tutup Buku**, serta **Audit**. Semua tabel ber-`gereja_id` (single DB multi-tenant).

---

## 1. Skema Saat Ini (di `gmim_api`)

| Tabel | Kolom utama | Catatan |
| --- | --- | --- |
| `gereja` | `id` (string PK), `nama`, `alamat`, timestamps | **Minim** — belum ada subdomain/langganan |
| `church_users` | `id`, `gereja_id`, `nama`, `role`, `username`, `password` | role: `Bendahara`/`Pelayan Khusus`; unik `(gereja_id, username)`; pakai Sanctum |
| `kategori_persembahan` | `id`, `gereja_id`, `nama` | unik `(gereja_id, nama)` |
| `nama_persembahan` | `id`, `gereja_id`, `kategori_persembahan_id`, `nama` | |
| `pemasukan` | `id`, `gereja_id`, `tanggal`, `kategori_persembahan_id`, `nama_persembahan_id`, `jumlah`, `keterangan`, **`sumber`** (manual/midtrans), **`status`** (pending/approved/rejected), **`bukti_gambar`**, **`input_by`**, **`approved_by`**, **`approved_at`**, **`rejected_reason`**, softDeletes | kolom approval & midtrans sudah ditambahkan |
| `kategori_pengeluaran` | `id`, `gereja_id`, `nama` | unik `(gereja_id, nama)` |
| `pengeluaran` | `id`, `gereja_id`, `tanggal`, `kategori_pengeluaran_id`, `jumlah`, `keterangan` | |
| `gereja_midtrans` | `gereja_id` (PK), `server_key` (enkripsi), `client_key`, `merchant_id`, `is_production`, `is_active` | key per gereja |
| `personal_access_tokens` | (Sanctum) | |

> Konvensi: PK string (mis. ULID/UUID/`g-001`), `gereja_id` FK `cascadeOnDelete`, index `(gereja_id, tanggal)` & `(gereja_id, status)`.

---

## 2. Perubahan pada Tabel `gereja` (perluasan)

Untuk SaaS multi-tenant + manajemen domain + langganan, perluas `gereja`:

```php
Schema::table('gereja', function (Blueprint $table) {
    $table->string('slug')->unique()->after('nama');     // path tenant: /g/<slug> (KF-2)
    $table->string('subdomain')->nullable();             // disiapkan untuk masa depan (ditunda)
    $table->string('nama_pendeta')->nullable();
    $table->string('telepon')->nullable();
    $table->string('email')->nullable();

    // Cache status untuk tampilan cepat — SUMBER KEBENARAN ada di tabel `langganan` (lihat 08)
    $table->string('status_langganan')->default('trial');// cache: trial|active|past_due|expired
    $table->date('bergabung_pada')->nullable();

    $table->softDeletes();
});
```

> - **`slug`** (path-based, KF-2) menggantikan peran `subdomain` untuk MVP; `subdomain` disiapkan tapi belum dipakai.
> - Detail langganan (`paket`, `berakhir`, tagihan) **dinormalkan** ke tabel `langganan`/`tagihan` di [08](./08-langganan-billing.md); `gereja.status_langganan` hanya cache.
> - Field ini selaras dengan `dummyGereja` di UI `gmim_admin` sehingga UI admin tinggal disambungkan ke API.

---

## 3. Perubahan pada `church_users` (identitas = modul di `gmim_api`)

> **Keputusan final KF-2 (modular monolith):** identitas **tetap di `gmim_api`** (tidak ada `gmim_sso` terpisah). `church_users` jadi tabel user + keanggotaan gereja, dengan **email unik global** sebagai kunci "login tanpa pilih gereja". Token = **Sanctum**. Kolom `sso_user_id` disiapkan **opsional** agar mudah diekstrak ke SSO kelak ([07](./07-sso-identitas.md)).

```php
Schema::table('church_users', function (Blueprint $table) {
    $table->string('email')->nullable()->after('nama');  // identitas login GLOBAL (Alur A)
    $table->string('telepon')->nullable();
    $table->string('status')->default('active');         // active | disabled
    $table->timestamp('login_terakhir')->nullable();
    $table->string('sso_user_id')->nullable()->index();  // KOSONG untuk sekarang; diisi saat ekstraksi SSO
    $table->softDeletes();
    $table->unique('email');                             // email unik global → login by email
    // `password` TETAP di sini (Sanctum). Pindah ke SSO hanya saat/ jika diekstrak nanti.
});
```

- **`role`** diperluas nilainya: `admin_gereja`, `bendahara`, `pelayan_khusus`, `viewer`. (Super Admin terpisah di `platform_admins`, §8.)
- **Anti-duplikasi user** sudah tercapai: satu DB, `email` unik global → satu identitas. Asumsi MVP **1 user = 1 gereja** (`church_users.gereja_id`).
- **Jalur upgrade ke SSO** (masa depan): pindahkan kredensial ke `gmim_sso.users`, isi `sso_user_id`, ganti Sanctum → validasi JWT. Tidak mengubah relasi data lain.

---

## 4. Tabel Baru: `aset` (Aset Gereja)

```php
Schema::create('aset', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('gereja_id');
    $table->string('kode')->nullable();                 // kode inventaris
    $table->string('nama');
    $table->string('kategori');                          // tanah | bangunan | kendaraan | alat_musik | elektronik | inventaris | lainnya
    $table->date('tanggal_perolehan')->nullable();
    $table->unsignedBigInteger('nilai_perolehan')->default(0);
    $table->unsignedBigInteger('nilai_sekarang')->nullable();   // setelah penyusutan (opsional)
    $table->string('metode_penyusutan')->nullable();     // none | garis_lurus
    $table->unsignedInteger('umur_manfaat_bulan')->nullable();
    $table->string('lokasi')->nullable();
    $table->string('kondisi')->default('baik');          // baik | rusak_ringan | rusak_berat | dihapus
    $table->string('bukti_gambar')->nullable();
    $table->text('keterangan')->nullable();
    $table->timestamps();
    $table->softDeletes();
    $table->foreign('gereja_id')->references('id')->on('gereja')->cascadeOnDelete();
    $table->index(['gereja_id', 'kategori']);
});
```

- **Tujuan:** inventarisasi aset (tanah, bangunan, kendaraan, alat musik/elektronik, inventaris) agar pengelolaan rapi dan siap audit.
- **Penyusutan opsional**: jika `metode_penyusutan = garis_lurus`, `nilai_sekarang` dihitung dari `nilai_perolehan`, `umur_manfaat_bulan`, dan usia aset. Untuk MVP boleh hanya pencatatan (tanpa penyusutan otomatis).
- **Keterkaitan dengan kas:** pembelian aset dapat sekaligus tercatat sebagai `pengeluaran` (kategori "Aset/Inventaris") — relasi opsional `pengeluaran_id`.

---

## 5. Tabel Baru: Gaji/Honor

Dua tabel: master pegawai dan transaksi pembayaran.

```php
Schema::create('pegawai', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('gereja_id');
    $table->string('nama');
    $table->string('jabatan')->nullable();               // mis. Pemusik, Pembersih, Operator, Sekretariat
    $table->string('tipe')->default('honor');            // gaji_tetap | honor
    $table->unsignedBigInteger('nominal_default')->default(0);
    $table->string('no_rekening')->nullable();
    $table->string('bank')->nullable();
    $table->string('status')->default('active');         // active | nonaktif
    $table->text('keterangan')->nullable();
    $table->timestamps();
    $table->softDeletes();
    $table->foreign('gereja_id')->references('id')->on('gereja')->cascadeOnDelete();
});

Schema::create('pembayaran_gaji', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('gereja_id');
    $table->string('pegawai_id');
    $table->string('periode');                           // "2026-06" (bulanan) atau tanggal kegiatan (honor)
    $table->date('tanggal_bayar');
    $table->unsignedBigInteger('nominal');
    $table->string('status')->default('pending');        // pending | dibayar
    $table->string('pengeluaran_id')->nullable();        // tautan ke transaksi pengeluaran saat dibayar
    $table->string('input_by')->nullable();
    $table->string('approved_by')->nullable();
    $table->text('keterangan')->nullable();
    $table->timestamps();
    $table->softDeletes();
    $table->foreign('gereja_id')->references('id')->on('gereja')->cascadeOnDelete();
    $table->foreign('pegawai_id')->references('id')->on('pegawai')->restrictOnDelete();
    $table->index(['gereja_id', 'periode']);
});
```

- **Alur:** buat/realisasi pembayaran gaji/honor → saat `status = dibayar`, **otomatis membuat baris `pengeluaran`** berkategori "Gaji & Honor" (tautan `pengeluaran_id`). Dengan begitu gaji ikut terhitung di arus kas & laporan tanpa pencatatan ganda.

---

## 6. Tabel Baru: `periode_buku` (Tutup Buku / Closing)

Mendukung tutup buku akhir bulan/tahun yang Anda minta.

```php
Schema::create('periode_buku', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('gereja_id');
    $table->string('tipe');                              // bulanan | tahunan
    $table->string('periode');                           // "2026-06" | "2026"
    $table->unsignedBigInteger('saldo_awal')->default(0);
    $table->unsignedBigInteger('total_pemasukan')->default(0);
    $table->unsignedBigInteger('total_pengeluaran')->default(0);
    $table->unsignedBigInteger('saldo_akhir')->default(0);
    $table->string('status')->default('open');           // open | closed
    $table->string('closed_by')->nullable();
    $table->timestamp('closed_at')->nullable();
    $table->text('catatan')->nullable();
    $table->timestamps();
    $table->foreign('gereja_id')->references('id')->on('gereja')->cascadeOnDelete();
    $table->unique(['gereja_id', 'tipe', 'periode']);
});
```

- **Saat `closed`:** transaksi pada periode tsb **dikunci** (tidak bisa diedit/hapus tanpa membuka kembali). `saldo_akhir` periode = `saldo_awal` periode berikutnya.
- Memberi bendahara laporan ringkas "siap tutup buku" + jejak siapa/kapan menutup.

---

## 7. Tabel Baru: `audit_log`

Untuk jejak audit (terutama akses Super Admin & perubahan sensitif).

```php
Schema::create('audit_log', function (Blueprint $table) {
    $table->bigIncrements('id');
    $table->string('gereja_id')->nullable();             // null = aksi level platform
    $table->string('actor_type');                        // super_admin | church_user
    $table->string('actor_id')->nullable();
    $table->string('aksi');                              // login | impersonate.start | pemasukan.approve | midtrans.update | ...
    $table->string('entitas')->nullable();              // nama tabel/objek
    $table->string('entitas_id')->nullable();
    $table->json('meta')->nullable();                    // ip, user agent, before/after ringkas
    $table->timestamp('created_at')->useCurrent();
    $table->index(['gereja_id', 'created_at']);
    $table->index(['actor_type', 'actor_id']);
});
```

---

## 8. Super Admin (level platform)

Super Admin **tidak** terikat satu gereja, jadi sebaiknya **terpisah** dari `church_users`:

```php
Schema::create('platform_admins', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('nama');
    $table->string('email')->unique();
    $table->string('password');
    $table->string('role')->default('super_admin');      // super_admin | support
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

- Otentikasi Super Admin (di `admin.gmim-keuangan.id`) lewat guard/token terpisah.
- Akses lintas-gereja **melewati** Global Scope hanya via jalur khusus ber-audit (lihat [05](./05-keamanan-rbac-midtrans.md)).

---

## 9. Pemetaan User → Gereja

> **KF-2:** untuk MVP **tidak perlu tabel pivot** — relasi cukup lewat `church_users.gereja_id` (1 user = 1 gereja). Tabel pivot `user_gereja` hanya diperlukan **bila** kelak satu orang mengelola banyak gereja (ala Accurate "pilih database") atau saat ekstraksi ke SSO — disimpan di `gmim_sso` saat itu. Lihat [07](./07-sso-identitas.md).

---

## 10. ERD (ringkas)

```
gereja 1───* church_users
  │  1───1 gereja_midtrans
  │  1───* kategori_persembahan 1───* nama_persembahan
  │  1───* pemasukan        (FK kategori & nama persembahan; input_by/approved_by → church_users)
  │  1───* kategori_pengeluaran 1───* pengeluaran
  │  1───* aset                 (opsional → pengeluaran_id)
  │  1───* pegawai 1───* pembayaran_gaji ──(saat dibayar)──► pengeluaran
  │  1───* periode_buku
  └──1───* audit_log

  │  1───1 langganan 1───* tagihan        (mesin billing — lihat 08)
  └──1───* (paket: katalog global, lintas gereja)

platform_admins (lintas gereja, terpisah)  ──► audit_log

(Masa depan / ditunda — KF-2) gmim_sso: users 1───* user_gereja; church_users.sso_user_id ──► users.id
```

---

## 11. Ringkasan Migrasi Baru yang Diperlukan

**Di `gmim_api`** (semua di satu backend — modular monolith, KF-2):

| Migration | Isi |
| --- | --- |
| `extend_gereja_table` | status_domain (cache), info gereja, dst. + softDeletes (subdomain disiapkan, ditunda) |
| `extend_church_users_table` | `email` (unik global), `status`, `login_terakhir`, `sso_user_id` (opsional/kosong), role baru; **`password` tetap (Sanctum)** |
| `create_aset_table` | modul Aset |
| `create_pegawai_table` + `create_pembayaran_gaji_table` | modul Gaji/Honor |
| `create_periode_buku_table` | tutup buku |
| `create_paket_table` + `create_langganan_table` + `create_tagihan_table` | **mesin langganan** ([08](./08-langganan-billing.md)) |
| `create_audit_log_table` | audit |
| `create_platform_admins_table` | Super Admin |

> **Tidak ada migrasi `gmim_sso`** untuk sekarang (ditunda, KF-2). Sanctum (`personal_access_tokens`) **dipertahankan**. Skema SSO masa depan ada di [07](./07-sso-identitas.md).

---

**Lanjut:** [04-modul-fitur.md](./04-modul-fitur.md) — dashboard grafik, aset, arus kas, gaji, midtrans, landing.
