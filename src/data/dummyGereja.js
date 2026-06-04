// src/data/dummyGereja.js
// Data gereja contoh untuk development
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
    statusDomain: "aktif", // "aktif" | "pending" | "nonaktif"
    bergabungPada: "2026-01-10",
    langgananBerakhir: "2027-01-10",
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
  },
  {
    id: "gmim-eben-haezer-tumpaan-1",
    nama: "GMIM Eben Haezer Tumpaan 1",
    alamat: "Tumpaan 1",
    namaPendeta: "",
    telepon: "",
    subdomain: "gmim-eben-haezer-tumpaan-1",
    statusLangganan: "trial",
    paketLangganan: "Basic",
    statusDomain: "aktif",
    bergabungPada: "2026-05-23",
    langgananBerakhir: "",
    createdAt: "23/05/2026 07:34:54",
    updatedAt: "23/05/2026 07:34:54"
  }
]
