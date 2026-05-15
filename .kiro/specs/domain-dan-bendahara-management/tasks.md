# Implementation Plan: Manajemen Domain dan Bendahara

## Overview

Implementasi refactoring arsitektur gmim_admin agar mengikuti konvensi gmim_client (Pinia, Tailwind CSS, folder structure baru) sekaligus memperluas fungsionalitas manajemen domain dan bendahara. Setiap task membangun di atas task sebelumnya secara inkremental.

## Tasks

- [x] 1. Setup infrastruktur dan dependensi
  - [x] 1.1 Install dependensi baru dan konfigurasi Tailwind CSS
    - Install tailwindcss, postcss, autoprefixer, pinia, fast-check, vitest, @vue/test-utils, @pinia/testing
    - Buat file `tailwind.config.js` dan `postcss.config.js` (copy pola dari gmim_client)
    - Buat file `src/assets/tailwind.css` dengan directive @tailwind base/components/utilities
    - Import tailwind.css di `src/main.js`
    - Konversi `vite.config.ts` ke `vite.config.js` dan tambahkan alias `@` ke `src/`
    - Hapus `tsconfig.json` (migrasi ke JavaScript)
    - Update `package.json` scripts: tambahkan `"test": "vitest --run"` dan `"test:watch": "vitest"`
    - _Requirements: Arsitektur konsisten dengan gmim_client_

  - [x] 1.2 Buat folder structure baru
    - Buat direktori: `src/components/ui/`, `src/components/layout/`, `src/components/gereja/`, `src/components/bendahara/`, `src/data/`, `src/layouts/`, `src/router/`, `src/stores/`, `src/utils/`, `src/views/super-admin/dashboard/`, `src/views/super-admin/gereja/`, `src/views/super-admin/bendahara/`
    - Buat file `src/main.js` baru yang mengimport Vue, Pinia, Router, dan Tailwind CSS
    - _Requirements: Arsitektur konsisten dengan gmim_client_

- [x] 2. Base UI components dan layout
  - [x] 2.1 Copy Base UI components dari gmim_client
    - Copy `BaseCard.vue`, `BaseTable.vue`, `BaseButton.vue`, `BaseModal.vue`, `BaseInput.vue`, `BaseSelect.vue`, `BaseAlert.vue` dari gmim_client ke `src/components/ui/`
    - Pastikan semua komponen menggunakan Tailwind CSS classes
    - _Requirements: Arsitektur konsisten dengan gmim_client_

  - [x] 2.2 Implementasi AdminLayout dengan Tailwind CSS
    - Buat `src/layouts/AdminLayout.vue` dengan sidebar navigation dan header bar menggunakan Tailwind CSS
    - Buat `src/components/layout/SidebarNav.vue` dengan menu items: Dashboard, Gereja, Bendahara
    - Buat `src/components/layout/HeaderBar.vue` dengan judul halaman
    - Gunakan `<router-view>` untuk konten halaman
    - _Requirements: Arsitektur konsisten dengan gmim_client_

- [x] 3. Data layer dan utility functions
  - [x] 3.1 Buat dummy data files
    - Buat `src/data/dummyGereja.js` dengan model Gereja (termasuk field statusDomain: "aktif"/"pending"/"nonaktif")
    - Buat `src/data/dummyBendahara.js` dengan model Bendahara (termasuk field loginTerakhir, createdAt, updatedAt)
    - Data menggunakan penamaan bahasa Indonesia sesuai design document
    - _Requirements: 1.4, 1.5, 3.1, 3.3_

  - [x] 3.2 Implementasi fungsi validasi subdomain
    - Buat `src/utils/validasiSubdomain.js` dengan fungsi `validasiSubdomain(subdomain)` dan `isSubdomainUnik(subdomain, gerejaList, excludeId)`
    - Validasi: panjang 3-30 karakter, regex `^[a-z0-9]+(-[a-z0-9]+)*$`, wajib diisi
    - Return format: `{ valid: boolean, pesan: string }`
    - _Requirements: 1.2, 1.3, 1.7, 1.8_

  - [x] 3.3 Implementasi fungsi validasi bendahara
    - Buat `src/utils/validasiBendahara.js` dengan fungsi `validasiBendahara(data, isCreate)`
    - Validasi: namaLengkap (2-100 karakter), email (format valid), password (8-128 karakter, hanya saat create), gerejaId (wajib), telepon (wajib), role (wajib)
    - Return format: `{ valid: boolean, errors: object }`
    - _Requirements: 3.5, 3.6, 3.7, 3.8_

  - [x] 3.4 Tulis property test untuk validasi subdomain
    - **Property 1: Validasi Subdomain** — validasiSubdomain mengembalikan valid:true hanya jika memenuhi semua syarat format
    - **Property 2: Keunikan Subdomain** — isSubdomainUnik mengembalikan false hanya jika ada gereja lain dengan subdomain sama
    - **Validates: Requirements 1.2, 1.3, 1.7, 1.8**

  - [x] 3.5 Tulis property test untuk validasi bendahara
    - **Property 6: Validasi Form Bendahara** — validasiBendahara mengembalikan error untuk setiap field yang tidak memenuhi aturan
    - **Validates: Requirements 3.5, 3.6, 3.7, 3.8**

