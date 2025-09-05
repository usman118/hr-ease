# HR Ease Backend

A NestJS-based backend application for HR management system with PostgreSQL database.

## Project Structure

# 🏢 HR Ease Backend

> A comprehensive Human Resources Management System backend built with NestJS, featuring role-based authentication, job management, and application tracking.

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=flat&logo=jest)](https://jestjs.io/)

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔐 Authentication & Security](#-authentication--security)
- [📊 Database Design](#-database-design)
- [🌐 API Documentation](#-api-documentation)
- [🧪 Testing](#-testing)
- [📧 Email Integration](#-email-integration)
- [🔧 Configuration](#-configuration)
- [🎯 Development Status](#-development-status)
- [🤝 Contributing](#-contributing)

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

# Email Configuration
EMAIL_USER=your-email@gmail.com
GOOGLE_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM="HR Ease" <your-email@gmail.com>

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

### Authentication (`/api/v1/auth`)

- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset with token
- `PATCH /api/v1/auth/update-password` - Change user password

### Admin Management (`/api/v1/admin`)

- `POST /api/v1/admin/users` - Create any type of user
- `POST /api/v1/admin/users/invite` - Invite user via email
- `PUT /api/v1/admin/users/:userId/assign-company` - Assign company to user
- `GET /api/v1/admin/users` - Get all users (with pagination & search)
- `GET /api/v1/admin/companies` - Get all companies (with pagination & search)
- `POST /api/v1/admin/companies/:companyId/owners/:userId` - Assign company owner

### Company Management (`/api/v1/companies`) 🔒 **Secured**

- `GET /api/v1/companies` - Get all companies (with pagination & search)
- `GET /api/v1/companies/:id` - Get company by ID
- `POST /api/v1/companies` - Create company
- `PUT /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company

### Company Owner Management (`/api/v1/company-owner`)

- `POST /api/v1/company-owner/hr-users` - Create HR user for company
- `POST /api/v1/company-owner/hr-users/invite` - Invite HR user via email
- `GET /api/v1/company-owner/hr-users` - Get company's HR users
- `GET /api/v1/company-owner/company` - Get company information
- `GET /api/v1/company-owner/stats` - Get company statistics
- `DELETE /api/v1/company-owner/hr-users/:hrUserId` - Remove HR user

### Job Posts Management (`/api/v1/job-posts`)

- `GET /api/v1/job-posts` - Get all job posts (public with pagination/search)
- `GET /api/v1/job-posts/my-posts` - Get current user's job posts
- `GET /api/v1/job-posts/statistics/overview` - Get job post statistics
- `GET /api/v1/job-posts/:id` - Get job post by ID
- `POST /api/v1/job-posts` - Create job post
- `PUT /api/v1/job-posts/:id` - Update job post
- `DELETE /api/v1/job-posts/:id` - Delete job post
- `PATCH /api/v1/job-posts/:id/toggle-status` - Toggle job post status

### Job Applications (`/api/v1/job-applications`)

- `POST /api/v1/job-applications/apply/:jobId` - Apply for job (public)
- `GET /api/v1/job-applications/my-applications` - Get applications for user's company
- `GET /api/v1/job-applications/job/:jobId` - Get applications for specific job
- `GET /api/v1/job-applications/statistics` - Get application statistics
- `GET /api/v1/job-applications/:id` - Get application by ID
- `PUT /api/v1/job-applications/:id/status` - Update application status

### User Management (`/api/v1/users`) 🔒 **Secured**

- `GET /api/v1/users` - Get basic user info (public listing with pagination & search)
- `GET /api/v1/users/:id` - Get user profile (full data for own profile, basic info for others)
- `PUT /api/v1/users/:id` - Update own profile only
- `PUT /api/v1/users/:id/deactivate` - Deactivate own account (soft delete)

**Note**: User creation, deletion, and admin operations moved to `/api/v1/admin/users`

- `DELETE /api/v1/users/:id` - Delete user
- `PUT /api/v1/users/:id/deactivate` - Soft delete user
- `PUT /api/v1/users/:id/restore` - Restore soft deleted user

### Profile Management (`/api/v1/profile`)

- `GET /api/v1/profile/me` - Get current user profile
- `GET /api/v1/profile/admin-only` - Admin-only test endpoint
- `GET /api/v1/profile/hr-or-admin` - HR or Admin test endpoint

### Visitor Management (`/api/v1/visitors`) 🔒 **Secured**

- `GET /api/v1/visitors` - Get all visitors (with pagination & search)
- `GET /api/v1/visitors/:id` - Get visitor by ID
- `POST /api/v1/visitors` - Create visitor
- `PUT /api/v1/visitors/:id` - Update visitor
- `DELETE /api/v1/visitors/:id` - Delete visitor

### 📊 Pagination Support

All "Get All" endpoints now support pagination with the following query parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term to filter results
- `lazy` (optional): Load all records at once (default: false)

**Standard Pagination**: `GET /api/v1/users?page=2&limit=20&search=john`

**Lazy Loading (All Records)**: `GET /api/v1/users?lazy=true&search=john`

**Response Format**:

```json
{
  "data": [...],
  "total": 150,
  "page": 2,
  "limit": 20,
  "totalPages": 8,
  "hasNext": true,
  "hasPrevious": true
}
```

**Note**: When `lazy=true`, pagination parameters are ignored and all matching records are returned. Use with caution for large datasets.

## 🔐 Authentication & Authorization

### 🔒 Security Model

**All endpoints now require authentication except:**

- Job browsing (`GET /api/v1/job-posts`)
- Job applications (`POST /api/v1/job-applications/apply/:jobId`)
- Authentication endpoints (`/api/v1/auth/*`)

### Role-Based Access Control

- **Admin**: Full system access, user management, company oversight
- **Company Owner**: Manage their company, create HR users, manage job posts and applications
- **HR**: Manage job posts and applications for their assigned company

### 🛡️ User Endpoint Security

| Endpoint                           | Access Level            | Description                                  |
| ---------------------------------- | ----------------------- | -------------------------------------------- |
| `GET /api/v1/users`                | **Authenticated Users** | Basic info only (name, role)                 |
| `GET /api/v1/users/:id`            | **Owner + Basic Info**  | Full profile for self, basic info for others |
| `PUT /api/v1/users/:id`            | **Owner Only**          | Can only update own profile                  |
| `PUT /api/v1/users/:id/deactivate` | **Owner Only**          | Can only deactivate own account              |
| `POST /api/v1/admin/users`         | **Admin Only**          | User creation restricted to admins           |

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
