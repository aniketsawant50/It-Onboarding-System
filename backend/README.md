# IT Onboarding System - Backend

A Spring Boot REST API for the IT Onboarding System with role-based access control, JWT authentication, and MySQL database integration.

## Technology Stack

- **Framework**: Spring Boot 3.3.11
- **Language**: Java 17
- **Database**: MySQL 8.0
- **ORM**: Hibernate (Spring Data JPA)
- **Authentication**: JWT (JJWT 0.12.6)
- **Security**: Spring Security
- **Build Tool**: Maven 3.9.9

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/onboarding/
│   │   │   ├── config/              # Spring configuration beans
│   │   │   ├── controller/          # REST API endpoints
│   │   │   ├── service/             # Business logic layer
│   │   │   ├── repository/          # Data access layer (JPA repositories)
│   │   │   ├── entity/              # JPA entity classes
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── security/            # JWT & authentication components
│   │   │   ├── exception/           # Custom exceptions
│   │   │   ├── common/              # Utilities, constants, enums
│   │   │   └── Application.java     # Main entry point
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── db/migration/        # Database migration scripts
│   └── test/
│       ├── java/com/onboarding/     # Unit & integration tests
│       └── resources/
├── pom.xml                          # Maven configuration
└── README.md
```

## Architecture Pattern

This project follows the **Layered Architecture** pattern:

1. **Controller Layer**: REST endpoints - handles HTTP requests/responses
2. **Service Layer**: Business logic - core application functionality
3. **Repository Layer**: Data access - JPA repositories for database operations
4. **Entity Layer**: Domain models - JPA entities mapped to database tables
5. **DTO Layer**: Transfer objects - for request/response serialization
6. **Security Layer**: Authentication & authorization - JWT tokens, role-based access

## Setup & Running

### Prerequisites
- Java 17+
- Maven 3.9+
- MySQL 8.0
- Maven Wrapper (`mvnw` / `mvnw.cmd`) - included in project

### Environment Configuration

1. **Development**:
   ```bash
   mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
   ```

2. **Production**:
   Create `application-prod.properties` in `src/main/resources/`

### Build

```bash
# Clean and compile
mvnw clean compile

# Run tests
mvnw clean test

# Build JAR
mvnw clean package

# Run application
mvnw spring-boot:run
```

### Database Setup

Update `application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/onboarding_db
spring.datasource.username=root
spring.datasource.password=your_password
```

## Key Features

- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, HR, Manager, Employee)
- ✅ Employee management
- ✅ Task assignment & tracking
- ✅ Asset allocation
- ✅ Training management

## API Documentation

API endpoints are available at `http://localhost:8084` with the following structure:

- `POST /api/auth/login` - User authentication
- `GET /api/users` - List users (requires authentication)
- `POST /api/employees` - Create employee (Admin only)
- Additional endpoints per feature documentation

## Testing

```bash
mvnw test
```

## Deployment

See project root README for full deployment instructions.

## Configuration

Update `src/main/resources/application.properties` with your database and JWT settings:

```properties
# MySQL Database
spring.datasource.url=jdbc:mysql://localhost:3306/onboarding_db
spring.datasource.username=root
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000
```

## Default Super Admin Credentials

Use these credentials to login as Super Admin after the database is initialized:

```
Username: superadmin
Password: Pass@123
```

**⚠️ IMPORTANT**: Change these credentials immediately after first login for security purposes.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/users/me` - Get current authenticated user

### User Management
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user details
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/{id}/profile` - Get user profile
- `PUT /api/users/{id}/profile` - Update user profile

### Task Management
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Asset Management
- `GET /api/assets` - List all assets
- `POST /api/assets` - Allocate asset
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Deallocate asset

### Training Management
- `GET /api/training` - List training modules
- `POST /api/training` - Assign training
- `PUT /api/training/{id}` - Update training

## Build for Production

```bash
mvn clean package
```

Output JAR: `target/it-onboarding-system-0.0.1-SNAPSHOT.jar`

Run the JAR:
```bash
java -jar target/it-onboarding-system-0.0.1-SNAPSHOT.jar
```

## Project Structure

```
src/main/java/com/onboarding/
├── controller/       # REST API endpoints
├── service/          # Business logic layer
├── entity/           # JPA entities (User, Task, Asset, Training)
├── repository/       # Database access layer
├── security/         # JWT and Spring Security config
└── Exception/        # Custom exceptions
```

## Database

- Automatically creates schema on startup using Hibernate `ddl-auto=update`
- Initializes with default super admin user (username: `superadmin`, password: `PAss@123`)

## Security

- All endpoints require JWT authentication (except `/api/auth/login`)
- Passwords are encrypted using BCrypt
- JWT tokens expire after 24 hours (configurable)
- All API responses use CORS-enabled configuration for frontend access

## Troubleshooting

**Connection refused on port 8084:**
- Verify backend is running: `mvn spring-boot:run`
- Check if port 8084 is already in use

**Database connection error:**
- Ensure MySQL is running
- Check `application.properties` credentials
- Verify database exists: `CREATE DATABASE onboarding_db;`

**Login fails:**
- Make sure database is initialized (check for `user` table)
- Verify super admin user exists in database
- Check JWT secret configuration

## Notes

- Frontend communicates with this API on `http://localhost:8084`
- All requests must include JWT token in `Authorization: Bearer <token>` header (except login)
- Database schema is auto-generated on first run
