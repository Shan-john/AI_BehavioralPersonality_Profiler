# AI Behavioral Personality Profiler - Backend API

This backend application handles API requests for the Behavioral Personality Profiler. It is built using **ASP.NET Core (C#)** and uses **Entity Framework Core (EF Core)** to read and write User Data to a **MySQL** database.

---

## The Flow of User Data (Storing & Retrieving)

The API uses a standard multi-layer architecture, known as the **Repository Pattern**. This pattern keeps code clean by separating concerns.

Here is the exact step-by-step flow of how user data is processed:

### 1. Storing User Data (e.g., Registering a User)
1. **The Request:** The client app (frontend, Postman, etc.) sends an HTTP `POST` request with a JSON payload containing the user's details (Name, Email, Password) to the `/api/user/register` endpoint on the `UserController`.
2. **The Controller:** `UserController` receives this data and performs basic validation.
3. **The Repository:** The Controller passes the validated data to the `UserRepository` (by calling `CreateUserAsync`). 
4. **The Database Context:** `UserRepository` takes the C# `User` object and adds it to the EF Core `AppDbContext`. It then calls `_context.SaveChangesAsync()`.
5. **The Storage:** Entity Framework Core translates the C# object into a raw MySQL `INSERT` statement and executes it against the local MySQL Database (`AIProfilerDB`), securely persisting the record into the `Users` table.

### 2. Retrieving User Data (e.g., Getting Profile / Logging In)
1. **The Request:** The client sends an HTTP `POST` to `/api/user/login` with an email and password.
2. **The Controller:** `UserController` receives the credentials.
3. **The Repository:** The Controller calls `_userRepository.GetUserByEmailAsync(user.Email)`.
4. **The Database Context:** The `UserRepository` queries `_context.Users.FirstOrDefaultAsync()`. Entity Framework Core translates this into a high-performance MySQL `SELECT` statement and fetches the specific user.
5. **The Return:** The MySQL row is returned as a C# `User` object. The `UserController` checks if the password matches, and if so, responds to the client with a successful `200 OK` JSON response containing the generated JWT token. 

---

## Why Do We Use "Migrations"?

In Entity Framework Core, we use **Migrations** to keep the database's tables perfectly synchronized with our C# `Model` classes.

### The Purpose of Migrations:
1. **Schema Generation:** When you first start building your app, the MySQL database doesn't have a table for `Users`. Instead of manually writing `CREATE TABLE Users (...)` in SQL, EF Core looks at your `User.cs` and `AppDbContext.cs` files, figures out the columns, and generates the layout for you through a Migration.
2. **Iterative Changes Without Data Loss:** As your application grows, you might want to add a new `PhoneNumber` or `Age` property to the `User.cs` class. Without migrations, you would have to delete the entire table and recreate it, losing all previously registered users. With migrations, you run `dotnet ef migrations add AddUserPhoneNumber`, and EF Core creates an intelligent script that precisely ALTERS the MySQL table to add just the new column layer by layer, preserving the existing data.
3. **Version Control for your Database:** Migrations sit neatly alongside your source code in the `Migrations` folder. This means if another developer clones your project, they can just run `dotnet ef database update` to construct their own identical MySQL schema matching the exact point-in-time state of the codebase.

### Are Migrations Written by Developers?
**Generally, no.** Developers do not write migrations entirely from scratch manually. Instead, Entity Framework Core **auto-generates** them.

When a developer changes a C# model class (for example, adding an `Age` property to `User.cs`), they simply run a terminal command:
```bash
dotnet ef migrations add AddUserAge
```

Entity Framework Core automatically analyzes the difference between your C# code and the existing database structure. It then creates a new `.cs` migration file in your `Migrations` folder that contains the exact instructions needed to upgrade (or downgrade) the MySQL table. 

The developer's job is simply to review this freely generated template file to ensure it looks correct, and then apply it to the specific database using the command:
```bash
dotnet ef database update
```
*(Note: Developers can occasionally manually tweak these auto-generated migration files to handle incredibly specific edge-case schema modifications or data seeding, but EF Core does 99% of the heavy lifting).*