- [x] 4. Checkpoint - Pastikan semua test lulus
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [x] 5. Pinia stores
  - [x] 5.1 Implementasi gerejaStore
    - Buat `src/stores/gerejaStore.js` menggunakan Pinia composition API (`defineStore` dengan setup function)
    - State: `gerejaList`, `notifikasi`
    - Getters: `gerejaAktifDanPending` (filter statusDomain !== "nonaktif")
    - Actions: `getById`, `tambahGereja` (statusDomain selalu "pending"), `updateGereja`, `hapusGereja`, `isSubdomainTersedia`, `aktifkanDomain`, `nonaktifkanDomain`
    - Gunakan fungsi dari `validasiSubdomain.js` untuk validasi
    - _Requirements: 1.2, 1.3, 1.4, 1.6, 2.7, 2.8, 2.9_

  - [x] 5.2 Implementasi bendaharaStore
    - Buat `src/stores/bendaharaStore.js` menggunakan Pinia composition API
    - State: `bendaharaList`, `notifikasi`
    - Getters: `bendaharaByGereja(gerejaId)`
    - Actions: `getById`, `tambahBendahara` (status selalu "active"), `updateBendahara`, `hapusBendahara`, `toggleStatus`, `resetPassword`, `isEmailTerdaftar`, `filterBendahara`
    - Filter menggunakan logika AND untuk pencarian + filterGereja + filterStatus
    - _Requirements: 3.1, 3.3, 3.4, 4.2, 4.3, 4.4, 4.5, 5.2, 5.3_

  - [x] 5.3 Tulis property tests untuk gerejaStore
    - **Property 3: Gereja Baru Selalu Berstatus Domain "pending"**
    - **Property 4: Transisi Status Domain** — aktifkanDomain dan nonaktifkanDomain mengubah status dengan benar
    - **Property 5: Filter Gereja Aktif dan Pending** — getter hanya mengembalikan gereja aktif/pending
    - **Validates: Requirements 1.4, 2.7, 2.8, 3.1**

  - [x] 5.4 Tulis property tests untuk bendaharaStore
    - **Property 7: Keunikan Email per Gereja**
    - **Property 8: Bendahara Baru Selalu Berstatus "active"**
    - **Property 9: Filter Kombinasi Bendahara (Logika AND)**
    - **Property 10: Toggle Status Bendahara**
    - **Validates: Requirements 3.3, 3.4, 4.2, 4.3, 4.4, 4.5, 5.2, 5.3**

