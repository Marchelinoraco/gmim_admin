# Arsitektur Platform SaaS Keuangan GMIM

> **Status:** Rancangan (plan) — belum dieksekusi menjadi kode.
> **Disusun:** 2026-06-04 · **Revisi keputusan final:** 2026-06-04 · **Lokasi dokumen:** `gmim_admin/docs/arsitektur-saas/`
> **Posisi produk:** **buku kas digital multi-gereja** yang sederhana, transparan, dan mudah dipakai bendahara gereja kecil. **Bukan** software akuntansi double-entry — *jangan* memasarkan "seperti Accurate".

Dokumen ini adalah **cetak biru (blueprint) arsitektur** untuk mengubah aplikasi keuangan gereja GMIM menjadi **produk SaaS multi-tenant** yang bisa dipakai banyak gereja secara mandiri (self-service) maupun lewat onboarding yang dibantu admin.

Versi visual (HTML yang mudah dibaca) tersedia di folder [`html/`](./html/index.html) — buka `html/index.html` di browser.

---

## 0. Keputusan Final (2026-06-04) — MENGIKAT

> Keputusan ini **menggantikan** bagian dokumen yang bertentangan. Beberapa doc lama (mis. [07 SSO](./07-sso-identitas.md), bagian subdomain di [01](./01-arsitektur-multi-tenant.md)) **dipertahankan sebagai blueprint masa depan**, bukan rencana eksekusi sekarang.

| # | Keputusan final | Konsekuensi |
| --- | --- | --- |
| **KF-1** | **Tetap buku kas** (single-entry), **bukan** double-entry. | Tidak menjanjikan "seperti Accurate". Tetap sediakan lapisan *posting* bersih agar bisa naik ke ledger kelak — tapi tidak dibangun sekarang. |
| **KF-2** | **Tunda SSO-sebagai-service & subdomain.** Pakai **modular monolith**: identitas = **modul di `gmim_api`** (Sanctum + email global), URL = **path-based** (`/g/<slug>`). | Tidak ada repo `gmim_sso` & wildcard DNS/TLS sekarang. Batas modul dijaga bersih agar bisa diekstrak jadi SSO + subdomain saat skala menuntut. |
| **KF-3** | **Bangun mesin langganan sejak awal.** Status `trial/active/past_due/expired` + tanggal + **middleware penegak expiry** + halaman billing. | SaaS yang nyata: trial→bayar, suspend saat nunggak. Detail: [08](./08-langganan-billing.md). |
| **KF-4** | **Kesiapan operasional = syarat go-live.** Backup PITR + **uji restore terjadwal**, error tracking (Sentry), uptime monitor, log terstruktur + alert, queue andal (webhook & email), email transaksional deliverable, lifecycle tenant (export/suspend/hapus). | Detail: [09](./09-operasional-kesiapan.md). |
| **KF-5** | **Disiplin eksekusi: sambungkan SEMUA frontend ke API lebih dulu.** | `gmim_manage` & `gmim_admin` berhenti pakai data dummy; test hijau; CI isolasi. Ini Fase 0 — blocker semua fitur. |

---

## 1. Ringkasan Eksekutif

Kita membangun platform di mana:

1. **Pengunjung** datang ke landing page (`gmim_landingpage`).
2. **Pengguna terdaftar** login lewat satu pintu (modul auth di `gmim_api`) dengan **email**, lalu **otomatis diarahkan ke ruang kerja gerejanya** (`/g/<slug>`) tanpa perlu memilih gereja.
3. **Calon pengguna** bisa mencoba **mode Demo** (data hanya di `localStorage`, tidak menyentuh server) untuk mengenal fitur.
4. **Gereja baru** bisa **mendaftar mandiri** (isi nama gereja, alamat, bendahara) → pendaftar menjadi **Admin Gereja** yang mengelola akun-akun lain. Alternatifnya, hubungi admin untuk onboarding yang dibantu.
5. **Data keuangan tiap gereja terisolasi total** — tidak ada gereja yang bisa melihat data gereja lain.
6. **Bendahara** dapat memasukkan **key Midtrans** gerejanya sendiri agar persembahan online masuk langsung ke rekening gereja.
7. **Langganan ditegakkan**: trial berakhir / nunggak → akses dibatasi sampai dibayar.
8. **Super Admin** (operator platform, di `gmim_admin`) dapat menelusuri seluruh gereja untuk dukungan — dengan kontrol akses & jejak audit ketat.
9. **Dashboard gereja** menampilkan grafik (bar per minggu/bulan: **biru = pemasukan**, **merah = pengeluaran**, plus **kas gereja**), serta modul: **Aset Gereja**, **Arus Kas** (mingguan/bulanan/kategori untuk tutup buku), dan **Gaji/Honor**.

