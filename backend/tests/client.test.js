const request = require('supertest');
const app = require('../app');
const { User, Client, DocumentType } = require('../models');

// Tests covering FR 2 (Configuration of Preferences) and FR 5 (Dashboards)
describe('Client and Preferences Management Tests', () => {
  let authToken;
  let testUser;

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
  });

  beforeEach(async () => {
    // Clear collections before each test
    await Client.deleteMany({});
    await DocumentType.deleteMany({});
  });

  // FR 2 - Client Management
  describe('Client Management Tests', () => {
    // FR 1.2 - Business users can manage their clients
    it('should create a new client', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Client',
          email: 'client@test.com',
          phone: '1234567890'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Client');
    });

    // FR 1.2 - Business users can access their client data
    it('should retrieve client list', async () => {
      // Create multiple clients first
      await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Client 1',
          email: 'client1@test.com'
        });

      await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Client 2',
          email: 'client2@test.com'
        });

      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
    });
  });

  describe('Document Type Configuration', () => {
    // Test for FR 2.1 and 2.2 - Document type configuration
    // FR 2.1, 2.2 - Users can configure document types and define extraction methods
    it('should allow configuration of document types with extraction preferences', async () => {
      const response = await request(app)
        .post('/api/document-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Identity Card',
          fields: [
            {
              name: 'full_name',
              extractionMethod: 'keyword',
              keywords: ['Name:', 'Full Name:']
            },
            {
              name: 'date_of_birth',
              extractionMethod: 'area',
              coordinates: {
                x: 100,
                y: 200,
                width: 150,
                height: 30
              }
            }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Identity Card');
      expect(response.body.fields).toHaveLength(2);
    });

    // Test for FR 2.3 - Configuration persistence
    // FR 2.3 - Configurations are saved and used during document processing
    it('should save and retrieve document type configurations', async () => {
      // First create a configuration
      const createResponse = await request(app)
        .post('/api/document-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Bank Statement',
          fields: [
            {
              name: 'account_number',
              extractionMethod: 'keyword',
              keywords: ['Account:', 'Account No:']
            }
          ]
        });

      // Then retrieve it
      const getResponse = await request(app)
        .get(`/api/document-types/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toMatchObject({
        name: 'Bank Statement',
        fields: [
          {
            name: 'account_number',
            extractionMethod: 'keyword',
            keywords: ['Account:', 'Account No:']
          }
        ]
      });
    });
  });

  describe('Dashboard Access', () => {
    // Test for FR 5.1 - Dashboard access
    // FR 5.1 - Business users can access dashboard to view document history and manage preferences
    it('should provide access to business dashboard with document history', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documentHistory');
      expect(response.body).toHaveProperty('extractionResults');
      expect(response.body).toHaveProperty('documentTypes');
    });
  });

  // Test for NFR 4.1.3 - Security & Multi-tenancy
  describe('Security and Data Isolation', () => {
    let secondUserToken;

    beforeAll(async () => {
      // Create second test user
      const secondUserResponse = await request(app)
        .post('/auth/register')
        .send({
          email: 'second@company.com',
          password: 'Test123!',
          companyName: 'Second Company'
        });

      secondUserToken = secondUserResponse.body.access_token;
    });

    // NFR 4.1.3 - 100% compliance in data isolation within multi-tenant architecture
    it('should ensure data isolation between different business users', async () => {
      // First user creates a client
      const firstUserClient = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'First User Client',
          email: 'client@firstcompany.com'
        });

      // Second user tries to access first user's client
      const response = await request(app)
        .get(`/api/clients/${firstUserClient.body.id}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(response.status).toBe(403);
    });
  });
});