- [x] 6. Checkpoint - Pastikan semua test lulus
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [x] 7. Komponen domain gereja
  - [x] 7.1 Implementasi FormGereja.vue
    - Buat `src/components/gereja/FormGereja.vue` dengan props `mode` ("tambah"/"edit") dan `initialData`
    - Field: nama, alamat, namaPendeta, telepon, subdomain, paketLangganan
    - Preview URL real-time: `{subdomain}.gmimjadi.com`
    - Validasi subdomain real-time (format + keunikan via store)
    - Dialog konfirmasi saat mengubah subdomain di mode edit
    - Gunakan BaseInput, BaseSelect, BaseButton, BaseModal
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8_

  - [x] 7.2 Implementasi TabelGereja.vue
    - Buat `src/components/gereja/TabelGereja.vue` dengan props `data` (array Gereja)
    - Kolom: Nama, Subdomain, Status Domain (badge berwarna), Paket, Aksi
    - Badge: hijau="aktif", kuning="pending", merah="nonaktif"
    - Slot aksi: tombol Detail, Edit, Hapus
    - Gunakan BaseTable
    - _Requirements: 1.5_

  - [x] 7.3 Implementasi InfoDomain.vue
    - Buat `src/components/gereja/InfoDomain.vue` dengan props `gereja`
    - Tampilkan: subdomain, URL lengkap, Status_Domain (badge berwarna)
    - Tombol Aktifkan/Nonaktifkan berdasarkan status
    - Emit events: `aktifkanDomain`, `nonaktifkanDomain`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 7.4 Implementasi DaftarBendaharaGereja.vue
    - Buat `src/components/gereja/DaftarBendaharaGereja.vue` dengan props `gerejaId`
    - Tabel bendahara terhubung ke gereja (kolom: nama, role, status badge, login terakhir)
    - Tombol "Tambah Bendahara" dan empty state
    - Emit events: `tambahBendahara`, `lihatBendahara(id)`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 8. Komponen domain bendahara
  - [x] 8.1 Implementasi FormBendahara.vue
    - Buat `src/components/bendahara/FormBendahara.vue` dengan props `mode`, `initialData`, `preselectedGerejaId`
    - Field: namaLengkap, email, password (hanya mode tambah), gereja (dropdown), telepon, role
    - Dropdown gereja hanya menampilkan gereja aktif/pending (dari store getter)
    - Info ringkas gereja setelah dipilih
    - Validasi menggunakan `validasiBendahara.js`
    - Gunakan BaseInput, BaseSelect, BaseButton
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 8.2 Implementasi TabelBendahara.vue
    - Buat `src/components/bendahara/TabelBendahara.vue` dengan props `data` (array Bendahara)
    - Kolom: Nama, Email, Gereja, Telepon, Role, Status (badge), Aksi
    - Badge status: hijau="active", merah="disabled"
    - Ikon peringatan jika gereja nonaktif
    - Slot aksi: tombol Detail, Edit, Toggle Status
    - Gunakan BaseTable
    - _Requirements: 4.1, 5.7_

  - [x] 8.3 Implementasi FilterBendahara.vue
    - Buat `src/components/bendahara/FilterBendahara.vue` dengan props `gerejaOptions`
    - Input pencarian dengan debounce 300ms
    - Dropdown filter gereja ("Semua Gereja" + daftar gereja)
    - Dropdown filter status ("Semua Status", "Active", "Disabled")
    - Emit events: `update:pencarian`, `update:filterGereja`, `update:filterStatus`
    - _Requirements: 4.2, 4.3, 4.4, 4.7_

- [x] 9. Views halaman gereja
  - [x] 9.1 Implementasi GerejaListView.vue
    - Buat `src/views/super-admin/gereja/GerejaListView.vue`
    - Gunakan TabelGereja, BaseButton (Tambah Gereja), BaseAlert (notifikasi)
    - Navigasi ke tambah/detail/edit gereja
    - Dialog konfirmasi hapus gereja (BaseModal)
    - _Requirements: 1.5_

  - [x] 9.2 Implementasi GerejaTambahView.vue
    - Buat `src/views/super-admin/gereja/GerejaTambahView.vue`
    - Gunakan FormGereja mode="tambah"
    - Panggil `gerejaStore.tambahGereja()` saat submit
    - Redirect ke detail gereja setelah berhasil
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 1.8_

  - [x] 9.3 Implementasi GerejaDetailView.vue
    - Buat `src/views/super-admin/gereja/GerejaDetailView.vue` dengan props `id`
    - Tampilkan info gereja, InfoDomain, DaftarBendaharaGereja
    - Handle aktifkan/nonaktifkan domain dengan dialog konfirmasi
    - Redirect ke daftar jika gereja tidak ditemukan
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 9.4 Implementasi GerejaEditView.vue
    - Buat `src/views/super-admin/gereja/GerejaEditView.vue` dengan props `id`
    - Gunakan FormGereja mode="edit" dengan initialData dari store
    - Panggil `gerejaStore.updateGereja()` saat submit
    - Redirect ke detail gereja setelah berhasil
    - _Requirements: 1.2, 1.3, 1.6, 1.7, 1.8_