---

## 2. Peta Repo (monorepo lokal)

| Repo | Peran | Stack | URL (rencana) |
| --- | --- | --- | --- |
| `gmim_landingpage` | Pemasaran + pintu masuk daftar/demo/login | HTML statis + Tailwind CDN | `gmim-keuangan.id` (apex / `www`) |
| `gmim_admin` | **Super Admin** platform (kelola gereja, langganan, dukungan) | Vue 3 + Pinia + Tailwind + radix-vue | `admin.gmim-keuangan.id` |
| `gmim_manage` | Ruang kerja keuangan **per gereja** + halaman login/daftar/billing | Vue 3 + Pinia + Tailwind + Chart.js | `gmim-keuangan.id/g/<slug>` (path-based) |
| `gmim_api` | Backend REST API + multi-tenant + **modul identitas/auth** + langganan + Midtrans | Laravel 13 + Sanctum + MySQL | `api.gmim-keuangan.id` |
| ~~`gmim_sso`~~ | **DITUNDA** (KF-2). Identitas dimulai sebagai modul di `gmim_api`; ekstraksi ke service SSO = opsi masa depan ([07](./07-sso-identitas.md)). | — | — |

> **Subdomain per gereja (`<slug>.gmim-keuangan.id`) DITUNDA (KF-2).** MVP memakai **path** `gmim-keuangan.id/g/<slug>`. Domain final tetap **`gmim-keuangan.id`** (spec lama `gmim_admin` yang memakai `gmimjadi.com` perlu diperbarui).

---

## 3. Keputusan Arsitektur Kunci

| # | Keputusan | Pilihan (setelah revisi final) | Alasan singkat |
| --- | --- | --- | --- |
| AD-1 | Isolasi tenant di URL | **Path-based** (`/g/<slug>`) untuk MVP. Subdomain = opsi masa depan. | Infra sederhana (1 domain/sertifikat), login same-origin, dekat dengan API kini (`/gereja/{gereja}`). Detail: [01](./01-arsitektur-multi-tenant.md). |
| AD-2 | Database | **Single DB + kolom `gereja_id`** di semua tabel | Backup 1 proses, migration 1×, onboarding = insert 1 baris. |
| AD-3 | Isolasi data | **Global Scope `BelongsToGereja` + Tenant Middleware + uji isolasi di CI** | Developer lupa filter → tetap aman. Wajib sebelum go-live. |
| AD-4 | Login | **Modul auth di `gmim_api`** (Sanctum + **email unik global**): login tanpa pilih gereja → resolusi gereja → token → redirect `/g/<slug>`. | Sederhana, same-origin, tanpa OIDC/JWT dulu. Detail: [02](./02-autentikasi-onboarding.md). |
| AD-5 | Demo | **Client-only, `localStorage`**, tanpa panggilan tulis ke API | Calon pengguna mengenal fitur tanpa mengotori data produksi. |
| AD-6 | Pendaftaran | **Self-service** (pendaftar = Admin Gereja) **dan** onboarding dibantu Super Admin | SaaS murni + jalur pendampingan. |
| AD-7 | Peran | Super Admin · Admin Gereja · Bendahara · Pelayan Khusus · Viewer/Majelis | RBAC bertingkat. Detail: [05](./05-keamanan-rbac-midtrans.md). |
| AD-8 | Midtrans (persembahan) | Key **per gereja**, di-input **Bendahara/Admin Gereja**, `server_key` terenkripsi & tak pernah ke FE | Dana persembahan langsung ke rekening gereja. |
| AD-9 | Akses Super Admin lintas-gereja | **Default read-only + "masuk sebagai" (impersonasi) ber-audit** | Dukungan teknis tanpa mengorbankan kepercayaan. |
| **AD-11** | **Langganan / Billing** | **Mesin langganan di `gmim_api`**: `paket`/`langganan`/`tagihan`, middleware `EnsureSubscriptionActive`, bayar via **Midtrans akun PLATFORM** (beda dari Midtrans gereja). | SaaS berkelanjutan. Detail: [08](./08-langganan-billing.md). |
| **AD-12** | **Kesiapan operasional** | Backup+restore drill, observability, queue, email transaksional, lifecycle tenant. | Syarat "kokoh". Detail: [09](./09-operasional-kesiapan.md). |
| AD-10 | ~~SSO terpisah~~ | **DITUNDA (KF-2)** → modul identitas di `gmim_api` dulu. Blueprint ekstraksi: [07](./07-sso-identitas.md). | Hindari over-engineering dini. |

