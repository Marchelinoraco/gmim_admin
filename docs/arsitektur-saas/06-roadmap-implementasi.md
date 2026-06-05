# 06 · Roadmap Implementasi (Urutan Final)

> Disusun ulang mengikuti **Keputusan Final** (§0 [README](./README.md)): buku kas (KF-1), modular monolith + path-based (KF-2), mesin langganan (KF-3), kesiapan operasional (KF-4), dan **sambungkan semua FE↔API lebih dulu** (KF-5).

> Ini rencana, **belum dieksekusi**. Estimasi indikatif (tim kecil). Setiap fase punya **Definisi Selesai (DoD)**.

---

## Prinsip Urutan

1. **Stabilkan fondasi sebelum menambah fitur** — FE↔API tersambung, isolasi terjamin, test hijau.
2. **Kirim nilai inti dulu** — buku kas (dashboard, arus kas, tutup buku) = alasan bendahara memakai produk.
3. **Jadikan SaaS nyata** — identitas rapi, langganan ditegakkan, operasional siap.
4. **Tunda yang canggih** — SSO-service & subdomain hanya saat skala menuntut.

---

## Ikhtisar Fase

| Fase | Fokus | Repo utama | KF |
| --- | --- | --- | --- |
| **0** ⛔ | Stabilisasi: Global Scope + uji isolasi + **sambungkan SEMUA FE↔API** + buang dummy + test hijau | `gmim_api`, `gmim_manage`, `gmim_admin` | KF-5 |
| **1** | Inti **buku kas**: Dashboard grafik + Arus Kas + Tutup Buku | `gmim_api`, `gmim_manage` | KF-1 |
| **2** | Aset & Gaji/Honor | `gmim_api`, `gmim_manage` | — |
| **3** | Identitas modul (email global) + path `/g/<slug>` + registrasi mandiri + Demo | `gmim_api`, `gmim_manage`, `gmim_landingpage` | KF-2 |
| **4** | **Mesin Langganan/Billing** | `gmim_api`, `gmim_manage`, `gmim_admin` | KF-3 |
| **5** | **Kesiapan operasional & go-live** | semua + infra | KF-4 |
| **6** | Midtrans persembahan oleh Bendahara + Super Admin tersambung + dukungan ber-audit | `gmim_api`, `gmim_manage`, `gmim_admin` | — |
| **7** 🔮 | **(MASA DEPAN)** Subdomain + ekstraksi SSO/OIDC | infra, `gmim_api`, (`gmim_sso`) | ditunda |

> Catatan: pondasi operasional ringan (error tracking, staging, CI) dimulai di **Fase 0**; email transaksional masuk saat pertama dibutuhkan (Fase 3–4) dan **dikeraskan penuh di Fase 5**.

---

## Fase 0 — Stabilisasi & Pondasi (BLOCKER · KF-5)

**Tujuan:** fondasi aman + semua frontend benar-benar jalan di atas API (bukan dummy).

- **Isolasi:** trait `BelongsToGereja` (Global Scope + auto-set `gereja_id`) di semua model finance; `ResolveTenant` (path); **uji isolasi tenant di CI**.
- **Sambungkan FE↔API (KF-5):**
  - `gmim_manage`: ganti `financeStore` & `authStore` dari dummy/localStorage → API (axios + Sanctum). Data persist.
  - `gmim_admin`: ganti store gereja/bendahara dari dummy → API.
- **Bersih-bersih:** perbaiki suite test yang merah, jalankan di CI; siapkan `staging`; pasang error tracking (Sentry) dasar.

**DoD:** semua uji isolasi hijau; `gmim_manage` & `gmim_admin` tidak lagi memakai data dummy; test suite hijau di CI; staging hidup.

---

## Fase 1 — Inti Buku Kas (KF-1)

> Produk tetap **buku kas** (single-entry). Tidak menjanjikan "seperti Accurate".

- **Dashboard grafik:** endpoint agregat `GET /gereja/{g}/dashboard/grafik?range=weekly|monthly`; komponen `BarChartMingguan`/`BarChartBulanan` (biru `#2563eb` pemasukan, merah `#dc2626` pengeluaran) + `KasGerejaCard`. Hanya pemasukan **counted**.
- **Arus Kas + Tutup Buku:** tabel `periode_buku`; view arus kas per minggu/bulan/kategori; tombol **Tutup Buku** (kunci periode); ekspor PDF.
- Sisakan **lapisan posting bersih** (service yang mencatat transaksi) agar mudah naik ke ledger kelak — tapi jangan bangun ledger sekarang.

**DoD:** dashboard menampilkan grafik biru/merah + kas; bendahara bisa lihat arus kas per minggu/bulan/kategori dan menutup buku bulanan/tahunan dengan penguncian.

---

## Fase 2 — Aset & Gaji/Honor

- **Aset:** migrasi `aset` + CRUD ter-scope; list/tambah/edit/detail + ringkasan total nilai aset; filter kategori/kondisi.
- **Gaji/Honor:** migrasi `pegawai` + `pembayaran_gaji`; master pegawai + pembayaran per periode; "Tandai Dibayar" → otomatis buat `pengeluaran` kategori "Gaji & Honor".

**DoD:** aset terkelola dengan total nilai tampil; pembayaran gaji otomatis masuk pengeluaran & arus kas tanpa double-input.

---

## Fase 3 — Identitas Modul + Path + Onboarding (KF-2)

