# Dokumen Desain: Manajemen Domain dan Bendahara

## Overview

Fitur ini melakukan refactoring arsitektur gmim_admin agar mengikuti konvensi dan pola yang sama dengan gmim_client, sekaligus memperluas fungsionalitas manajemen domain (subdomain) dan bendahara. Refactoring mencakup migrasi dari custom composables ke Pinia stores, penggantian custom CSS dengan Tailwind CSS, adopsi folder structure gmim_client, dan penggunaan Base UI components yang konsisten.

### Tujuan Utama

1. **Konsistensi Arsitektur**: gmim_admin mengikuti pola gmim_client (Pinia, Tailwind, folder structure)
2. **Manajemen Domain**: Validasi subdomain real-time, preview URL, dan status domain (aktif/pending/nonaktif)
3. **Manajemen Bendahara**: CRUD bendahara dengan relasi gereja, filter, pencarian, dan pengelolaan akses

---

## Architecture

### Arsitektur Aplikasi (Setelah Refactoring)

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
├─────────────────────────────────────────────────────┤
│  Vue Router (navigasi halaman, lazy loading)        │
├─────────────────────────────────────────────────────┤
│  Layouts (AdminLayout)                              │
├─────────────────────────────────────────────────────┤
│  Views (halaman-halaman utama)                      │
├─────────────────────────────────────────────────────┤
│  Components (komponen reusable + domain-specific)   │
├─────────────────────────────────────────────────────┤
│  Pinia Stores (state management)                    │
├─────────────────────────────────────────────────────┤
│  Utils (validasi, format)                           │
├─────────────────────────────────────────────────────┤
│  Data Layer (dummy data / future API)               │
└─────────────────────────────────────────────────────┘
```

### Perubahan Arsitektur dari Kondisi Saat Ini

| Aspek            | Sebelum (gmim_admin)                                       | Sesudah (mengikuti gmim_client)                               |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| State Management | Custom composables (`useChurchState`, `useTreasurerState`) | Pinia stores (`useGerejaStore`, `useBendaharaStore`)          |
| Styling          | Custom CSS (`styles.css`)                                  | Tailwind CSS (utility classes)                                |
| Folder Structure | `src/state/`, `src/ui/pages/`, `src/ui/shared/`            | `src/stores/`, `src/views/`, `src/components/ui/`             |
| Naming           | English (`Church`, `Treasurer`, `churches`)                | Indonesian (`Gereja`, `Bendahara`, `gereja`)                  |
| UI Components    | Custom (`StatCard`, `TableCard`)                           | Base components (`BaseCard`, `BaseTable`, `BaseButton`, dll.) |
| Router           | Eager loading, TypeScript                                  | Lazy loading, JavaScript (konsisten dengan gmim_client)       |
| Data             | Single `dummy.ts`                                          | Terpisah per domain (`dummyGereja.js`, `dummyBendahara.js`)   |

### Folder Structure Baru

```
src/
├── components/
│   ├── ui/                    → Base components (copy dari gmim_client)
│   │   ├── BaseCard.vue
│   │   ├── BaseTable.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseModal.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseSelect.vue
│   │   └── BaseAlert.vue
│   ├── layout/                → Layout components
│   │   ├── SidebarNav.vue
│   │   └── HeaderBar.vue
│   ├── gereja/                → Domain-specific: gereja
│   │   ├── FormGereja.vue
│   │   ├── TabelGereja.vue
│   │   ├── InfoDomain.vue
│   │   └── DaftarBendaharaGereja.vue
│   └── bendahara/             → Domain-specific: bendahara
│       ├── FormBendahara.vue
│       ├── TabelBendahara.vue
│       └── FilterBendahara.vue
├── data/                      → Dummy data files
│   ├── dummyGereja.js
│   └── dummyBendahara.js
├── layouts/                   → Page layouts
│   └── AdminLayout.vue
├── router/                    → Router config
│   └── index.js
├── stores/                    → Pinia stores
│   ├── gerejaStore.js
│   └── bendaharaStore.js
├── utils/                     → Utility functions
│   ├── validasiSubdomain.js
│   └── formatTanggal.js
├── views/                     → Page views
│   └── super-admin/
│       ├── dashboard/
│       │   └── DashboardView.vue
│       ├── gereja/
│       │   ├── GerejaListView.vue
│       │   ├── GerejaTambahView.vue
│       │   ├── GerejaDetailView.vue
│       │   └── GerejaEditView.vue
│       └── bendahara/
│           ├── BendaharaListView.vue
│           ├── BendaharaTambahView.vue
│           ├── BendaharaDetailView.vue
│           └── BendaharaEditView.vue
├── App.vue
└── main.js
```

---

## Components and Interfaces

### Base UI Components (Dari gmim_client)

Komponen-komponen berikut di-copy langsung dari gmim_client untuk menjaga konsistensi:

| Komponen     | Props Utama                                              | Fungsi                                           |
| ------------ | -------------------------------------------------------- | ------------------------------------------------ |
| `BaseCard`   | `title`, `variant`, `padding`, `shadow`                  | Card wrapper                                     |
| `BaseTable`  | `columns`, `data`, `emptyMessage`                        | Tabel data dengan sorting                        |
| `BaseButton` | `variant`, `size`, `disabled`, `loading`                 | Tombol dengan variant (primary/secondary/danger) |
| `BaseModal`  | `show`, `title`, `confirmText`, `cancelText`             | Dialog konfirmasi                                |
| `BaseInput`  | `label`, `modelValue`, `type`, `error`, `placeholder`    | Input field dengan validasi                      |
| `BaseSelect` | `label`, `modelValue`, `options`, `error`, `placeholder` | Dropdown select                                  |
| `BaseAlert`  | `type`, `message`, `dismissible`, `autoHide`             | Notifikasi (success/error/warning/info)          |

### Domain Components: Gereja

#### FormGereja.vue

```
Props:
  - mode: "tambah" | "edit"
  - initialData?: Gereja (untuk mode edit)
