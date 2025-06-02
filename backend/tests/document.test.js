const request = require('supertest');
const app = require('../app');
const { Document, User, Client } = require('../models');
const path = require('path');
const fs = require('fs').promises;

// Tests covering FR 3 (Document Submission and Processing) and FR 4 (Results and Data Management)
// FR 3 - Document Processing and Analysis
// FR 3.2 - Document Processing
// FR 3.3 - Information Extraction
// NFR 4.1.2 - Processing Time Requirements
describe('Document Processing Tests', () => {
  let authToken;
  let testUser;
  let testClient;

  beforeAll(async () => {
    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        email: 'test@company.com',
        password: 'Test123!',
        companyName: 'Test Company'
      });

    authToken = registerResponse.body.access_token;
    testUser = registerResponse.body.user;

    // Create test client
    const clientResponse = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Client',
        email: 'client@test.com'
      });

    testClient = clientResponse.body;
  });

  beforeEach(async () => {
    // Clear documents collection before each test
    await Document.deleteMany({});
  });

  // FR 3.1 - Document Upload
  // NFR 4.1.1 - Performance Requirements
  describe('Document Upload and Processing', () => {
    // Test for FR 3.1 - Document submission via API
    // FR 3.1 - Businesses can submit documents via REST API with client ID
    it('should accept document upload via API with client ID', async () => {
      const testFilePath = path.join(__dirname, '../test-files/sample.pdf');
      
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('clientId', testClient.id)
        .field('documentType', 'identity_card')
        .attach('document', testFilePath);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documentId');
      expect(response.body).toHaveProperty('status', 'pending');
    });

    // Test for FR 4.1 - Extraction results storage and access
    // FR 4.1 - Extraction results are stored and accessible via API
    it('should store and provide access to extraction results', async () => {
      // First upload a document
      const testFilePath = path.join(__dirname, '../test-files/sample.pdf');
      const uploadResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('clientId', testClient.id)
        .field('documentType', 'identity_card')
        .attach('document', testFilePath);

      // Wait for processing (in real scenario this might be longer)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Get extraction results
      const response = await request(app)
        .get(`/api/documents/${uploadResponse.body.documentId}/results`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('extractedData');
      expect(response.body).toHaveProperty('status');
    });

    // Test for NFR 4.1.1 - Performance requirement
    // NFR 4.1.1 - At least 90% of document conversions completed within 15 seconds per page
    it('should process document within 15 seconds per page', async () => {
      const testFilePath = path.join(__dirname, '../test-files/single-page.pdf');
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('clientId', testClient.id)
        .field('documentType', 'identity_card')
        .attach('document', testFilePath);

      // Wait for processing to complete
      let status = 'pending';
      while (status === 'pending') {
        const statusResponse = await request(app)
          .get(`/api/documents/${response.body.documentId}/status`)
          .set('Authorization', `Bearer ${authToken}`);
        
        status = statusResponse.body.status;
        if (status !== 'pending') break;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(15000); // 15 seconds in milliseconds
    });
  });

  // FR 3.4 - Document Storage
  // NFR 4.1.3 - Multi-tenancy Data Isolation
  describe('Document Status Management', () => {
    // Test for FR 4.3 - Document status tracking
    // FR 4.3 - Processed documents are associated with statuses (pending, partially extracted, completed)
    it('should track document status correctly', async () => {
      const testFilePath = path.join(__dirname, '../test-files/sample.pdf');
      
      const uploadResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('clientId', testClient.id)
        .field('documentType', 'identity_card')
        .attach('document', testFilePath);

      const statusResponse = await request(app)
        .get(`/api/documents/${uploadResponse.body.documentId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.status).toMatch(/^(pending|partially_extracted|completed)$/);
    });
  });

  // Test for FR 6.1 - Logging and Auditing
  describe('Logging and Auditing', () => {
    // FR 6.1, 6.2 - System maintains logs of document submissions with timestamp, user ID, and action description
    it('should log document submission and processing actions', async () => {
      const testFilePath = path.join(__dirname, '../test-files/sample.pdf');
      
      await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('clientId', testClient.id)
        .field('documentType', 'identity_card')
        .attach('document', testFilePath);

      const logsResponse = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          startDate: new Date(Date.now() - 3600000).toISOString(),
          endDate: new Date().toISOString()
        });

      expect(logsResponse.status).toBe(200);
      expect(logsResponse.body).toBeInstanceOf(Array);
      expect(logsResponse.body.length).toBeGreaterThan(0);
      expect(logsResponse.body[0]).toHaveProperty('timestamp');
      expect(logsResponse.body[0]).toHaveProperty('userId');
      expect(logsResponse.body[0]).toHaveProperty('action');
    });
  });
});
