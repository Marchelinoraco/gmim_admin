export const subscriptionStatusLabel = {
  active: "Aktif",
  trial: "Percobaan",
  expired: "Kedaluwarsa"
} as const;

export const paymentStatusLabel = {
  paid: "Lunas",
  pending: "Tertunda",
  failed: "Gagal"
} as const;

export const accountStatusLabel = {
  active: "Aktif",
  disabled: "Nonaktif"
} as const;

export const monitoringTypeLabel = {
  login: "Login",
  input: "Input",
  system: "Sistem"
} as const;

export function translateSubscriptionStatus(status: string) {
  return subscriptionStatusLabel[status as keyof typeof subscriptionStatusLabel] ?? status;
}

export function translatePaymentStatus(status: string) {
  return paymentStatusLabel[status as keyof typeof paymentStatusLabel] ?? status;
}

export function translateAccountStatus(status: string) {
  return accountStatusLabel[status as keyof typeof accountStatusLabel] ?? status;
}

export function translateMonitoringType(type: string) {
  return monitoringTypeLabel[type as keyof typeof monitoringTypeLabel] ?? type;
}
