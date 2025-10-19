using System.Text.Json;
using Wybod.TaskTest.Data.Models;
using Wybod.TaskTest.DTOs;

namespace Wybod.TaskTest.Data.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly IDataContext _dataContext;

    public TaskRepository(IDataContext dataContext)
    {
        _dataContext = dataContext;
    }

    public IEnumerable<TaskItem> GetAll()
    {
        return _dataContext.Tasks;
    }

    public TaskItem? GetById(Guid id)
    {
        return _dataContext.Tasks.FirstOrDefault(t => t.Id == id);
    }

    public PaginatedResult<TaskItem> GetAllPaginated(int pageNumber = 1, int pageSize = 10)
    {
        var query = _dataContext.Tasks.AsEnumerable();
        return PaginateQuery(query, pageNumber, pageSize);
    }

    public PaginatedResult<TaskItem> GetFiltered(
        int pageNumber = 1,
        int pageSize = 10,
        bool? isCompleted = null,
        DateTime? startDate = null,
        DateTime? endDate = null)
    {
        var query = _dataContext.Tasks.AsEnumerable();

        if (isCompleted.HasValue)
        {
            query = query.Where(t => t.IsCompleted == isCompleted.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(t => t.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(t => t.CreatedAt <= endDate.Value.AddDays(1));
        }

        return PaginateQuery(query, pageNumber, pageSize);
    }

    public IEnumerable<TaskItem> Search(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return Enumerable.Empty<TaskItem>();

        var lowerSearchTerm = searchTerm.ToLower();
        return _dataContext.Tasks.Where(t =>
            t.Title.ToLower().Contains(lowerSearchTerm) ||
            t.Description.ToLower().Contains(lowerSearchTerm)
        );
    }

    public TaskItem Create(TaskItem task)
    {
        task.Id = Guid.NewGuid();
        task.CreatedAt = DateTime.UtcNow;
        _dataContext.Tasks.Add(task);
        // Print all tasks (the new array/list)
        Console.WriteLine("All tasks:");
        Console.WriteLine(JsonSerializer.Serialize(_dataContext.Tasks));
        return task;
    }

    public bool Update(Guid id, TaskItem task)
    {
        var existingTask = GetById(id);
        if (existingTask == null)
            return false;

        existingTask.Title = task.Title;
        existingTask.Description = task.Description;

        if (task.IsCompleted && !existingTask.IsCompleted)
        {
            existingTask.IsCompleted = true;
            existingTask.CompletedAt = DateTime.UtcNow;
        }
        else if (!task.IsCompleted && existingTask.IsCompleted)
        {
            existingTask.IsCompleted = false;
            existingTask.CompletedAt = null;
        }

        return true;
    }

    public bool Delete(Guid id)
    {
        var task = GetById(id);
        
        if (task == null)
            return false;

        _dataContext.Tasks.Remove(task);
        return true;
    }

    public bool DeleteCompleted()
    {
        var completedTasks = _dataContext.Tasks
            .Where(t => t.IsCompleted)
            .ToList();

        if (!completedTasks.Any())
            return false;

        foreach (var task in completedTasks)
        {
            _dataContext.Tasks.Remove(task);
        }

        return true;
    }

    private PaginatedResult<TaskItem> PaginateQuery(
        IEnumerable<TaskItem> query,
        int pageNumber,
        int pageSize)
    {
        var totalCount = query.Count();
        var items = query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PaginatedResult<TaskItem>
        {
            Data = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }
}

