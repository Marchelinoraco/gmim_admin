# 02 · Autentikasi & Onboarding

> Tiga alur masuk (login terdaftar, demo, pendaftaran mandiri), model peran (RBAC), dan akses dukungan Super Admin.

> 🟢 **Keputusan final (KF-2): modular monolith.** Autentikasi = **modul di `gmim_api`** (Sanctum + **email unik global**), URL **path-based** (`/g/<slug>`), **same-origin** sehingga tidak perlu OIDC/handoff. "Tanpa duplikasi user" sudah tercapai karena identitas berada di satu tabel `church_users` dengan email unik global. Versi SSO/OIDC (service terpisah) adalah **opsi masa depan** — lihat [07](./07-sso-identitas.md).

---

## 1. Tiga Alur Masuk dari Landing Page

Dari `gmim_landingpage`, pengunjung punya **empat tombol** yang memetakan ke tiga alur:

```
┌──────────── Landing (gmim-keuangan.id) ────────────┐
│  [ Masuk ]  [ Coba Demo ]  [ Daftar Gratis ]  [ Hubungi Admin ] │
└───┬───────────┬──────────────┬───────────────┬──────┘
    │           │              │               │
 Alur A      Alur B         Alur C        Onboarding dibantu
 Login     Demo (local)   Daftar mandiri   (Super Admin)
```

---

## 2. Alur A — Login Pengguna Terdaftar (tanpa memilih gereja)

**Tujuan UX:** pengguna cukup memasukkan email + password; sistem yang menentukan gerejanya dan mengarahkan ke ruang kerja yang benar.

> **Perubahan dari sekarang:** login API kini menerima `{ gerejaId, username, password }` (perlu konteks gereja). Ganti menjadi **login by email global**: `POST /auth/login { email, password }` → resolusi gereja user → token Sanctum → redirect `/g/<slug>`.

### 2.1 Diagram sekuens (MVP · Sanctum, same-origin)

```
User        gmim-keuangan.id (UI login)      gmim_api
 │ email + password   │                          │
 ├───────────────────►│ POST /auth/login         │
 │                    ├─────────────────────────►│ verifikasi (email unik global)
 │                    │                          │ resolusi gereja user → slug
 │                    │   { token, slug, role }  │ terbitkan token Sanctum
 │                    │◄─────────────────────────┤
 │                    │ simpan token (localStorage)
 │  router.push('/g/<slug>/dashboard') ─────────►│ GET /gereja/{slug}/... + Bearer
 │                    │                          │ EnsureUserBelongsToGereja → cocok? lanjut
 │                    │◄─────────────────────────┤ Dashboard gereja
```

- **Tanpa duplikasi user:** `email` unik global di `church_users` → satu identitas. Asumsi MVP **1 user = 1 gereja**.
- **Pengikatan satu gereja:** middleware `EnsureUserBelongsToGereja` (sudah ada) menolak 403 bila `user.gereja_id` ≠ gereja yang diakses → user hanya bisa akses gerejanya.
- **Same-origin:** semua di `gmim-keuangan.id` → token langsung dipakai, tanpa OIDC/handoff/JWT.

> Versi SSO/OIDC (service terpisah, JWT/JWKS) = peningkatan masa depan: **[07](./07-sso-identitas.md)**.

### 2.2 Kasus 1 user punya >1 gereja (opsional, ala Accurate)

Jika kelak satu orang mengelola beberapa gereja, modul auth menampilkan **pemilih gereja** setelah login (seperti pemilih "database" Accurate Online), lalu arahkan ke ruang kerja `/g/<slug>` terpilih. Untuk MVP, asumsi **1 user = 1 gereja** (sesuai `church_users.gereja_id`).

---

## 3. Alur B — Mode Demo (client-only)

**Tujuan:** calon pengguna mencoba seluruh fitur tanpa akun & tanpa menyentuh server.

