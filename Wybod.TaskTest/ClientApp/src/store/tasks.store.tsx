import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  taskApi,
  type TaskItem,
  type CreateTaskPayload,
  type PaginatedResult,
} from '@/api/task.api'
import { toast } from 'vue-sonner'

export const useTaskStore = defineStore('tasks', () => {
  const router = useRouter()
  const route = useRoute()

  const tasks = ref<TaskItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalCount = ref(0)
  const totalPages = ref(0)

  const activeFilter = ref<'all' | 'completed' | 'incomplete'>('all')
  const searchQuery = ref<string>('')
  const filterStartDate = ref<string | null>(null)
  const filterEndDate = ref<string | null>(null)

  const filteredTasks = computed(() => {
    return tasks.value
  })

  const paginationInfo = computed(() => ({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    totalCount: totalCount.value,
    totalPages: totalPages.value,
    hasNextPage: currentPage.value < totalPages.value,
    hasPreviousPage: currentPage.value > 1,
  }))

  const initializeFromUrl = () => {
    currentPage.value = parseInt((route.query.page as string) || '1', 10)
    pageSize.value = parseInt((route.query.pageSize as string) || '10', 10)
    activeFilter.value = (route.query.filter as any) || 'all'
    searchQuery.value = (route.query.search as string) || ''
    filterStartDate.value = (route.query.startDate as string) || null
    filterEndDate.value = (route.query.endDate as string) || null
  }

  const updateUrlQuery = async () => {
    const query: Record<string, string | number | null> = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }

    if (activeFilter.value !== 'all') {
      query.filter = activeFilter.value
    }

    if (searchQuery.value) {
      query.search = searchQuery.value
    }

    if (filterStartDate.value) {
      query.startDate = filterStartDate.value
    }

    if (filterEndDate.value) {
      query.endDate = filterEndDate.value
    }

    Object.keys(query).forEach((key) => {
      if (query[key] === null) {
        delete query[key]
      }
    })

    await router.push({ query })
  }

  const fetchTasks = async () => {
    loading.value = true
    error.value = null

    try {
      let result: PaginatedResult<TaskItem>

      if (searchQuery.value.trim()) {
        const searchResults = await taskApi.searchTasks(searchQuery.value)

        const startIndex = (currentPage.value - 1) * pageSize.value
        const endIndex = startIndex + pageSize.value
        tasks.value = searchResults.slice(startIndex, endIndex)
        totalCount.value = searchResults.length
        totalPages.value = Math.ceil(totalCount.value / pageSize.value)
      } else {
        const isCompletedFilter =
          activeFilter.value === 'completed'
            ? true
            : activeFilter.value === 'incomplete'
              ? false
              : undefined

        result = await taskApi.fetchFilteredTasks(
          currentPage.value,
          pageSize.value,
          isCompletedFilter,
          filterStartDate.value || undefined,
          filterEndDate.value || undefined
        )

        tasks.value = result.data
        totalCount.value = result.totalCount
        totalPages.value = result.totalPages
      }
    } catch (err) {
      error.value = (err as Error).message
      toast.error('Failed to fetch tasks', {
        description: error.value,
      })
    } finally {
      loading.value = false
    }
  }

  const setPage = async (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    await updateUrlQuery()
    await fetchTasks()
  }

  const setPageSize = async (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    await updateUrlQuery()
    await fetchTasks()
  }

  const searchTasks = async (query: string) => {
    searchQuery.value = query
    currentPage.value = 1 
    await updateUrlQuery()
    toast.loading('Searching tasks...', {
      description: `Searching for "${query}"`,
    })
    try {
      await fetchTasks()
      toast.dismiss()
      toast.success('Search completed', {
        description: `Found ${totalCount.value} task(s)`,
      })
    } catch (err) {
      toast.dismiss()
      toast.error('Search failed', {
        description: (err as Error).message,
      })
    }
  }

  const clearSearch = async () => {
    searchQuery.value = ''
    currentPage.value = 1
    await updateUrlQuery()
    await fetchTasks()
  }

  const setFilter = async (filter: 'all' | 'completed' | 'incomplete') => {
    activeFilter.value = filter
    currentPage.value = 1
    await updateUrlQuery()
    const filterLabel = {
      all: 'All tasks',
      completed: 'Completed tasks',
      incomplete: 'Incomplete tasks',
    }
    toast.info('Filter applied', {
      description: `Showing ${filterLabel[filter]}`,
    })
    await fetchTasks()
  }

  const setDateFilter = async (startDate: string | null, endDate: string | null) => {
    filterStartDate.value = startDate
    filterEndDate.value = endDate
    currentPage.value = 1 
    await updateUrlQuery()
    await fetchTasks()
  }

  const createTask = async (payload: CreateTaskPayload) => {
    try {
      const newTask = await taskApi.createTask(payload)
      toast.success('Task created', {
        description: `"${newTask.title}" has been added`,
      })
      await fetchTasks()
      return newTask
    } catch (err) {
      error.value = (err as Error).message
      toast.error('Failed to create task', {
        description: error.value,
      })
      throw err
    }
  } 

  const updateTask = async (id: string, payload: TaskItem) => {
    try {
      const updatedTask = await taskApi.updateTask(id, payload)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      toast.success('Task updated', {
        description: `"${updatedTask.title}" has been updated`,
      })
      return updatedTask
    } catch (err) {
      error.value = (err as Error).message
      toast.error('Failed to update task', {
        description: error.value,
      })
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const taskToDelete = tasks.value.find((t) => t.id === id)
      await taskApi.deleteTask(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
      toast.success('Task deleted', {
        description: `"${taskToDelete?.title}" has been deleted`,
      })
      if (tasks.value.length === 0 && currentPage.value > 1) {
        await setPage(currentPage.value - 1)
      }
    } catch (err) {
      error.value = (err as Error).message
      toast.error('Failed to delete task', {
        description: error.value,
      })
      throw err
    }
  }

  const toggleTaskCompletion = async (id: string, isCompleted: boolean) => {
    try {
      const updatedTask = await taskApi.toggleTaskCompletion(id, isCompleted)
      const index = tasks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      const status = isCompleted ? 'completed' : 'incomplete'
      toast.success('Task updated', {
        description: `Task marked as ${status}`,
      })
      return updatedTask
    } catch (err) {
      error.value = (err as Error).message
      toast.error('Failed to update task', {
        description: error.value,
      })
      throw err
    }
  }

  const getTaskById = async (id: string): Promise<TaskItem> => {
  loading.value = true
  error.value = null

  try {
    const result = await taskApi.getTaskById(id)
    return result
  } catch (err) {
    error.value = (err as Error).message
    toast.error('Failed to fetch task', {
      description: error.value,
    })
    throw err
  } finally {
    loading.value = false
  }
}


  const deleteCompletedTasks = async () => {
    try {
      const completedCount = tasks.value.filter((t) => t.isCompleted).length
      if (completedCount === 0) {
        toast.info('No completed tasks', {
          description: 'There are no completed tasks to delete',
        })
        return
      }
      await taskApi.deleteCompletedTasks()
      toast.success('Completed tasks deleted', {
        description: `${completedCount} completed task(s) have been removed`,
      })
      await fetchTasks()
    } catch (err) {
      error.value = (err as Error).message
      toast.error('Failed to delete completed tasks', {
        description: error.value,
      })
      throw err
    }
  }

  const resetFilters = async () => {
    currentPage.value = 1
    activeFilter.value = 'all'
    searchQuery.value = ''
    filterStartDate.value = null
    filterEndDate.value = null
    await updateUrlQuery()
    await fetchTasks()
  }

  watch(
    () => route.query,
    () => {
      initializeFromUrl()
      fetchTasks()
    },
    { deep: true }
  )

  return {
    getTaskById,
    tasks,
    loading,
    error,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    activeFilter,
    searchQuery,
    filterStartDate,
    filterEndDate,

    filteredTasks,
    paginationInfo,

    initializeFromUrl,
    updateUrlQuery,
    fetchTasks,
    setPage,
    setPageSize,
    searchTasks,
    clearSearch,
    setFilter,
    setDateFilter,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    deleteCompletedTasks,
    resetFilters,
  }
})