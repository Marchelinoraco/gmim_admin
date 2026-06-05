# 07 · SSO & Identitas Terpusat (Identity Provider) — DITUNDA / MASA DEPAN

> 🟣 **STATUS: DITUNDA (Keputusan Final KF-2).** SSO **sebagai service terpisah** (`gmim_sso`) **tidak** dibangun sekarang. Untuk MVP, identitas = **modul di dalam `gmim_api`** (Sanctum + email unik global), URL = **path-based** (`/g/<slug>`). Lihat §0 [README](./README.md) dan §1 di bawah.
>
> Dokumen ini **dipertahankan sebagai blueprint ekstraksi** — peta jalan saat skala/kebutuhan menuntut peningkatan ke SSO/OIDC penuh. Baca sebagai *target masa depan*, bukan rencana eksekusi.

---

## 0. Yang Dipakai SEKARANG (modular monolith)

| Aspek | MVP sekarang (di `gmim_api`) | Masa depan (ekstraksi ke `gmim_sso`) |
| --- | --- | --- |
| Identitas | tabel `church_users` + **email unik global** | tabel `users` di service terpisah |
| Token | **Sanctum** (Bearer, opaque) | **JWT RS256 + JWKS** (OIDC) |
| Login | modul `AuthController` di `gmim_api`, same-origin | server `/authorize` `/token` terpisah |
| Pengikatan gereja | middleware `EnsureUserBelongsToGereja` (sudah ada) | klaim `gereja_id` di JWT |
| Anti-duplikasi user | email unik global di satu DB (sudah cukup) | `sub` global di SSO |

> **Kenapa cukup untuk sekarang:** dengan single-DB & asumsi 1 user = 1 gereja, user sudah berada di satu tabel — **tidak ada duplikasi**. Sanctum same-origin sudah mewujudkan "login tanpa pilih gereja" tanpa OIDC. Selebihnya di bawah berlaku **saat** diekstrak.

---

> Sisa dokumen ini = **blueprint masa depan.** Ia memperdalam (versi lanjut) **AD-4** dan mantan **AD-10**, memakai standar **OpenID Connect / OAuth2** bila nanti diekstrak menjadi service.

---

## 1. Mengapa SSO Terpisah?

| Masalah tanpa SSO | Solusi dengan `gmim_sso` |
| --- | --- |
| Identitas user tersebar/duplikat di tiap tenant | **Satu tabel `users`** di SSO — identitas tidak terduplikasi |
| Tiap subdomain punya login sendiri | **Satu pintu login** untuk semua subdomain |
| Sulit menjamin "1 user = 1 gereja" | SSO menerbitkan token yang **terikat ke satu `gereja_id`** |
| Password tersimpan di banyak tempat | Password **hanya** di SSO; `gmim_api` tak pernah menyimpan password |
| Sulit cabut akses lintas layanan | Revokasi terpusat (refresh token / introspeksi) di SSO |

> **Prinsip:** `gmim_sso` = **Authentication** (siapa Anda). `gmim_api` = **Authorization atas data gereja** (Anda boleh apa, di gereja mana). Pemisahan ini membuat identitas tunggal dan data tetap terisolasi per gereja.

---

## 2. Posisi dalam Sistem

```
                ┌───────────────────────────────────────────────┐
                │                  gmim_sso (IdP)               │
                │  users (identitas tunggal) · OIDC/OAuth2      │
                │  /authorize /token /userinfo /jwks /logout    │
                └───────▲───────────────────────────┬───────────┘
                        │ login (Auth Code + PKCE)   │ JWKS (kunci publik)
                        │                            │
   app.gmim-keuangan.id │                            ▼
   (UI login/daftar) ───┘                  ┌───────────────────────┐
                        ▲                   │   gmim_api (utama)    │
   bethesda.gmim-keuangan.id ──────────────►   validasi JWT (RS256)│
   (gmim_manage, Bearer JWT)               │   cek gereja_id klaim │
                                           │   resolve membership  │
                                           └───────────┬───────────┘
                                                       ▼
                                                 MySQL data gereja
```

