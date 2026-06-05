# 01 · Arsitektur Multi-Tenant

> Bagaimana satu platform melayani banyak gereja dengan data yang **terisolasi total**, dan cara memisahkan tenant di URL.

> 🟢 **KEPUTUSAN FINAL (KF-2):** MVP memakai **path-based** (`gmim-keuangan.id/g/<slug>`) + **modular monolith** (identitas = modul di `gmim_api`). Bagian **subdomain** & **central auth/handoff** di bawah dipertahankan sebagai **opsi masa depan** — aktifkan saat skala menuntut. Baca §3 dengan konteks ini.

---

## 1. Konteks Sistem (high-level)

```
                         ┌──────────────────────────────┐
                         │   Pengunjung / Calon Gereja   │
                         └───────────────┬───────────────┘
                                         │
                          gmim-keuangan.id (landing)
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │ "Masuk"                   │ "Coba Demo"               │ "Daftar"
              ▼                           ▼                           ▼
   app.gmim-keuangan.id           demo.gmim-keuangan.id      app.../daftar
   (UI login → SSO)               (client-only, localStorage) (registrasi → SSO)
              │                                                       │
              │ OIDC (Auth Code + PKCE)                               │ buat identitas (SSO)
              ▼                                                       ▼  + provision gereja (api)
   ┌─────────────────────────────┐                          ┌────────────────────────┐
   │  gmim_sso (Identity Provider)│  ◄── identitas tunggal ──│  resolusi gereja user  │
   │  users · /authorize /token   │      (tanpa duplikasi)   └────────────┬───────────┘
   │  /jwks /userinfo /logout     │                                       │
   └──────────────┬───────────────┘                                       │
                  │ terbitkan JWT (RS256), terikat gereja_id              │
                  ▼                                                       │
   <slug>.gmim-keuangan.id  ◄───────── redirect + token ─────────────────┘
   (gmim_manage — ruang kerja gereja)  ── Bearer JWT ─┐
                                                      ▼
   api.gmim-keuangan.id  ◄──── Super Admin: admin.gmim-keuangan.id (gmim_admin)
   (gmim_api — validasi JWT via JWKS SSO, cek gereja_id, multi-tenant, Midtrans)
              ▲
              │ webhook
   Midtrans (akun per gereja)
```

Enam permukaan (surface) aplikasi:

| Surface | Repo | Fungsi |
| --- | --- | --- |
| Landing | `gmim_landingpage` | Pemasaran, tombol Masuk / Demo / Daftar / Hubungi Admin |
| Central Auth UI | `gmim_manage` (rute khusus) atau halaman terpisah | Halaman login/daftar yang mengarahkan ke SSO; Demo |
| **SSO / Identity Provider** | **`gmim_sso`** | **Sumber identitas tunggal**: registrasi, autentikasi, terbitkan token (OIDC). Detail: [07](./07-sso-identitas.md) |
| Tenant App | `gmim_manage` | Ruang kerja keuangan satu gereja |
| Super Admin | `gmim_admin` | Operator platform: kelola gereja, langganan, dukungan |
| API | `gmim_api` | Sumber kebenaran data gereja, validasi token SSO, isolasi tenant, Midtrans |

---

## 2. Tiga Lapis Isolasi Tenant (wajib, apa pun pilihan URL)

Isolasi **tidak boleh** bergantung pada URL saja. URL (subdomain/path) hanya menentukan *tenant mana yang dituju*; keamanan sebenarnya ada di backend:

1. **Tenant Middleware (`ResolveTenant`)** — menentukan `gereja_id` aktif dari request (hostname *atau* path param), memvalidasi bahwa **token user cocok dengan gereja yang dituju**, lalu `app()->instance('currentGereja', $gereja)`.
2. **Global Scope Eloquent (`BelongsToGereja`)** — semua model finance otomatis `->where('gereja_id', currentTenantId())`. Developer lupa filter → tetap aman.
3. **Uji isolasi di CI** — user gereja A tidak boleh membaca/menulis data gereja B; menutup semua endpoint yang mengembalikan data keuangan.

> **Kondisi saat ini di `gmim_api`:** isolasi sudah berbasis **path param** (`/api/gereja/{gereja}/...` + middleware `EnsureUserBelongsToGereja` yang mencocokkan `user.gereja_id === route('gereja')`). **Global Scope belum ada** dan harus ditambahkan (lihat [05](./05-keamanan-rbac-midtrans.md)). Artinya, secara backend kita **sudah dekat dengan model path-based**; pilihan subdomain menambahkan lapisan resolusi tenant dari hostname.

---

## 3. Keputusan AD-1: Subdomain vs Path-based

Pertanyaan inti dari Anda: *"apakah tetap subdomain atau pakai `domain.com/nama-gereja`?"*

### 3.1 Matriks perbandingan