> Modular monolith: identitas = modul di `gmim_api`, URL path-based. **Tanpa** `gmim_sso`/subdomain.

- **Identitas:** migrasi `church_users` (`email` unik global, `status`, `login_terakhir`, role `admin_gereja`/`viewer`); endpoint `POST /auth/login { email, password }` (Sanctum) → resolusi gereja → token; FE redirect `/g/<slug>`.
- **Registrasi mandiri:** `POST /auth/register` (transaksional: gereja + **langganan trial** + Admin Gereja + seed kategori/aset/gaji; validasi slug unik+reserved & email unik); FE form daftar + cek slug real-time; landing CTA "Daftar Gratis".
- **Demo:** `financeStore` adapter `localStorage` (mode `demo`); seed + banner + reset; landing CTA "Coba Demo".

**DoD:** user login satu pintu tanpa pilih gereja (email) → `/g/<slug>`; gereja baru daftar sendiri (pendaftar = Admin Gereja, langsung trial); demo jalan tanpa akun.

---

## Fase 4 — Mesin Langganan / Billing (KF-3)

> Detail: [08-langganan-billing.md](./08-langganan-billing.md).

- Migrasi `paket` + `langganan` + `tagihan`.
- Middleware **`EnsureSubscriptionActive`** (402 saat expired; izinkan billing + read-only; banner saat `past_due`/trial hampir habis).
- Checkout via **Midtrans akun PLATFORM** (beda dari Midtrans gereja) + webhook langganan (idempoten, signature).
- Halaman billing (Admin Gereja) + kelola paket/langganan (Super Admin).
- Job harian evaluasi status + email pengingat (H-7/H-1/H+1).

**DoD:** trial otomatis; akses dibatasi saat expired; checkout→webhook memperpanjang langganan; pengingat terkirim.

---

## Fase 5 — Kesiapan Operasional & Go-Live (KF-4)

> Detail: [09-operasional-kesiapan.md](./09-operasional-kesiapan.md).

- **Backup PITR + uji restore terjadwal** (catat RTO/RPO nyata).
- **Observability**: Sentry (FE+BE), uptime monitor, log terstruktur, alert kritis (webhook/queue/error/disk).
- **Queue andal**: Redis + Horizon; webhook & email async, retry, `failed_jobs`, idempoten.
- **Email transaksional**: provider + **SPF/DKIM/DMARC**; verifikasi, reset password, invoice, pengingat.
- **Lifecycle tenant**: ekspor data, suspend (read-only saat nunggak), hapus (retensi → hard delete).
- Pengerasan: HTTPS/HSTS, CORS, rate limit + captcha, secrets aman, kebijakan privasi (UU PDP), audit append-only.

**DoD:** seluruh checklist go-live ([09 §8](./09-operasional-kesiapan.md#8-checklist-go-live-operasional)) terpenuhi.

---

## Fase 6 — Midtrans Persembahan + Super Admin

- **Midtrans persembahan oleh Bendahara**: `GET/PUT /gereja/{g}/midtrans/config` (server_key write-only/masked) + `POST /midtrans/test`; alur persembahan online + webhook (akun gereja).
- **Super Admin tersambung API**: `platform_admins` + guard terpisah; UI `gmim_admin` (kini dummy → API) kelola gereja/bendahara/langganan; akses dukungan **read-only + "masuk sebagai" ber-audit**; panel status Midtrans tiap gereja (tanpa server_key).

**DoD:** bendahara isi key Midtrans sendiri & terima persembahan online; Super Admin kelola gereja nyata; semua akses lintas-gereja tercatat di audit.

---

## Fase 7 — (MASA DEPAN, ditunda) Subdomain + Ekstraksi SSO 🔮

> Hanya saat skala/kebutuhan menuntut (banyak tenant, butuh isolasi origin, custom domain, banyak service/integrasi).

- Wildcard DNS `*.gmim-keuangan.id` + TLS; `ResolveTenant` dari host; CORS allow-list.
- Ekstraksi modul identitas → `gmim_sso` (OIDC/Passport, JWT/JWKS); migrasi Sanctum→JWT; isi `sso_user_id`. Lihat [07](./07-sso-identitas.md).

**DoD (jika dikerjakan):** tiap gereja di `slug.gmim-keuangan.id`; identitas terpusat berbasis SSO; isolasi origin aktif.

---

## Keputusan yang Sudah Final (tidak perlu ditanya lagi)

- ✅ **Buku kas** (bukan double-entry) — KF-1.
- ✅ **Path-based + modular monolith**, SSO & subdomain ditunda — KF-2.
- ✅ **Mesin langganan dibangun** (Fase 4) — KF-3.
- ✅ **Operasional jadi syarat go-live** (Fase 5) — KF-4.
- ✅ **Sambungkan semua FE↔API dulu** (Fase 0) — KF-5.

## Keputusan kecil yang masih bisa ditentukan saat eksekusi

1. **Domain final** `gmim-keuangan.id` (update spec admin yang masih `gmimjadi.com`).
2. **Penyusutan aset**: dicatat saja (MVP) vs hitung otomatis.
3. **Approval gaji**: perlu approval atau langsung dibayar.
4. **Verifikasi email** saat daftar: wajib sebelum aktif atau menyusul.
5. **Lama trial & grace** (mis. trial 14 hari, grace 7 hari) & harga paket.

> Eksekusi dimulai dari **Fase 0**.