Emits:
  - submit(data: GerejaInput)
  - cancel()
Fitur:
  - Field: nama, alamat, namaPendeta, telepon, subdomain, paketLangganan
  - Preview URL real-time: "{subdomain}.gmimjadi.com"
  - Validasi subdomain (format, panjang, keunikan)
  - Dialog konfirmasi saat mengubah subdomain (mode edit)
```

#### TabelGereja.vue

```
Props:
  - data: Gereja[]
Slots:
  - cell-statusDomain (badge berwarna)
  - cell-aksi (tombol detail/edit/hapus)
```

#### InfoDomain.vue

```
Props:
  - gereja: Gereja
Emits:
  - aktifkanDomain()
  - nonaktifkanDomain()
Fitur:
  - Menampilkan subdomain, URL lengkap, Status_Domain (badge)
  - Tombol Aktifkan/Nonaktifkan berdasarkan status
```

#### DaftarBendaharaGereja.vue

```
Props:
  - gerejaId: string
Emits:
  - tambahBendahara()
  - lihatBendahara(id: string)
Fitur:
  - Tabel bendahara terhubung ke gereja
  - Tombol "Tambah Bendahara"
  - Empty state jika belum ada bendahara
```

### Domain Components: Bendahara

#### FormBendahara.vue

```
Props:
  - mode: "tambah" | "edit"
  - initialData?: Bendahara (untuk mode edit)
  - preselectedGerejaId?: string
Emits:
  - submit(data: BendaharaInput)
  - cancel()
Fitur:
  - Field: namaLengkap, email, password (hanya tambah), gereja (dropdown), telepon, role
  - Dropdown gereja hanya menampilkan gereja aktif/pending
  - Info ringkas gereja setelah dipilih
  - Validasi email, password, nama, telepon
```

#### TabelBendahara.vue

```
Props:
  - data: Bendahara[]
Slots:
  - cell-status (badge berwarna)
  - cell-gereja (nama gereja)
  - cell-aksi (tombol detail/edit/toggle status)
```

#### FilterBendahara.vue

```
Props:
  - gerejaOptions: { value, label }[]
Emits:
  - update:pencarian(value: string)
  - update:filterGereja(value: string)
  - update:filterStatus(value: string)
Fitur:
  - Input pencarian dengan debounce 300ms
  - Dropdown filter gereja
  - Dropdown filter status
