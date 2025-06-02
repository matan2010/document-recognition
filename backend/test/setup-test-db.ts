import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

async function setupTestDatabase() {
  // Load environment variables
  console.log('Environment variables loaded from .env');
  
  // Set test database URL
  process.env.DATABASE_URL = 'file:./test.db';
  console.log('Prisma schema loaded from prisma\\schema.prisma');
  console.log('Datasource "db": SQLite database "test.db" at "file:./test.db"');
  
  // Reset the database
  console.log();
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
  console.log('\nDatabase reset successful');

  // Create a Prisma client
  const prisma = new PrismaClient();

  try {
    // Create test company 1 (main test company)
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    const company = await prisma.company.create({
      data: {
        name: 'Test Company'
      }
    });

    // Create main test user
    const user = await prisma.user.create({
      data: {
        email: 'test@company.com',
        password: hashedPassword,
        role: 'admin',
        companyId: company.id
      }
    });

    // Create test client for main company
    const client = await prisma.client.create({
      data: {
        name: 'Test Client',
        clientReferenceId: 'TEST001',
        email: 'client@testcompany.com',
        companyId: company.id
      }
    });

    // Create test company 2 (for data isolation tests)
    const otherHashedPassword = await bcrypt.hash('otherpass123', 10);
    const otherCompany = await prisma.company.create({
      data: {
        name: 'Other Test Company'
      }
    });

    // Create other test user
    const otherUser = await prisma.user.create({
      data: {
        email: 'other@example.com',
        password: otherHashedPassword,
        role: 'admin',
        companyId: otherCompany.id
      }
    });

    // Create test client for other company
    const otherClient = await prisma.client.create({
      data: {
        name: 'Other Client',
        clientReferenceId: 'OTHER001',
        email: 'client@othercompany.com',
        companyId: otherCompany.id
      }
    });

    // Ensure test files directory exists
    const testFilesDir = path.join(__dirname, 'test-files');
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }

    // Create sample test files if they don't exist
    const testPdfPath = path.join(testFilesDir, 'sample.pdf');
    const testImagePath = path.join(testFilesDir, 'sample.jpg');

    if (!fs.existsSync(testPdfPath)) {
      fs.writeFileSync(testPdfPath, '%PDF-1.5\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 73 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test PDF Document for Document Recognition Tests) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000015 00000 n \n0000000064 00000 n \n0000000123 00000 n \n0000000210 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n334\n%%EOF');
    }

    if (!fs.existsSync(testImagePath)) {
      // Create a simple JPG file header
      const jpgHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00]);
      fs.writeFileSync(testImagePath, Buffer.concat([jpgHeader, Buffer.from('Test JPG content')]));
    }

    console.log('\nTest database setup completed');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDatabase();
