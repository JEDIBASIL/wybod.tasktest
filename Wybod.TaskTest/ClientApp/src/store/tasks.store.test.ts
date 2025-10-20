import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTaskStore } from '@/store/tasks.store';
import { taskApi } from '@/api/task.api';
import { toast } from 'vue-sonner';

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: vi.fn().mockResolvedValue(undefined)
    }),
    useRoute: () => ({
        query: {}
    })
}));

vi.mock('@/api/task.api');
vi.mock('vue-sonner');

const mockTask = {
    id: '123',
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    completedAt: undefined
};

const mockPaginatedResult = {
    data: [mockTask],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false
};

describe('Task Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initial state', () => {
        it('has correct initial values', () => {
            const store = useTaskStore();

            expect(store.tasks).toEqual([]);
            expect(store.loading).toBe(false);
            expect(store.error).toBeNull();
            expect(store.currentPage).toBe(1);
            expect(store.pageSize).toBe(10);
            expect(store.totalCount).toBe(0);
            expect(store.totalPages).toBe(0);
            expect(store.activeFilter).toBe('all');
            expect(store.searchQuery).toBe('');
            expect(store.filterStartDate).toBeNull();
            expect(store.filterEndDate).toBeNull();
        });
    });

    describe('fetchTasks', () => {
        it('fetches tasks with current filter and pagination', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            await store.fetchTasks();

            expect(store.tasks).toEqual([mockTask]);
            expect(store.totalCount).toBe(1);
            expect(store.totalPages).toBe(1);
            expect(store.loading).toBe(false);
            expect(vi.mocked(taskApi.fetchFilteredTasks)).toHaveBeenCalled();
        });

        it('handles search query with pagination', async () => {
            const searchResults = [mockTask, { ...mockTask, id: '124' }, { ...mockTask, id: '125' }];
            vi.mocked(taskApi.searchTasks).mockResolvedValueOnce(searchResults);

            const store = useTaskStore();
            store.pageSize = 2;
            store.searchQuery = 'test';
            await store.fetchTasks();

            expect(vi.mocked(taskApi.searchTasks)).toHaveBeenCalledWith('test');
            expect(store.tasks).toHaveLength(2);
            expect(store.tasks[0].id).toBe('123');
            expect(store.tasks[1].id).toBe('124');
            expect(store.totalCount).toBe(3);
            expect(store.totalPages).toBe(2);
        });

        it('sets loading state during fetch', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockImplementationOnce(async () => {
                const store = useTaskStore();
                expect(store.loading).toBe(true);
                return mockPaginatedResult as any;
            });

            const store = useTaskStore();
            await store.fetchTasks();

            expect(store.loading).toBe(false);
        });

        it('handles fetch error', async () => {
            const error = new Error('Fetch failed');
            vi.mocked(taskApi.fetchFilteredTasks).mockRejectedValueOnce(error);

            const store = useTaskStore();
            await store.fetchTasks();

            expect(store.error).toBe('Fetch failed');
            expect(vi.mocked(toast.error)).toHaveBeenCalled();
        });
    });

    describe('setPage', () => {
        it('sets current page and fetches tasks', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            store.totalPages = 5;
            await store.setPage(2);

            expect(store.currentPage).toBe(2);
            expect(vi.mocked(taskApi.fetchFilteredTasks)).toHaveBeenCalled();
        });

        it('does not set page if invalid', async () => {
            const store = useTaskStore();
            store.totalPages = 5;
            await store.setPage(0);

            expect(store.currentPage).toBe(1);
            expect(vi.mocked(taskApi.fetchFilteredTasks)).not.toHaveBeenCalled();
        });

        it('does not set page if exceeds total pages', async () => {
            const store = useTaskStore();
            store.totalPages = 5;
            await store.setPage(6);

            expect(store.currentPage).toBe(1);
        });
    });

    describe('setPageSize', () => {
        it('updates page size and resets to page 1', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            store.currentPage = 3;
            await store.setPageSize(20);

            expect(store.pageSize).toBe(20);
            expect(store.currentPage).toBe(1);
            expect(vi.mocked(taskApi.fetchFilteredTasks)).toHaveBeenCalled();
        });
    });

    describe('searchTasks', () => {
        it('searches and updates search query', async () => {
            vi.mocked(taskApi.searchTasks).mockResolvedValueOnce([mockTask]);

            const store = useTaskStore();
            await store.searchTasks('test query');

            expect(store.searchQuery).toBe('test query');
            expect(store.currentPage).toBe(1);
            expect(vi.mocked(toast.success)).toHaveBeenCalled();
        });

        it('shows loading toast during search', async () => {
            vi.mocked(taskApi.searchTasks).mockResolvedValueOnce([mockTask]);

            const store = useTaskStore();
            await store.searchTasks('test');

            expect(vi.mocked(toast.loading)).toHaveBeenCalled();
            expect(vi.mocked(toast.dismiss)).toHaveBeenCalled();
        });

        it('handles search error', async () => {
            const error = new Error('Search failed');
            vi.mocked(taskApi.searchTasks).mockRejectedValueOnce(error);

            const store = useTaskStore();
            await store.searchTasks('test');

            expect(vi.mocked(toast.error)).toHaveBeenCalled();
        });
    });

    describe('clearSearch', () => {
        it('clears search query and fetches all tasks', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            store.searchQuery = 'test';
            await store.clearSearch();

            expect(store.searchQuery).toBe('');
            expect(store.currentPage).toBe(1);
            expect(vi.mocked(taskApi.fetchFilteredTasks)).toHaveBeenCalled();
        });
    });

    describe('setFilter', () => {
        it('sets filter to completed', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            await store.setFilter('completed');

            expect(store.activeFilter).toBe('completed');
            expect(store.currentPage).toBe(1);
            expect(vi.mocked(toast.info)).toHaveBeenCalled();
            expect(vi.mocked(taskApi.fetchFilteredTasks)).toHaveBeenCalledWith(1, 10, true, undefined, undefined);
        });

        it('sets filter to incomplete', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            await store.setFilter('incomplete');

            expect(store.activeFilter).toBe('incomplete');
            expect(vi.mocked(taskApi.fetchFilteredTasks)).toHaveBeenCalledWith(1, 10, false, undefined, undefined);
        });

        it('sets filter to all', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            await store.setFilter('all');

            expect(store.activeFilter).toBe('all');
            expect(vi.mocked(taskApi.fetchFilteredTasks)).toHaveBeenCalledWith(1, 10, undefined, undefined, undefined);
        });
    });

    describe('setDateFilter', () => {
        it('sets date filter and fetches tasks', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            await store.setDateFilter('2024-01-01', '2024-01-31');

            expect(store.filterStartDate).toBe('2024-01-01');
            expect(store.filterEndDate).toBe('2024-01-31');
            expect(store.currentPage).toBe(1);
            expect(vi.mocked(taskApi.fetchFilteredTasks)).toHaveBeenCalled();
        });

        it('clears date filter with null values', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            store.filterStartDate = '2024-01-01';
            store.filterEndDate = '2024-01-31';

            await store.setDateFilter(null, null);

            expect(store.filterStartDate).toBeNull();
            expect(store.filterEndDate).toBeNull();
        });
    });

    describe('createTask', () => {
        it('creates a task and fetches updated list', async () => {
            vi.mocked(taskApi.createTask).mockResolvedValueOnce(mockTask);
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            const payload = { title: 'New Task', description: 'Description' };
            const result = await store.createTask(payload);

            expect(result).toEqual(mockTask);
            expect(vi.mocked(taskApi.createTask)).toHaveBeenCalledWith(payload);
            expect(vi.mocked(toast.success)).toHaveBeenCalled();
            expect(vi.mocked(taskApi.fetchFilteredTasks)).toHaveBeenCalled();
        });

        it('handles create error', async () => {
            const error = new Error('Create failed');
            vi.mocked(taskApi.createTask).mockRejectedValueOnce(error);

            const store = useTaskStore();
            const payload = { title: 'New Task', description: 'Description' };

            await expect(store.createTask(payload)).rejects.toThrow();
            expect(vi.mocked(toast.error)).toHaveBeenCalled();
            expect(store.error).toBe('Create failed');
        });
    });

    describe('updateTask', () => {
        it('updates a task in the store', async () => {
            const updatedTask = { ...mockTask, title: 'Updated Title' };
            vi.mocked(taskApi.updateTask).mockResolvedValueOnce(updatedTask);

            const store = useTaskStore();
            store.tasks = [mockTask];

            const result = await store.updateTask('123', updatedTask);

            expect(result).toEqual(updatedTask);
            expect(store.tasks[0]).toEqual(updatedTask);
            expect(vi.mocked(toast.success)).toHaveBeenCalled();
        });

        it('handles update error', async () => {
            const error = new Error('Update failed');
            vi.mocked(taskApi.updateTask).mockRejectedValueOnce(error);

            const store = useTaskStore();
            const payload = { ...mockTask, title: 'Updated' };

            await expect(store.updateTask('123', payload)).rejects.toThrow();
            expect(vi.mocked(toast.error)).toHaveBeenCalled();
        });
    });

    describe('deleteTask', () => {
        it('deletes a task from the store', async () => {
            vi.mocked(taskApi.deleteTask).mockResolvedValueOnce(undefined);

            const store = useTaskStore();
            store.tasks = [mockTask];

            await store.deleteTask('123');

            expect(store.tasks).toEqual([]);
            expect(vi.mocked(taskApi.deleteTask)).toHaveBeenCalledWith('123');
            expect(vi.mocked(toast.success)).toHaveBeenCalled();
        });

        it('goes to previous page if last task on page is deleted', async () => {
            vi.mocked(taskApi.deleteTask).mockResolvedValueOnce(undefined);
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            store.tasks = [mockTask];
            store.currentPage = 2;
            store.totalPages = 2;

            await store.deleteTask('123');

            expect(store.currentPage).toBe(1);
        });

        it('handles delete error', async () => {
            const error = new Error('Delete failed');
            vi.mocked(taskApi.deleteTask).mockRejectedValueOnce(error);

            const store = useTaskStore();
            store.tasks = [mockTask];

            await expect(store.deleteTask('123')).rejects.toThrow();
            expect(vi.mocked(toast.error)).toHaveBeenCalled();
        });
    });

    describe('toggleTaskCompletion', () => {
        it('marks task as completed', async () => {
            const completedTask = { ...mockTask, isCompleted: true, completedAt: new Date().toISOString() };
            vi.mocked(taskApi.toggleTaskCompletion).mockResolvedValueOnce(completedTask);

            const store = useTaskStore();
            store.tasks = [mockTask];

            const result = await store.toggleTaskCompletion('123', true);

            expect(result.isCompleted).toBe(true);
            expect(store.tasks[0].isCompleted).toBe(true);
            expect(vi.mocked(toast.success)).toHaveBeenCalled();
        });

        it('marks task as incomplete', async () => {
            const incompleteTask = { ...mockTask, isCompleted: false, completedAt: undefined };
            vi.mocked(taskApi.toggleTaskCompletion).mockResolvedValueOnce(incompleteTask);

            const store = useTaskStore();
            store.tasks = [{ ...mockTask, isCompleted: true }];

            await store.toggleTaskCompletion('123', false);

            expect(store.tasks[0].isCompleted).toBe(false);
        });

        it('handles toggle error', async () => {
            const error = new Error('Toggle failed');
            vi.mocked(taskApi.toggleTaskCompletion).mockRejectedValueOnce(error);

            const store = useTaskStore();

            await expect(store.toggleTaskCompletion('123', true)).rejects.toThrow();
            expect(vi.mocked(toast.error)).toHaveBeenCalled();
        });
    });

    describe('getTaskById', () => {
        it('fetches a task by id', async () => {
            vi.mocked(taskApi.getTaskById).mockResolvedValueOnce(mockTask);

            const store = useTaskStore();
            const result = await store.getTaskById('123');

            expect(result).toEqual(mockTask);
            expect(vi.mocked(taskApi.getTaskById)).toHaveBeenCalledWith('123');
        });

        it('sets loading state during fetch', async () => {
            vi.mocked(taskApi.getTaskById).mockImplementationOnce(async () => {
                const store = useTaskStore();
                expect(store.loading).toBe(true);
                return mockTask;
            });

            const store = useTaskStore();
            await store.getTaskById('123');

            expect(store.loading).toBe(false);
        });

        it('handles fetch error', async () => {
            const error = new Error('Fetch failed');
            vi.mocked(taskApi.getTaskById).mockRejectedValueOnce(error);

            const store = useTaskStore();

            await expect(store.getTaskById('123')).rejects.toThrow();
            expect(vi.mocked(toast.error)).toHaveBeenCalled();
        });
    });

    describe('deleteCompletedTasks', () => {
        it('deletes all completed tasks', async () => {
            vi.mocked(taskApi.deleteCompletedTasks).mockResolvedValueOnce(undefined);
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            store.tasks = [
                mockTask,
                { ...mockTask, id: '124', isCompleted: true }
            ];

            await store.deleteCompletedTasks();

            expect(vi.mocked(taskApi.deleteCompletedTasks)).toHaveBeenCalled();
            expect(vi.mocked(toast.success)).toHaveBeenCalled();
        });

        it('shows info toast when no completed tasks', async () => {
            const store = useTaskStore();
            store.tasks = [mockTask];

            await store.deleteCompletedTasks();

            expect(vi.mocked(toast.info)).toHaveBeenCalled();
            expect(vi.mocked(taskApi.deleteCompletedTasks)).not.toHaveBeenCalled();
        });

        it('handles delete error', async () => {
            const error = new Error('Delete failed');
            vi.mocked(taskApi.deleteCompletedTasks).mockRejectedValueOnce(error);

            const store = useTaskStore();
            store.tasks = [{ ...mockTask, isCompleted: true }];

            await expect(store.deleteCompletedTasks()).rejects.toThrow();
            expect(vi.mocked(toast.error)).toHaveBeenCalled();
        });
    });

    describe('resetFilters', () => {
        it('resets all filters to default', async () => {
            vi.mocked(taskApi.fetchFilteredTasks).mockResolvedValueOnce(mockPaginatedResult as any);

            const store = useTaskStore();
            store.currentPage = 5;
            store.activeFilter = 'completed';
            store.searchQuery = 'test';
            store.filterStartDate = '2024-01-01';
            store.filterEndDate = '2024-01-31';

            await store.resetFilters();

            expect(store.currentPage).toBe(1);
            expect(store.activeFilter).toBe('all');
            expect(store.searchQuery).toBe('');
            expect(store.filterStartDate).toBeNull();
            expect(store.filterEndDate).toBeNull();
        });
    });

    describe('computed properties', () => {
        it('filteredTasks returns all tasks', () => {
            const store = useTaskStore();
            store.tasks = [mockTask, { ...mockTask, id: '124' }];

            expect(store.filteredTasks).toEqual(store.tasks);
        });

        it('paginationInfo has correct values', () => {
            const store = useTaskStore();
            store.currentPage = 2;
            store.pageSize = 20;
            store.totalCount = 100;
            store.totalPages = 5;

            const info = store.paginationInfo;
            expect(info.currentPage).toBe(2);
            expect(info.pageSize).toBe(20);
            expect(info.totalCount).toBe(100);
            expect(info.totalPages).toBe(5);
            expect(info.hasNextPage).toBe(true);
            expect(info.hasPreviousPage).toBe(true);
        });

        it('paginationInfo reflects no next page on last page', () => {
            const store = useTaskStore();
            store.currentPage = 5;
            store.totalPages = 5;

            expect(store.paginationInfo.hasNextPage).toBe(false);
        });
    });
});