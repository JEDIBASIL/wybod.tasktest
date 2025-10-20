<template>
  <div class="flex-1 p-6">
    <div class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-colors">
      <div class="min-h-[500px] p-6">
        <div v-if="taskStore.loading" class="space-y-2">
          <div v-for="index in 10" :key="index">
            <div class="flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-700 p-2">
              <div class="flex items-center gap-2">
                <SkeletonLoader customClass="h-5 w-50" />
                <SkeletonLoader customClass="h-2 w-70" />
              </div>
              <SkeletonLoader customClass="h-4 w-20" />
            </div>
          </div>
        </div>

        <div v-else-if="taskStore.error" class="text-center py-12">
          <span style="font-size: 70px" class="text-red-500 dark:text-red-400 material-symbols-outlined">
            sentiment_sad
          </span>
          <p class="mt-4 text-neutral-700 dark:text-neutral-300">{{ taskStore.error }}</p>
          <button @click="taskStore.fetchTasks()"
            class="mt-5 underline text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            Try again
          </button>
        </div>

        <div v-else-if="emptyStateType === 'no-tasks'" class="text-center py-12">
          <span style="font-size: 70px" class="text-neutral-400 dark:text-neutral-600 material-symbols-outlined">
            task_alt
          </span>
          <p class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">No tasks yet</p>
          <p class="text-sm mt-2 text-neutral-600 dark:text-neutral-400">Click "New Task" to create your first task!</p>
        </div>

        <div v-else-if="emptyStateType === 'no-completed-tasks'" class="text-center py-12">
          <span style="font-size: 70px" class="text-green-400 dark:text-green-500 material-symbols-outlined">
            check_circle
          </span>
          <p class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">Good, you got it all covered!</p>
          <p class="text-sm mt-2 text-neutral-600 dark:text-neutral-400">No completed tasks to show. Keep up the great work!</p>
        </div>

        <div v-else-if="emptyStateType === 'no-incomplete-tasks'" class="text-center py-12">
          <span style="font-size: 70px" class="text-green-400 dark:text-green-500 material-symbols-outlined">
            task_alt
          </span>
          <p class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">You're all set!</p>
          <p class="text-sm mt-2 text-neutral-600 dark:text-neutral-400">No incomplete tasks. Everything is done! What's next?</p>
        </div>

        <div v-else-if="emptyStateType === 'no-search-results'" class="text-center py-12">
          <span style="font-size: 70px" class="text-neutral-400 dark:text-neutral-600 material-symbols-outlined">
            search_off
          </span>
          <p class="mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">No results found</p>
          <p class="text-sm mt-2 text-neutral-600 dark:text-neutral-400">
            No tasks match "{{ taskStore.searchQuery }}"
          </p>
          <button @click="taskStore.clearSearch"
            class="mt-5 underline text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            Clear search
          </button>
        </div>

        <div v-else class="space-y-1">
          <ListCard v-for="task in taskStore.tasks" :key="task.id" :id="task.id" :title="task.title"
            :description="task.description" :is-completed="task.isCompleted" :created-at="task.createdAt"
            :completed-at="task.completedAt" />
        </div>
      </div>

      <TaskPagination v-if="!taskStore.loading && taskStore.tasks.length > 0" :currentPage="taskStore.currentPage"
        :pageSize="taskStore.pageSize" :totalCount="taskStore.totalCount" :totalPages="taskStore.totalPages"
        :hasPreviousPage="taskStore.paginationInfo.hasPreviousPage" :hasNextPage="taskStore.paginationInfo.hasNextPage"
        @pageChange="taskStore.setPage" @pageSizeChange="taskStore.setPageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTaskStore } from '@/store/tasks.store'
import SkeletonLoader from '@/components/loader/SkeletonLoader.vue'
import ListCard from '@/components/ui/ListCard.vue'
import TaskPagination from '@/components/layouts/TaskPagination.vue'

const taskStore = useTaskStore()

const emptyStateType = computed(() => {
  if (taskStore.searchQuery && taskStore.tasks.length === 0) return 'no-search-results'
  if (!taskStore.searchQuery && taskStore.tasks.length === 0 && taskStore.activeFilter === 'all') return 'no-tasks'
  if (!taskStore.searchQuery && taskStore.tasks.length === 0 && taskStore.activeFilter === 'completed') return 'no-completed-tasks'
  if (!taskStore.searchQuery && taskStore.tasks.length === 0 && taskStore.activeFilter === 'incomplete') return 'no-incomplete-tasks'
  return 'has-tasks'
})

onMounted(async () => {
  taskStore.initializeFromUrl()
  await taskStore.fetchTasks()
})
</script>
