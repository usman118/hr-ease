# Admin Module Documentation

## Overview

The Admin module provides comprehensive administrative functionality for HR Ease, allowing administrators to manage users, assign roles, and handle company relationships. Only users with `ADMIN` role can access these endpoints.

## Features

### 1. User Management

- Create users with specific roles (ADMIN, HR, COMPANY_OWNER)
- Invite users via email with temporary passwords
- List all users in the system
- Assign companies to users

### 2. Company Management

- List all companies
- Assign company owners
- Manage company-HR relationships

### 3. Email Integration

- Professional invitation emails with temporary credentials
- Branded templates with company information
- Automatic password reset instructions

## API Endpoints

### Authentication

All endpoints require:

- Valid JWT token (Bearer authentication)
- Admin role (`UserRole.ADMIN`)

### User Management Endpoints

#### 1. Create User

```
POST /admin/users
```

Create a new user without sending invitation email.

**Request Body:**

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "hr"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "hr",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 2. Invite User

```
POST /admin/users/invite
```

Create a new user and send invitation email with temporary password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "hr",
  "companyId": "company-uuid-optional"
}
```

**Response:**

```json
{
  "message": "User invited successfully. Invitation email has been sent.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "hr",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3. Get All Users

```
GET /admin/users
```

Retrieve list of all users in the system.

**Response:**

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "hr",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### 4. Assign Company to User

```
PUT /admin/users/:userId/assign-company
```

Assign a company to an HR or Company Owner user.

**Request Body:**

```json
{
  "companyId": "company-uuid"
}
```

**Response:**

```json
{
  "message": "Company assigned to user successfully"
}
```

### Company Management Endpoints

#### 1. Get All Companies

```
GET /admin/companies
```

Retrieve list of all companies with owner information.

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "Tech Solutions Inc.",
    "industry": "Technology",
    "website": "https://techsolutions.com",
    "description": "Leading provider of innovative technology solutions",
    "address": "123 Business Street",
    "city": "New York",
    "country": "United States",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "owner": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    }
  }
]
```

#### 2. Assign Company Owner

```
POST /admin/companies/:companyId/owners/:userId
```

Assign a user with COMPANY_OWNER role to a company.

**Response:**

```json
{
  "message": "Company owner assigned successfully"
}
```

## Role Hierarchy

### Admin (ADMIN)

- Full system access
- Can create and manage all users
- Can assign companies to users
- Can manage company owners

### Company Owner (COMPANY_OWNER)

- Can create HR users for their company
- Can manage their company's HR staff
- Limited to their assigned company

### HR (HR)

- Standard HR operations within assigned company
- Cannot create other users
- Limited to company-specific data

## User Invitation Process

1. Admin creates invitation using `/admin/users/invite`
2. System generates temporary password
3. User is created in database
4. Company assignment (if applicable) is created
5. Professional invitation email is sent with:
   - Temporary credentials
   - Login instructions
   - Company information (if assigned)
   - Security reminders

## Email Template Features

### Professional Design

- Branded HR Ease header
- Clear credential presentation
- Company information display
- Responsive HTML design

### Security Best Practices

- Temporary password emphasis
- Password change reminders
- Secure login instructions
- Clear invitation source

### Content Customization

- Role-specific messaging
- Company context inclusion
- Personal invitation details
- Next steps guidance

## Error Handling

### Common Error Responses

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Access denied. Admin role required."
}
```

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Email already in use"
}
```

## Business Logic

### User Creation Rules

- Email must be unique across the system
- Temporary passwords are automatically generated
- All created users are active by default
- Role assignment is enforced at creation

### Company Assignment Rules

- Only HR and COMPANY_OWNER roles can be assigned to companies
- COMPANY_OWNER users update the company's owner field
- HR users create company-HR relationship records
- Multiple HR users can be assigned to one company

### Email Integration Rules

- Invitation emails are sent automatically for `/invite` endpoint
- Email failures don't prevent user creation
- Templates include all necessary login information
- Company context is included when applicable

## Security Features

### Route Protection

- JWT authentication required
- Admin role verification
- Request validation with DTOs
- Type-safe parameter handling

### Data Validation

- Email format validation
- Required field enforcement
- Role enum validation
- Company existence verification

### Error Prevention

- Duplicate email detection
- Role-based access control
- Company assignment validation
- Safe error handling for email service

## Usage Examples

### Creating an HR User with Company Assignment

```typescript
// 1. Create invitation
POST /admin/users/invite
{
  "email": "hr@company.com",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "role": "hr",
  "companyId": "company-123"
}

// 2. User receives invitation email with temporary password
// 3. User logs in and changes password
// 4. HR user is automatically assigned to company
```

### Setting Up a Company Owner

```typescript
// 1. Create company owner user
POST /admin/users/invite
{
  "email": "owner@company.com",
  "firstName": "Michael",
  "lastName": "Brown",
  "role": "company_owner"
}

// 2. Assign to company
POST /admin/companies/company-123/owners/user-456

// 3. Company owner can now create HR users for their company
```

## Integration with Existing Auth System

The Admin module integrates seamlessly with the existing authentication system:

- Uses same JWT strategy and guards
- Leverages existing AuthHelper utilities
- Integrates with EmailService for notifications
- Follows established error handling patterns
- Maintains consistent API response formats

## Environment Configuration

Required environment variables:

```env
# Email configuration (required for invitations)
EMAIL_USER=your-gmail@gmail.com
GOOGLE_APP_PASSWORD=your-16-char-app-password

# Frontend URL (for login links in emails)
FRONTEND_URL=http://localhost:3000

# JWT configuration (inherited from auth module)
JWT_SECRET=your-jwt-secret
```

## Testing

### Manual Testing

1. Ensure you have an admin user in the database
2. Get JWT token through login
3. Test each endpoint with admin token
4. Verify email delivery (check logs for preview URLs)

### User Role Testing

1. Create different role users through admin endpoints
2. Test login with temporary passwords
3. Verify role-based access control
4. Test company assignment functionality

This admin system provides a complete foundation for hierarchical user management in HR Ease, enabling scalable multi-company administration with proper security and user experience considerations.