- **`gmim_sso`** menerbitkan token. **`gmim_api`** mengonsumsi/memvalidasinya secara lokal memakai **kunci publik** (JWKS) — **tanpa** memanggil SSO tiap request → cepat & tahan beban.
- "**mengirimkan token ke backend utama**" (sesuai permintaan Anda) = frontend menyertakan **JWT terbitan SSO** di header `Authorization: Bearer` saat memanggil `gmim_api`.

---

## 3. Protokol: OpenID Connect (Authorization Code + PKCE)

Memakai standar industri agar aman & tidak menemukan ulang roda.

| Komponen | Pilihan |
| --- | --- |
| Alur | **Authorization Code + PKCE** (cocok untuk SPA publik) |
| Access token | **JWT RS256** (ditandatangani kunci privat SSO, divalidasi via JWKS) |
| ID token | JWT (klaim profil dasar) |
| Refresh token | opaque, disimpan & dapat dicabut di SSO; rotasi saat dipakai |
| Penemuan | `/.well-known/openid-configuration` + `/.well-known/jwks.json` |
| Implementasi server | **Laravel Passport** (OAuth2 server) di `gmim_sso` — selaras keahlian tim |

> **Alternatif ringan** (jika tak mau OAuth2 penuh): SSO menerbitkan JWT RS256 sendiri + kode sekali-pakai via redirect; `gmim_api` validasi via kunci publik. Lebih sederhana, tetapi kehilangan fitur standar (consent, refresh rotation, introspeksi). **Rekomendasi tetap OIDC/Passport.** Ini masuk daftar keputusan terbuka.

---

## 4. Klaim Token (JWT access token)

```jsonc
{
  "iss": "https://sso.gmim-keuangan.id",   // penerbit
  "sub": "usr_01HX...",                      // ID user SSO — identitas tunggal (tak duplikat)
  "email": "bendahara@bethesda.id",
  "aud": "bethesda",                          // tenant yang dituju (slug)
  "gereja_id": "g-001",                       // PENGIKAT: token hanya untuk gereja ini
  "slug": "bethesda",
  "role": "bendahara",                        // opsional (lihat §6) — atau di-resolve gmim_api
  "scope": "openid profile finance",
  "iat": 1735900000,
  "exp": 1735900900                            // access token pendek (±15 menit)
}
```

- **`sub`** = identitas global tunggal → dasar "tidak ada duplikasi user".
- **`gereja_id` + `aud/slug`** = **pengikat satu gereja**. `gmim_api` menolak bila tidak cocok dengan subdomain yang diakses.
- **Access token pendek** (±15 menit) + **refresh token** di SSO → revokasi cepat & aman.

---

## 5. Alur Lengkap

### 5.1 Login dari domain utama (SSO)

```
User        app. (UI login)      gmim_sso (IdP)        bethesda. (gmim_manage)    gmim_api
 │  klik "Masuk"   │                  │                        │                      │
 ├────────────────►│ redirect /authorize?client=manage&        │                      │
 │                 │   code_challenge=PKCE&redirect_uri=bethesda/callback             │
 │                 ├─────────────────►│ tamp. form login        │                      │
 │  email+password ├─────────────────►│ verifikasi akun         │                      │
 │                 │                  │ resolusi gereja user → slug=bethesda           │
 │                 │   302 ?code=AUTHCODE (sekali pakai, TTL pendek)                   │
 │                 │◄─────────────────┤                         │                      │
 │  redirect ──────┼──────────────────┼────────────────────────►│ /callback?code=...   │
 │                 │                  │   POST /token (code+PKCE verifier)             │
 │                 │                  │◄────────────────────────┤                      │
 │                 │                  │ JWT access + refresh + id_token               │
 │                 │                  ├────────────────────────►│ simpan token         │
 │                 │                  │                         ├─ Bearer JWT ────────►│ validasi JWT (JWKS)
 │                 │                  │                         │                      │ cek gereja_id==bethesda
 │                 │                  │                         │◄─────────────────────┤ 200 data gereja
```

