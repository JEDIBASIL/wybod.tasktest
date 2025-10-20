<template>
  <ModalContainer v-if="showDeleteModal" :onClose="() => (showDeleteModal = false)">
    <div class="p-6">
      <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Delete Task</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Are you sure you want to delete "<strong class="text-gray-900 dark:text-gray-100">{{ title }}</strong>"? This action cannot be undone.
      </p>
      <div class="flex gap-3 justify-end">
        <button
          @click="showDeleteModal = false"
          class="px-6 py-2 border border-neutral-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          @click="confirmDelete"
          class="px-6 py-2 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-md transition-colors font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  </ModalContainer>

  <div class="border-b border-neutral-200 dark:border-neutral-700 p-3 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors group">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <span
          :class="[
            'flex-shrink-0 px-2 py-1 text-xs rounded-full font-medium border',
            isCompleted
              ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-500 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-500 text-red-600 dark:text-red-400',
          ]"
        >
          {{ isCompleted ? 'Completed' : 'Pending' }}
        </span>

        <div class="flex items-center gap-3 min-w-0 flex-1">
          <router-link
            :to="`/tasks/${id}`"
            class="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors truncate"
          >
            {{ title }}
          </router-link>
          <p class="text-gray-600 dark:text-gray-400 text-sm truncate">{{ description }}</p>
        </div>
      </div>

      <div class="flex-shrink-0 ml-4 flex items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap group-hover:hidden">
          {{ formatDate(createdAt) }}
        </span>

        <div class="hidden group-hover:flex items-center gap-2">
          <router-link
            :to="`/tasks/${id}`"
            class="p-2 h-6 w-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
            title="View task"
          >
            <span class="material-symbols-outlined text-xs m-0 " style="font-size: 18px;">visibility</span>
          </router-link>

          <button
            @click="showDeleteModal = true"
            class="p-2 h-6 w-6 flex items-center justify-center bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
            title="Delete task"
          >
            <span class="material-symbols-outlined text-xs m-0 " style="font-size: 18px;">delete</span>
          </button>

          <button
            @click="toggleCompletion"
            class="p-2 h-6 w-6 flex items-center justify-center bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 transition-colors"
            :title="isCompleted ? 'Mark as incomplete' : 'Mark as complete'"
          >
            <span class="material-symbols-outlined text-xs m-0 " style="font-size: 18px;">
              {{ isCompleted ? 'radio_button_unchecked' : 'check_circle' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '@/store/tasks.store'
import ModalContainer from '@/components/ui/ModalContainer.vue'

const taskStore = useTaskStore()
const showDeleteModal = ref(false)

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    required: true,
  },
  completedAt: {
    type: String,
    default: null,
  },
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const toggleCompletion = async () => {
  await taskStore.toggleTaskCompletion(props.id, !props.isCompleted)
}

const confirmDelete = async () => {
  await taskStore.deleteTask(props.id)
  showDeleteModal.value = false
}
</script>

<style scoped>
.group:hover .hidden {
  display: flex;
}
</style>
