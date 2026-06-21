using AIProfilerAPI.Controllers;
using AIProfilerAPI.Models;
using AIProfilerAPI.Repositories;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace AIProfilerAPI.Tests.Controllers
{
    public class UserControllerTests
    {
        private readonly Mock<IUserRepository> _mockUserRepo;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _mockUserRepo = new Mock<IUserRepository>();
            _controller = new UserController(_mockUserRepo.Object);
        }

        // ────────────────────────────────────────────
        // REGISTER
        // ────────────────────────────────────────────

        [Fact]
        public async Task Register_ValidUser_ReturnsOkWithUserIdAndRole()
        {
            // Arrange
            var user = new User
            {
                Email = "test@example.com",
                Password = "Pass123",
                Name = "Test User",
                Role = "User"
            };

            _mockUserRepo
                .Setup(r => r.GetUserByEmailAsync(user.Email))
                .ReturnsAsync((User?)null);

            _mockUserRepo
                .Setup(r => r.CreateUserAsync(It.IsAny<User>()))
                .ReturnsAsync(new User { Id = 1, Email = user.Email, Name = user.Name, Role = "User" });

            // Act
            var result = await _controller.Register(user);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            var value = okResult.Value;
            var messageProperty = value.GetType().GetProperty("message");
            Assert.Equal("User registered successfully", messageProperty?.GetValue(value)?.ToString());
        }

        [Fact]
        public async Task Register_NullEmailOrPassword_ReturnsBadRequest()
        {
            // Arrange — missing email
            var user = new User { Email = "", Password = "Pass123" };

            // Act
            var result = await _controller.Register(user);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Email and Password are required", badRequest.Value);
        }

        [Fact]
        public async Task Register_NullPassword_ReturnsBadRequest()
        {
            // Arrange — missing password
            var user = new User { Email = "test@example.com", Password = "" };

            // Act
            var result = await _controller.Register(user);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("Email and Password are required", badRequest.Value);
        }

        [Fact]
        public async Task Register_DuplicateEmail_ReturnsBadRequest()
        {
            // Arrange
            var user = new User { Email = "dup@example.com", Password = "Pass123" };

            _mockUserRepo
                .Setup(r => r.GetUserByEmailAsync(user.Email))
                .ReturnsAsync(new User { Id = 99, Email = user.Email });

            // Act
            var result = await _controller.Register(user);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("User with this email already exists", badRequest.Value);
        }

        // ────────────────────────────────────────────
        // LOGIN
        // ────────────────────────────────────────────

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkWithUserInfo()
        {
            // Arrange
            var dbUser = new User
            {
                Id = 1,
                Email = "test@example.com",
                Password = "Pass123",
                Name = "Test User",
                Role = "User"
            };

            _mockUserRepo
                .Setup(r => r.GetUserByEmailAsync("test@example.com"))
                .ReturnsAsync(dbUser);

            var loginRequest = new User { Email = "test@example.com", Password = "Pass123" };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            var value = okResult.Value;
            Assert.Equal("Login successful", value.GetType().GetProperty("message")?.GetValue(value)?.ToString());
            Assert.Equal(1, (int?)value.GetType().GetProperty("userId")?.GetValue(value));
        }

        [Fact]
        public async Task Login_InvalidPassword_ReturnsUnauthorized()
        {
            // Arrange
            var dbUser = new User { Id = 1, Email = "test@example.com", Password = "CorrectPassword" };

            _mockUserRepo
                .Setup(r => r.GetUserByEmailAsync("test@example.com"))
                .ReturnsAsync(dbUser);

            var loginRequest = new User { Email = "test@example.com", Password = "WrongPassword" };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid email or password", unauthorized.Value);
        }

        [Fact]
        public async Task Login_NonExistentUser_ReturnsUnauthorized()
        {
            // Arrange
            _mockUserRepo
                .Setup(r => r.GetUserByEmailAsync("nobody@example.com"))
                .ReturnsAsync((User?)null);

            var loginRequest = new User { Email = "nobody@example.com", Password = "Pass123" };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal("Invalid email or password", unauthorized.Value);
        }

        [Fact]
        public async Task Login_NullBody_ReturnsBadRequest()
        {
            // Arrange
            var loginRequest = new User { Email = "", Password = "" };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // ────────────────────────────────────────────
        // UPDATE USER
        // ────────────────────────────────────────────

        [Fact]
        public async Task UpdateUser_ExistingUser_ReturnsOk()
        {
            // Arrange
            var dbUser = new User { Id = 1, Email = "test@example.com", Name = "Old Name", Password = "OldPass" };

            _mockUserRepo.Setup(r => r.GetUserByIdAsync(1)).ReturnsAsync(dbUser);
            _mockUserRepo.Setup(r => r.UpdateUserAsync(It.IsAny<User>())).ReturnsAsync(dbUser);

            var updatePayload = new User { Name = "New Name", Password = "NewPass" };

            // Act
            var result = await _controller.UpdateUser(1, updatePayload);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            var value = okResult.Value;
            Assert.Equal("User updated successfully", value.GetType().GetProperty("message")?.GetValue(value)?.ToString());
        }

        [Fact]
        public async Task UpdateUser_NonExistentUser_ReturnsNotFound()
        {
            // Arrange
            _mockUserRepo.Setup(r => r.GetUserByIdAsync(999)).ReturnsAsync((User?)null);

            // Act
            var result = await _controller.UpdateUser(999, new User { Name = "X" });

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("User not found", notFound.Value);
        }

        // ────────────────────────────────────────────
        // GET PROFILE
        // ────────────────────────────────────────────

        [Fact]
        public async Task GetProfile_ExistingUser_ReturnsOkWithUserData()
        {
            // Arrange
            var dbUser = new User { Id = 5, Email = "user5@example.com", Name = "User Five" };
            _mockUserRepo.Setup(r => r.GetUserByIdAsync(5)).ReturnsAsync(dbUser);

            // Act
            var result = await _controller.GetProfile(5);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value!;
            Assert.Equal(5, (int?)value.GetType().GetProperty("userId")?.GetValue(value));
            Assert.Equal("user5@example.com", value.GetType().GetProperty("email")?.GetValue(value)?.ToString());
            Assert.Equal("User Five", value.GetType().GetProperty("name")?.GetValue(value)?.ToString());
        }

        [Fact]
        public async Task GetProfile_NonExistentUser_ReturnsNotFound()
        {
            // Arrange
            _mockUserRepo.Setup(r => r.GetUserByIdAsync(404)).ReturnsAsync((User?)null);

            // Act
            var result = await _controller.GetProfile(404);

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("User not found", notFound.Value);
        }

        // ────────────────────────────────────────────
        // DELETE USER
        // ────────────────────────────────────────────

        [Fact]
        public async Task DeleteUser_ExistingUser_ReturnsOk()
        {
            // Arrange
            _mockUserRepo.Setup(r => r.DeleteUserAsync(1)).ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteUser(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value!;
            Assert.Equal("User deleted successfully", value.GetType().GetProperty("message")?.GetValue(value)?.ToString());
        }

        [Fact]
        public async Task DeleteUser_NonExistentUser_ReturnsNotFound()
        {
            // Arrange
            _mockUserRepo.Setup(r => r.DeleteUserAsync(999)).ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteUser(999);

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("User not found", notFound.Value);
        }

        // ────────────────────────────────────────────
        // GET ALL USERS
        // ────────────────────────────────────────────

        [Fact]
        public async Task GetAllUsers_ReturnsOkWithList()
        {
            // Arrange
            var users = new List<User>
            {
                new User { Id = 1, Email = "a@test.com", Name = "A" },
                new User { Id = 2, Email = "b@test.com", Name = "B" }
            };

            _mockUserRepo.Setup(r => r.GetAllUsersAsync()).ReturnsAsync(users);

            // Act
            var result = await _controller.GetAllUsers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedUsers = Assert.IsAssignableFrom<IEnumerable<User>>(okResult.Value);
            Assert.Equal(2, returnedUsers.Count());
        }
    }
}
