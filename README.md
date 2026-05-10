# IT Onboarding System

A comprehensive, role-based employee onboarding platform with modern full-stack architecture.

##  Project Overview

This is a **full-stack application** designed to streamline the IT employee onboarding process. The system supports multiple user roles (Admin, HR, Manager, Employee) and provides dedicated dashboards, task management, asset allocation, and training tracking.

### Architecture Model: Multi-Repo Structure 

This project follows a **logical multi-repo structure** where frontend and backend are organized as separate, independently deployable projects within a single repository:

```
IT-Onboarding-System/
├── backend/                    # Independent backend service
│   ├── src/
│   ├── pom.xml
│   └── [Backend has its own build, dependencies, README]
│
├── frontend/                   # Independent frontend service
│   ├── src/
│   ├── package.json
│   └── [Frontend has its own build, dependencies, README]
│
├── tools/                      # Shared utilities & scripts
│   ├── QueryOnboardingUsers.java
│   └── ResetOnboardingDatabase.java
│
├── .gitignore                  # Root .gitignore
└── README.md                   # This file
```

**Key Principle**: Each folder (`backend/`, `frontend/`) is designed to be independently deployable. They can easily be split into separate repositories in the future.

---

##  Technology Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Spring Boot | 3.3.11 |
| **Language** | Java | 17 |
| **Build Tool** | Maven | 3.9.9 |
| **Database** | MySQL | 8.0 |
| **ORM** | Hibernate/JPA | (Spring Data) |
| **Authentication** | JWT + Spring Security | JJWT 0.12.6 |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React | 18.3.1 |
| **Build Tool** | Vite | 5.4.18 |
| **Routing** | React Router | 6.30.0 |
| **HTTP Client** | Axios | 1.8.4 |
| **Styling** | CSS Modules & Global CSS | - |

### Infrastructure
- **Runtime**: Java 17+, Node 18+
- **Package Managers**: Maven (Java), NPM (Node)

---

##  Directory Structure Overview

### Backend Folder (`backend/`)
Implements a **layered architecture** with clear separation of concerns:

```
backend/
└── src/main/java/com/onboarding/
    ├── config/           # Spring configurations (Database, Security, etc)
    ├── controller/       # REST API endpoints
    ├── service/          # Business logic layer
    ├── repository/       # JPA repositories (data access)
    ├── entity/           # JPA entity models
    ├── dto/              # Data Transfer Objects (request/response)
    ├── security/         # JWT providers, filters, authentication
    ├── exception/        # Custom exceptions & handlers
    ├── common/           # Utilities, constants, enums
    └── Application.java  # Main application entry point
```

**Architecture Pattern**: **Layered (N-Tier) Architecture**
- Clear separation between web, business, and data layers
- Dependency flow: Controllers → Services → Repositories
- Easier to test, maintain, and scale

For detailed backend setup, see [backend/README.md](backend/README.md)

### Frontend Folder (`frontend/`)
Implements a **modular component-based architecture**:

```
frontend/src/
├── api/               # Axios client + API endpoint definitions
├── components/        # Reusable React components
│   ├── Layout/       # Navbar, Sidebar
│   └── UI/           # Button, Input, Card, Table
├── pages/            # Page-level components (organized by role)
│   ├── Admin/
│   ├── Auth/
│   ├── Employee/
│   ├── HR/
│   └── Manager/
├── layouts/          # Layout wrappers
├── routes/           # Route definitions & protection
├── context/          # React Context API (global state)
├── hooks/            # Custom React hooks
├── constants/        # App constants & role enums
├── utils/            # Formatters, validators, helpers
├── styles/           # Global CSS
└── assets/           # Images, icons, fonts
```

For detailed frontend setup, see [frontend/README.md](frontend/README.md)

### Tools Folder (`tools/`)
Contains utility scripts:
- `QueryOnboardingUsers.java` - Database query utility
- `ResetOnboardingDatabase.java` - Database reset tool

---

##  Quick Start

