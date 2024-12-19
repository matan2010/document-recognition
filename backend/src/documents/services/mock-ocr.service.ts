import { Injectable, Logger } from '@nestjs/common';
import { IOcrService, OcrResult } from '../interfaces/ocr.interface';
import * as path from 'path';

@Injectable()
export class MockOcrService implements IOcrService {
    private readonly logger = new Logger(MockOcrService.name);

    async processDocument(filePath: string): Promise<OcrResult> {
        try {
            this.logger.log(`Mock processing document: ${filePath}`);
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const fileName = path.basename(filePath);
            const fileType = path.extname(filePath).toLowerCase();

            // Generate mock data based on file type
            let mockData: OcrResult;
            switch (fileType) {
                case '.pdf':
                    mockData = this.generateMockPdfData(fileName);
                    break;
                case '.jpg':
                case '.jpeg':
                case '.png':
                    mockData = this.generateMockImageData(fileName);
                    break;
                default:
                    mockData = this.generateMockGenericData(fileName);
            }

            this.logger.log(`Mock processing completed for: ${filePath}`);
            return mockData;
        } catch (error) {
            this.logger.error(`Mock processing failed for: ${filePath}`, error.stack);
            throw error;
        }
    }

    private generateMockPdfData(fileName: string): OcrResult {
        return {
            text: `Sample Invoice #12345\n
                  Date: December 18, 2024\n
                  Amount: $1,234.56\n
                  Items:\n
                  - Product A: $500\n
                  - Product B: $734.56`,
            confidence: 95.5,
            metadata: {
                documentType: 'invoice',
                processedAt: new Date().toISOString(),
                pages: 2,
                extractedFields: {
                    invoiceNumber: '12345',
                    date: '2024-12-18',
                    totalAmount: 1234.56,
                    items: [
                        { name: 'Product A', amount: 500 },
                        { name: 'Product B', amount: 734.56 }
                    ]
                }
            }
        };
    }

    private generateMockImageData(fileName: string): OcrResult {
        return {
            text: `Business Card\n
                  John Doe\n
                  Software Engineer\n
                  Email: john@example.com\n
                  Phone: (555) 123-4567`,
            confidence: 88.7,
            metadata: {
                documentType: 'business_card',
                processedAt: new Date().toISOString(),
                imageQuality: 'high',
                extractedFields: {
                    name: 'John Doe',
                    title: 'Software Engineer',
                    email: 'john@example.com',
                    phone: '(555) 123-4567'
                }
            }
        };
    }

    private generateMockGenericData(fileName: string): OcrResult {
        return {
            text: `Generic Document\n
                  This is a sample text extracted from ${fileName}\n
                  Contains various information and data.`,
            confidence: 85.0,
            metadata: {
                documentType: 'unknown',
                processedAt: new Date().toISOString(),
                fileName: fileName,
                extractedFields: {
                    title: 'Generic Document',
                    content: 'Sample content'
                }
            }
        };
    }

    async validateDocument(filePath: string): Promise<boolean> {
        try {
            const result = await this.processDocument(filePath);
            return result.confidence > 50;
        } catch (error) {
            this.logger.error(`Document validation failed: ${filePath}`, error.stack);
            return false;
        }
    }
}
