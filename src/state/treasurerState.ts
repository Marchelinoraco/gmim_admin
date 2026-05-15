import { computed, reactive } from "vue";
import type { Treasurer } from "../data/dummy";
import { treasurers as seed } from "../data/dummy";

type CreateTreasurerInput = Omit<Treasurer, "id" | "lastLoginAt"> & {
  password: string;
};
type UpdateTreasurerInput = Partial<Omit<Treasurer, "id">>;

const state = reactive({
  treasurers: [...seed] as Treasurer[]
});

function newId() {
  return `u-${Math.floor(Math.random() * 900000 + 100000)}`;
}

export function useTreasurerState() {
  const treasurers = computed(() => state.treasurers);

  function getById(id: string) {
    return state.treasurers.find((u) => u.id === id) ?? null;
  }

  function create(input: CreateTreasurerInput) {
    const created: Treasurer = {
      id: newId(),
      fullName: input.fullName,
      email: input.email,
      churchId: input.churchId,
      phone: input.phone,
      role: input.role,
      status: input.status,
      lastLoginAt: new Date().toISOString()
    };
    state.treasurers.unshift(created);
    return created;
  }

  function update(id: string, patch: UpdateTreasurerInput) {
    const idx = state.treasurers.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    state.treasurers[idx] = { ...state.treasurers[idx], ...patch };
    return state.treasurers[idx];
  }

  function remove(id: string) {
    const before = state.treasurers.length;
    state.treasurers = state.treasurers.filter((u) => u.id !== id);
    return state.treasurers.length !== before;
  }

  function resetPassword(_id: string, _newPassword: string) {
    return true;
  }

  function toggleStatus(id: string) {
    const found = getById(id);
    if (!found) return null;
    found.status = found.status === "active" ? "disabled" : "active";
    return found;
  }

  return { treasurers, getById, create, update, remove, resetPassword, toggleStatus };
}

