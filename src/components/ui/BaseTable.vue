<script setup>
import { ref, computed } from "vue"

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    // Each column: { key: String, label: String, width?: String, sortable?: Boolean }
    validator: (value) => value.every((col) => col.key && col.label)
  },
  data: {
    type: Array,
    default: () => []
  },
  emptyMessage: {
    type: String,
    default: "Tidak ada data untuk ditampilkan"
  }
})

defineEmits(["sort"])

const sortKey = ref("")
const sortOrder = ref("asc")

const sortedData = computed(() => {
  if (!sortKey.value) return props.data

  const column = props.columns.find((col) => col.key === sortKey.value)
  if (!column || !column.sortable) return props.data

  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]

    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    let comparison = 0
    if (typeof aVal === "number" && typeof bVal === "number") {
      comparison = aVal - bVal
    } else {
      comparison = String(aVal).localeCompare(String(bVal), "id")
    }

    return sortOrder.value === "asc" ? comparison : -comparison
  })
})

function handleSort(column) {
  if (!column.sortable) return

  if (sortKey.value === column.key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc"
  } else {
    sortKey.value = column.key
    sortOrder.value = "asc"
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="column.width ? { width: column.width } : {}"
            :class="[
              'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
              column.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''
            ]"
            @click="handleSort(column)"
          >
            <div class="flex items-center gap-1">
              <span>{{ column.label }}</span>
              <span v-if="column.sortable" class="inline-flex flex-col">
                <svg
                  class="w-3 h-3"
                  :class="sortKey === column.key && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-300'"
                  viewBox="0 0 10 6"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5 0L10 6H0L5 0Z" />
                </svg>
                <svg
                  class="w-3 h-3"
                  :class="sortKey === column.key && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-300'"
                  viewBox="0 0 10 6"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M5 6L0 0H10L5 6Z" />
                </svg>
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-if="sortedData.length === 0">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-500">
            {{ emptyMessage }}
          </td>
        </tr>
        <tr v-for="(row, index) in sortedData" :key="row.id || index" class="hover:bg-gray-50 transition-colors">
          <td v-for="column in columns" :key="column.key" class="px-4 py-3 text-sm text-gray-700">
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :index="index">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