| Aspek | **Subdomain** `bethesda.gmim-keuangan.id` | **Path** `gmim-keuangan.id/bethesda` |
| --- | --- | --- |
| Isolasi browser (cookie/localStorage) | ✅ **Per-origin**, terpisah otomatis antar gereja | ⚠️ Sama origin → storage/cookie dibagi; isolasi murni di server |
| Pertahanan berlapis data keuangan | ✅ Kuat (origin boundary) | ➖ Cukup, tapi 100% bergantung authz server |
| Branding / nuansa SaaS (ala Accurate) | ✅ Tiap gereja "punya alamat sendiri" | ➖ URL lebih generik |
| Infrastruktur | ⚠️ Butuh **wildcard DNS** `*.gmim-keuangan.id` + **wildcard TLS** | ✅ Satu domain, satu sertifikat |
| Kompleksitas dev lokal | ⚠️ Perlu `*.localhost`/hosts/proxy | ✅ Sederhana |
| Login "tanpa pilih gereja" → masuk | ⚠️ Perlu **redirect OIDC** (authorization code) lintas-subdomain | ✅ Same-origin, callback langsung |
| Kedekatan dengan kode saat ini | ➖ API perlu resolusi hostname tambahan | ✅ API sudah `/gereja/{gereja}/...` |
| CORS | ⚠️ Banyak origin (`*.gmim-keuangan.id`) | ✅ Lebih sedikit origin |
| CDN/cache per tenant, custom domain masa depan | ✅ Mudah | ⚠️ Lebih sulit |

### 3.2 Keputusan (final)

> **DIPILIH untuk MVP: PATH-BASED** (`gmim-keuangan.id/g/<slug>`). Subdomain ditunda (KF-2).

Alasan memilih path-based sekarang:
1. **Infra sederhana** — satu domain, satu sertifikat; tanpa wildcard DNS/TLS.
2. **Login same-origin** — "login tanpa memilih gereja" cukup pakai **Sanctum** + email global, tanpa OIDC/handoff/JWT.
3. **Dekat dengan kode kini** — API sudah `/gereja/{gereja}/...`; FE tinggal namespace `/g/<slug>`.
4. **Fokus** — energi tim ke inti produk (buku kas, billing, operasional), bukan infra multi-origin.

> **Subdomain tetap dirancang sebagai jalur upgrade** (lihat di bawah & [07](./07-sso-identitas.md)). Karena `gereja_id`/`slug` sudah jadi konsep tenant di seluruh sistem, peralihan ke subdomain di masa depan **tidak mengubah model data** — hanya menambah `ResolveTenant` dari hostname + DNS/TLS/CORS. Pertimbangkan saat: tenant banyak, butuh isolasi origin lebih kuat, atau custom domain per gereja.

<details><summary><b>Catatan historis — analisis subdomain (masa depan)</b></summary>

Pada rancangan awal, subdomain direkomendasikan demi isolasi level *origin*. Itu tetap valid sebagai peningkatan, namun untuk tahap sekarang manfaatnya tidak sebanding dengan biaya infra & kompleksitas auth lintas-origin. Keamanan inti tetap dijaga lapis server (Global Scope + middleware), apa pun bentuk URL.
</details>

Alasan:

1. **Data keuangan = aset paling sensitif.** Isolasi level *origin* memberi pertahanan berlapis: token/`localStorage` gereja A secara fisik tidak terbaca dari origin gereja B oleh JavaScript. Ini selaras dengan kekhawatiran utama Anda ("jangan sampai gereja lain bisa melihat keuangan gereja lain").
2. **Selaras dengan keputusan & aset yang sudah ada:** memori arsitektur sudah menetapkan wildcard DNS/TLS + subdomain, dan `gmim_admin` sudah memodelkan `subdomain` + `statusDomain` (aktif/pending/nonaktif) beserta validasinya.
3. **Nuansa produk** seperti Accurate Online: tiap organisasi terasa punya ruang sendiri; memudahkan custom domain di masa depan (`keuangan.gerejaX.org` → CNAME).

**Namun** path-based adalah **alternatif MVP yang sah** bila tim ingin rilis cepat tanpa wildcard DNS/TLS. Karena backend sudah path-based, jalur paling pragmatis adalah:

> **Strategi bertahap (direkomendasikan untuk eksekusi):**
> - **Fase awal:** jalankan **path-based** (`/g/<slug>/...` di FE, `/gereja/{gereja}/...` di API yang sudah ada) untuk mempercepat MVP dan menyederhanakan central-auth (same-origin).
> - **Sebelum/saat go-live publik:** aktifkan **subdomain** sebagai lapisan isolasi & branding; SSO cukup mengubah `redirect_uri` OIDC ke callback per-subdomain. Karena `gereja_id`/`slug` sudah menjadi konsep tenant di seluruh sistem, peralihan ini **tidak mengubah model data** — hanya menambah `ResolveTenant` dari hostname + konfigurasi DNS/TLS/CORS.

