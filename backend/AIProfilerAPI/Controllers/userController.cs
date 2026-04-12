using AIProfilerAPI.Models;
using AIProfilerAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace AIProfilerAPI.Controllers
{ [ApiController]
    [Route("api/user")]
   
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // Register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (user == null || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Email and Password are required");
            }

            // Check if user already exists
            var existingUser = await _userRepository.GetUserByEmailAsync(user.Email);
            if (existingUser != null)
            {
                return BadRequest("User with this email already exists");
            }

            // Create new user (in production, hash the password)
            var newUser = await _userRepository.CreateUserAsync(user);

            return Ok(new { message = "User registered successfully", userId = newUser.Id });
        }

        // Login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User user)
        {
            Console.WriteLine($"Login attempt: Email={user?.Email}");
            if (user == null || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Email and Password are required");
            }

            // Find user by email
            var dbUser = await _userRepository.GetUserByEmailAsync(user.Email);
            if (dbUser == null || dbUser.Password != user.Password)
            {
                Console.WriteLine($"Login failed: Email={user?.Email}");
                return Unauthorized("Invalid email or password");
            }

            return Ok(new { message = "Login successful", userId = dbUser.Id, email = dbUser.Email, name = dbUser.Name });
        }

        // Update User
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User user)
        {
            // Get existing user from database
            var dbUser = await _userRepository.GetUserByIdAsync(id);
            if (dbUser == null)
            {
                return NotFound("User not found");
            }

            // Update user properties
            dbUser.Name = user.Name ?? dbUser.Name;
            if (!string.IsNullOrEmpty(user.Password))
            {
                dbUser.Password = user.Password;
            }

            // Save to database
            await _userRepository.UpdateUserAsync(dbUser);

            Console.WriteLine($"Updated user: Id={dbUser.Id}, Name={dbUser.Name}, Email={dbUser.Email}");

            return Ok(new { message = "User updated successfully", user = dbUser });
        }

        // Get user profile by ID
        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var user = await _userRepository.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(new { userId = user.Id, email = user.Email, name = user.Name });
        }

        // Delete user
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _userRepository.DeleteUserAsync(id);
            if (!result)
            {
                return NotFound("User not found");
            }

            return Ok(new { message = "User deleted successfully" });
        }

        // Get all users (for testing/debugging)
        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsersAsync();
            return Ok(users);
        }
    }
}