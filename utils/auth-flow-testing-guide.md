# Authentication Flow Testing Guide

This guide explains how to test the authentication flow in our document recognition system.

## Prerequisites
- Node.js and npm installed
- Backend server running on localhost:3000
- cURL or a REST client (like Postman)

## 1. Company Bootstrap (Initial Setup)
This is the first step to create a new company and admin user.

```bash
curl -X POST http://localhost:3000/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "adminEmail": "admin@testcompany.com",
    "adminPassword": "securePassword123"
  }'
```

### Expected Response
```json
{
  "company": {
    "id": "company-uuid",
    "name": "Test Company"
  },
  "admin": {
    "id": "user-uuid",
    "email": "admin@testcompany.com"
  },
  "token": "your.jwt.token"
}
```

## 2. Token Verification
Verify that your JWT token is valid.

```bash
curl -X GET http://localhost:3000/auth/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Expected Response
```json
{
  "companyId": "your-company-id",
  "verified": true
}
```

## 3. Protected Company Routes
Examples of accessing protected routes.

### Get Current Company
```bash
curl -X GET http://localhost:3000/companies/current \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Upload Document
```bash
curl -X POST http://localhost:3000/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/document.pdf" \
  -F "name=Test Document"
```

## Authentication Flow Explanation

1. **Initial Setup**
   - Call `/auth/bootstrap` to create company and admin
   - System creates:
     - Company record
     - Admin user record
     - JWT token with company and user info

2. **Request Authentication**
   - Protected requests go through JwtAuthGuard
   - Guard checks "Authorization: Bearer" header
   - Valid token: request proceeds with company context
   - Invalid/missing token: returns 401 Unauthorized

3. **Company Context**
   - JwtAuthGuard validates token and attaches user info
   - `@Company()` decorator extracts company ID
   - Protected routes automatically get company context
   - Users can only access their company's data

4. **Logging and Debugging**
   - Guard logs request path and method
   - Auth controller logs bootstrap attempts
   - Token verification is logged
   - Helps track flow and debug issues

## Testing Steps

1. Run bootstrap request to get token
2. Copy token from response
3. Use token in subsequent requests
4. Test protected routes with:
   - Valid token (should succeed)
   - Invalid token (should get 401)
   - No token (should get 401)
   - Expired token (should get 401)

## Common Issues and Solutions

1. **401 Unauthorized**
   - Check token is valid and not expired
   - Ensure "Bearer" prefix is included
   - Verify token format in Authorization header

2. **500 Internal Server Error on Bootstrap**
   - Check database connection
   - Verify company name is unique
   - Ensure admin email is unique

3. **403 Forbidden on Protected Routes**
   - Confirm company ID in token matches requested resource
   - Check user permissions within company

## Security Notes

- Never share JWT tokens
- Store tokens securely
- Use HTTPS in production
- Implement token refresh mechanism
- Consider token expiration times
