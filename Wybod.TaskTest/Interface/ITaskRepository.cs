using Wybod.TaskTest.Data.Models;
using Wybod.TaskTest.DTOs;

public interface ITaskRepository
{
    IEnumerable<TaskItem> GetAll();
    TaskItem? GetById(Guid id);
    PaginatedResult<TaskItem> GetAllPaginated(int pageNumber = 1, int pageSize = 10);
    PaginatedResult<TaskItem> GetFiltered(
        int pageNumber = 1, 
        int pageSize = 10, 
        bool? isCompleted = null, 
        DateTime? startDate = null, 
        DateTime? endDate = null);
    IEnumerable<TaskItem> Search(string searchTerm);
    TaskItem Create(TaskItem task);
    bool Update(Guid id, TaskItem task);
    bool Delete(Guid id);
    bool DeleteCompleted();
}