```

### Pinia Stores

#### useGerejaStore

```javascript
// src/stores/gerejaStore.js
export const useGerejaStore = defineStore("gereja", () => {
  // === STATE ===
  const gerejaList = ref([...dummyGereja])
  const notifikasi = ref(null)

  // === GETTERS ===
  const gerejaAktifDanPending = computed(() => gerejaList.value.filter((g) => g.statusDomain !== "nonaktif"))

  // === ACTIONS ===
  function getById(id) {
    /* ... */
  }
  function tambahGereja(input) {
    /* ... */
  }
  function updateGereja(id, patch) {
    /* ... */
  }
  function hapusGereja(id) {
    /* ... */
  }
  function isSubdomainTersedia(subdomain, excludeId) {
    /* ... */
  }
  function aktifkanDomain(id) {
    /* ... */
  }
  function nonaktifkanDomain(id) {
    /* ... */
  }

  return {
    gerejaList,
    notifikasi,
    gerejaAktifDanPending,
    getById,
    tambahGereja,
    updateGereja,
    hapusGereja,
    isSubdomainTersedia,
    aktifkanDomain,
    nonaktifkanDomain
  }
})
```

#### useBendaharaStore

```javascript
// src/stores/bendaharaStore.js
export const useBendaharaStore = defineStore("bendahara", () => {
  // === STATE ===
  const bendaharaList = ref([...dummyBendahara])
  const notifikasi = ref(null)

  // === GETTERS ===
  const bendaharaByGereja = (gerejaId) => bendaharaList.value.filter((b) => b.gerejaId === gerejaId)

  // === ACTIONS ===
  function getById(id) {
    /* ... */
  }
  function tambahBendahara(input) {
    /* ... */
  }
  function updateBendahara(id, patch) {
    /* ... */
  }
  function hapusBendahara(id) {
    /* ... */
  }
  function toggleStatus(id) {
    /* ... */
  }
  function resetPassword(id, passwordBaru) {
    /* ... */
  }
  function isEmailTerdaftar(email, gerejaId, excludeId) {
    /* ... */
  }
  function filterBendahara(pencarian, filterGereja, filterStatus) {
    /* ... */
  }

  return {
    bendaharaList,
    notifikasi,
    bendaharaByGereja,
    getById,
    tambahBendahara,
    updateBendahara,
    hapusBendahara,
    toggleStatus,
    resetPassword,
    isEmailTerdaftar,
    filterBendahara
  }
})
```

---

## Data Models

### Model Gereja (Setelah Refactoring)

```javascript
// src/data/dummyGereja.js
// Field menggunakan bahasa Indonesia, konsisten dengan gmim_client

export const dummyGereja = [
  {
    id: "c-001",
    nama: "GMIM Sion Manado",
    alamat: "Jl. Piere Tendean, Manado",
    namaPendeta: "Pdt. Andreas T.",
    telepon: "0812-1111-2222",
    subdomain: "sion-manado",
    statusLangganan: "active", // "active" | "trial" | "expired"
    paketLangganan: "Premium", // "Basic" | "Standard" | "Premium"
    statusDomain: "aktif", // "aktif" | "pending" | "nonaktif" ← FIELD BARU
    bergabungPada: "2026-01-10", // YYYY-MM-DD
    langgananBerakhir: "2027-01-10", // YYYY-MM-DD
    createdAt: "10/01/2026 08:00:00",
    updatedAt: "10/01/2026 08:00:00"
  },
  {
    id: "c-002",
    nama: "GMIM Eben Haezer Tomohon",
    alamat: "Jl. Raya Tomohon",
    namaPendeta: "Pdt. Maria L.",
    telepon: "0813-3333-4444",
    subdomain: "eben-tomohon",
    statusLangganan: "trial",
    paketLangganan: "Standard",
    statusDomain: "pending",
    bergabungPada: "2026-04-02",
    langgananBerakhir: "2026-05-16",
    createdAt: "02/04/2026 08:00:00",
    updatedAt: "02/04/2026 08:00:00"
  },
  {
    id: "c-003",
    nama: "GMIM Bethesda Bitung",
    alamat: "Jl. Sam Ratulangi, Bitung",
    namaPendeta: "Pdt. Daniel R.",
    telepon: "0821-5555-6666",
    subdomain: "bethesda-bitung",
    statusLangganan: "expired",
    paketLangganan: "Basic",
    statusDomain: "nonaktif",
    bergabungPada: "2025-09-12",
    langgananBerakhir: "2026-03-12",
    createdAt: "12/09/2025 08:00:00",
    updatedAt: "12/09/2025 08:00:00"
  }
]
```

### Model Bendahara (Setelah Refactoring)

```javascript
// src/data/dummyBendahara.js