### Prerequisites
- **Java 17+** (for backend)
- **Node.js 18+** (for frontend)
- **Maven 3.9+** (included as wrapper: `mvnw` / `mvnw.cmd`)
- **MySQL 8.0** running locally or remotely

### 1. Backend Setup

```bash
cd backend

# Install dependencies (Maven)
mvnw clean install

# Configure database
# Update src/main/resources/application.properties with your MySQL credentials

# Run backend
mvnw spring-boot:run

# Backend runs on: http://localhost:8080
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env from template
cp .env.example .env

# Update .env with backend API URL (if needed)
# VITE_API_BASE_URL=http://localhost:8080/api

# Start development server
npm run dev

# Frontend runs on: http://localhost:5173
```

---

##  Authentication & Authorization

### JWT Token Flow

```
1. User submits credentials → POST /api/auth/login
2. Backend validates & returns JWT token
3. Frontend stores token in localStorage/context
4. Subsequent requests include token: Authorization: Bearer <token>
5. Backend validates token before processing request
```

### Role-Based Access Control

| Role | Permissions |
|------|------------|
| **Admin** | All system operations, user management, role management, reports |
| **HR** | Employee management, task assignment, onboarding workflows |
| **Manager** | Team management, task approval, performance tracking |
| **Employee** | Self-service tasks, profile management, personal development |

---

##  Building for Production

### Backend

```bash
cd backend

# Clean build
mvnw clean package

# Output: backend/target/it-onboarding-system-0.0.1-SNAPSHOT.jar
# Run with: java -jar target/it-onboarding-system-0.0.1-SNAPSHOT.jar
```

### Frontend

```bash
cd frontend

# Build for production
npm run build

# Output: frontend/dist/
# Deploy to any static file server (Nginx, Apache, S3, Vercel, Netlify, etc.)
```

---

##  Testing

### Backend Tests

```bash
cd backend
mvnw test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

##  Project Structure Best Practices

This project follows industry best practices:

###  Backend Best Practices
- **Layered Architecture**: Separation of concerns (controller, service, repository layers)
- **DTOs**: Data Transfer Objects for request/response
- **Exception Handling**: Custom exceptions and error handling
- **Configuration**: Environment-specific configs (dev, prod)
- **Database Migrations**: Version control for schema changes (migrations folder)
- **Testing**: Unit and integration tests for business logic

###  Frontend Best Practices
- **Component Organization**: Components grouped by type (Layout, UI, Pages)
- **API Abstraction**: Centralized API client with axios
- **State Management**: React Context API for auth state
- **Code Reusability**: Hooks, utilities, constants
- **Routing**: Protected routes for role-based access
- **Environment Config**: .env files for configuration
- **Single Responsibility**: Each component has a clear purpose

---

##  Development Workflow

1. **Branch Naming**: `feature/<feature-name>`, `bugfix/<bug-name>`, `hotfix/<issue-name>`
2. **Commit Messages**: Clear, descriptive messages
3. **Pull Requests**: Code review before merge to main
4. **Testing**: Write tests for new features
5. **Documentation**: Update README and inline comments

---

##  API Documentation

### Authentication Endpoint
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "123",
  "role": "EMPLOYEE"
}
```

### User Management
```http
GET /api/users              # List all users (Admin only)
GET /api/users/:id          # Get user details
POST /api/users             # Create user (Admin only)
PUT /api/users/:id          # Update user
DELETE /api/users/:id       # Delete user (Admin only)
```

For complete API documentation, refer backend README or Swagger UI (if enabled).

---

##  Troubleshooting

### Backend Won't Start
- Ensure MySQL is running: `mysql -u root -p`
- Check `application.properties` database credentials
- Verify Java 17+ is installed: `java -version`

### Frontend Dev Server Won't Start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 18+)
- Ensure port 5173 is not in use

### API Connection Issues
- Verify backend is running on `http://localhost:8080`
- Check `.env` file in frontend has correct `VITE_API_BASE_URL`
- Check browser console for CORS errors