- [ ] 10. Views halaman bendahara
  - [x] 10.1 Implementasi BendaharaListView.vue
    - Buat `src/views/super-admin/bendahara/BendaharaListView.vue`
    - Gunakan FilterBendahara, TabelBendahara, BaseAlert
    - Implementasi filter dan pencarian menggunakan `bendaharaStore.filterBendahara()`
    - Dialog konfirmasi toggle status (BaseModal)
    - Empty state "Tidak ada bendahara yang ditemukan"
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.1, 5.2, 5.3, 5.7, 5.8_

  - [x] 10.2 Implementasi BendaharaTambahView.vue
    - Buat `src/views/super-admin/bendahara/BendaharaTambahView.vue`
    - Gunakan FormBendahara mode="tambah"
    - Support preselectedGerejaId dari query param (navigasi dari detail gereja)
    - Panggil `bendaharaStore.tambahBendahara()` saat submit
    - Redirect ke detail bendahara setelah berhasil
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 6.3_

  - [x] 10.3 Implementasi BendaharaDetailView.vue
    - Buat `src/views/super-admin/bendahara/BendaharaDetailView.vue` dengan props `id`
    - Tampilkan info bendahara, info gereja terhubung, status akun
    - Tombol: Edit, Toggle Status, Reset Password
    - Dialog reset password dengan validasi (BaseModal + BaseInput)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 10.4 Implementasi BendaharaEditView.vue
    - Buat `src/views/super-admin/bendahara/BendaharaEditView.vue` dengan props `id`
    - Gunakan FormBendahara mode="edit" dengan initialData dari store
    - Panggil `bendaharaStore.updateBendahara()` saat submit
    - Redirect ke detail bendahara setelah berhasil
    - _Requirements: 3.4, 3.5, 3.7, 3.8_

- [x] 11. Router dan integrasi
  - [x] 11.1 Implementasi router baru
    - Buat `src/router/index.js` dengan lazy loading untuk semua views
    - Routes: dashboard, gereja (list/tambah/detail/edit), bendahara (list/tambah/detail/edit)
    - Gunakan `props: true` untuk routes dengan parameter `:id`
    - Hapus file `src/router.ts` lama
    - _Requirements: Semua requirements (navigasi antar halaman)_

  - [x] 11.2 Integrasi semua komponen di App.vue dan main.js
    - Update `src/App.vue` untuk menggunakan `<router-view>` sederhana
    - Pastikan `src/main.js` mengimport dan menggunakan Pinia, Router, dan Tailwind CSS
    - Hapus file-file lama yang tidak digunakan (src/state/, src/ui/, src/data/dummy.ts, src/router.ts)
    - Verifikasi aplikasi berjalan tanpa error
    - _Requirements: Semua requirements_

- [x] 12. Checkpoint - Pastikan semua test lulus dan aplikasi berjalan
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

  - [x] 12.1 Tulis unit tests untuk komponen dan views
    - Test rendering badge warna sesuai status domain
    - Test visibility tombol Aktifkan/Nonaktifkan berdasarkan status
    - Test empty states pada tabel
    - Test navigasi dan redirect setelah create/edit
    - Test dialog konfirmasi flows
    - **Validates: Requirements 1.5, 2.2, 2.3, 2.4, 2.5, 2.6, 4.6, 6.5**

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoints memastikan validasi inkremental
- Property tests memvalidasi correctness properties universal dari design document
- Unit tests memvalidasi skenario spesifik dan edge cases
- Semua kode menggunakan JavaScript (bukan TypeScript) sesuai konvensi gmim_client
- Penamaan variabel dan konsep menggunakan bahasa Indonesia

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1", "3.2", "3.3"] },
    { "id": 3, "tasks": ["2.2", "3.4", "3.5"] },
    { "id": 4, "tasks": ["5.1", "5.2"] },
    { "id": 5, "tasks": ["5.3", "5.4"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3", "7.4", "8.1", "8.2", "8.3"] },
    { "id": 7, "tasks": ["9.1", "9.2", "9.3", "9.4", "10.1", "10.2", "10.3", "10.4"] },
    { "id": 8, "tasks": ["11.1"] },
    { "id": 9, "tasks": ["11.2"] },
    { "id": 10, "tasks": ["12.1"] }
  ]
}
```
