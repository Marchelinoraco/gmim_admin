# 08 · Langganan & Billing (KF-3 / AD-11)

> Mesin langganan agar produk benar-benar SaaS: paket, status (trial/active/past_due/expired), tagihan, **middleware penegak expiry**, dan halaman billing. Dibangun **sejak awal**, bukan belakangan.

---

## 1. Prinsip Penting: Dua Konteks Midtrans yang BERBEDA

| Konteks | Akun Midtrans | Dana mengalir ke | Dikelola di |
| --- | --- | --- | --- |
| **Persembahan jemaat** (AD-8) | **akun gereja** (per tenant) | rekening **gereja** | input Bendahara di `gmim_manage` |
| **Pembayaran langganan** (AD-11) | **akun PLATFORM** (satu, milik operator) | rekening **operator platform** | `gmim_api` (modul billing) |

> Jangan campur keduanya. Gereja membayar langganannya ke **platform**; jemaat memberi persembahan ke **gereja**. Keduanya kebetulan sama-sama pakai Midtrans, tapi akun & tujuan dananya berbeda.

---

## 2. Status Langganan (state machine)

```
              daftar
                │
                ▼
            ┌────────┐   bayar    ┌────────┐
            │ trial  │──────────► │ active │
            └───┬────┘            └───┬────┘
       trial habis                jatuh tempo tak dibayar
                │                     │
                ▼                     ▼
            ┌─────────┐  +grace   ┌──────────┐  bayar   ┌────────┐
            │ expired │◄──────────│ past_due │─────────►│ active │
            └─────────┘           └──────────┘          └────────┘
                │ (operator/gereja)                 cancel
                └──────────────► canceled ◄───────────────
```

| Status | Arti | Akses tenant |
| --- | --- | --- |
| `trial` | masa coba (mis. 14 hari) | **penuh** |
| `active` | langganan berjalan/terbayar | **penuh** |
| `past_due` | tagihan lewat jatuh tempo, dalam **grace** (mis. 7 hari) | **penuh + banner peringatan** |
| `expired` | trial habis / grace lewat | **read-only** + halaman billing saja |
| `canceled` | dihentikan | read-only / ditutup sesuai kebijakan |

---

## 3. Skema Data (di `gmim_api`)

```php
// Katalog paket
Schema::create('paket', function (Blueprint $t) {
    $t->string('id')->primary();
    $t->string('nama');                 // Basic | Standard | Premium
    $t->unsignedBigInteger('harga_bulanan')->default(0);
    $t->unsignedBigInteger('harga_tahunan')->default(0);
    $t->json('batas')->nullable();      // mis. {max_pengguna: 5, fitur: ["aset","gaji"]}
    $t->boolean('is_active')->default(true);
    $t->timestamps();
});

// Langganan per gereja (1-1 dengan gereja)
Schema::create('langganan', function (Blueprint $t) {
    $t->string('id')->primary();
    $t->string('gereja_id');
    $t->string('paket_id');
    $t->string('status')->default('trial');     // trial|active|past_due|expired|canceled
    $t->string('siklus')->default('bulanan');   // bulanan|tahunan
    $t->date('trial_berakhir')->nullable();
    $t->date('mulai')->nullable();
    $t->date('berakhir')->nullable();           // tanggal kedaluwarsa berjalan
    $t->boolean('auto_renew')->default(true);
    $t->timestamps();
    $t->foreign('gereja_id')->references('id')->on('gereja')->cascadeOnDelete();
    $t->unique('gereja_id');
});

// Tagihan / invoice
Schema::create('tagihan', function (Blueprint $t) {
    $t->string('id')->primary();
    $t->string('gereja_id');
    $t->string('langganan_id');
    $t->string('nomor')->unique();              // INV-2026-0001
    $t->string('periode');                      // "2026-06" atau rentang
    $t->unsignedBigInteger('jumlah');
    $t->string('status')->default('unpaid');    // unpaid|paid|void
    $t->date('jatuh_tempo');
    $t->timestamp('dibayar_pada')->nullable();
    $t->string('midtrans_order_id')->nullable();// akun PLATFORM
    $t->timestamps();
    $t->foreign('gereja_id')->references('id')->on('gereja')->cascadeOnDelete();
    $t->index(['gereja_id', 'status']);
});
```

