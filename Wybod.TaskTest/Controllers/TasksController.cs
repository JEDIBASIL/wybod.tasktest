using Microsoft.AspNetCore.Mvc;
using Wybod.TaskTest.Data.Models;
namespace Wybod.TaskTest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskRepository _repository;

    public TasksController(ITaskRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public ActionResult<IEnumerable<TaskItem>> GetTasks()
    {
        return Ok(_repository.GetAll());
    }

    [HttpGet("{id:guid}")]
    public ActionResult<TaskItem> GetTask(Guid id)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    [HttpPost]
    public ActionResult<TaskItem> CreateTask(TaskItem task)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    [HttpPut("{id:guid}")]
    public IActionResult UpdateTask(Guid id, TaskItem task)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }

    [HttpDelete("{id:guid}")]
    public IActionResult DeleteTask(Guid id)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}
