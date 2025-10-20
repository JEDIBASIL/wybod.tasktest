<template>
  <nav class="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b bg-neutral-200 dark:bg-neutral-800 transition-colors">
    <div class="max-w-full px-6 py-4 flex items-center justify-between gap-6">
      <router-link to="/" class="flex items-center gap-3 flex-shrink-0">
        <div class="w-10 h-10 bg-neutral-500 dark:bg-neutral-600 rounded-lg flex items-center justify-center">
          <span class="material-symbols-outlined text-white">task_alt</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Task Manager</h1>
      </router-link>

      <div class="flex-1 max-w-2xl">
        <div class="flex gap-2">
          <input v-model="searchInput" type="text" placeholder="Search tasks by title or description..."
            @keyup.enter="handleSearch"
            class="flex-1 px-4 py-2 border bg-neutral-50 dark:bg-neutral-600 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg dark:border-neutral-600 dark:bg-background focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500" />
          <button @click="handleSearch"
            class="px-6 py-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 whitespace-nowrap">
            <span class="material-symbols-outlined">search</span>
            Search
          </button>
          <button class="dark:text-neutral-400" v-if="taskStore.searchQuery" @click="handleClear">
            Clear
          </button>
        </div>
      </div>

      <button @click="toggleDarkMode"
        class="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 transition-colors flex-shrink-0"
        :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
        <span class="material-symbols-outlined">
          {{ isDarkMode ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/store/tasks.store'

const router = useRouter()
const taskStore = useTaskStore()
const isDarkMode = ref(false)
const searchInput = ref('')

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const handleSearch = async () => {
  if (searchInput.value.trim()) {
    await router.push({
      path: '/',
      query: { search: searchInput.value, page: 1 },
    })
    await taskStore.searchTasks(searchInput.value)
    searchInput.value = ''
  }
}

const handleClear = async () => {
  searchInput.value = ''
  await taskStore.clearSearch()
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>
