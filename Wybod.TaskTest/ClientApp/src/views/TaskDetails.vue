<template>
    <!-- Delete Modal -->
    <ModalContainer v-if="showDeleteModal" :onClose="() => (showDeleteModal = false)">
        <div class="p-6">
            <h3 class="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Delete Task</h3>
            <p class="text-neutral-600 dark:text-neutral-400 mb-6">
                Are you sure you want to delete "<strong class="text-neutral-900 dark:text-neutral-100">{{ task?.title
                    }}</strong>"? This action cannot be undone.
            </p>
            <div class="flex gap-3 justify-end">
                <button @click="showDeleteModal = false"
                    class="px-6 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium">
                    Cancel
                </button>
                <button @click="confirmDelete"
                    class="px-6 py-2 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-md transition-colors font-medium">
                    Delete
                </button>
            </div>
        </div>
    </ModalContainer>

    <!-- Page Content -->
    <div class="full mx-auto px-6 py-6">
        <!-- Back Button -->

        <!-- Loading State -->
        <div v-if="loading"
            class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8">
            <div class="space-y-4">
                <div class="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
                <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
                <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error"
            class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <span style="font-size: 70px" class="text-red-500 dark:text-red-400 material-symbols-outlined">
                error
            </span>
            <p class="mt-4 text-neutral-700 dark:text-neutral-300">{{ error }}</p>
            <router-link to="/"
                class="mt-5 inline-block underline text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                Go back to tasks
            </router-link>
        </div>

        <!-- Task Detail -->
        <div v-else-if="task"
            class="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-8">
            <!-- Task Header -->
            <router-link to="/"
                class="inline-flex items-center gap-2 mb-6 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                <span class="material-symbols-outlined">arrow_back</span>
                Back to tasks
            </router-link>
            <div class="mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-700">
                <div class="flex items-start justify-between">
                    <div>
                        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                            {{ task.title }}
                        </h1>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400">
                            Created on {{ formatDate(task.createdAt) }}
                        </p>
                    </div>

                    <div class="flex items-center gap-3">
                        <!-- Toggle Completion -->
                        <button @click="toggleCompletion" :class="[
                            'px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2',
                            task.isCompleted
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700',
                        ]">
                            <span class="material-symbols-outlined">
                                {{ task.isCompleted ? 'check_circle' : 'radio_button_unchecked' }}
                            </span>
                            {{ task.isCompleted ? 'Completed' : 'Incomplete' }}
                        </button>

                        <!-- Delete -->
                        <button @click="showDeleteModal = true"
                            class="px-4 py-2 rounded-md font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined">delete</span>
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            <!-- Task Description -->
            <div class="mb-8">
                <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Description
                </h2>
                <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {{ task.description || 'No description provided' }}
                </p>
            </div>
        </div>

        <!-- Not Found State -->
        <div v-else class="text-center py-12">
            <span style="font-size: 70px" class="text-neutral-400 dark:text-neutral-600 material-symbols-outlined">
                task_alt
            </span>
            <p class="mt-4 text-neutral-700 dark:text-neutral-300">Task not found</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTaskStore } from '@/store/tasks.store'
import ModalContainer from '@/components/ui/ModalContainer.vue'
import type { TaskItem } from '@/api/task.api'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()

const task = ref<TaskItem | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showDeleteModal = ref(false)

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

const toggleCompletion = async () => {
    if (!task.value) return
    try {
        // Call store - updates API and shows toast
        const updatedTask = await taskStore.toggleTaskCompletion(task.value.id, !task.value.isCompleted)
        // Update local task ref - UI updates automatically
        task.value = updatedTask
    } catch (err) {
        error.value = (err as Error).message
    }
}

const confirmDelete = async () => {
    if (!task.value) return
    try {
        // Call store - updates API and shows toast
        await taskStore.deleteTask(task.value.id)
        // Redirect to tasks page
        router.push('/')
    } catch (err) {
        error.value = (err as Error).message
    }
}

onMounted(async () => {
    const taskId = route.params.id as string
    loading.value = true
    error.value = null

    try {
        // Fetch task from store
        const fetchedTask = await taskStore.getTaskById(taskId)
        task.value = fetchedTask
    } catch (err) {
        error.value = (err as Error).message
    } finally {
        loading.value = false
    }
})
</script>