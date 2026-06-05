# 09 · Kesiapan Operasional (KF-4 / AD-12)

> "Kokoh" diuji saat insiden pertama, bukan saat demo. Ini syarat operasional **sebelum go-live**: backup yang teruji, observability, queue andal, email deliverable, dan lifecycle tenant.

---

## 1. Backup & Pemulihan (yang teruji)

> **Backup yang belum pernah di-restore = belum ada backup.**

| Item | Standar |
| --- | --- |
| Full backup harian | otomatis, terenkripsi, retensi ≥ 30 hari |
| **PITR** (point-in-time recovery) | binlog MySQL aktif → bisa pulih ke menit tertentu |
| Penyimpanan | off-site / object storage berbeda region |
| **Restore drill terjadwal** | **tiap kuartal**: pulihkan ke environment terpisah, verifikasi data + login |
| Target | **RPO ≤ 15 menit**, **RTO ≤ 4 jam** (tetapkan & uji) |
| Cakupan | DB **+** file `storage` (bukti persembahan/aset) |

Runbook restore singkat didokumentasikan & pernah dijalankan minimal 1×.

---

## 2. Observability (lihat sebelum pengguna komplain)

| Pilar | Alat (saran) | Yang dipantau |
| --- | --- | --- |
| **Error tracking** | **Sentry** (FE Vue + BE Laravel) | exception, stack trace, rilis, user/tenant context (tanpa data sensitif) |
| **Uptime monitor** | Better Stack / UptimeRobot / Healthchecks | `/health` tiap surface, status page |
| **Log terstruktur** | Laravel JSON log channel + agregator | request id, gereja_id, actor, latency |
| **Metrics & alert** | dashboard + alert | error rate, latency p95, **antrean webhook**, **job gagal**, kapasitas disk/DB |

**Alert wajib**: webhook Midtrans gagal/backlog, job queue gagal berulang, error rate naik, uptime turun, langganan gagal evaluasi, disk/DB penuh.

---

## 3. Queue & Job Andal

| Aspek | Keputusan |
| --- | --- |
| Driver | Redis (atau database) + **Laravel Horizon** (monitoring) |
| Pekerjaan async | webhook Midtrans (persembahan & langganan), email, ekspor data, job harian langganan |
| Reliabilitas | retry dengan backoff, **dead-letter**/`failed_jobs`, **idempoten** (kunci `order_id`/`message_id`) |
| Webhook | terima cepat (200) → proses di queue; verifikasi signature sebelum proses |

---

## 4. Email Transaksional (harus sampai)

| Aspek | Keputusan |
| --- | --- |
| Provider | Postmark / Amazon SES / Mailgun / Resend (bukan SMTP gmail) |
| **Deliverability** | **SPF + DKIM + DMARC** terkonfigurasi di domain |
| Jenis email | verifikasi email, reset password, undangan akun, **invoice/tagihan**, pengingat langganan (H-7/H-1/H+1), notifikasi approval |
| Antrean | dikirim via queue + retry; lacak bounce/complaint |
| Template | konsisten, berbahasa Indonesia, ada jejak (audit) untuk email penting |

---

## 5. Lifecycle Tenant

| Tahap | Perilaku |
| --- | --- |
| **Onboarding** | daftar → trial → seed data default (kategori, aset, "Gaji & Honor") |
| **Suspend** (nunggak) | `expired` → akses **read-only** + halaman billing (lihat [08](./08-langganan-billing.md)); data **tidak** dihapus |
| **Export data** | Admin Gereja bisa **ekspor seluruh data gerejanya** (Excel/CSV/JSON: pemasukan, pengeluaran, aset, gaji, laporan) — hak atas data |
| **Offboarding/Hapus** | permintaan hapus → **soft delete** → **hard delete setelah masa retensi** (mis. 90 hari) + konfirmasi; sediakan ekspor final |
| **Reaktivasi** | bayar → kembali `active`, data utuh (selama belum hard-delete) |

---

## 6. Keamanan Operasional & Kepatuhan (ringkas)

- **Secrets** di vault/ENV terkelola (bukan di git); rotasi key Midtrans/app.
- **Audit log append-only** untuk aksi sensitif & akses Super Admin (lihat [05](./05-keamanan-rbac-midtrans.md)).
- **UU PDP (Indonesia)**: minimisasi data, kebijakan privasi & retensi, prosedur notifikasi kebocoran, persetujuan pengelolaan data jemaat. (Data kartu tidak disimpan — ditangani Midtrans.)
- **Rate limit + captcha** di login, daftar, dan checkout.

---

## 7. Lingkungan & Rilis

| Item | Keputusan |
| --- | --- |
| Environment | `local` → **`staging`** → `production` (staging wajib sebelum rilis) |
| CI | jalankan test (unit + **uji isolasi tenant**) tiap PR; blok merge bila merah |
| Migrasi | reversible + diuji di staging; backup sebelum migrasi produksi |
| Deploy | otomatis dari main yang hijau; rollback terdokumentasi |
| Feature flag | untuk fitur berisiko (mis. pembayaran) |

---

## 8. Checklist Go-Live Operasional

- [ ] Backup harian + PITR aktif; **restore drill** pernah sukses (catat RTO/RPO nyata)
- [ ] Sentry (FE+BE) + uptime monitor + alert kritis aktif
- [ ] Queue + Horizon jalan; webhook diproses async & idempoten; `failed_jobs` dipantau
- [ ] Email provider + SPF/DKIM/DMARC terverifikasi; email penting terkirim & terlacak
- [ ] Ekspor data tenant berfungsi; alur suspend & hapus teruji
- [ ] Staging mirip produksi; CI memblok merge bila test/uji isolasi merah
- [ ] Secrets aman; rate limit + captcha; kebijakan privasi (UU PDP) terbit

---

**Kembali:** [README](./README.md) · **Terkait:** [08 Billing](./08-langganan-billing.md) · [05 Keamanan](./05-keamanan-rbac-midtrans.md) · [06 Roadmap](./06-roadmap-implementasi.md)