Dengan kata lain: **desain data & API dibuat netral terhadap cara URL memisahkan tenant**, sehingga subdomain bisa diaktifkan tanpa refactor besar.

### 3.3 Jika memilih path-based secara permanen

Tetap aman **asalkan**:
- Global Scope + middleware authz ketat (server adalah satu-satunya penjaga).
- Token Sanctum disimpan dengan kunci ber-namespace per gereja di `localStorage` (mis. `auth:bethesda:token`) untuk mengurangi risiko tercampur.
- Slug gereja berada di namespace rute terpisah (`/g/<slug>/...`) agar tidak bentrok dengan rute aplikasi.

---

## 4. Domain & Subdomain Final {#domain}

Standar tunggal: **`gmim-keuangan.id`** (mengikuti yang sudah dipakai `gmim_landingpage`). Spec lama `gmim_admin` yang memakai `gmimjadi.com` perlu diperbarui.

| Subdomain | Tujuan |
| --- | --- |
| `gmim-keuangan.id`, `www.` | Landing page (`gmim_landingpage`) |
| `app.gmim-keuangan.id` | Central Auth: login, daftar, resolusi tenant, redirect |
| `demo.gmim-keuangan.id` | Mode Demo (client-only) |
| `<slug>.gmim-keuangan.id` | Ruang kerja gereja (`gmim_manage`) — mis. `bethesda.`, `sion-manado.` |
| `admin.gmim-keuangan.id` | Super Admin (`gmim_admin`) |
| `api.gmim-keuangan.id` | Backend API (`gmim_api`) |

**Slug yang dilindungi** (tidak boleh dipakai gereja): `app`, `admin`, `api`, `demo`, `www`, `mail`, `static`, `assets`, `status`. Validasi `subdomain` di admin sudah ada — tambahkan daftar reserved ini.

---

## 5. DNS, TLS, dan Routing

- **Wildcard DNS:** `*.gmim-keuangan.id` → 1 ingress/load balancer.
- **Wildcard TLS:** sertifikat `*.gmim-keuangan.id` (Let's Encrypt DNS-01) sehingga gereja baru **tidak** perlu konfigurasi DNS manual.
- **HTTPS dipaksa** di semua subdomain (redirect HTTP→HTTPS, HSTS).
- **CORS:** API mengizinkan origin `https://*.gmim-keuangan.id`, `https://app.gmim-keuangan.id`, `https://admin.gmim-keuangan.id`. Hindari `*` saat memakai kredensial.
- **Resolusi tenant di API (mode subdomain):** middleware membaca `Host`/header `X-Gereja-Slug` dari FE → memetakan ke `gereja_id`. Saat mode path, `gereja_id` diambil dari route param (seperti sekarang).

---

## 6. Penyediaan Tenant Baru (provisioning)

Onboarding gereja baru = **insert baris**, bukan provisioning DB:

1. Buat baris `gereja` (id, nama, alamat, **subdomain/slug**, paket, status `trial`/`pending`).
2. Buat user `Admin Gereja` pertama (pendaftar).
3. Seed data default: kategori persembahan & kategori pengeluaran standar, kategori aset standar, kategori "Gaji & Honor".
4. (Mode subdomain) Tidak perlu DNS baru — sudah tercakup wildcard. Set `statusDomain = pending` lalu `aktif` setelah verifikasi.
5. Redirect Admin Gereja ke ruang kerjanya.

Detail alur ada di [02-autentikasi-onboarding.md](./02-autentikasi-onboarding.md).

---

## 7. Diagram Lapisan (request lifecycle, mode subdomain)

```
Browser (bethesda.gmim-keuangan.id)
   │  Authorization: Bearer <JWT terbitan gmim_sso, klaim gereja_id=bethesda>
   ▼
[ Ingress / TLS *.gmim-keuangan.id ]
   ▼
gmim_api
   ├─ Middleware ResolveTenant      → gereja_id = "bethesda" (dari host/slug)
   ├─ Middleware VerifySsoToken     → validasi JWT RS256 via JWKS gmim_sso (lokal, tanpa call SSO)
   ├─ Middleware EnsureUserBelongsToGereja → klaim gereja_id JWT === gereja aktif ? lanjut : 403
   ├─ Controller                    → query model
   └─ Global Scope BelongsToGereja  → WHERE gereja_id = "bethesda" (otomatis)
   ▼
MySQL (single DB, semua tabel ber-gereja_id)
```

Empat pemeriksaan (host vs tanda-tangan JWT vs klaim gereja vs scope) yang saling menguatkan = **tidak ada satu titik kegagalan** yang membocorkan data antar gereja. Identitas user berasal dari **`gmim_sso`** (tunggal, tak terduplikasi) — lihat [07](./07-sso-identitas.md).

---

**Lanjut:** [02-autentikasi-onboarding.md](./02-autentikasi-onboarding.md) — alur login, demo, dan pendaftaran mandiri.