export const dummyBendahara = [
  {
    id: "u-100",
    namaLengkap: "Yohanes W.",
    email: "yohanes@sion-manado.id",
    gerejaId: "c-001",
    telepon: "0812-9000-1111",
    role: "Bendahara", // "Admin Gereja" | "Bendahara" | "Viewer / Majelis"
    status: "active", // "active" | "disabled"
    loginTerakhir: "2026-05-12T09:15:00.000Z",
    createdAt: "10/01/2026 09:00:00",
    updatedAt: "12/05/2026 09:15:00"
  },
  {
    id: "u-101",
    namaLengkap: "Debora K.",
    email: "debora@eben-tomohon.id",
    gerejaId: "c-002",
    telepon: "0813-8888-7777",
    role: "Admin Gereja",
    status: "active",
    loginTerakhir: "2026-05-11T18:02:00.000Z",
    createdAt: "02/04/2026 10:00:00",
    updatedAt: "11/05/2026 18:02:00"
  },
  {
    id: "u-102",
    namaLengkap: "Stefanus P.",
    email: "stefanus@bethesda-bitung.id",
    gerejaId: "c-003",
    telepon: "0821-1234-9876",
    role: "Viewer / Majelis",
    status: "disabled",
    loginTerakhir: "2026-03-01T03:40:00.000Z",
    createdAt: "12/09/2025 09:00:00",
    updatedAt: "01/03/2026 03:40:00"
  }
]
```

### Validasi Subdomain

```javascript
// src/utils/validasiSubdomain.js

const SUBDOMAIN_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/
const MIN_LENGTH = 3
const MAX_LENGTH = 30

/**
 * Validasi format subdomain
 * @param {string} subdomain
 * @returns {{ valid: boolean, pesan: string }}
 */
export function validasiSubdomain(subdomain) {
  if (!subdomain || subdomain.trim() === "") {
    return { valid: false, pesan: "Subdomain wajib diisi" }
  }

  if (subdomain.length < MIN_LENGTH || subdomain.length > MAX_LENGTH) {
    return { valid: false, pesan: "Subdomain harus antara 3-30 karakter" }
  }

  if (!SUBDOMAIN_REGEX.test(subdomain)) {
    return { valid: false, pesan: "Format subdomain tidak valid" }
  }

  return { valid: true, pesan: "" }
}

/**
 * Cek keunikan subdomain terhadap daftar gereja
 * @param {string} subdomain
 * @param {Array} gerejaList
 * @param {string|null} excludeId - ID gereja yang dikecualikan (untuk edit)
 * @returns {boolean}
 */
export function isSubdomainUnik(subdomain, gerejaList, excludeId = null) {
  return !gerejaList.some((g) => g.subdomain === subdomain && g.id !== excludeId)
}
```

### Validasi Bendahara

```javascript
// src/utils/validasiBendahara.js

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validasi form bendahara
 * @param {object} data - Data form bendahara
 * @param {boolean} isCreate - true jika mode tambah (password wajib)
 * @returns {{ valid: boolean, errors: object }}
 */
