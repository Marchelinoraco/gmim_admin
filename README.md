# gmim_admin

VueJS frontend (Vue 3 + Vite) untuk **Super Admin SaaS** dengan **data dummy (in-memory)**.

## Jalankan

```bash
cd /Users/bernaldonapitupulu/Documents/Allinodev/gmim/gmim_admin
npm install
npm run dev
```

Default port: `5174` (lihat `vite.config.ts`).

## Menu yang tersedia (dummy)

- Dashboard Super Admin: `/super-admin/dashboard`
  - Total Gereja Terdaftar, Gereja Aktif/Trial/Expired, Total Bendahara, Total Transaksi (dummy), Statistik Langganan
- Manajemen Gereja: `/super-admin/churches`
  - List, tambah, detail, edit, aktif/nonaktif, hapus (CRUD in-memory)
- Manajemen Bendahara: `/super-admin/treasurers`
  - List, tambah, detail, edit, aktif/nonaktif, hapus + reset password (dummy)
- Manajemen Langganan: `/super-admin/subscriptions`, `/super-admin/payments`, `/super-admin/subscription-history`
- Monitoring Sistem: `/super-admin/monitoring`
- Pengaturan Sistem: `/super-admin/settings`

## Data dummy

- Seed data: `src/data/dummy.ts`
- State in-memory (CRUD): `src/state/*.ts`
