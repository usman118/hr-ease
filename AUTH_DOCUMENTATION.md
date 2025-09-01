# Authentication System Documentation

## Overview

Complete authentication system for HR Ease application built with NestJS, TypeORM, PostgreSQL, and JWT. Includes user signup, login, password management, and role-based authorization.

## Features

- ✅ User Registration (Signup)
- ✅ User Authentication (Login)
- ✅ JWT Token-based Authentication
- ✅ Password Reset via Email Token
- ✅ Password Update for Authenticated Users
- ✅ Role-based Authorization (Admin, HR, Employee)
- ✅ Protected Routes with Guards
- ✅ Input Validation with DTOs
- ✅ Password Hashing with bcrypt
- ✅ Comprehensive Error Handling

## API Endpoints

### Base URL: `http://localhost:3000/api/v1/auth`

### 1. User Signup

```bash
POST /signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 2. User Login

```bash
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3. Forgot Password

```bash
POST /forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset email sent",
  "resetToken": "reset_token_here"
}
```

### 4. Reset Password

```bash
POST /reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "message": "Password reset successfully"
}
```

### 5. Update Password (Protected)

```bash
PATCH /update-password
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "oldPassword": "currentpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "message": "Password updated successfully"
}
```

### 6. Get Profile (Protected)

```bash
GET /profile
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## Architecture

### Module Structure

```
src/
├── root/
│   └── auth/
│       ├── auth.controller.ts      # API endpoints
│       ├── auth.service.ts         # Business logic
│       ├── auth.module.ts          # Module configuration
│       ├── dto/                    # Data Transfer Objects
│       ├── guards/                 # Route protection
│       ├── strategies/             # JWT strategy
│       └── decorators/             # Custom decorators
├── helpers/
│   ├── auth.helper.ts              # Auth utilities
│   └── user.helper.ts              # User utilities
└── users/
    └── user.entity/
        └── user.entity.ts          # User database model
```

### Key Components

#### 1. Auth Service (`src/root/auth/auth.service.ts`)

Main business logic for authentication operations:

- User registration and validation
- Login authentication
- Password reset flow
- Password updates
- Token management

#### 2. Auth Helper (`src/helpers/auth.helper.ts`)

Utility functions for authentication:

- Password hashing and comparison
- JWT token generation and validation
- User credential validation
- Security utilities

#### 3. User Helper (`src/helpers/user.helper.ts`)

User-related utilities:

- User creation and validation
- Email uniqueness checks
- User retrieval operations

#### 4. JWT Strategy (`src/root/auth/strategies/jwt.strategy.ts`)

Passport JWT strategy for token validation:

- Token extraction from Authorization header
- Payload validation
- User authentication

#### 5. Guards

- `JwtAuthGuard`: Protects routes requiring authentication
- `RolesGuard`: Provides role-based access control

## Environment Configuration

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/hr_ease

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

## Database Schema

### User Entity

```sql
CREATE TYPE user_role_enum AS ENUM ('admin', 'hr', 'employee');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  reset_token VARCHAR,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

### Password Security

- Passwords hashed using bcrypt with salt rounds of 10
- Minimum password requirements enforced via DTOs
- Old password verification for updates

### JWT Security

- 7-day token expiration
- Secure token generation with user payload
- Token validation on protected routes

### Role-based Access Control

- User roles: `admin`, `hr`, `employee`
- Role-based route protection
- Flexible authorization decorators

## Testing

### Manual Testing Examples

#### 1. Complete User Flow

```bash
# 1. Signup
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","role":"hr"}'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Access protected route
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer <access_token>"

# 4. Update password
curl -X PATCH http://localhost:3000/api/v1/auth/update-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"oldPassword":"password123","newPassword":"newpassword123"}'

# 5. Forgot password
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 6. Reset password
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"<reset_token>","newPassword":"resetpassword123"}'
```

## Error Handling

### Common Errors

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid credentials or token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found
- `409 Conflict`: Email already exists

### Error Response Format

```json
{
  "message": "Error description",
  "error": "Error type",
  "statusCode": 400
}
```

## Dependencies

### Core Dependencies

```json
{
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/passport": "^10.0.3",
  "bcryptjs": "^2.4.3",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1"
}
```

### Development Dependencies

```json
{
  "@types/bcryptjs": "^2.4.6",
  "@types/passport-jwt": "^4.0.1"
}
```

## Usage in Other Modules

### Protecting Routes

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('protected-route')
async getProtectedData() {
  return { message: 'This is protected data' };
}
```

### Role-based Protection

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../users/user.entity/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.HR)
@Get('admin-only')
async getAdminData() {
  return { message: 'Admin/HR only data' };
}
```

### Getting Current User

```typescript
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../../users/user.entity/user.entity';

@UseGuards(JwtAuthGuard)
@Get('my-data')
async getMyData(@GetUser() user: User) {
  return { user: user.email, role: user.role };
}
```

## Status

✅ **COMPLETE**: Full authentication system implemented and tested

- All endpoints functional
- Database schema properly configured
- JWT authentication working
- Password management complete
- Role-based authorization implemented
- Helper classes integrated
- Error handling comprehensive
- Security measures in place

The authentication system is ready for production use and integration with other modules in the HR Ease application.