> Field `status_langganan`/`paket_langganan`/`langganan_berakhir` yang sebelumnya diusulkan di tabel `gereja` ([03 §2](./03-model-data.md)) **dipindah/dinormalkan** ke tabel `langganan` ini (sumber kebenaran tunggal). `gereja` boleh menyimpan cache `status_langganan` untuk tampilan cepat.

---

## 4. Penegakan Expiry — Middleware `EnsureSubscriptionActive`

Dipasang setelah `EnsureUserBelongsToGereja`, **sebelum** controller data:

```
1. Ambil langganan gereja aktif.
2. Hitung status efektif (trial_berakhir/berakhir vs hari ini, + grace).
3. Jika expired/canceled:
     - izinkan HANYA rute billing + read-only (GET laporan/dashboard);
     - tolak semua mutasi (POST/PUT/DELETE) → 402 Payment Required.
4. Jika past_due: lanjut, tapi sisipkan header/flag agar FE tampilkan banner.
```

- **402 Payment Required** = kode yang jelas untuk FE mengarahkan ke halaman billing.
- **Job harian** (`langganan:evaluasi`) memutakhirkan status (trial→expired, active→past_due→expired) + kirim email pengingat (H-7, H-1, H+1). Lihat [09](./09-operasional-kesiapan.md).

---

## 5. Alur Pembayaran Langganan (Midtrans platform)

```
Admin Gereja        gmim_manage/billing      gmim_api (billing)        Midtrans (platform)
 │ pilih paket/perpanjang  │                       │                          │
 ├────────────────────────►│ POST /langganan/checkout                         │
 │                         ├──────────────────────►│ buat tagihan (unpaid)    │
 │                         │                        ├─ Snap token (server_key platform) ─►│
 │                         │   { snap_token }       │◄─────────────────────────┤
 │                         │◄───────────────────────┤                          │
 │  bayar via Snap ────────┼────────────────────────┼─────────────────────────►│
 │                         │                        │◄─ webhook notifikasi ─────┤
 │                         │                        │ verifikasi signature + idempoten
 │                         │                        │ tandai tagihan=paid, langganan=active, perpanjang berakhir
 │                         │◄── status terbaru ─────┤
```

- Webhook langganan **terpisah** dari webhook persembahan (order_id ber-prefix, mis. `SUB-...` vs `OFR-...`), atau endpoint berbeda.
- Idempoten by `order_id`; verifikasi signature SHA-512 (sama disiplin dengan persembahan).

---

## 6. Halaman & Peran

| Permukaan | Siapa | Isi |
| --- | --- | --- |
| `gmim_manage` → Billing (`/g/<slug>/billing`) | **Admin Gereja** | Paket aktif, status, tanggal berakhir, daftar tagihan, tombol Bayar/Perpanjang/Upgrade |
| `gmim_admin` → Langganan | **Super Admin** | Semua langganan, override manual (perpanjang gratis, ubah paket, suspend), kelola katalog `paket`, laporan pendapatan |
| Banner global (FE) | semua peran gereja | Muncul saat `past_due`/`trial` mendekati habis → CTA ke billing |

---

## 7. Endpoint (ringkas)

| Method | Path | Peran |
| --- | --- | --- |
| `GET` | `/gereja/{g}/langganan` | Admin Gereja/Bendahara |
| `GET` | `/gereja/{g}/tagihan` | Admin Gereja |
| `POST` | `/gereja/{g}/langganan/checkout` | Admin Gereja |
| `POST` | `/billing/midtrans/notification` | publik (webhook platform) |
| `GET/POST/PUT` | `/admin/paket`, `/admin/langganan/{id}` | Super Admin |

---

## 8. Definisi Selesai (untuk Fase Billing)

- [ ] Trial otomatis saat daftar; status efektif dihitung benar (termasuk grace).
- [ ] `EnsureSubscriptionActive` menolak mutasi saat expired (402) tapi izinkan billing + read-only.
- [ ] Checkout → Snap (akun platform) → webhook → langganan diperpanjang (idempoten).
- [ ] Email pengingat H-7/H-1/H+1 terkirim.
- [ ] Super Admin bisa override (perpanjang/suspend) + tercatat di audit.

---

**Lanjut:** [09-operasional-kesiapan.md](./09-operasional-kesiapan.md) — backup, observability, email, lifecycle tenant.
