# 05 · Keamanan, RBAC & Midtrans

> Cara menjamin **"tidak ada gereja yang bisa melihat data gereja lain"**, hak akses per peran, penanganan key Midtrans, akses dukungan Super Admin, dan jejak audit.

---

## 1. Isolasi Tenant — Pertahanan Berlapis

Keamanan finansial **tidak** boleh bergantung pada satu kontrol. Lapisan dari luar ke dalam:

| Lapis | Kontrol | Status |
| --- | --- | --- |
| 0. Origin | (Mode subdomain) `slug.gmim-keuangan.id` → cookie/localStorage terpisah per gereja | direkomendasikan |
| 1. Transport | HTTPS dipaksa + HSTS, CORS allow-list domain platform | perlu dikonfigurasi |
| 2. Resolusi tenant | Middleware `ResolveTenant` set `gereja_id` aktif dari **path** (`/g/<slug>`) | path sudah ada |
| 3. Autentikasi | **Sanctum** Bearer token (login by email global) | **sudah ada** (SSO/JWT = masa depan, [07](./07-sso-identitas.md)) |
| 3b. Langganan aktif | `EnsureSubscriptionActive`: tolak mutasi bila expired (402) | **baru** ([08](./08-langganan-billing.md)) |
| 4. Otorisasi tenant | `EnsureUserBelongsToGereja`: `user.gereja_id === gereja aktif` → else 403 | **sudah ada** |
| 5. Otorisasi peran | `EnsureBendahara` & gate per-peran | sebagian ada |
| 6. Scope query | **Global Scope `BelongsToGereja`** di semua model | **BELUM — wajib ditambah** |
| 7. Uji | Test isolasi di CI (A tak bisa baca/tulis B) | **BELUM — wajib** |

> **Gap kritis saat ini:** lapis **6 (Global Scope)** dan **7 (uji isolasi)** belum ada. Tanpa Global Scope, satu query yang lupa `where('gereja_id', ...)` bisa membocorkan data antar gereja. **Ini blocker sebelum go-live publik.**

### 1.1 Trait `BelongsToGereja` (rancangan)

```php
trait BelongsToGereja
{
    protected static function bootBelongsToGereja(): void
    {
        static::addGlobalScope('gereja', function (Builder $b) {
            if ($id = app()->bound('currentGereja') ? app('currentGereja')->id : null) {
                $b->where($b->getModel()->getTable().'.gereja_id', $id);
            }
        });

        static::creating(function ($model) {
            if (empty($model->gereja_id) && app()->bound('currentGereja')) {
                $model->gereja_id = app('currentGereja')->id;
            }
        });
    }
}
```

Diterapkan ke: `Pemasukan`, `Pengeluaran`, `KategoriPersembahan`, `NamaPersembahan`, `KategoriPengeluaran`, `ChurchUser`, **`Aset`**, **`Pegawai`**, **`PembayaranGaji`**, **`PeriodeBuku`**, `GerejaMidtrans`.

### 1.2 Uji isolasi (contoh wajib di CI)

```
test: user gereja A GET /gereja/B/pemasukan         → 403
test: user gereja A GET /gereja/A/pemasukan         → 200 (hanya data A)
test: query model tanpa scope di konteks A          → tak pernah mengembalikan baris B
test: Pelayan Khusus PUT /pemasukan/{id}/approve    → 403
test: Viewer POST /pengeluaran                       → 403
```

---

## 2. RBAC — Penegakan di Backend

