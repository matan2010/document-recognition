# Complete Testing Example - Israeli ID Card Processing

This guide provides a complete, step-by-step example of processing an Israeli ID card through our system.

## Prerequisites
- Postman or cURL for making API requests
- Sample Israeli ID card image
- Backend server running at `http://localhost:3000`

## Complete Flow

### Step 1: Register a New Company Account
```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
    "email": "company@example.com",
    "password": "securePassword123",
    "companyName": "Test Company Ltd"
}
```

### Step 2: Login and Get Token
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
    "email": "company@example.com",
    "password": "securePassword123"
}

Response:
{
    "token": "eyJhbGciOiJIUzI1NiIs...",  // Save this token for subsequent requests
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "company@example.com",
        "companyId": "507f1f77bcf86cd799439012"
    }
}
```

### Step 3: Create a Client
```http
POST http://localhost:3000/clients
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
    "clientReferenceId": "ISR001",  // Your internal reference for this client
    "name": "John Doe",
    "email": "john.doe@example.com"
}

Response:
{
    "id": "507f1f77bcf86cd799439013",
    "clientReferenceId": "ISR001",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "companyId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-12-19T17:20:33.000Z",
    "updatedAt": "2024-12-19T17:20:33.000Z"
}
```

### Step 4: Upload ID Card Document

#### Using Postman:
1. Create a new POST request to `http://localhost:3000/documents`
2. Add Authorization header: `Bearer eyJhbGciOiJIUzI1NiIs...`
3. Set body type to `form-data`
4. Add the following fields:
   - `file`: Select your ID card image file
   - `title`: "Israeli ID Card"
   - `clientId`: "ISR001"
   - `metadata`: {"idNumber": "123456789"}

#### Using cURL:
```bash
curl -X POST http://localhost:3000/documents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "file=@/path/to/id-card.jpg" \
  -F "title=Israeli ID Card" \
  -F "clientId=ISR001" \
  -F 'metadata={"idNumber": "123456789"}'
```

Response:
```json
{
    "id": "507f1f77bcf86cd799439014",
    "title": "Israeli ID Card",
    "status": "PENDING",
    "fileName": "id-card.jpg",
    "fileType": "image/jpeg",
    "metadata": {
        "idNumber": "123456789"
    },
    "clientId": "507f1f77bcf86cd799439013",
    "companyId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-12-19T17:21:33.000Z",
    "updatedAt": "2024-12-19T17:21:33.000Z"
}
```

### Step 5: Check Document Status
```http
GET http://localhost:3000/documents/507f1f77bcf86cd799439014
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
    "id": "507f1f77bcf86cd799439014",
    "status": "COMPLETED",
    "parsedData": {
        "idNumber": "123456789",
        "fullName": "John Doe",
        "dateOfBirth": "1990-01-01",
        "dateOfIssue": "2020-01-01",
        "dateOfExpiry": "2030-01-01"
    },
    "metadata": {
        "idNumber": "123456789"
    }
}
```

### Step 6: Update Document Metadata (Optional)
```http
PATCH http://localhost:3000/documents/507f1f77bcf86cd799439014
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
    "metadata": {
        "idNumber": "123456789",
        "verified": true,
        "verificationDate": "2024-12-19",
        "verifiedBy": "operator@company.com"
    }
}

Response:
{
    "id": "507f1f77bcf86cd799439014",
    "status": "COMPLETED",
    "metadata": {
        "idNumber": "123456789",
        "verified": true,
        "verificationDate": "2024-12-19",
        "verifiedBy": "operator@company.com"
    }
}
```

### Step 7: List All Documents for Client
```http
GET http://localhost:3000/clients/ISR001/documents
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
    "documents": [
        {
            "id": "507f1f77bcf86cd799439014",
            "title": "Israeli ID Card",
            "status": "COMPLETED",
            "fileName": "id-card.jpg",
            "parsedData": {
                "idNumber": "123456789",
                "fullName": "John Doe",
                "dateOfBirth": "1990-01-01",
                "dateOfIssue": "2020-01-01",
                "dateOfExpiry": "2030-01-01"
            }
        }
    ]
}
```

## Testing Error Scenarios

### 1. Upload with Non-existent Client ID
```http
POST http://localhost:3000/documents
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data

Form Data:
- file: [ID Card Image]
- title: Israeli ID Card
- clientId: NONEXISTENT001

Response:
{
    "statusCode": 404,
    "message": "Client with reference ID NONEXISTENT001 not found in your company"
}
```

### 2. Create Duplicate Client Reference
```http
POST http://localhost:3000/clients
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
    "clientReferenceId": "ISR001",  // Already exists
    "name": "Jane Doe",
    "email": "jane.doe@example.com"
}

Response:
{
    "statusCode": 409,
    "message": "Client with reference ID ISR001 already exists in your company"
}
```

### 3. Upload Invalid File Type
```http
POST http://localhost:3000/documents
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: multipart/form-data

Form Data:
- file: [text file]
- title: Israeli ID Card
- clientId: ISR001

Response:
{
    "statusCode": 400,
    "message": "Invalid file provided. Supported formats are: jpg, jpeg, png, pdf"
}
```

## Best Practices
1. Always save the JWT token after login
2. Use meaningful client reference IDs (e.g., combining client initials and sequence number)
3. Include relevant metadata during document upload
4. Check document status periodically until COMPLETED
5. Handle all possible error responses in your application
6. Implement proper error handling for network issues
7. Keep track of all document IDs returned from the API

## Testing Checklist
- [ ] Company registration successful
- [ ] Login and token retrieval working
- [ ] Client creation with unique reference ID
- [ ] Document upload with correct client ID
- [ ] Document processing status checks
- [ ] Metadata updates working
- [ ] Error scenarios handled properly
- [ ] Document listing functionality working
