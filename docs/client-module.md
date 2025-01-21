# Client Module Documentation

## Overview
The Client module manages client information within the document recognition system. Each client belongs to a company and can have multiple associated documents. The module provides endpoints for client management with company-based isolation and proper access control.

## Data Model

### Client Schema
```prisma
model Client {
  id                String     @id @default(auto()) @map("_id") @db.ObjectId
  clientReferenceId String   
  name              String
  email             String
  company           Company    @relation(fields: [companyId], references: [id])
  companyId         String     @db.ObjectId
  documents         Document[]
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  @@unique([companyId, clientReferenceId])
}
```

## Endpoints

### Client Management

#### Create New Client
```http
POST /clients
```
- **Auth:** Required (JWT)
- **Description:** Create a new client in the user's company
- **Access:** Any authenticated user in the company
- **Request Body:**
  ```json
  {
    "clientReferenceId": "string",
    "name": "string",
    "email": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "clientReferenceId": "string",
    "name": "string",
    "email": "string",
    "companyId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```
- **Notes:**
  - `clientReferenceId` must be unique within the company
  - Email validation is performed

#### List All Clients
```http
GET /clients
```
- **Auth:** Required (JWT)
- **Description:** List all clients in the user's company
- **Access:** Any authenticated user in the company
- **Response:**
  ```json
  [
    {
      "id": "string",
      "clientReferenceId": "string",
      "name": "string",
      "email": "string",
      "companyId": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
  ```

#### Get Client by ID
```http
GET /clients/:id
```
- **Auth:** Required (JWT)
- **Description:** Get specific client details
- **Access:** Any authenticated user in the client's company
- **Parameters:**
  - `id`: Client ID
- **Response:**
  ```json
  {
    "id": "string",
    "clientReferenceId": "string",
    "name": "string",
    "email": "string",
    "companyId": "string",
    "documents": [
      {
        "id": "string",
        "name": "string",
        "status": "string"
      }
    ],
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```

#### Update Client
```http
PATCH /clients/:id
```
- **Auth:** Required (JWT)
- **Description:** Update client details
- **Access:** Any authenticated user in the client's company
- **Parameters:**
  - `id`: Client ID
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "clientReferenceId": "string"
  }
  ```
- **Response:** Updated client object

#### Delete Client
```http
DELETE /clients/:id
```
- **Auth:** Required (JWT)
- **Description:** Delete a client
- **Access:** Any authenticated user in the client's company
- **Parameters:**
  - `id`: Client ID
- **Response:**
  ```json
  {
    "success": true,
    "message": "Client deleted successfully",
    "deletedClient": {
      "id": "string",
      "name": "string",
      "deletedAt": "datetime"
    }
  }
  ```

### Client Document Management

#### List Client Documents
```http
GET /clients/:id/documents
```
- **Auth:** Required (JWT)
- **Description:** List all documents belonging to a specific client
- **Access:** Any authenticated user in the client's company
- **Parameters:**
  - `id`: Client ID
- **Response:**
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "status": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
  ```

#### Get Client Document by ID
```http
GET /clients/:id/documents/:documentId
```
- **Auth:** Required (JWT)
- **Description:** Get specific client document details
- **Access:** Any authenticated user in the client's company
- **Parameters:**
  - `id`: Client ID
  - `documentId`: Document ID
- **Response:**
  ```json
  {
    "id": "string",
    "name": "string",
    "status": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
  ```

## Security Features

### Authentication
- All endpoints require JWT authentication
- JWT token must include user's company ID
- Company-based access control is enforced

### Authorization
1. **Company Isolation:**
   - Users can only access clients within their company
   - Company ID is validated for all operations
   - Cross-company access attempts are logged and blocked

2. **Data Validation:**
   - Client reference ID uniqueness within company
   - Email format validation
   - Required field validation

## Logging and Monitoring

### Activity Logging
All operations are logged with:
- Timestamp
- User ID
- Company ID
- Action type
- Client details
- Success/failure status

### Error Handling
- Structured error responses
- Detailed error logging
- Business logic validation

## Testing Endpoints

Here's how to test the client endpoints:

1. **Create New Client:**
   ```bash
   curl -X POST http://localhost:3000/clients \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "clientReferenceId": "CLI001",
       "name": "Test Client",
       "email": "client@example.com"
     }'
   ```

2. **List Clients:**
   ```bash
   curl -X GET http://localhost:3000/clients \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Update Client:**
   ```bash
   curl -X PATCH http://localhost:3000/clients/CLIENT_ID \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Updated Client Name"
     }'
   ```

## Error Codes

| Code | Description                    |
|------|--------------------------------|
| 400  | Bad Request                    |
| 401  | Unauthorized                   |
| 403  | Forbidden                      |
| 404  | Client Not Found               |
| 409  | Client Reference ID Conflict   |
| 500  | Internal Server Error          |

## Best Practices

1. **Data Management:**
   - Regularly backup client data
   - Implement soft delete for clients
   - Maintain audit trail of changes

2. **Performance:**
   - Index frequently queried fields
   - Implement caching for client lists
   - Optimize database queries

3. **Security:**
   - Validate all input data
   - Sanitize email addresses
   - Implement rate limiting
   - Monitor suspicious activities

4. **Integration:**
   - Webhook support for client updates
   - Export/Import functionality
   - API versioning support
