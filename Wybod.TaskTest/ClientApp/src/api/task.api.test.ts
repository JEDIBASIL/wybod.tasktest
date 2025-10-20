import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { taskApi, TaskItem, PaginatedResult } from '@/api/task.api';

const mockTask: TaskItem = {
  id: '123',
  title: 'Test Task',
  description: 'Test Description',
  isCompleted: false,
  createdAt: new Date().toISOString(),
  completedAt: undefined
};

const mockPaginatedResult: PaginatedResult<TaskItem> = {
  data: [mockTask],
  pageNumber: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false
};

describe('Task API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchTasks', () => {
    it('fetches tasks with default pagination', async () => {
      const mockResponse = new Response(JSON.stringify(mockPaginatedResult), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      const result = await taskApi.fetchTasks();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks/paginated?pageNumber=1&pageSize=10'
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('fetches tasks with custom pagination', async () => {
      const mockResponse = new Response(JSON.stringify(mockPaginatedResult), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await taskApi.fetchTasks(2, 20);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks/paginated?pageNumber=2&pageSize=20'
      );
    });

    it('throws error on failed response', async () => {
      const mockResponse = new Response(null, { status: 500 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await expect(taskApi.fetchTasks()).rejects.toThrow('Failed to fetch tasks');
    });

    it('throws error on network failure', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(taskApi.fetchTasks()).rejects.toThrow('Network error');
    });
  });

  describe('fetchFilteredTasks', () => {
    it('fetches filtered tasks with completion status', async () => {
      const mockResponse = new Response(JSON.stringify(mockPaginatedResult), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await taskApi.fetchFilteredTasks(1, 10, true);

      const callUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(callUrl).toContain('/api/tasks/filtered?');
      expect(callUrl).toContain('isCompleted=true');
      expect(callUrl).toContain('pageNumber=1');
      expect(callUrl).toContain('pageSize=10');
    });

    it('fetches filtered tasks with date range', async () => {
      const mockResponse = new Response(JSON.stringify(mockPaginatedResult), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      await taskApi.fetchFilteredTasks(1, 10, undefined, startDate, endDate);

      const callUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(callUrl).toContain('startDate=2024-01-01');
      expect(callUrl).toContain('endDate=2024-01-31');
    });

    it('fetches filtered tasks with all parameters', async () => {
      const mockResponse = new Response(JSON.stringify(mockPaginatedResult), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await taskApi.fetchFilteredTasks(2, 15, false, '2024-01-01', '2024-01-31');

      const callUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(callUrl).toContain('pageNumber=2');
      expect(callUrl).toContain('pageSize=15');
      expect(callUrl).toContain('isCompleted=false');
      expect(callUrl).toContain('startDate=2024-01-01');
      expect(callUrl).toContain('endDate=2024-01-31');
    });

    it('throws error on failed response', async () => {
      const mockResponse = new Response(null, { status: 500 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await expect(taskApi.fetchFilteredTasks()).rejects.toThrow('Failed to fetch filtered tasks');
    });
  });

  describe('searchTasks', () => {
    it('searches tasks with query', async () => {
      const mockResponse = new Response(JSON.stringify([mockTask]), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      const result = await taskApi.searchTasks('test query');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks/search?query=test%20query'
      );
      expect(result).toEqual([mockTask]);
    });

    it('returns empty array for empty query', async () => {
      const result = await taskApi.searchTasks('   ');

      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('encodes special characters in query', async () => {
      const mockResponse = new Response(JSON.stringify([]), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await taskApi.searchTasks('test & query?');

      const callUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
      expect(callUrl).toContain('query=');
      expect(callUrl).not.toContain('&query');
    });

    it('throws error on failed response', async () => {
      const mockResponse = new Response(null, { status: 500 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await expect(taskApi.searchTasks('test')).rejects.toThrow('Failed to search tasks');
    });
  });

  describe('getTaskById', () => {
    it('fetches task by id', async () => {
      const mockResponse = new Response(JSON.stringify(mockTask), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      const result = await taskApi.getTaskById('123');

      expect(global.fetch).toHaveBeenCalledWith('/api/tasks/123');
      expect(result).toEqual(mockTask);
    });

    it('throws error when task not found', async () => {
      const mockResponse = new Response(null, { status: 404 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await expect(taskApi.getTaskById('invalid')).rejects.toThrow('Task not found');
    });

    it('throws error on server error', async () => {
      const mockResponse = new Response(null, { status: 500 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await expect(taskApi.getTaskById('123')).rejects.toThrow('Task not found');
    });
  });

  describe('createTask', () => {
    it('creates a task with valid payload', async () => {
      const mockResponse = new Response(JSON.stringify(mockTask), { status: 201 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      const payload = { title: 'New Task', description: 'New Description' };
      const result = await taskApi.createTask(payload);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      );
      expect(result).toEqual(mockTask);
    });

    it('throws error when title is empty', async () => {
      const payload = { title: '   ', description: 'Description' };

      await expect(taskApi.createTask(payload)).rejects.toThrow('Title is required');
    });

    it('throws error on failed response', async () => {
      const mockResponse = new Response(null, { status: 400 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      const payload = { title: 'Task', description: 'Description' };
      await expect(taskApi.createTask(payload)).rejects.toThrow('Failed to create task');
    });
  });

  describe('updateTask', () => {
    it('updates a task with valid payload', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Title' };
      const mockResponse = new Response(JSON.stringify(updatedTask), { status: 200 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      const result = await taskApi.updateTask('123', updatedTask);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks/123',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask)
        })
      );
      expect(result).toEqual(updatedTask);
    });

    it('throws error on failed response', async () => {
      const mockResponse = new Response(null, { status: 500 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await expect(taskApi.updateTask('123', mockTask)).rejects.toThrow('Failed to update task');
    });
  });

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      const mockResponse = new Response(null, { status: 204 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await taskApi.deleteTask('123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks/123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('throws error on failed response', async () => {
      const mockResponse = new Response(null, { status: 500 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await expect(taskApi.deleteTask('123')).rejects.toThrow('Failed to delete task');
    });
  });

  describe('deleteCompletedTasks', () => {
    it('deletes all completed tasks', async () => {
      const mockResponse = new Response(null, { status: 204 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await taskApi.deleteCompletedTasks();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/tasks/completed',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('throws error on failed response', async () => {
      const mockResponse = new Response(null, { status: 500 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await expect(taskApi.deleteCompletedTasks()).rejects.toThrow('Failed to delete completed tasks');
    });
  });

  describe('toggleTaskCompletion', () => {
    it('marks task as completed', async () => {
      const getResponse = new Response(JSON.stringify(mockTask), { status: 200 });
      const updatedTask = { ...mockTask, isCompleted: true, completedAt: new Date().toISOString() };
      const updateResponse = new Response(JSON.stringify(updatedTask), { status: 200 });

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(getResponse)
        .mockResolvedValueOnce(updateResponse);

      const result = await taskApi.toggleTaskCompletion('123', true);

      expect(result.isCompleted).toBe(true);
      expect(result.completedAt).toBeDefined();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('marks task as incomplete and removes completedAt', async () => {
      const completedTask = { ...mockTask, isCompleted: true, completedAt: new Date().toISOString() };
      const getResponse = new Response(JSON.stringify(completedTask), { status: 200 });
      const updatedTask = { ...completedTask, isCompleted: false, completedAt: undefined };
      const updateResponse = new Response(JSON.stringify(updatedTask), { status: 200 });

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(getResponse)
        .mockResolvedValueOnce(updateResponse);

      const result = await taskApi.toggleTaskCompletion('123', false);

      expect(result.isCompleted).toBe(false);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('throws error if getTaskById fails', async () => {
      const mockResponse = new Response(null, { status: 404 });
      vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse);

      await expect(taskApi.toggleTaskCompletion('invalid', true)).rejects.toThrow();
    });

    it('throws error if updateTask fails', async () => {
      const getResponse = new Response(JSON.stringify(mockTask), { status: 200 });
      const updateResponse = new Response(null, { status: 500 });

      vi.mocked(global.fetch)
        .mockResolvedValueOnce(getResponse)
        .mockResolvedValueOnce(updateResponse);

      await expect(taskApi.toggleTaskCompletion('123', true)).rejects.toThrow();
    });
  });
});