export function validasiBendahara(data, isCreate = true) {
  const errors = {}

  // Nama lengkap: 2-100 karakter
  if (!data.namaLengkap || data.namaLengkap.trim().length < 2) {
    errors.namaLengkap = "Nama lengkap minimal 2 karakter"
  } else if (data.namaLengkap.trim().length > 100) {
    errors.namaLengkap = "Nama lengkap maksimal 100 karakter"
  }

  // Email: format valid
  if (!data.email || !EMAIL_REGEX.test(data.email)) {
    errors.email = "Format email tidak valid"
  }

  // Password: 8-128 karakter (hanya saat create)
  if (isCreate) {
    if (!data.password || data.password.length < 8) {
      errors.password = "Password minimal 8 karakter"
    } else if (data.password.length > 128) {
      errors.password = "Password maksimal 128 karakter"
    }
  }

  // Gereja: wajib dipilih
  if (!data.gerejaId) {
    errors.gerejaId = "Gereja wajib dipilih"
  }

  // Telepon: wajib diisi
  if (!data.telepon || data.telepon.trim() === "") {
    errors.telepon = "Nomor telepon wajib diisi"
  }

  // Role: wajib dipilih
  if (!data.role) {
    errors.role = "Role wajib dipilih"
  }

  const valid = Object.keys(errors).length === 0
  return { valid, errors }
}
```

### Router Configuration (Setelah Refactoring)

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", redirect: "/super-admin/dashboard" },
  {
    path: "/super-admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    children: [
      { path: "", redirect: "/super-admin/dashboard" },
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/super-admin/dashboard/DashboardView.vue")
      },
      // Gereja
      {
        path: "gereja",
        name: "DaftarGereja",
        component: () => import("@/views/super-admin/gereja/GerejaListView.vue")
      },
      {
        path: "gereja/tambah",
        name: "TambahGereja",
        component: () => import("@/views/super-admin/gereja/GerejaTambahView.vue")
      },
      {
        path: "gereja/:id",
        name: "DetailGereja",
        component: () => import("@/views/super-admin/gereja/GerejaDetailView.vue"),
        props: true
      },
      {
        path: "gereja/:id/edit",
        name: "EditGereja",
        component: () => import("@/views/super-admin/gereja/GerejaEditView.vue"),
        props: true
      },
      // Bendahara
      {
        path: "bendahara",
        name: "DaftarBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaListView.vue")
      },
      {
        path: "bendahara/tambah",
        name: "TambahBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaTambahView.vue")
      },
      {
        path: "bendahara/:id",
        name: "DetailBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaDetailView.vue"),
        props: true
      },
      {
        path: "bendahara/:id/edit",
        name: "EditBendahara",
        component: () => import("@/views/super-admin/bendahara/BendaharaEditView.vue"),
        props: true
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Validasi Subdomain

_For any_ string input, fungsi `validasiSubdomain` SHALL mengembalikan `{ valid: true }` jika dan hanya jika string tersebut memenuhi semua syarat: panjang 3-30 karakter, hanya mengandung huruf kecil, angka, dan tanda hubung, serta sesuai regex `^[a-z0-9]+(-[a-z0-9]+)*$`. Untuk string yang tidak memenuhi syarat, fungsi SHALL mengembalikan `{ valid: false }` dengan pesan error yang sesuai.

**Validates: Requirements 1.2, 1.7, 1.8**

### Property 2: Keunikan Subdomain

_For any_ daftar gereja dan string subdomain, fungsi `isSubdomainUnik` SHALL mengembalikan `false` jika dan hanya jika terdapat gereja lain (selain excludeId) dalam daftar yang memiliki subdomain yang sama. Sebaliknya SHALL mengembalikan `true`.

**Validates: Requirements 1.3**

### Property 3: Gereja Baru Selalu Berstatus Domain "pending"

_For any_ input gereja yang valid, ketika `tambahGereja` dipanggil, gereja yang dibuat SHALL selalu memiliki `statusDomain === "pending"` terlepas dari nilai input lainnya.

**Validates: Requirements 1.4**

### Property 4: Transisi Status Domain

_For any_ gereja dengan `statusDomain` bukan "aktif", ketika `aktifkanDomain` dipanggil, `statusDomain` SHALL berubah menjadi "aktif". _For any_ gereja dengan `statusDomain === "aktif"`, ketika `nonaktifkanDomain` dipanggil, `statusDomain` SHALL berubah menjadi "nonaktif".

**Validates: Requirements 2.7, 2.8**

### Property 5: Filter Gereja Aktif dan Pending

_For any_ daftar gereja dengan campuran statusDomain, getter `gerejaAktifDanPending` SHALL mengembalikan hanya gereja yang memiliki `statusDomain === "aktif"` atau `statusDomain === "pending"`, dan tidak pernah mengembalikan gereja dengan `statusDomain === "nonaktif"`.

**Validates: Requirements 3.1**

### Property 6: Validasi Form Bendahara

_For any_ kombinasi input form bendahara, fungsi `validasiBendahara` SHALL mengembalikan error untuk setiap field yang tidak memenuhi aturan validasi (namaLengkap: 2-100 karakter, email: format valid, password: 8-128 karakter saat create, gerejaId: wajib, telepon: wajib) dan SHALL mengembalikan `{ valid: true }` hanya jika semua field memenuhi aturan.

**Validates: Requirements 3.5, 3.6, 3.7, 3.8**

### Property 7: Keunikan Email per Gereja

_For any_ daftar bendahara, email, dan gerejaId, fungsi `isEmailTerdaftar` SHALL mengembalikan `true` jika dan hanya jika terdapat bendahara lain (selain excludeId) dalam daftar yang memiliki email yang sama DAN gerejaId yang sama.

**Validates: Requirements 3.4**

### Property 8: Bendahara Baru Selalu Berstatus "active"

_For any_ input bendahara yang valid, ketika `tambahBendahara` dipanggil, bendahara yang dibuat SHALL selalu memiliki `status === "active"` terlepas dari nilai input lainnya.

**Validates: Requirements 3.3**

### Property 9: Filter Kombinasi Bendahara (Logika AND)

_For any_ daftar bendahara dan kombinasi filter (pencarian, filterGereja, filterStatus), fungsi `filterBendahara` SHALL mengembalikan hanya bendahara yang memenuhi SEMUA kriteria filter yang aktif secara bersamaan: pencarian cocok dengan nama/email/namaGereja (case-insensitive), filterGereja cocok dengan gerejaId, dan filterStatus cocok dengan status.

**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

### Property 10: Toggle Status Bendahara

_For any_ bendahara dengan `status === "active"`, ketika `toggleStatus` dipanggil, status SHALL berubah menjadi "disabled". _For any_ bendahara dengan `status === "disabled"`, ketika `toggleStatus` dipanggil, status SHALL berubah menjadi "active".

**Validates: Requirements 5.2, 5.3**

---

## Error Handling

### Strategi Penanganan Error

| Skenario                                  | Penanganan                                                      | Komponen            |
| ----------------------------------------- | --------------------------------------------------------------- | ------------------- |
| Validasi subdomain gagal                  | Tampilkan pesan error di bawah field, cegah submit              | FormGereja          |
| Subdomain sudah digunakan                 | Tampilkan pesan "Subdomain sudah digunakan" di field            | FormGereja          |
| Validasi form bendahara gagal             | Tampilkan pesan error per field yang gagal, cegah submit        | FormBendahara       |
| Email sudah terdaftar di gereja           | Tampilkan pesan error di field email                            | FormBendahara       |
| Perubahan status domain gagal             | Tampilkan BaseAlert type="error", pertahankan status sebelumnya | GerejaDetailView    |
| Bendahara tidak ditemukan saat toggle     | Tampilkan BaseAlert type="error" selama 5 detik                 | BendaharaListView   |
| Reset password gagal validasi             | Tampilkan pesan error di dialog, dialog tetap terbuka           | BendaharaDetailView |
| Data gereja tidak ditemukan (route param) | Redirect ke halaman daftar gereja                               | GerejaDetailView    |

### Pola Notifikasi

```javascript
// Pattern notifikasi menggunakan BaseAlert
// Sukses: autoHide=true, autoHideDuration=3000
// Error: autoHide=true, autoHideDuration=5000
// Warning: dismissible=true, autoHide=false