---


---

##  Team

[Add team information here]

---

##  Future Enhancements

- [ ] Add Docker support for containerized deployment
- [ ] Implement OAuth 2.0 for advanced authentication
- [ ] Add email notifications
- [ ] Implement audit logging
- [ ] Add analytics dashboard
- [ ] Mobile app (React Native)

---

##  Support

For issues or questions, please:
1. Check existing documentation
2. Review code comments
3. Create an issue in the repository

---

**Last Updated**: April 2026  
**Status**: Active Development
│
├── backend/                # Spring Boot API (Port 8084)
│   ├── src/main/
│   │   ├── java/
│   │   │   └── com/onboarding/
│   │   │       ├── controller/    # REST endpoints
│   │   │       ├── service/       # Business logic
│   │   │       ├── entity/        # JPA entities
│   │   │       └── repository/    # Data access layer
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/
│   ├── pom.xml
│   └── target/
│
└── tools/                  # Build tools and utilities
    └── apache-maven-3.9.9/ # Maven installation
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Java 17 or higher
- MySQL 8.0
- Maven 3.9.9 (included in `tools/`)

### Setup & Run

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

**Backend Setup:**
```bash
cd backend
mvn spring-boot:run
```
Backend API runs on `http://localhost:8084`

### Database Configuration

Configure database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/onboarding_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### Default Super Admin Credentials

After initial database setup, use the following credentials to login as Super Admin:

```
Username: admin
Password: Admin@123
```

**Note:** Change these credentials immediately after first login for security purposes.

## Features

### User Roles & Permissions

- **Admin**: Full system access, user management, role assignment
- **HR**: Employee onboarding coordination, training management
- **Manager**: Team oversight, task assignment, asset allocation
- **Employee**: Profile management, task tracking, document access

### Core Functionalities

- Secure user authentication with JWT tokens
- Role-based dashboards with pertinent workflows
- Employee onboarding profile management
- Task assignment and tracking
- Asset management and allocation
- Training module tracking
- Real-time data updates from backend API

### UI/UX Highlights

- Modern, responsive login interface with password visibility toggle
- Caps Lock detection and visual feedback
- Real-time form validation with success/error states
- Remember me functionality with localStorage
- Accessible design with ARIA labels and semantic HTML
- Mobile-responsive across all screen sizes
- Optional dark mode support

## API Endpoints

**Authentication:**
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Current user profile

**User Management:**
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

**Employee Onboarding:**
- `GET /api/users/{id}/profile` - Get employee profile
- `PUT /api/users/{id}/profile` - Update profile

**Task Management:**
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task

**Asset Management:**
- `GET /api/assets` - List assets
- `POST /api/assets` - Allocate asset
- `PUT /api/assets/{id}` - Update asset

**Training:**
- `GET /api/training` - List training modules
- `POST /api/training` - Assign training

## Development Notes

- The frontend uses React Context API for authentication state management
- All API requests include JWT token in Authorization header
- Forms include real-time validation and accessible error messages
- The system auto-generates database schema on startup
- All endpoints are secured with Spring Security

## Build & Deployment

**Frontend Build:**
```bash
cd frontend
npm run build
```
Output: `frontend/dist/` folder ready for deployment

**Backend Build:**
```bash
cd backend
mvn clean package
```
Output: `backend/target/it-onboarding-system-*.jar`

## Security Considerations

- JWT tokens expire and require re-authentication
- Passwords are hashed using BCrypt
- CORS is configured for development (update for production)
- All credentials should be managed via environment variables in production
- Database passwords should never be committed to version control

## Troubleshooting

**Frontend won't start:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Backend connection issues:**
- Ensure MySQL service is running
- Check `application.properties` database credentials
- Verify ports 8084 (backend) and 5173 (frontend) are not in use

**Build failures:**
- Clean build: `mvn clean install`
- Check Maven version: `mvn -version`
- Verify Java version: `java -version`

## License

This project is provided as-is for internal use.
