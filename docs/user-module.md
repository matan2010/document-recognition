# User Module Documentation

## Overview
The User module handles user management within the document recognition system. It provides endpoints for user creation, profile management, and user administration, with role-based access control and company isolation.

## Data Model

### User Schema
```prisma
model User {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  email         String         @unique
  password      String
  role          String         @default("normal")
  company       Company        @relation(fields: [companyId], references: [id])
  companyId     String         @db.ObjectId
  refreshTokens RefreshToken[]
  preferences   Json?
  documents     Document[]
  activityLogs  ActivityLog[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

## Endpoints

### Profile Management

#### Get Current User Profile
```http
GET /users/profile
```
- **Auth:** Required (JWT)
- **Description:** Retrieve the current user's profile
- **Access:** Any authenticated user
- **Response:**
  ```json
  {
    "id": "string",
    "email": "string",
    "role": "string",
    "companyId": "string",
    "preferences": {},
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```

#### Update Current User Profile
```http
PATCH /users/profile
```
- **Auth:** Required (JWT)
- **Description:** Update the current user's profile
- **Access:** Any authenticated user
- **Restrictions:** Cannot change own role
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "preferences": {}
  }
  ```

### User Administration (Admin Only)

#### Create New User
```http
POST /users
```
- **Auth:** Required (JWT)
- **Access:** Admin only
- **Description:** Create a new user in the admin's company
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "role": "string"
  }
  ```

#### List Users
```http
GET /users
```
- **Auth:** Required (JWT)
- **Description:** List all users
- **Access Control:**
  - Admins: See all users
  - Regular users: See only users in their company
- **Query Parameters:**
  - `page`: Page number (optional)
  - `limit`: Items per page (optional)

#### Get User by ID
```http
GET /users/:id
```
- **Auth:** Required (JWT)
- **Description:** Get specific user details
- **Access Control:**
  - Admins: Can view any user
  - Regular users: Can only view users in their company
- **Parameters:**
  - `id`: User ID

#### Update User
```http
PATCH /users/:id
```
- **Auth:** Required (JWT)
- **Description:** Update user details
- **Access:** Admin only
- **Parameters:**
  - `id`: User ID
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "role": "string",
    "preferences": {}
  }
  ```

#### Delete User
```http
DELETE /users/:id
```
- **Auth:** Required (JWT)
- **Description:** Delete a user
- **Access:** Admin only
- **Parameters:**
  - `id`: User ID

## Security Features

### Authentication
- All endpoints require JWT authentication
- JWT token must be provided in Authorization header
- Token includes user ID, role, and company ID

### Authorization
1. **Role-Based Access Control:**
   - `admin`: Full access to all endpoints
   - `normal`: Limited to profile and company-scoped operations

2. **Company Isolation:**
   - Users can only access data within their company
   - Company ID is extracted from JWT token
   - Cross-company access attempts are logged and blocked

### Password Security
- Passwords are hashed using bcrypt
- Password updates trigger automatic rehashing
- Minimum password requirements enforced

## Logging and Monitoring

### Activity Logging
All operations are logged with:
- Timestamp
- User ID
- Action type
- Request details
- Response status
- Error details (if any)

### Error Handling
- Structured error responses
- Detailed error logging
- Security-sensitive information is never exposed in responses

## Testing Endpoints

To test these endpoints, you can use tools like Postman or curl. Here's an example workflow:

1. **Login and Get Token:**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@example.com", "password": "password123"}'
   ```

2. **Use Token for Requests:**
   ```bash
   curl -X GET http://localhost:3000/users/profile \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Create New User (Admin):**
   ```bash
   curl -X POST http://localhost:3000/users \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email": "newuser@example.com", "password": "password123", "role": "normal"}'
   ```

## Error Codes

| Code | Description                    |
|------|--------------------------------|
| 400  | Bad Request                    |
| 401  | Unauthorized                   |
| 403  | Forbidden                      |
| 404  | User Not Found                 |
| 409  | Email Already Exists           |
| 500  | Internal Server Error          |

## Best Practices

1. **Security:**
   - Always use HTTPS in production
   - Implement rate limiting
   - Monitor failed login attempts
   - Regular security audits

2. **Performance:**
   - Use pagination for list endpoints
   - Index frequently queried fields
   - Cache user profiles where appropriate

3. **Maintenance:**
   - Regular backup of user data
   - Monitor API usage patterns
   - Keep dependencies updated
