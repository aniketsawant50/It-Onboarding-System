# IT Onboarding System

A full-stack, role-based employee onboarding platform for managing employee accounts, profile details, IT assets, tasks, training, and onboarding progress.

## Project Structure

```text
IT-Onboarding-System/
|-- backend/       # Spring Boot API
|-- frontend/      # React + Vite app
|-- tools/         # Utility scripts and local Maven distribution
`-- README.md
```

The frontend and backend are separated inside one repository and can be developed or deployed independently.

## Tech Stack

### Backend

- Spring Boot 3.3.11
- Java 17
- Maven
- MySQL 8
- Hibernate/JPA
- Spring Security
- JWT authentication

### Frontend

- React 18
- Vite
- Axios
- React Router
- CSS Modules and global CSS

## Core Features

- JWT login and protected routes
- Role-based authorization for Admin, HR, Manager, and Employee
- Admin dashboard and user management
- HR onboarding workflow and asset approvals
- Manager team tracking and task assignment
- Employee dashboard, profile management, assets, tasks, and training
- Asset assignment tracking with automatic assignment timestamps
- Task tracking with automatic created date and manager-controlled completion date
- Report generation and download support

## Role Summary

| Role | Main Capabilities |
| --- | --- |
| Admin | Create users, manage roles/status, assign assets, view reports |
| HR | Approve/reject assets, manage onboarding stages, assign training |
| Manager | Assign tasks, manage task status and completion dates, track team progress |
| Employee | View assigned tasks/assets/training, update allowed profile fields |

## Backend Layout

```text
backend/src/main/java/com/onboarding/system/
|-- config/        # App configuration and seed data
|-- controller/    # REST controllers
|-- dto/           # Request/response DTOs
|-- entity/        # JPA entities
|-- exception/     # Global exception handling
|-- repository/    # Spring Data JPA repositories
|-- security/      # JWT and authentication filters
`-- service/       # Business logic
```

## Frontend Layout

```text
frontend/src/
|-- components/    # Reusable UI and layout components
|-- context/       # Auth context
|-- layouts/       # Main app layout
|-- pages/         # Role-based pages
|-- routes/        # Protected route logic
|-- services/      # Axios API integration
|-- utils/         # Formatters and validators
`-- styles.css     # Global styles
```

## Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8
- Maven 3.9+ or the Maven distribution in `tools/apache-maven-3.9.9/`

### Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8084
```

Database settings are in:

```text
backend/src/main/resources/application.properties
```

Default values:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/onboarding_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata
spring.datasource.username=root
spring.datasource.password=A.sawant50
```

Use environment variables such as `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` for production or shared environments.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

The frontend API base URL defaults to:

```text
http://localhost:8084/api
```

Override it with:

```env
VITE_API_URL=http://localhost:8084/api
```

## Default Super Admin

The backend seeds a Super Admin account on startup:

```text
Username: superadmin
Password: Pass@123
```

Change seeded credentials before using the system outside local development.

## API Overview

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/forgot-password`

### Users and Profile

- `GET /api/users`
- `GET /api/users/me`
- `POST /api/users`
- `PUT /api/users/{id}/access`
- `PUT /api/users/{id}/status`
- `PUT /api/users/me/profile`

User creation captures:

- First name
- Last name
- Date of birth
- Contact number
- Gender
- Email address
- Username
- Password
- Role
- Status

Employees can update only allowed profile fields:

- Email
- Contact number
- Gender
- Date of birth
- Password, when provided

Employees cannot update username, role, employee ID, or permissions through the profile API.

### Assets

- `GET /api/assets`
- `POST /api/assets`
- `PUT /api/assets/{id}/status`
- `GET /api/asset-history`
- `GET /api/asset-history/asset/{assetId}`
- `GET /api/asset-history/employee/{employeeId}`

When an asset is assigned, the backend automatically stores `assignedDate`. Asset tables and recent assignment history display this timestamp.

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}/status`

When a task is created, the backend automatically stores `taskCreatedDate`.

Managers can set or update `completionDate`. Validation rules:

- Only managers can update completion date.
- Completion date cannot be before task created date.
- Completion date is required when a task status becomes `COMPLETED`.
- Employees can view completion date but cannot modify it.

### Training

- `GET /api/training`
- `POST /api/training`

### Reports

- `POST /api/reports/generate`
- `POST /api/reports/download`

## Database Schema Notes

Hibernate is configured with:

```properties
spring.jpa.hibernate.ddl-auto=update
```

For existing MySQL databases, apply these schema updates if Hibernate has not already created them:

```sql
ALTER TABLE users
  ADD COLUMN first_name VARCHAR(255) NULL AFTER name,
  ADD COLUMN last_name VARCHAR(255) NULL AFTER first_name,
  ADD COLUMN date_of_birth DATE NULL AFTER last_name,
  ADD COLUMN contact_number VARCHAR(255) NULL AFTER date_of_birth,
  ADD COLUMN gender VARCHAR(255) NULL AFTER contact_number;

UPDATE users
SET
  first_name = COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(name, ' ', 1)), ''), username),
  last_name = COALESCE(NULLIF(TRIM(SUBSTRING(name, LENGTH(SUBSTRING_INDEX(name, ' ', 1)) + 2)), ''), 'User')
WHERE first_name IS NULL OR last_name IS NULL;

ALTER TABLE users
  MODIFY first_name VARCHAR(255) NOT NULL,
  MODIFY last_name VARCHAR(255) NOT NULL;

ALTER TABLE assets
  ADD COLUMN assigned_date DATETIME NULL;

ALTER TABLE asset_assignment_history
  ADD COLUMN assigned_date DATETIME NULL;

UPDATE asset_assignment_history
SET assigned_date = COALESCE(assignment_date, NOW())
WHERE assigned_date IS NULL;

ALTER TABLE tasks
  ADD COLUMN task_created_date DATETIME NULL,
  ADD COLUMN completion_date DATE NULL;

UPDATE tasks
SET task_created_date = NOW()
WHERE task_created_date IS NULL;
```

The `email` column on `users` is unique and required.

## Utility Scripts

The `tools/` directory includes:

- `ResetOnboardingDatabase.java`: recreates local database tables for development.
- `QueryOnboardingUsers.java`: prints local user records for quick inspection.

Example reset command used in this workspace:

```powershell
java -cp ".;C:\Users\hp\.m2\repository\com\mysql\mysql-connector-j\9.5.0\mysql-connector-j-9.5.0.jar;tools" ResetOnboardingDatabase
```

## Build

### Backend

```bash
cd backend
mvn -DskipTests package
```

If a local process locks the existing JAR under `backend/target`, stop the running Java process or clean the target directory before packaging.

### Frontend

```bash
cd frontend
npm run build
```

Build output is written to `frontend/dist/`.

## Validation

Backend validation includes:

- Required fields for user creation and profile updates
- Email format validation
- Contact number format validation
- Task completion date authorization and date-order validation
- Required completion date for completed tasks

Frontend validation includes:

- Required form fields
- Email format checks
- Contact number checks
- Required completion date before marking a task complete
- Password confirmation on profile updates

## Security Notes

- JWT tokens are stored client-side and sent as `Authorization: Bearer <token>`.
- Passwords are encoded with Spring Security password encoding.
- Role access is enforced through Spring Security annotations.
- Production deployments should use environment variables for secrets and database credentials.

## Verified Commands

The current project has been checked with:

```bash
cd backend
mvn -q -DskipTests compile
mvn -q -DskipTests "-Dspring-boot.repackage.skip=true" package

cd frontend
npm run build
```

## License

This project is provided as-is for internal use.
