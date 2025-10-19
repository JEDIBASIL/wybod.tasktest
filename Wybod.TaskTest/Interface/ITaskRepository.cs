using Wybod.TaskTest.Data.Models;

public interface ITaskRepository
{
    IEnumerable<TaskItem> GetAll();
    TaskItem? GetById(Guid id);
    TaskItem Create(TaskItem task);
    bool Update(Guid id, TaskItem task);
    bool Delete(Guid id);
}
