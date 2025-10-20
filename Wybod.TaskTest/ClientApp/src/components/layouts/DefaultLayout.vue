<template>
  <div class="tracking-tighter font-regular min-h-screen bg-neutral-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 transition-colors">
    <Navbar />

    <main class="flex">
      <TaskFilters :activeFilter="taskStore.activeFilter" @openNewTaskModal="showNewTaskModal"
        @filterChange="handleFilterChange" @deleteCompleted="taskStore.deleteCompletedTasks()" />

      <div class="flex-1">
        <ModalContainer v-if="showModal" :onClose="closeModal">
          <NewTask @task-created="closeModal" />
        </ModalContainer>

        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '@/store/tasks.store'
import Navbar from './Navbar.vue'
import TaskFilters from './TaskFilter.vue'
import NewTask from '@/components/forms/NewTask.vue'
import ModalContainer from '@/components/ui/ModalContainer.vue'

const taskStore = useTaskStore()
const showModal = ref(false)

const showNewTaskModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleFilterChange = async (filterValue: 'all' | 'completed' | 'incomplete') => {
  await taskStore.setFilter(filterValue)
}
</script>