Catatan: jika 1 user punya >1 gereja (mode lanjut), SSO menampilkan **pemilih gereja** sebelum menerbitkan kode — token tetap **untuk satu gereja** pada satu waktu.

### 5.2 Pendaftaran mandiri (gereja baru)

```
User        app/daftar        gmim_sso             gmim_api
 │ isi form      │                │                   │
 ├──────────────►│ POST /register │                   │
 │               ├───────────────►│ buat users (identitas tunggal, email unik)
 │               │                ├──────────────────►│ POST /internal/provision-gereja
 │               │                │                   │  (server-to-server, mTLS/secret)
 │               │                │                   │  buat gereja + church_member(role=admin_gereja)
 │               │                │◄──────────────────┤  { gereja_id, slug }
 │               │                │ simpan user_gereja(default)
 │               │  lanjut ke login SSO (§5.1) ───────►│
```

- **Provisioning lintas layanan** memakai endpoint internal `gmim_api` (`/internal/provision-gereja`) yang dipanggil SSO secara server-to-server (rahasia bersama/mTLS), dalam satu alur transaksional logis. Identitas dibuat di SSO; gereja+membership di `gmim_api`.

### 5.3 Logout

- `gmim_manage` hapus token lokal → panggil SSO `/logout` (end session) → cabut refresh token. Access token kedaluwarsa cepat (±15 mnt) sehingga jendela risiko kecil.

---

## 6. Pembagian Kepemilikan Data

| Data | Pemilik | Alasan |
| --- | --- | --- |
| Kredensial (email, password) | **gmim_sso** `users` | Identitas tunggal, tak duplikat |
| Profil dasar (nama, telepon) | **gmim_sso** `users` | Ikut identitas |
| Pemetaan user → gereja (routing) | **gmim_sso** `user_gereja` | SSO perlu tahu ke subdomain mana redirect |
| Peran & keanggotaan gereja | **gmim_api** `church_members` | Admin Gereja kelola peran di app tenant |
| Semua data keuangan | **gmim_api** (ber-`gereja_id`) | Terisolasi per gereja |

**Peran dalam token (`role`)** — dua opsi:
- **(a) Resolve di gmim_api** (rekomendasi): token hanya bawa identitas + `gereja_id`; `gmim_api` mencari peran dari `church_members` (sso_user_id + gereja_id). Kopling SSO↔tenant minimal.
- **(b) Embed di token**: SSO menaruh `role` di klaim (perlu sinkronisasi peran ke SSO). Lebih cepat tapi lebih kopling.

---

## 7. Validasi Token di `gmim_api`

Pengganti `auth:sanctum` lama menjadi middleware **`VerifySsoToken`**:

```
1. Ambil Bearer JWT.
2. Validasi tanda tangan RS256 via JWKS SSO (cache kunci publik, refresh berkala).
3. Cek iss == sso.gmim-keuangan.id, aud/slug, exp belum lewat.
4. Cek klaim gereja_id/slug == subdomain yang diakses → kalau beda: 403.
5. Resolve church_member(sub, gereja_id) → set user + role (opsi 6a).
6. Lanjut middleware peran (EnsureRole) & Global Scope BelongsToGereja.
```

- **Tanpa panggilan ke SSO per-request** (validasi lokal pakai kunci publik) → performa baik.
- **Revokasi**: access token pendek; untuk kebutuhan ketat, tambah **introspeksi**/denylist `jti` (mis. saat akun dinonaktifkan, masukkan ke denylist sampai exp).

---

## 8. Skema Data SSO (`gmim_sso`)

```php
// users — identitas tunggal global
Schema::create('users', function (Blueprint $t) {
    $t->string('id')->primary();              // usr_ULID = klaim sub
    $t->string('email')->unique();            // unik GLOBAL → anti-duplikasi
    $t->string('password');
    $t->string('nama');
    $t->string('telepon')->nullable();
    $t->string('status')->default('active');  // active | disabled
    $t->timestamp('email_verified_at')->nullable();
    $t->timestamps();
});

// user_gereja — pemetaan untuk routing & pengikatan gereja
Schema::create('user_gereja', function (Blueprint $t) {
    $t->string('user_id');
    $t->string('gereja_id');
    $t->string('slug');
    $t->boolean('is_default')->default(true);
    $t->primary(['user_id', 'gereja_id']);
    $t->index('user_id');
});
// MVP: tepat 1 baris per user → menegakkan "1 user = 1 gereja".

// + tabel OAuth2 Passport: oauth_clients, oauth_auth_codes,
//   oauth_access_tokens, oauth_refresh_tokens, signing keys.
```

