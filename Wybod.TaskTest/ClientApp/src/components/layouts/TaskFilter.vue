<template>
  <div class="w-[300px] p-6 rounded-lg h-fit sticky top-24">
    <div class="flex flex-col gap-4">
      <button @click="emit('openNewTaskModal')"
        class="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 p-2 px-6 rounded-md flex items-center gap-2 font-medium text-white transition-colors">
        <span class="material-symbols-outlined">note_stack_add</span>
        New Task
      </button>

      <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
          Filters
        </p>
        <div v-for="filterOption in filterOptions" :key="filterOption.value" class="mb-2">
          <button
            @click="handleFilterClick(filterOption.value)"
            :class="[
              'cursor-pointer p-2 w-full text-left flex items-center gap-2 rounded-md transition-colors duration-200',
              filterOption.value === activeFilter
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200'
                : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800',
            ]"
          >
            <span class="material-symbols-outlined text-lg flex-shrink-0">
              {{ filterOption.icon }}
            </span>
            <span class="text-sm">{{ filterOption.name }}</span>
          </button>
        </div>
      </div>

      <button @click="emit('deleteCompleted')"
        class="mt-4 p-2 w-full text-left flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors">
        <span class="material-symbols-outlined text-lg flex-shrink-0">delete_sweep</span>
        <span class="text-sm">Delete Completed</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  activeFilter: {
    type: String,
    default: 'all',
  },
})

const emit = defineEmits(['openNewTaskModal', 'deleteCompleted'])

const filterOptions = [
  {
    name: 'All tasks',
    icon: 'task',
    value: 'all',
  },
  {
    name: 'Completed tasks',
    icon: 'done_outline',
    value: 'completed',
  },
  {
    name: 'Incomplete tasks',
    icon: 'disabled_by_default',
    value: 'incomplete',
  },
]

const handleFilterClick = async (filterValue: string) => {
  await router.push({
    path: '/',
    query: {
      filter: filterValue !== 'all' ? filterValue : undefined,
      page: 1,
    },
  })
}
</script>
