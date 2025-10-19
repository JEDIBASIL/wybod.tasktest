using Moq;
using Wybod.TaskTest.Data.Models;
using Wybod.TaskTest.DTOs;
using Wybod.TaskTest.Services;

namespace Wybod.TaskTest.Tests.Services;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _mockRepository;
    private readonly TaskService _service;

    public TaskServiceTests()
    {
        _mockRepository = new Mock<ITaskRepository>();
        _service = new TaskService(_mockRepository.Object);
    }

    #region GetAllTasks Tests

    [Fact]
    public void GetAllTasks_ReturnsAllTasks()
    {
        var tasks = new List<TaskItem>
        {
            new TaskItem { Id = Guid.NewGuid(), Title = "Task 1", IsCompleted = false },
            new TaskItem { Id = Guid.NewGuid(), Title = "Task 2", IsCompleted = true }
        };
        _mockRepository.Setup(r => r.GetAll()).Returns(tasks);

        
        var result = _service.GetAllTasks();

        
        Assert.Equal(2, result.Count());
        Assert.Equal(tasks, result);
        _mockRepository.Verify(r => r.GetAll(), Times.Once);
    }

    [Fact]
    public void GetAllTasks_ReturnsEmptyList_WhenNoTasks()
    {
        _mockRepository.Setup(r => r.GetAll()).Returns(new List<TaskItem>());

        
        var result = _service.GetAllTasks();

        
        Assert.Empty(result);
    }

    #endregion

    #region GetTasksPaginated Tests

    [Fact]
    public void GetTasksPaginated_WithValidParameters_ReturnsPaginatedResult()
    {
        var paginatedResult = new PaginatedResult<TaskItem>
        {
            Items = new List<TaskItem> { new TaskItem { Id = Guid.NewGuid(), Title = "Task 1" } },
            TotalCount = 50,
            PageNumber = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetAllPaginated(1, 10)).Returns(paginatedResult);

        
        var result = _service.GetTasksPaginated(1, 10);

        
        Assert.Single(result.Items);
        Assert.Equal(50, result.TotalCount);
        _mockRepository.Verify(r => r.GetAllPaginated(1, 10), Times.Once);
    }

    [Fact]
    public void GetTasksPaginated_WithInvalidPageNumber_CorrectsToPrimary()
    {
        var paginatedResult = new PaginatedResult<TaskItem>
        {
            Items = new List<TaskItem>(),
            TotalCount = 0,
            PageNumber = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetAllPaginated(1, 10)).Returns(paginatedResult);

        
        _service.GetTasksPaginated(-5, 10);

        
        _mockRepository.Verify(r => r.GetAllPaginated(1, 10), Times.Once);
    }

    [Fact]
    public void GetTasksPaginated_WithInvalidPageSize_CorrectsToPrimary()
    {
        var paginatedResult = new PaginatedResult<TaskItem>
        {
            Items = [],
            TotalCount = 0,
            PageNumber = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetAllPaginated(1, 10)).Returns(paginatedResult);

        
        _service.GetTasksPaginated(1, 0);

        
        _mockRepository.Verify(r => r.GetAllPaginated(1, 10), Times.Once);
    }

    #endregion

    #region GetTasksFiltered Tests

    [Fact]
    public void GetTasksFiltered_WithValidFilters_ReturnsFilteredResult()
    {
        var startDate = new DateTime(2024, 1, 1);
        var endDate = new DateTime(2024, 1, 31);
        var paginatedResult = new PaginatedResult<TaskItem>
        {
            Items = new List<TaskItem> { new TaskItem { Id = Guid.NewGuid(), Title = "Completed Task", IsCompleted = true } },
            TotalCount = 5,
            PageNumber = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetFiltered(1, 10, true, startDate, endDate)).Returns(paginatedResult);

        
        var result = _service.GetTasksFiltered(1, 10, true, startDate, endDate);

        
        Assert.Single(result.Items);
        Assert.True(result.Items.First().IsCompleted);
        _mockRepository.Verify(r => r.GetFiltered(1, 10, true, startDate, endDate), Times.Once);
    }

    [Fact]
    public void GetTasksFiltered_WithNullFilters_CallsRepositoryWithNulls()
    {
        var paginatedResult = new PaginatedResult<TaskItem>
        {
            Items = new List<TaskItem>(),
            TotalCount = 0,
            PageNumber = 1,
            PageSize = 10
        };
        _mockRepository.Setup(r => r.GetFiltered(1, 10, null, null, null)).Returns(paginatedResult);

        
        _service.GetTasksFiltered();

        
        _mockRepository.Verify(r => r.GetFiltered(1, 10, null, null, null), Times.Once);
    }

    #endregion

    #region SearchTasks Tests

    [Fact]
    public void SearchTasks_WithValidQuery_ReturnsMatchingTasks()
    {
        var query = "important";
        var tasks = new List<TaskItem>
        {
            new TaskItem { Id = Guid.NewGuid(), Title = "Important Task" }
        };
        _mockRepository.Setup(r => r.Search(query)).Returns(tasks);

        
        var result = _service.SearchTasks(query);

        
        Assert.Single(result);
        _mockRepository.Verify(r => r.Search(query), Times.Once);
    }

    [Fact]
    public void SearchTasks_WithEmptyQuery_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => _service.SearchTasks(""));
    }

    [Fact]
    public void SearchTasks_WithNullQuery_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => _service.SearchTasks(null));
    }

    [Fact]
    public void SearchTasks_WithWhitespaceQuery_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => _service.SearchTasks("   "));
    }

    #endregion

    #region GetTaskById Tests

    [Fact]
    public void GetTaskById_WithValidId_ReturnsTask()
    {
        var id = Guid.NewGuid();
        var task = new TaskItem { Id = id, Title = "Test Task" };
        _mockRepository.Setup(r => r.GetById(id)).Returns(task);

        
        var result = _service.GetTaskById(id);

        
        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
        Assert.Equal("Test Task", result.Title);
    }

    [Fact]
    public void GetTaskById_WithNonExistentId_ReturnsNull()
    {
        var id = Guid.NewGuid();
        _mockRepository.Setup(r => r.GetById(id)).Returns((TaskItem)null);

        
        var result = _service.GetTaskById(id);

        
        Assert.Null(result);
    }

    #endregion

    #region CreateTask Tests

    [Fact]
    public void CreateTask_WithValidTask_CreatesAndReturnsTask()
    {
        var newTask = new TaskItem { Id = Guid.NewGuid(), Title = "New Task" };
        _mockRepository.Setup(r => r.Create(newTask)).Returns(newTask);

        
        var result = _service.CreateTask(newTask);

        
        Assert.NotNull(result);
        Assert.Equal(newTask.Title, result.Title);
        _mockRepository.Verify(r => r.Create(newTask), Times.Once);
    }

    [Fact]
    public void CreateTask_WithEmptyTitle_ThrowsArgumentException()
    {
        var task = new TaskItem { Id = Guid.NewGuid(), Title = "" };

        Assert.Throws<ArgumentException>(() => _service.CreateTask(task));
        _mockRepository.Verify(r => r.Create(It.IsAny<TaskItem>()), Times.Never);
    }

    [Fact]
    public void CreateTask_WithNullTitle_ThrowsArgumentException()
    {
        var task = new TaskItem { Id = Guid.NewGuid(), Title = null };

        Assert.Throws<ArgumentException>(() => _service.CreateTask(task));
    }

    [Fact]
    public void CreateTask_WithWhitespaceTitle_ThrowsArgumentException()
    {
        var task = new TaskItem { Id = Guid.NewGuid(), Title = "   " };

        Assert.Throws<ArgumentException>(() => _service.CreateTask(task));
    }

    #endregion

    #region UpdateTask Tests

    [Fact]
    public void UpdateTask_WithValidData_UpdatesAndReturnsTask()
    {
        var id = Guid.NewGuid();
        var existingTask = new TaskItem { Id = id, Title = "Old Title" };
        var updatedTask = new TaskItem { Id = id, Title = "New Title" };
        
        _mockRepository.Setup(r => r.GetById(id)).Returns(existingTask);
        _mockRepository.Setup(r => r.Update(id, updatedTask)).Returns(true);

        
        var result = _service.UpdateTask(id, updatedTask);

        
        Assert.NotNull(result);
        Assert.Equal(updatedTask.Title, result.Title);
        _mockRepository.Verify(r => r.Update(id, updatedTask), Times.Once);
    }

    [Fact]
    public void UpdateTask_WithNonExistentId_ReturnsNull()
    {
        var id = Guid.NewGuid();
        var task = new TaskItem { Id = id, Title = "New Title" };
        _mockRepository.Setup(r => r.GetById(id)).Returns((TaskItem)null);

        
        var result = _service.UpdateTask(id, task);

        
        Assert.Null(result);
        _mockRepository.Verify(r => r.Update(It.IsAny<Guid>(), It.IsAny<TaskItem>()), Times.Never);
    }

    [Fact]
    public void UpdateTask_WithEmptyTitle_ThrowsArgumentException()
    {
        var id = Guid.NewGuid();
        var task = new TaskItem { Id = id, Title = "" };

        Assert.Throws<ArgumentException>(() => _service.UpdateTask(id, task));
        _mockRepository.Verify(r => r.Update(It.IsAny<Guid>(), It.IsAny<TaskItem>()), Times.Never);
    }

    [Fact]
    public void UpdateTask_WhenRepositoryUpdateFails_ReturnsNull()
    {
        var id = Guid.NewGuid();
        var existingTask = new TaskItem { Id = id, Title = "Old Title" };
        var updatedTask = new TaskItem { Id = id, Title = "New Title" };
        
        _mockRepository.Setup(r => r.GetById(id)).Returns(existingTask);
        _mockRepository.Setup(r => r.Update(id, updatedTask)).Returns(false);

        
        var result = _service.UpdateTask(id, updatedTask);

        
        Assert.Null(result);
    }

    #endregion

    #region DeleteTask Tests

    [Fact]
    public void DeleteTask_WithValidId_DeletesTask()
    {
        var id = Guid.NewGuid();
        _mockRepository.Setup(r => r.Delete(id)).Returns(true);

        
        var result = _service.DeleteTask(id);

        
        Assert.True(result);
        _mockRepository.Verify(r => r.Delete(id), Times.Once);
    }

    [Fact]
    public void DeleteTask_WithNonExistentId_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        _mockRepository.Setup(r => r.Delete(id)).Returns(false);

        
        var result = _service.DeleteTask(id);

        
        Assert.False(result);
    }

    #endregion

    #region CompleteTask Tests

    [Fact]
    public void CompleteTask_WithValidId_MarksTaskAsCompleted()
    {
        var id = Guid.NewGuid();
        var task = new TaskItem { Id = id, Title = "Task", IsCompleted = false, CompletedAt = null };
        _mockRepository.Setup(r => r.GetById(id)).Returns(task);
        _mockRepository.Setup(r => r.Update(id, It.IsAny<TaskItem>())).Returns(true);

        
        var result = _service.CompleteTask(id);

        
        Assert.True(result);
        Assert.True(task.IsCompleted);
        Assert.NotNull(task.CompletedAt);
        _mockRepository.Verify(r => r.Update(id, It.IsAny<TaskItem>()), Times.Once);
    }

    [Fact]
    public void CompleteTask_WithNonExistentId_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        _mockRepository.Setup(r => r.GetById(id)).Returns((TaskItem)null);

        
        var result = _service.CompleteTask(id);

        
        Assert.False(result);
        _mockRepository.Verify(r => r.Update(It.IsAny<Guid>(), It.IsAny<TaskItem>()), Times.Never);
    }

    [Fact]
    public void CompleteTask_WhenUpdateFails_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        var task = new TaskItem { Id = id, Title = "Task", IsCompleted = false };
        _mockRepository.Setup(r => r.GetById(id)).Returns(task);
        _mockRepository.Setup(r => r.Update(id, It.IsAny<TaskItem>())).Returns(false);

        
        var result = _service.CompleteTask(id);

        
        Assert.False(result);
    }

    #endregion

    #region DeleteCompleted Tests

    [Fact]
    public void DeleteCompleted_CallsRepository()
    {
        _mockRepository.Setup(r => r.DeleteCompleted()).Returns(true);

        
        var result = _service.DeleteCompleted();

        
        Assert.True(result);
        _mockRepository.Verify(r => r.DeleteCompleted(), Times.Once);
    }

    [Fact]
    public void DeleteCompleted_WhenNoCompletedTasks_ReturnsFalse()
    {
        _mockRepository.Setup(r => r.DeleteCompleted()).Returns(false);

        
        var result = _service.DeleteCompleted();

        
        Assert.False(result);
    }

    #endregion
}