using Wybod.TaskTest.Data.Models;
using Wybod.TaskTest.Data.Repositories;
using Wybod.TaskTest.DTOs;

namespace Wybod.TaskTest.Services;

public class TaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository)
    {
        _repository = repository;
    }

    public IEnumerable<TaskItem> GetAllTasks()
    {
        return _repository.GetAll();
    }

    public PaginatedResult<TaskItem> GetTasksPaginated(int pageNumber = 1, int pageSize = 10)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;

        return _repository.GetAllPaginated(pageNumber, pageSize);
    }

    public PaginatedResult<TaskItem> GetTasksFiltered(
        int pageNumber = 1,
        int pageSize = 10,
        bool? isCompleted = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;

        return _repository.GetFiltered(pageNumber, pageSize, isCompleted, startDate, endDate);
    }

    public IEnumerable<TaskItem> SearchTasks(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            throw new ArgumentException("Search term cannot be empty", nameof(query));

        return _repository.Search(query);
    }

    public TaskItem? GetTaskById(Guid id)
    {
        return _repository.GetById(id);
    }

    public TaskItem CreateTask(TaskItem task)
    {
        if (string.IsNullOrWhiteSpace(task.Title))
            throw new ArgumentException("Title is required", nameof(task.Title));

        return _repository.Create(task);
    }

    public TaskItem? UpdateTask(Guid id, TaskItem task)
    {
        if (string.IsNullOrWhiteSpace(task.Title))
            throw new ArgumentException("Title is required", nameof(task.Title));

        var existing = _repository.GetById(id);
        if (existing == null)
            return null;

        var updated = _repository.Update(id, task);
        return updated ? task : null;
    }

    public bool DeleteTask(Guid id)
    {
        return _repository.Delete(id);
    }

    public bool CompleteTask(Guid id)
    {
        var task = _repository.GetById(id);
        if (task == null)
            return false;

        task.IsCompleted = true;
        task.CompletedAt = DateTime.UtcNow;
        return _repository.Update(id, task);
    }

    public bool DeleteCompleted()
    {
        return _repository.DeleteCompleted();
    }
}
