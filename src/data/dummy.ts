export type SubscriptionStatus = "active" | "trial" | "expired";
export type PackageName = "Basic" | "Standard" | "Premium";

export type Church = {
  id: string;
  name: string;
  address: string;
  pastorName: string;
  phone: string;
  subdomain: string;
  subscriptionStatus: SubscriptionStatus;
  packageName: PackageName;
  joinedAt: string; // YYYY-MM-DD
  isActive: boolean;
  subscriptionEndsAt: string; // YYYY-MM-DD
};

export type TreasurerRole = "Admin Gereja" | "Bendahara" | "Viewer / Majelis";
export type AccountStatus = "active" | "disabled";

export type Treasurer = {
  id: string;
  fullName: string;
  email: string;
  churchId: string;
  phone: string;
  role: TreasurerRole;
  status: AccountStatus;
  lastLoginAt: string; // ISO string
};

export type PaymentStatus = "paid" | "pending" | "failed";
export type Payment = {
  id: string;
  churchId: string;
  packageName: PackageName;
  amount: number;
  status: PaymentStatus;
  paidAt?: string; // ISO
  createdAt: string; // ISO
};

export const churches: Church[] = [
  {
    id: "c-001",
    name: "GMIM Sion Manado",
    address: "Jl. Piere Tendean, Manado",
    pastorName: "Pdt. Andreas T.",
    phone: "0812-1111-2222",
    subdomain: "sion-manado",
    subscriptionStatus: "active",
    packageName: "Premium",
    joinedAt: "2026-01-10",
    isActive: true,
    subscriptionEndsAt: "2027-01-10"
  },
  {
    id: "c-002",
    name: "GMIM Eben Haezer Tomohon",
    address: "Jl. Raya Tomohon",
    pastorName: "Pdt. Maria L.",
    phone: "0813-3333-4444",
    subdomain: "eben-tomohon",
    subscriptionStatus: "trial",
    packageName: "Standard",
    joinedAt: "2026-04-02",
    isActive: true,
    subscriptionEndsAt: "2026-05-16"
  },
  {
    id: "c-003",
    name: "GMIM Bethesda Bitung",
    address: "Jl. Sam Ratulangi, Bitung",
    pastorName: "Pdt. Daniel R.",
    phone: "0821-5555-6666",
    subdomain: "bethesda-bitung",
    subscriptionStatus: "expired",
    packageName: "Basic",
    joinedAt: "2025-09-12",
    isActive: false,
    subscriptionEndsAt: "2026-03-12"
  }
];

export const treasurers: Treasurer[] = [
  {
    id: "u-100",
    fullName: "Yohanes W.",
    email: "yohanes@sion-manado.id",
    churchId: "c-001",
    phone: "0812-9000-1111",
    role: "Bendahara",
    status: "active",
    lastLoginAt: "2026-05-12T09:15:00.000Z"
  },
  {
    id: "u-101",
    fullName: "Debora K.",
    email: "debora@eben-tomohon.id",
    churchId: "c-002",
    phone: "0813-8888-7777",
    role: "Admin Gereja",
    status: "active",
    lastLoginAt: "2026-05-11T18:02:00.000Z"
  },
  {
    id: "u-102",
    fullName: "Stefanus P.",
    email: "stefanus@bethesda-bitung.id",
    churchId: "c-003",
    phone: "0821-1234-9876",
    role: "Viewer / Majelis",
    status: "disabled",
    lastLoginAt: "2026-03-01T03:40:00.000Z"
  }
];

export const payments: Payment[] = [
  {
    id: "p-9001",
    churchId: "c-001",
    packageName: "Premium",
    amount: 1500000,
    status: "paid",
    paidAt: "2026-05-01T02:10:00.000Z",
    createdAt: "2026-04-30T10:00:00.000Z"
  },
  {
    id: "p-9002",
    churchId: "c-002",
    packageName: "Standard",
    amount: 900000,
    status: "pending",
    createdAt: "2026-05-10T07:30:00.000Z"
  },
  {
    id: "p-9003",
    churchId: "c-003",
    packageName: "Basic",
    amount: 500000,
    status: "failed",
    createdAt: "2026-03-10T08:00:00.000Z"
  }
];
