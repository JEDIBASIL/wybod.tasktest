using Wybod.TaskTest.Data.Models;
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
        // TODO: Implement
        throw new NotImplementedException();
    }

    public TaskItem Create(TaskItem task)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public bool Update(Guid  id, TaskItem task)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    public bool Delete(Guid id)
    {
        // TODO: Implement
        return false;
    }
}