// Contoh penggunaan di store:
function aktifkanDomain(id) {
  const gereja = getById(id)
  if (!gereja) {
    notifikasi.value = { type: "error", message: "Gereja tidak ditemukan" }
    return false
  }
  gereja.statusDomain = "aktif"
  gereja.updatedAt = formatTimestamp()
  notifikasi.value = { type: "success", message: "Domain berhasil diaktifkan" }
  return true
}
```

### Validasi Real-time vs Submit

- **Real-time (on input/change)**: Validasi subdomain format, preview URL, panjang karakter
- **On blur**: Validasi keunikan subdomain, format email
- **On submit**: Validasi lengkap semua field, cek keunikan email per gereja

---

## Testing Strategy

### Pendekatan Dual Testing

Fitur ini menggunakan dua pendekatan testing yang saling melengkapi:

1. **Property-Based Tests**: Memverifikasi properti universal yang harus berlaku untuk semua input valid
2. **Unit Tests (Example-Based)**: Memverifikasi skenario spesifik, edge cases, dan integrasi komponen

### Property-Based Testing

**Library**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript property-based testing library)

**Konfigurasi**:

- Minimum 100 iterasi per property test
- Setiap test di-tag dengan referensi ke property di design document
- Format tag: `Feature: domain-dan-bendahara-management, Property {number}: {title}`

**Property Tests yang Diimplementasi**:

| Property    | Fungsi yang Ditest                        | Generator                                         |
| ----------- | ----------------------------------------- | ------------------------------------------------- |
| Property 1  | `validasiSubdomain()`                     | Random strings (valid/invalid subdomain patterns) |
| Property 2  | `isSubdomainUnik()`                       | Random gereja arrays + random subdomain strings   |
| Property 3  | `tambahGereja()`                          | Random valid gereja inputs                        |
| Property 4  | `aktifkanDomain()`, `nonaktifkanDomain()` | Random gereja with various statusDomain           |
| Property 5  | `gerejaAktifDanPending` getter            | Random gereja arrays with mixed statusDomain      |
| Property 6  | `validasiBendahara()`                     | Random form inputs (valid/invalid combinations)   |
| Property 7  | `isEmailTerdaftar()`                      | Random bendahara arrays + email/gerejaId combos   |
| Property 8  | `tambahBendahara()`                       | Random valid bendahara inputs                     |
| Property 9  | `filterBendahara()`                       | Random bendahara arrays + filter combinations     |
| Property 10 | `toggleStatus()`                          | Random bendahara with active/disabled status      |

### Unit Tests (Example-Based)

| Area         | Test Cases                                                         |
| ------------ | ------------------------------------------------------------------ |
| UI Rendering | Badge warna sesuai status, tombol visibility, empty states         |
| Navigation   | Redirect setelah create, pre-fill gereja pada form bendahara       |
| Dialog Flows | Konfirmasi sebelum ubah subdomain, konfirmasi toggle status        |
| Edge Cases   | Subdomain kosong, password terlalu pendek, gereja nonaktif warning |

### Struktur File Test

```
src/
├── stores/
│   ├── gerejaStore.test.js          → Unit tests untuk gerejaStore
│   ├── gerejaStore.property.test.js → Property tests (Property 1-5)
│   ├── bendaharaStore.test.js       → Unit tests untuk bendaharaStore
│   └── bendaharaStore.property.test.js → Property tests (Property 6-10)
└── utils/
    ├── validasiSubdomain.test.js    → Unit tests untuk validasi subdomain
    └── validasiBendahara.test.js    → Unit tests untuk validasi bendahara
