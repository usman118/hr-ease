# Authentication System

A complete authentication system for the HR Ease application built with NestJS, JWT, and bcryptjs.

## Features

- ✅ User Registration (Signup)
- ✅ User Login with JWT tokens
- ✅ Password hashing with bcryptjs
- ✅ Forgot/Reset Password functionality
- ✅ Update Password for authenticated users
- ✅ JWT Authentication Guards
- ✅ Role-based Authorization
- ✅ Comprehensive API documentation with Swagger
- ✅ Helper functions for reusable auth logic

## API Endpoints

### Public Endpoints

#### POST /auth/signup

Register a new user account.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "hr",
    "isActive": true,
    "createdAt": "2025-09-01T10:20:17.577Z",
    "updatedAt": "2025-09-01T10:20:17.577Z"
  }
}
```

#### POST /auth/login

Authenticate user and get access token.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:** Same as signup response.

#### POST /auth/forgot-password

Request password reset token.

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Response:**

```json
{
  "message": "Password reset token generated",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

_Note: In production, the reset token should be sent via email, not returned in the response._

#### POST /auth/reset-password

Reset password using the token.

**Request Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "message": "Password reset successfully"
}
```

### Protected Endpoints

#### PATCH /auth/update-password

Update current user's password (requires authentication).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "message": "Password updated successfully"
}
```

## Usage in Controllers

### Basic Authentication Guard

```typescript
import { JwtAuthGuard, GetUser } from '@/root/auth';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get('profile')
  getProfile(@GetUser() user: any) {
    return { user };
  }
}
```

### Role-Based Authorization

```typescript
import { JwtAuthGuard, RolesGuard, Roles, GetUser } from '@/root/auth';
import { UserRole } from '@/enums/user.enum';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN)
  getAllUsers(@GetUser() user: any) {
    return { message: 'Admin only endpoint', user };
  }

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.HR)
  getDashboard(@GetUser() user: any) {
    return { message: 'Admin or HR only', user };
  }
}
```

## Helper Functions

### AuthHelper

The `AuthHelper` provides reusable authentication utilities:

```typescript
import { AuthHelper } from '@/helpers';

// Hash a password
const hashedPassword = await AuthHelper.hashPassword('password123');

// Compare passwords
const isValid = await AuthHelper.comparePassword('password123', hashedPassword);

// Generate JWT token
const token = AuthHelper.generateAccessToken(jwtService, user);

// Generate reset token
const resetToken = AuthHelper.generateResetToken(jwtService, userId, email);

// Validate user credentials
const user = await AuthHelper.validateUserCredentials(
  userRepo,
  email,
  password,
);

// Check email availability
await AuthHelper.checkEmailAvailability(userRepo, email);

// Format auth response
const response = AuthHelper.formatAuthResponse(user, token);
```

### UserHelper

The `UserHelper` provides user management utilities:

```typescript
import { UserHelper } from '@/helpers';

// Find user by ID with error handling
const user = await UserHelper.findUserById(userRepo, userId);

// Check user roles
const isAdmin = UserHelper.isAdmin(user);
const isHR = UserHelper.isHR(user);

// Format user response (removes password)
const userResponse = UserHelper.formatUserResponse(user);
```

## Configuration

### Environment Variables

Make sure to set the following environment variables in your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key
```

### Module Setup

The authentication module is already configured and imported in the main `AppModule`. It includes:

- JWT strategy with Passport
- Database connection for User entity
- JWT module configuration
- Auth guards and decorators

## Security Features

- **Password Hashing**: Uses bcryptjs with salt rounds of 10
- **JWT Security**: Tokens expire after 7 days
- **Role-based Access**: Fine-grained permission control
- **Input Validation**: All DTOs include validation decorators
- **Error Handling**: Secure error messages (no sensitive data exposure)

## Development

### Running the Application

```bash
npm run start:dev
```

The API documentation will be available at: `http://localhost:3000/api`

### Testing Endpoints

You can test the authentication endpoints using tools like:

- Postman
- curl
- Thunder Client (VS Code extension)
- The built-in Swagger UI

Example curl command for signup:

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Architecture

The authentication system follows NestJS best practices:

- **Modular Design**: Auth functionality is encapsulated in its own module
- **Helper Pattern**: Business logic is extracted to helper classes
- **Guard System**: Reusable guards for authentication and authorization
- **DTO Validation**: Input validation with class-validator
- **Swagger Documentation**: Complete API documentation
- **TypeScript**: Full type safety throughout

## Error Handling

The system provides clear, secure error messages:

- `400 Bad Request`: Invalid input or business logic errors
- `401 Unauthorized`: Authentication failures
- `404 Not Found`: User not found errors
- `409 Conflict`: Email already exists

All sensitive information (like password hashes) is excluded from error responses.
