using Microsoft.AspNetCore.Mvc;
using Wybod.TaskTest.Data.Models;
using Wybod.TaskTest.DTOs;
using Wybod.TaskTest.Services;

namespace Wybod.TaskTest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly TaskService _service;

    public TasksController(TaskService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<IEnumerable<TaskItem>> GetTasks()
    {
        var tasks = _service.GetAllTasks();
        return Ok(tasks);
    }

    [HttpGet("paginated")]
    public ActionResult<PaginatedResult<TaskItem>> GetTasksPaginated(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = _service.GetTasksPaginated(pageNumber, pageSize);
        return Ok(result);
    }

    [HttpGet("filtered")]
    public ActionResult<PaginatedResult<TaskItem>> GetTasksFiltered(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? isCompleted = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var result = _service.GetTasksFiltered(pageNumber, pageSize, isCompleted, startDate, endDate);
        return Ok(result);
    }

    [HttpGet("search")]
    public ActionResult<IEnumerable<TaskItem>> SearchTasks([FromQuery] string query)
    {
        try
        {
            var results = _service.SearchTasks(query);
            return Ok(results);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id:guid}")]
    public ActionResult<TaskItem> GetTask(Guid id)
    {
        var task = _service.GetTaskById(id);
        if (task == null)
            return NotFound($"Task with ID {id} not found");

        return Ok(task);
    }

    [HttpPost]
    public ActionResult<TaskItem> CreateTask(TaskItem task)
    {
        try
        {
            var createdTask = _service.CreateTask(task);
            return CreatedAtAction(nameof(GetTask), new { id = createdTask.Id }, createdTask);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public ActionResult<TaskItem> UpdateTask(Guid id, TaskItem task)
    {
        try
        {
            var updated = _service.UpdateTask(id, task);
            if (updated == null)
                return NotFound($"Task with ID {id} not found");

            return Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public IActionResult DeleteTask(Guid id)
    {
        var deleted = _service.DeleteTask(id);
        if (!deleted)
            return NotFound($"Task with ID {id} not found");

        return NoContent();
    }

    [HttpDelete("completed")]
    public IActionResult DeleteCompleted()
    {
        var result = _service.DeleteCompleted();
        if (!result)
            return NotFound("No completed tasks found");

        return Ok(new { message = "All completed tasks have been deleted" });
    }
}