| Aspek | Keputusan |
| --- | --- |
| Data | Disimpan **hanya di `localStorage`** (mis. namespace `demo:financeStore`) |
| API | **Tidak ada** panggilan tulis; semua aksi diintersep store demo |
| Seed | Data contoh realistis (beberapa pemasukan/pengeluaran, kategori, 1 aset, 1 pegawai) |
| Banner | "🧪 Mode Demo — perubahan tersimpan sementara di perangkat ini & tidak permanen. **Daftar** untuk menyimpan." |
| Reset | Tombol "Reset Demo" mengosongkan `localStorage` demo |
| Konversi | CTA "Daftar & simpan data ini" → bawa snapshot demo (opsional) ke form pendaftaran |

**Implementasi (gmim_manage):** `financeStore` memperoleh *adapter* — `apiAdapter` (produksi) vs `localStorageAdapter` (demo). Mode ditentukan oleh host (`demo.`) atau flag rute (`/demo`). Tidak perlu menduplikasi UI.

```
financeStore
   ├─ mode = 'demo'  → localStorageAdapter (read/write localStorage)
   └─ mode = 'live'  → apiAdapter (axios → gmim_api)
```

---

## 4. Alur C — Pendaftaran Mandiri (Self-Service)

**Tujuan:** gereja mendaftar sendiri; **pendaftar otomatis menjadi Admin Gereja**.

### 4.1 Form pendaftaran (di `app.gmim-keuangan.id/daftar`)

| Bagian | Field |
| --- | --- |
| Data Gereja | `nama gereja` (wajib), `alamat` (wajib), `subdomain/slug` (cek ketersediaan real-time + preview `slug.gmim-keuangan.id`) |
| Bendahara/Admin | `nama lengkap bendahara` (wajib), `email` (wajib, unik global), `password` (≥8 char), `no. telepon` |
| Paket | pilih paket (default **Trial**); detail langganan menyusul |
| Persetujuan | centang syarat & ketentuan |

### 4.2 Diagram sekuens

```
User        app/daftar              gmim_api
 │ isi form     │                       │
 ├─────────────►│ POST /auth/register   │
 │              ├──────────────────────►│ validasi slug unik+reserved, email unik global
 │              │                       │ TRANSACTION:
 │              │                       │   • gereja (slug, status_langganan=trial)
 │              │                       │   • langganan (status=trial, trial_berakhir=+14h)  ← 08
 │              │                       │   • church_user (email, role=admin_gereja, password)
 │              │                       │   • seed kategori + aset + "Gaji & Honor"
 │              │   { token, slug }      │ COMMIT (+ kirim email verifikasi)
 │              │◄──────────────────────┤
 │  redirect ───┴──────────────────────►│ /g/<slug>/dashboard
```

- Semua dalam **satu backend & satu transaksi** (modular monolith) — gereja + langganan trial + Admin Gereja + seed. **Tanpa duplikasi user** (email unik global).

### 4.3 Aturan penting