Di `gmim_api`, `church_users` berubah menjadi keanggotaan tanpa kredensial — lihat [03 §3](./03-model-data.md#3-perubahan-pada-church_users-peran--identitas-global) (revisi SSO):

```php
// church_members (eks church_users) — TANPA password
Schema::table('church_users', function (Blueprint $t) {
    $t->string('sso_user_id')->nullable()->index(); // = sub dari SSO
    // password DIHAPUS (pindah ke SSO); email opsional sebagai cache tampilan
});
```

---

## 9. Penjaminan "1 user → 1 subdomain/gereja"

Tiga titik penegakan:

1. **SSO** menerbitkan token dengan `gereja_id` dari `user_gereja` user (MVP: satu-satunya gerejanya).
2. **gmim_api `VerifySsoToken`** menolak (403) bila `gereja_id` token ≠ subdomain diakses.
3. **Global Scope `BelongsToGereja`** membatasi semua query ke `gereja_id` itu.

Walau seseorang mencoba memakai token bethesda untuk memanggil `sion.gmim-keuangan.id`, langkah 2 menolaknya. Walau backend lupa filter, langkah 3 mengamankan. → **berlapis**.

---

## 10. Migrasi dari Sanctum (kondisi sekarang)

`gmim_api` kini memakai **Sanctum** + `church_users.password`. Jalur migrasi:

1. Bangun `gmim_sso` (Passport) + tabel `users`.
2. **Pindahkan identitas**: untuk tiap `church_users`, buat `users` di SSO (email + hash password yang sama bila skema hash kompatibel; jika tidak, kirim undangan set-password). Catat pemetaan `sso_user_id`.
3. Tambah `church_users.sso_user_id`; isi dari pemetaan; **hapus kolom `password`** setelah verifikasi.
4. Ganti `auth:sanctum` → `VerifySsoToken` di `gmim_api`.
5. Ganti login FE (`authStore`) → alur OIDC (redirect ke SSO, exchange code → JWT).
6. Hapus jalur login lama setelah semua tenant migrasi.

> Selama transisi bisa **dual-run** (Sanctum untuk tenant lama, SSO untuk baru) lalu cutover.

---

## 11. Repo & Deploy

| Item | Nilai |
| --- | --- |
| Repo baru | `gmim_sso` (Laravel + Passport) |
| Domain | `sso.gmim-keuangan.id` (atau gabung di `app.` sebagai issuer) |
| Dipanggil oleh | UI login (`app.`), `gmim_manage` (exchange token), `gmim_api` (JWKS) |
| Rahasia | kunci RSA penandatangan (rotasi terjadwal), client secret per aplikasi |
| Endpoint internal | `gmim_api /internal/provision-gereja` (server-to-server, mTLS/secret) |

---

## 12. Keputusan Terbuka Khusus SSO

1. **Protokol**: OIDC/Passport penuh (rekomendasi) vs JWT ringan buatan sendiri.
2. **Peran di token**: resolve di `gmim_api` (rekomendasi) vs embed di klaim.
3. **Domain SSO**: `sso.` terpisah vs menyatu dengan `app.`.
4. **Multi-gereja per user**: aktifkan pemilih gereja sekarang atau kunci 1:1 dulu (MVP).
5. **Revokasi**: hanya access token pendek vs + denylist `jti`/introspeksi.

---

**Kembali:** [README](./README.md) · **Terkait:** [02 Onboarding](./02-autentikasi-onboarding.md) · [03 Model Data](./03-model-data.md) · [05 Keamanan](./05-keamanan-rbac-midtrans.md)
