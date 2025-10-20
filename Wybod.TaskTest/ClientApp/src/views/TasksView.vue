<template>
  <div>
    <div v-if="loading" class="text-center py-8 text-lg text-gray-600">
      Loading tasks...
    </div>

    <div v-else-if="error" class="text-center py-8 text-lg text-red-600">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="tasks.length === 0" class="text-center py-8 text-lg text-gray-500">
        No tasks yet
      </div>

      <div v-else class="space-y-4">
          <ListCard v-for="task in tasks" :key="task.id" :id="task.id" :title="task.title"
            :description="task.description" :is-completed="task.isCompleted" :created-at="task.createdAt"
            :completed-at="task.completedAt" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ListCard from '@/components/ui/ListCard.vue'

import { ref, onMounted } from 'vue'

interface TaskItem {
  id: string
  title: string
  description: string
  isCompleted: boolean
  createdAt: string
  completedAt?: string
}

const tasks = ref<TaskItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchTasks = async () => {
  try {
    const response = await fetch('/api/tasks')
    if (!response.ok) {
      throw new Error('Failed to fetch tasks')
    }
    tasks.value = await response.json()
    console.log(tasks.value.length)
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchTasks()
})
</script>
