export interface TaskItem {
  id: string
  title: string
  description: string
  isCompleted: boolean
  createdAt: string
  completedAt?: string
}

export interface CreateTaskPayload {
  title: string
  description: string
}

export interface UpdateTaskPayload extends Partial<TaskItem> {}

export interface PaginatedResult<T> {
  data: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

const BASE_URL = '/api'

export const taskApi = {
  async fetchTasks(pageNumber: number = 1, pageSize: number = 10): Promise<PaginatedResult<TaskItem>> {
    try {
      const response = await fetch(
        `${BASE_URL}/tasks/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  },

  async fetchFilteredTasks(
    pageNumber: number = 1,
    pageSize: number = 10,
    isCompleted?: boolean,
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedResult<TaskItem>> {
    try {
      const params = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      })

      if (isCompleted !== undefined) {
        params.append('isCompleted', isCompleted.toString())
      }
      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }

      const response = await fetch(`${BASE_URL}/tasks/filtered?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch filtered tasks')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  },

  async searchTasks(query: string): Promise<TaskItem[]> {
    try {
      if (!query.trim()) {
        return []
      }

      const response = await fetch(`${BASE_URL}/tasks/search?query=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to search tasks')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  },

  async getTaskById(id: string): Promise<TaskItem> {
    try {
      const response = await fetch(`${BASE_URL}/tasks/${id}`)
      if (!response.ok) {
        throw new Error('Task not found')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  },

  async createTask(payload: CreateTaskPayload): Promise<TaskItem> {
    try {
      if (!payload.title.trim()) {
        throw new Error('Title is required')
      }

      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw error
    }
  },

  async updateTask(id: string, payload: TaskItem): Promise<TaskItem> {
    try {
      const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw error
    }
  },


  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }
    } catch (error) {
      throw error
    }
  },

  async deleteCompletedTasks(): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/tasks/completed`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete completed tasks')
      }
    } catch (error) {
      throw error
    }
  },

  async toggleTaskCompletion(id: string, isCompleted: boolean): Promise<TaskItem> {
    try {
      const currentTask = await this.getTaskById(id)

      const updatedPayload: TaskItem = {
        ...currentTask,
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : undefined,
      }

      return await this.updateTask(id, updatedPayload)
    } catch (error) {
      throw error
    }
  },
}