---

## 4. Daftar Isi Dokumen

> Doc 01 & 07 mengandung bagian **masa depan** (subdomain & SSO) yang **ditunda** per KF-2 — baca dengan konteks §0.

1. [01-arsitektur-multi-tenant.md](./01-arsitektur-multi-tenant.md) — Model multi-tenant, path-based (MVP) vs subdomain (masa depan), isolasi berlapis, diagram konteks.
2. [02-autentikasi-onboarding.md](./02-autentikasi-onboarding.md) — Tiga alur masuk (login terdaftar, demo, pendaftaran mandiri), RBAC, akses dukungan Super Admin.
3. [03-model-data.md](./03-model-data.md) — Skema & tabel baru (gereja, users+role, **aset**, **gaji**, **tutup buku**, midtrans, audit) + ERD.
4. [04-modul-fitur.md](./04-modul-fitur.md) — **Dashboard grafik**, **Aset**, **Arus Kas + Tutup Buku**, **Gaji/Honor**, Midtrans, landing.
5. [05-keamanan-rbac-midtrans.md](./05-keamanan-rbac-midtrans.md) — Isolasi berlapis, RBAC, key Midtrans, audit & akses Super Admin.
6. [06-roadmap-implementasi.md](./06-roadmap-implementasi.md) — Rencana bertahap (urutan final) + prasyarat go-live.
7. [07-sso-identitas.md](./07-sso-identitas.md) — **(MASA DEPAN, ditunda)** blueprint ekstraksi modul identitas → SSO/OIDC.
8. [08-langganan-billing.md](./08-langganan-billing.md) — **Mesin langganan**: paket, status, tagihan, penegakan expiry, halaman billing.
9. [09-operasional-kesiapan.md](./09-operasional-kesiapan.md) — **Kesiapan operasional**: backup+restore, observability, queue, email, lifecycle tenant.
10. [10-plan-fitur-lanjutan.md](./10-plan-fitur-lanjutan.md) — **Plan fitur lanjutan**: Cash Basis Accounting, Slug otomatis + lokasi gereja, Arsitektur trial→berbayar, Menu Transaksi Belum Diterima.

---

## 5. Cara Membaca

- **Eksekutif / pemilik produk:** §0 + dokumen ini + folder [`html/`](./html/index.html).
- **Arsitek / backend:** [01](./01-arsitektur-multi-tenant.md) → [03](./03-model-data.md) → [08](./08-langganan-billing.md) → [05](./05-keamanan-rbac-midtrans.md) → [09](./09-operasional-kesiapan.md).
- **Frontend:** [02](./02-autentikasi-onboarding.md) → [04](./04-modul-fitur.md).
- **Manajer proyek:** [06-roadmap-implementasi.md](./06-roadmap-implementasi.md).

> ⚠️ **Penting:** Ini dokumen rancangan. **Belum ada kode yang diubah.** Keputusan final (§0) sudah disepakati; eksekusi dimulai dari **Fase 0** di [roadmap](./06-roadmap-implementasi.md).
