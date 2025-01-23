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
            text: `Sample Invoice #12345
Date: December 18, 2024
Amount: $1,234.56
Items:
- Product A: $500
- Product B: $734.56`,
            confidence: 95.5,
            metadata: {
                documentType: 'invoice',
                pageCount: 1,
                fileName,
                mimeType: 'application/pdf',
                fields: {
                    invoiceNumber: '12345',
                    date: '2024-12-18',
                    amount: 1234.56
                },
                processingTime: new Date().toISOString()
            }
        };
    }

    private generateMockImageData(fileName: string): OcrResult {
        return {
            text: `Receipt
Store: Example Store
Date: December 18, 2024
Total: $45.99
Payment Method: Credit Card
Thank you for shopping!`,
            confidence: 88.5,
            metadata: {
                documentType: 'receipt',
                pageCount: 1,
                fileName,
                mimeType: 'image/jpeg',
                fields: {
                    store: 'Example Store',
                    date: '2024-12-18',
                    total: 45.99,
                    paymentMethod: 'Credit Card'
                },
                processingTime: new Date().toISOString()
            }
        };
    }

    private generateMockGenericData(fileName: string): OcrResult {
        return {
            text: `Generic Document
This is a sample text that would be extracted from a generic document.
It contains multiple lines of text to simulate real OCR output.
The quality and accuracy of the text extraction may vary depending on the document type and quality.`,
            confidence: 85.0,
            metadata: {
                documentType: 'unknown',
                pageCount: 1,
                fileName,
                mimeType: 'application/octet-stream',
                processingTime: new Date().toISOString()
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
