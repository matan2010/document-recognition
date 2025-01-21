# Authentication Test Scenarios

This document outlines comprehensive test scenarios for the authentication system. Each scenario includes the expected request, response, and validation criteria.

## 1. Bootstrap Scenarios

### 1.1 Create First Company and Admin (Success)
```bash
curl -X POST http://localhost:3000/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "adminEmail": "admin@company1.com",
    "adminPassword": "Admin123!",
    "companyName": "Company One"
  }'
```
**Expected Response**: 
- Status: 201
- Response includes: company details, admin user details, and JWT token

### 1.2 Duplicate Company Email (Failure)
```bash
curl -X POST http://localhost:3000/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "adminEmail": "admin@company1.com",
    "adminPassword": "Different123!",
    "companyName": "Company Two"
  }'
```
**Expected Response**: 
- Status: 401
- Error message: "User already exists"

### 1.3 Invalid Email Format (Failure)
```bash
curl -X POST http://localhost:3000/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "adminEmail": "not-an-email",
    "adminPassword": "Admin123!",
    "companyName": "Company Three"
  }'
```
**Expected Response**: 
- Status: 400
- Validation error for email format

### 1.4 Short Password (Failure)
```bash
curl -X POST http://localhost:3000/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "adminEmail": "admin@company4.com",
    "adminPassword": "short",
    "companyName": "Company Four"
  }'
```
**Expected Response**: 
- Status: 400
- Validation error for password length

## 2. Login Scenarios

### 2.1 Successful Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company1.com",
    "password": "Admin123!"
  }'
```
**Expected Response**: 
- Status: 200
- Response includes: JWT token and user details

### 2.2 Wrong Password
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company1.com",
    "password": "WrongPass123!"
  }'
```
**Expected Response**: 
- Status: 401
- Error message: "Invalid credentials"

### 2.3 Non-existent User
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@company1.com",
    "password": "Admin123!"
  }'
```
**Expected Response**: 
- Status: 401
- Error message: "Invalid credentials"

## 3. Token Verification Scenarios

### 3.1 Valid Token
```bash
# Replace TOKEN with actual JWT token
curl -X GET http://localhost:3000/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Response**: 
- Status: 200
- Response includes: user details and token expiration

### 3.2 Invalid Token
```bash
curl -X GET http://localhost:3000/auth/verify \
  -H "Authorization: Bearer invalid-token"
```
**Expected Response**: 
- Status: 401
- Error message: "Unauthorized"

### 3.3 Missing Token
```bash
curl -X GET http://localhost:3000/auth/verify
```
**Expected Response**: 
- Status: 401
- Error message: "Unauthorized"

## 4. Role-Based Access Scenarios

### 4.1 Admin Access (Success)
```bash
# Replace TOKEN with admin JWT token
curl -X GET http://localhost:3000/companies \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Response**: 
- Status: 200
- Response includes: list of companies

### 4.2 Non-Admin Access (Failure)
```bash
# Replace TOKEN with non-admin JWT token
curl -X GET http://localhost:3000/companies \
  -H "Authorization: Bearer $TOKEN"
```
**Expected Response**: 
- Status: 403
- Error message: "Forbidden resource"

## 5. Edge Cases

### 5.1 Malformed JSON
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{malformed json}'
```
**Expected Response**: 
- Status: 400
- Error message: "Bad Request"

### 5.2 Wrong Content-Type
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: text/plain" \
  -d '{"email": "admin@company1.com", "password": "Admin123!"}'
```
**Expected Response**: 
- Status: 415
- Error message: "Unsupported Media Type"

### 5.3 Empty Payload
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected Response**: 
- Status: 400
- Validation errors for missing required fields

## Automated Test Script

Save this as `test-auth.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to run test and check response
run_test() {
    local name=$1
    local command=$2
    local expected_status=$3
    
    echo -e "\n${GREEN}Running test: $name${NC}"
    response=$(eval $command)
    actual_status=$?
    
    if [ $actual_status -eq $expected_status ]; then
        echo -e "${GREEN}✓ Test passed${NC}"
    else
        echo -e "${RED}✗ Test failed${NC}"
        echo "Expected status: $expected_status"
        echo "Actual status: $actual_status"
        echo "Response: $response"
    fi
}

# Bootstrap Tests
run_test "Create First Company" "curl -s -X POST http://localhost:3000/auth/bootstrap..." 201

# Login Tests
run_test "Valid Login" "curl -s -X POST http://localhost:3000/auth/login..." 200

# More tests...
```

## Running the Tests

1. Make sure your server is running:
```bash
cd backend
npm run start:dev
```

2. Run the test script:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

## Test Coverage

These scenarios cover:
- User Registration (Bootstrap)
- Authentication (Login)
- Authorization (Role-based access)
- Token Management
- Input Validation
- Error Handling
- Edge Cases

## Notes

- Replace `localhost:3000` with your actual API endpoint
- Store sensitive data (passwords, tokens) securely
- Some tests require sequential execution (e.g., create user before login)
- Consider rate limiting for production environments
