// Set up environment variables for testing
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRATION = '1d';

// Ensure we're using the test database
console.log('Using test database at:', process.env.DATABASE_URL);
