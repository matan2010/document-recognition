const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const jwt = require('jsonwebtoken');

// Tests covering FR 1.1 (Business registration) and FR 1.2 (User account creation and access)
// FR 1 - User Authentication and Authorization
describe('Authentication Tests', () => {
  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  describe('POST /auth/register', () => {
    // FR 1.1 - Businesses can register on the system via the frontend or an open API
    it('should register a new business user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'business@test.com',
          password: 'Test123!',
          companyName: 'Test Company'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('business@test.com');
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });

    // FR 1.1 - Validates unique business registration
    it('should not register user with existing email', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send({
          email: 'business@test.com',
          password: 'Test123!',
          companyName: 'Test Company'
        });

      // Second registration with same email
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'business@test.com',
          password: 'Test123!',
          companyName: 'Another Company'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/auth/register')
        .send({
          email: 'business@test.com',
          password: 'Test123!',
          companyName: 'Test Company'
        });
    });

    // FR 1.2 - User can access their account
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'business@test.com',
          password: 'Test123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('user');
    });

    // FR 1.2 - Validates secure account access
    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'business@test.com',
          password: 'WrongPassword!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    // Test for NFR 4.1.2 - Error handling
    // NFR 4.1.2 - System shall gracefully handle all operational errors
    it('should handle invalid input gracefully', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: ''
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBeDefined();
    });
  });

  // Test for NFR 4.1.1 - Performance
  // FR 1.3 - Token Management
  // NFR 4.1.1 - Security Requirements
  describe('Token Management', () => {
    // NFR 4.1.1 - 90% of user interactions completed in under 10 seconds
    it('should respond to login requests within 10 seconds', async () => {
      const startTime = Date.now();
      
      await request(app)
        .post('/auth/login')
        .send({
          email: 'business@test.com',
          password: 'Test123!'
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(10000); // 10 seconds in milliseconds
    });
  });
});