- **Pendaftar = `admin_gereja`** (peran tertinggi di tingkat gereja). Ia bisa membuat akun Bendahara/Pelayan/Viewer berikutnya.
- **Idempoten & transaksional:** pembuatan gereja+user+seed dalam satu DB transaction; gagal di tengah → rollback penuh.
- **Verifikasi email** (disarankan): status gereja `pending` sampai email terverifikasi, lalu `aktif`. Untuk MVP bisa langsung aktif + verifikasi menyusul.
- **Anti-abuse:** rate limit, captcha pada form daftar, validasi slug (format `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–30 char, bukan reserved).

---

## 5. Onboarding Dibantu (via Super Admin)

Untuk gereja yang lebih nyaman dibantu (klik "Hubungi Admin" / WhatsApp):

1. Super Admin membuat gereja + Admin Gereja pertama lewat `gmim_admin` (sudah ada UI gereja & bendahara — tinggal disambungkan ke API).
2. Sistem mengirim kredensial awal / tautan set-password ke email Admin Gereja.
3. Admin Gereja login (Alur A) dan melanjutkan konfigurasi.

> `gmim_admin` saat ini memakai **data dummy**. Roadmap [06](./06-roadmap-implementasi.md) menyambungkannya ke `gmim_api` (endpoint `POST /admin/gereja`, dll. dengan peran Super Admin).

---

## 6. Model Peran (RBAC)

| Peran | Lingkup | Kewenangan inti |
| --- | --- | --- |
| **Super Admin** | Platform (lintas gereja) | Kelola semua gereja & langganan; dukungan; "masuk sebagai" (ber-audit). **Bukan** untuk mengubah transaksi gereja kecuali untuk perbaikan tercatat. |
| **Admin Gereja** | 1 gereja | Kelola akun pengguna gereja, pengaturan gereja, **input key Midtrans**, lihat semua finance, tutup buku. Superset dari Bendahara. |
| **Bendahara** | 1 gereja | Penuh atas keuangan: pemasukan, pengeluaran, approval, aset, gaji, laporan, **input key Midtrans**. |
| **Pelayan Khusus** | 1 gereja | Input pemasukan **manual** (butuh approval Bendahara), akses terbatas. |
| **Viewer / Majelis** | 1 gereja | **Read-only**: lihat laporan & dashboard, tanpa mengubah data. |

> **Kondisi sekarang:** `church_users.role` hanya `Bendahara` & `Pelayan Khusus`. Tambahkan `admin_gereja` dan `viewer`. Lihat [03](./03-model-data.md) untuk perubahan kolom `role`.

### 6.1 Pemetaan peran → kemampuan (ringkas)

| Kemampuan | Super Admin | Admin Gereja | Bendahara | Pelayan | Viewer |
| --- | :-: | :-: | :-: | :-: | :-: |
| Kelola akun gereja | (semua) | ✅ | ➖ | ✕ | ✕ |
| Input/edit pemasukan | (support) | ✅ | ✅ | manual→pending | ✕ |
| Approve/reject pemasukan | (support) | ✅ | ✅ | ✕ | ✕ |
| Pengeluaran | (support) | ✅ | ✅ | ✕ | ✕ |
| Aset gereja | (support) | ✅ | ✅ | ✕ | lihat |
| Gaji/Honor | (support) | ✅ | ✅ | ✕ | lihat |
| Tutup buku (closing) | (support) | ✅ | ✅ | ✕ | ✕ |
| Konfig Midtrans | (support) | ✅ | ✅ | ✕ | ✕ |
| Lihat laporan/dashboard | ✅ | ✅ | ✅ | sebagian | ✅ |

---

## 7. Akses Dukungan Super Admin Lintas-Gereja

Permintaan Anda: *"Admin tetap bisa melihat semua hal di setiap gereja agar memudahkan perbaikan kendala."* Ini didesain dengan **prinsip least-privilege + audit**:

- **Default read-only** lintas gereja (Super Admin token tidak terikat satu `gereja_id`; punya kemampuan `support.read`).
- **"Masuk sebagai" (impersonasi)**: Super Admin dapat membuka ruang kerja gereja tertentu untuk diagnosa; setiap sesi impersonasi **dicatat** (siapa, gereja mana, kapan, durasi) dan idealnya **read-only** kecuali ada elevasi eksplisit untuk perbaikan.
- **Audit log wajib** untuk setiap akses/aksi Super Admin terhadap data gereja (lihat tabel `audit_log` di [03](./03-model-data.md)).
- **Pemisahan kebijakan:** Global Scope `BelongsToGereja` dilewati **hanya** lewat jalur khusus Super Admin yang tervalidasi peran + tercatat — tidak pernah dari endpoint tenant biasa.

---

## 8. Penyimpanan Sesi di Frontend

| Mode | Penyimpanan token | Catatan |
| --- | --- | --- |
| **Path (MVP)** | `localStorage` `auth:token` (+ `slug` aktif) | Same-origin; server (Global Scope + middleware) penjaga utama |
| Demo | `localStorage` `demo:*`, **tanpa token nyata** | Tidak ada sesi server |
| Subdomain (masa depan) | `localStorage` per origin `slug.gmim-keuangan.id` | Terisolasi per-origin; aktif saat KF-2 di-upgrade |

`authStore` (gmim_manage) sudah punya `checkAuth()` yang memverifikasi sesi ke server saat cold-start — **pola ini dipertahankan**. Cukup ganti payload login menjadi `{ email, password }` dan simpan token Sanctum di `localStorage`. (Peningkatan ke OIDC/JWT menyusul bila diekstrak ke SSO — [07](./07-sso-identitas.md).)

---

**Lanjut:** [03-model-data.md](./03-model-data.md) — perubahan skema & tabel baru.
