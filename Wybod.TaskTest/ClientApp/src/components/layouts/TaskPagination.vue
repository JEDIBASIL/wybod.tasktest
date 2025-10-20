<template>
  <div class="mt-6 flex items-center justify-between border-t pt-4 px-5 pb-3">
    <div class="flex items-center gap-2">
      <label for="pageSize" class="text-sm text-gray-600 dark:text-gray-400">
        Items per page:
      </label>
      <select id="pageSize" :value="pageSize"
        @change="emit('pageSizeChange', parseInt(($event.target as HTMLSelectElement).value))"
        class="px-3 py-1 border bg-neutral-300 dark:bg-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>

    <div class="text-sm text-gray-600 dark:text-gray-400">
      Showing {{ startIndex }} to {{ endIndex }} of {{ totalCount }} tasks
    </div>

    <div class="flex items-center gap-1">
      <button @click="emit('pageChange', currentPage - 1)" :disabled="!hasPreviousPage" :class="[
        'w-8 h-8 rounded-md border transition-colors flex items-center justify-center',
        hasPreviousPage
          ? 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer'
          : 'bg-neutral-200 dark:bg-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed',
      ]">
        <span class="material-symbols-outlined text-sm">chevron_left</span>
      </button>

      <button v-for="page in pageNumbers" :key="page" @click="typeof page === 'number' && emit('pageChange', page)"
        :disabled="page === '...'" :class="[
          'w-8 h-8 rounded-md border transition-colors',
          page === currentPage
            ? 'bg-neutral-500 dark:bg-neutral-600 text-white border-blue-500 dark:border-blue-600'
            : page === '...'
              ? 'bg-neutral-200 dark:bg-neutral-700 cursor-default'
              : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer',
        ]">
        {{ page }}
      </button>

      <button @click="emit('pageChange', currentPage + 1)" :disabled="!hasNextPage" :class="[
        'w-8 h-8 rounded-md border transition-colors',
        hasNextPage
          ? 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer'
          : 'bg-neutral-200 dark:bg-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed',
      ]">
        <span class="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  hasPreviousPage: { type: Boolean, required: true },
  hasNextPage: { type: Boolean, required: true },
})

const emit = defineEmits(['pageChange', 'pageSizeChange'])

const startIndex = computed(() => (props.currentPage - 1) * props.pageSize + 1)
const endIndex = computed(() => Math.min(props.currentPage * props.pageSize, props.totalCount))

const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages } = props

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)
    for (let i = startPage; i <= endPage; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return pages
})
</script>
