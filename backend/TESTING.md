# Testing Documentation

This document provides information about testing the backend application.

## Test Structure

The tests are organized following the NestJS testing best practices:

- Unit tests are located in `__tests__` directories next to the files they test
- Each service and controller has its own test file
- Tests use Jest as the testing framework
- Mock implementations are used for external dependencies

## Running Tests

### Prerequisites

Make sure you have all dependencies installed:

```bash
npm install
```

### Running All Tests

To run all tests with coverage:

```bash
# Using npm
npm run test:cov

# Using the test script
./scripts/test-all.sh
```

### Running Specific Tests

To run tests in watch mode during development:

```bash
npm run test:watch
```

To run a specific test file:

```bash
npm test -- path/to/test-file.spec.ts
```

## Test Coverage

We maintain a minimum coverage threshold of 80% for:
- Statements
- Branches
- Functions
- Lines

The coverage report is generated in the `coverage` directory after running tests with coverage.

## Writing Tests

### Test File Naming

- Test files should be named `*.spec.ts`
- Place test files in a `__tests__` directory next to the file being tested

### Test Structure

Follow this structure for test files:

```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('ComponentName', () => {
  let service: ServiceName;
  let dependencies: MockDependencies;

  beforeEach(async () => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('methodName', () => {
    it('should do something specific', () => {
      // Test
    });
  });
});
```

### Mocking

Use Jest's mocking capabilities:

```typescript
const mockDependency = {
  method: jest.fn(),
};

// Mock return value
mockDependency.method.mockReturnValue(value);

// Mock async return value
mockDependency.method.mockResolvedValue(value);

// Mock rejection
mockDependency.method.mockRejectedValue(error);
```

### Best Practices

1. Test both success and failure cases
2. Use descriptive test names
3. Keep tests focused and isolated
4. Clean up after each test
5. Mock external dependencies
6. Test edge cases
7. Maintain test readability

## Continuous Integration

Tests are run automatically in the CI pipeline. The build will fail if:
- Tests fail
- Coverage thresholds are not met
- Linting errors exist

## Troubleshooting

Common issues and solutions:

1. **Tests are failing locally but passing in CI**
   - Check Node.js version
   - Clear Jest cache: `npm test -- --clearCache`

2. **Coverage thresholds not met**
   - Run coverage report to identify uncovered lines
   - Add tests for uncovered scenarios

3. **Mocks not working as expected**
   - Verify mock implementation
   - Check import paths
   - Ensure mocks are reset between tests 