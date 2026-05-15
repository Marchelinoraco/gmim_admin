import { computed, reactive } from "vue";
import type { Church } from "../data/dummy";
import { churches as seed } from "../data/dummy";

type CreateChurchInput = Omit<Church, "id" | "joinedAt">;
type UpdateChurchInput = Partial<Omit<Church, "id">>;

const state = reactive({
  churches: [...seed] as Church[]
});

function newId() {
  return `c-${Math.floor(Math.random() * 900000 + 100000)}`;
}

export function useChurchState() {
  const churches = computed(() => state.churches);

  function getById(id: string) {
    return state.churches.find((c) => c.id === id) ?? null;
  }

  function create(input: CreateChurchInput) {
    const joinedAt = new Date().toISOString().slice(0, 10);
    const created: Church = { id: newId(), joinedAt, ...input };
    state.churches.unshift(created);
    return created;
  }

  function update(id: string, patch: UpdateChurchInput) {
    const idx = state.churches.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    state.churches[idx] = { ...state.churches[idx], ...patch };
    return state.churches[idx];
  }

  function remove(id: string) {
    const before = state.churches.length;
    state.churches = state.churches.filter((c) => c.id !== id);
    return state.churches.length !== before;
  }

  function toggleActive(id: string) {
    const found = getById(id);
    if (!found) return null;
    found.isActive = !found.isActive;
    return found;
  }

  return { churches, getById, create, update, remove, toggleActive };
}