```

### Dependencies Testing

| Package         | Fungsi                 |
| --------------- | ---------------------- |
| vitest          | Test runner            |
| fast-check      | Property-based testing |
| @vue/test-utils | Component testing      |
| @pinia/testing  | Pinia store testing    |

---

## Requirement Traceability

| Requirement                       | Views                                  | Components                      | Store Actions/Getters                                    |
| --------------------------------- | -------------------------------------- | ------------------------------- | -------------------------------------------------------- |
| Req 1: Manajemen Domain           | GerejaTambahView, GerejaEditView       | FormGereja                      | tambahGereja, updateGereja, isSubdomainTersedia          |
| Req 2: Info Domain Detail         | GerejaDetailView                       | InfoDomain                      | getById, aktifkanDomain, nonaktifkanDomain               |
| Req 3: Pembuatan Bendahara        | BendaharaTambahView                    | FormBendahara                   | tambahBendahara, isEmailTerdaftar, gerejaAktifDanPending |
| Req 4: Daftar & Filter Bendahara  | BendaharaListView                      | TabelBendahara, FilterBendahara | filterBendahara                                          |
| Req 5: Status & Akses Bendahara   | BendaharaDetailView, BendaharaListView | TabelBendahara                  | toggleStatus, resetPassword                              |
| Req 6: Bendahara di Detail Gereja | GerejaDetailView                       | DaftarBendaharaGereja           | bendaharaByGereja                                        |
