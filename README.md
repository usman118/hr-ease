# HR Ease Backend

A NestJS-based backend application for HR management system with PostgreSQL database.

## Project Structure

# HR Ease Backend

A comprehensive NestJS-based backend application for HR management system with role-based authentication, job management, and application tracking using PostgreSQL database.

## 🚀 Features

### Authentication & Authorization

- ✅ JWT-based authentication with role-based access control
- ✅ Multi-role system: Admin, HR, Company Owner
- ✅ Password complexity validation and hashing
- ✅ Email verification and password reset functionality
- ✅ Development email redirection system

### User Management

- ✅ Admin can create and manage all user types
- ✅ Company Owner management and assignment
- ✅ HR user creation and company association
- ✅ User profile management and status control

### Company Management

- ✅ Company creation and management
- ✅ Owner assignment to companies
- ✅ HR user association with companies
- ✅ Company-scoped data access control

### Job Management

- ✅ Unified job posting system for HR and Company Owners
- ✅ Job CRUD operations with role-based permissions
- ✅ Job status management (active/inactive)
- ✅ Company-specific job listings

### Job Application System

- ✅ Public job application submission for visitors
- ✅ Multiple applications per email (separate visitor records)
- ✅ Comprehensive applicant information collection
- ✅ Cover letter and document upload support
- ✅ Application status tracking workflow
- ✅ HR notes and application management
- ✅ Application statistics and reporting

## 📁 Project Structure

```
src/
├── database/                    # Database configuration
│   ├── migrations/             # TypeORM migrations
│   ├── database.config.ts      # Database connection config
│   └── database.module.ts      # Database module
├── entities/                   # TypeORM entities
│   ├── user.entity.ts         # User entity with roles
│   ├── company.entity.ts      # Company entity
│   ├── job-post.entity.ts     # Job posting entity
│   ├── visitor.entity.ts      # Job applicant entity
│   ├── job-application.entity.ts # Job application entity
│   └── index.ts              # Entity exports
├── helpers/                   # Helper utilities
│   ├── auth.helper.ts        # Authentication utilities
│   └── email.helper.ts       # Email utilities
├── root/                     # Feature modules
│   ├── admin/               # Admin management
│   │   ├── dto/
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── admin.module.ts
│   ├── auth/                # Authentication
│   │   ├── dto/
│   │   ├── guards/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── companies/           # Company management
│   │   ├── dto/
│   │   ├── companies.controller.ts
│   │   ├── companies.service.ts
│   │   └── companies.module.ts
│   ├── job-posts/          # Job posting management
│   │   ├── dto/
│   │   ├── job-posts.controller.ts
│   │   ├── job-posts.service.ts
│   │   └── job-posts.module.ts
│   └── job-applications/   # Job application management
│       ├── dto/
│       ├── job-applications.controller.ts
│       ├── job-applications.service.ts
│       └── job-applications.module.ts
├── users/                  # User management
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── app.module.ts          # Root application module
└── main.ts               # Application entry point
```

## 🛠️ Environment Setup

1. Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

2. Update the environment variables in `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=hr_ease

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Email Configuration (Development)
DEVELOPMENT_EMAIL_REDIRECT=theusmanofficial@gmail.com

# Application Configuration
NODE_ENV=development
PORT=3000
```

## 📦 Installation

```bash
# Install dependencies
$ npm install

# Run database migrations
$ npm run migration:run

# Start the development server
$ npm run start:dev
```

## 🔧 Available Scripts

```bash
# Development
$ npm run start:dev          # Start in development mode with hot reload
$ npm run start              # Start in production mode

# Database
$ npm run migration:generate # Generate new migration
$ npm run migration:run      # Run pending migrations
$ npm run migration:revert   # Revert last migration

# Build & Production
$ npm run build              # Build the application
$ npm run start:prod         # Start production build

# Testing
$ npm run test               # Run unit tests
$ npm run test:e2e           # Run end-to-end tests
$ npm run test:cov           # Run tests with coverage
```

## 🔗 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Admin Management

- `POST /api/v1/admin/create-company-owner` - Create company owner
- `GET /api/v1/admin/users` - Get all users (paginated)
- `PUT /api/v1/admin/users/:id/status` - Update user status

### Company Management

- `POST /api/v1/companies` - Create company
- `GET /api/v1/companies` - Get companies (role-based)
- `GET /api/v1/companies/:id` - Get company by ID
- `PUT /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company
- `POST /api/v1/companies/:id/assign-owner` - Assign owner to company

### Job Posts Management

- `POST /api/v1/job-posts` - Create job post (HR/Owner)
- `GET /api/v1/job-posts` - Get job posts (public & role-based)
- `GET /api/v1/job-posts/:id` - Get job post by ID
- `PUT /api/v1/job-posts/:id` - Update job post (HR/Owner)
- `DELETE /api/v1/job-posts/:id` - Delete job post (HR/Owner)

### Job Applications

- `POST /api/v1/job-applications/apply/:jobId` - Apply for job (public)
- `GET /api/v1/job-applications/my-applications` - Get applications (HR/Owner)
- `GET /api/v1/job-applications/:id` - Get application by ID (HR/Owner)
- `PUT /api/v1/job-applications/:id/status` - Update application status (HR/Owner)
- `GET /api/v1/job-applications/statistics` - Get application statistics (HR/Owner)

### Users Management

- `POST /api/v1/users/create-hr` - Create HR user (Owner)
- `GET /api/v1/users` - Get users
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 🔐 Authentication & Authorization

### Role-Based Access Control

- **Admin**: Full system access, can create company owners
- **Company Owner**: Manage their company, create HR users, manage job posts and applications
- **HR**: Manage job posts and applications for their assigned company

### JWT Token Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "admin|hr|company_owner",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 📊 Database Schema

### Core Entities

- **User**: Authentication and role management
- **Company**: Company information and relationships
- **JobPost**: Job posting with company association
- **Visitor**: Job applicant information
- **JobApplication**: Application linking visitors to jobs

### Key Relationships

- User ↔ Company (Owner/HR relationship)
- Company → JobPost (One-to-Many)
- JobPost → JobApplication (One-to-Many)
- Visitor → JobApplication (One-to-Many, allows multiple applications)

## 🧪 Testing Strategy

### Unit Tests

- Service layer business logic
- Helper function utilities
- DTO validation

### Integration Tests

- Controller endpoint testing
- Database operations
- Authentication flows

### End-to-End Tests

- Complete user workflows
- Role-based access scenarios
- Application submission flows

## 📈 Development Status

### ✅ Completed Features

- [x] Multi-role authentication system (Admin, HR, Company Owner)
- [x] Company management with owner assignment
- [x] HR user creation and company association
- [x] Unified job posting system
- [x] Visitor job application system with multiple applications per email
- [x] Application status tracking and HR notes
- [x] Role-based data access control
- [x] Email service with development redirection
- [x] Comprehensive database migrations
- [x] API documentation and testing

### 🔄 Current Phase

- [ ] Unit test implementation
- [ ] Integration test coverage
- [ ] End-to-end test scenarios

### 🎯 Future Enhancements

- [ ] File upload for resumes and documents
- [ ] Email notifications for application status changes
- [ ] Advanced search and filtering for jobs
- [ ] Application analytics and reporting dashboard
- [ ] Interview scheduling system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using NestJS, TypeORM, and PostgreSQL**