Peran (lihat [02 §6](./02-autentikasi-onboarding.md#6-model-peran-rbac)) ditegakkan via middleware/gate, **bukan** hanya disembunyikan di UI.

| Middleware/Gate | Fungsi |
| --- | --- |
| `auth:sanctum` | user terautentikasi (login by email global) |
| `EnsureUserBelongsToGereja` | `user.gereja_id` cocok dengan `/g/<slug>` (sudah ada) |
| `EnsureSubscriptionActive` | langganan aktif (tolak mutasi bila expired) — [08](./08-langganan-billing.md) |
| `EnsureRole:admin_gereja` | kelola pengguna, pengaturan, midtrans, buka-buku |
| `EnsureRole:bendahara,admin_gereja` | finance penuh, approval, aset, gaji, tutup buku, midtrans |
| `EnsureRole:bendahara,admin_gereja,pelayan_khusus` | input pemasukan (pelayan → manual/pending) |
| read-only check untuk `viewer` | tolak semua mutasi |

> **Prinsip:** UI menyembunyikan tombol untuk UX; **server menolak** untuk keamanan. Keduanya wajib.

---

## 3. Keamanan Key Midtrans

| Aturan | Penjelasan |
| --- | --- |
| `server_key` **terenkripsi at-rest** | `protected $casts = ['server_key' => 'encrypted']` (Laravel Crypt) |
| `server_key` **tak pernah** dikirim ke FE | Endpoint config mengembalikan versi **masked** (`••••1234`) |
| `server_key` **write-only** dari UI | Dikirim hanya saat diubah; field kosong = "jangan ubah" |
| `client_key` boleh ke FE | Diperlukan Snap.js |
| Webhook Midtrans | Verifikasi **signature SHA-512**, **idempoten by `order_id`**, di luar `auth:sanctum` (sudah jadi rute publik `POST /midtrans/notification`) |
| Dana | Akun Midtrans **per gereja** → uang langsung ke rekening gereja |
| Input oleh | **Bendahara/Admin Gereja** (baru) — lihat [04 §5](./04-modul-fitur.md#5-konfigurasi-midtrans-oleh-bendahara) |
| Akses Super Admin | Hanya **status/metadata** (aktif, production, kapan diubah) — **bukan** plaintext key |

---

## 4. Akses Dukungan Super Admin (lintas gereja)

Menyeimbangkan kebutuhan dukungan ("admin bisa melihat semua gereja") dengan kepercayaan:

| Prinsip | Implementasi |
| --- | --- |
| Least privilege | Default **read-only** lintas gereja (`support.read`) |
| Impersonasi tercatat | "Masuk sebagai gereja X" membuat sesi ber-TTL; dicatat di `audit_log` (`impersonate.start`/`end`) |
| Jalur khusus | Bypass Global Scope **hanya** lewat service Super Admin tervalidasi peran + audit; **tidak** dari endpoint tenant |
| Elevasi untuk perbaikan | Aksi tulis untuk "perbaikan kendala" memerlukan elevasi eksplisit + alasan + audit |
| Tanpa rahasia | Super Admin tak bisa melihat `server_key` plaintext atau password |
| Notifikasi (opsional) | Gereja diberi tahu saat sesi dukungan dibuka, demi transparansi |

---

## 5. Keamanan Data Keuangan (umum)

- **Soft delete** semua transaksi (pemasukan/pengeluaran/aset/gaji) — tidak hard-delete. (sudah ada di `pemasukan`)
- **Audit trail** per transaksi: `input_by`, `approved_by`, `approved_at`, `rejected_reason`. (sudah ada di `pemasukan`; tambahkan ke gaji)
- **Tutup buku mengunci** periode: edit/hapus transaksi pada periode `closed` ditolak API.
- **Backup PITR** (point-in-time recovery) wajib + uji restore sebelum go-live.
- **Upload bukti**: validasi mime+ukuran, nama file UUID, akses ter-scope gereja.
- **Rahasia tidak di git**: pastikan tidak ada key/`.env` di history.

---

## 6. Autentikasi & Sesi

| Aspek | Keputusan (MVP · modular monolith) |
| --- | --- |
| Identitas & token | **Modul auth di `gmim_api`** + **Sanctum** Bearer token (kedaluwarsa konfigurabel) |
| Identitas login | **email unik global** di `church_users` (login "tanpa pilih gereja") |
| Pengikatan gereja | `EnsureUserBelongsToGereja`: `user.gereja_id === /g/<slug>` → 403 bila beda |
| Logout | hapus token dari `personal_access_tokens` |
| Super Admin | guard/token terpisah (`platform_admins`) |
| Langganan | `EnsureSubscriptionActive` (402 bila expired) — [08](./08-langganan-billing.md) |
| Rate limit & captcha | pada login, registrasi, & checkout (anti brute-force/abuse) |
| Password | hash bcrypt/argon; panjang ≥8 |
| Masa depan | ekstraksi ke SSO/OIDC + JWT/JWKS — [07](./07-sso-identitas.md) |

---

## 7. Ringkasan "Wajib Sebelum Go-Live Publik"

- [ ] Global Scope `BelongsToGereja` di **semua** model finance + tabel baru
- [ ] Uji isolasi tenant lulus di CI (user gereja A tak bisa baca/tulis data gereja B)
- [ ] Login by email global + `EnsureUserBelongsToGereja` aktif (Sanctum)
- [ ] `EnsureSubscriptionActive` menegakkan expiry ([08](./08-langganan-billing.md))
- [ ] Kesiapan operasional terpenuhi ([09](./09-operasional-kesiapan.md): backup+restore drill, observability, queue, email)
- [ ] Wildcard DNS + TLS aktif (mode subdomain) / HTTPS dipaksa
- [ ] CORS allow-list ketat
- [ ] `server_key` Midtrans terenkripsi & tak pernah keluar ke FE; webhook verifikasi signature + idempoten
- [ ] Audit log aktif untuk akses Super Admin & aksi sensitif
- [ ] Backup PITR + uji restore
- [ ] Rate limit + captcha pada login/daftar
- [ ] Tidak ada secret di git history

---

**Lanjut:** [06-roadmap-implementasi.md](./06-roadmap-implementasi.md) — urutan implementasi.
