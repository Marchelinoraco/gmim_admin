import { computed, reactive } from "vue";
import type { Payment } from "../data/dummy";
import { payments as seed } from "../data/dummy";

const state = reactive({
  payments: [...seed] as Payment[]
});

export function useSubscriptionState() {
  const payments = computed(() => state.payments);
  const totalPaidAmount = computed(() =>
    state.payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0)
  );
  return { payments, totalPaidAmount };
}

