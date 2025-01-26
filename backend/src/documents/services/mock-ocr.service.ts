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
            text: `Israeli ID Card
Last Name: ישראלי
First Name: ישראל
Birth Date: 15.09.1976
Issue Date: 10.10.2011
ID Number: 123456789
Valid Until: 10.10.2021`,
            confidence: 0.9992,
            metadata: {
                processedAt: new Date().toISOString(),
                provider: 'mock-ocr',
                documentType: 'id_card',
                pages: 1,
                mimeType: 'application/pdf',
                structuredData: {
                    'last_name': 'ישראלי',
                    'first_name': 'ישראל',
                    'birth_date': '1976-09-15',
                    'issue_date': '2011-10-10',
                    'id': '123456789',
                    'valid_until': '2021-10-10'
                },
                rawResponse: {
                    entities: [
                        {
                            type: 'ID',
                            mentionText: '123456789',
                            confidence: 0.9992712140083313,
                            normalizedValue: { text: '123456789' }
                        },
                        {
                            type: 'Issue_date',
                            mentionText: '10.10.2011',
                            confidence: 0.9999779462814331,
                            normalizedValue: {
                                text: '2011-10-10',
                                dateValue: { year: 2011, month: 10, day: 10 }
                            }
                        },
                        {
                            type: 'birth_date',
                            mentionText: '15.09.1976',
                            confidence: 0.9999957084655762,
                            normalizedValue: {
                                text: '1976-09-15',
                                dateValue: { year: 1976, month: 9, day: 15 }
                            }
                        },
                        {
                            type: 'first_name',
                            mentionText: 'ישראל',
                            confidence: 0.9999934434890747
                        },
                        {
                            type: 'last_name',
                            mentionText: 'ישראלי',
                            confidence: 0.9999982118606567
                        },
                        {
                            type: 'valid_until',
                            mentionText: '10.10.2021',
                            confidence: 0.9999940395355225,
                            normalizedValue: {
                                text: '2021-10-10',
                                dateValue: { year: 2021, month: 10, day: 10 }
                            }
                        }
                    ]
                }
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
                processedAt: new Date().toISOString(),
                provider: 'mock-ocr',
                documentType: 'receipt',
                pages: 1,
                mimeType: 'image/jpeg',
                structuredData: {
                    'Receipt Number': 'RCP-001',
                    'Date': '2024-01-25',
                    'Total': '$123.45',
                    'Store': 'Local Store',
                },
                rawResponse: `Receipt
Store: Example Store
Date: December 18, 2024
Total: $45.99
Payment Method: Credit Card
Thank you for shopping!`,
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
                processedAt: new Date().toISOString(),
                provider: 'mock-ocr',
                documentType: 'unknown',
                pages: 1,
                mimeType: 'application/octet-stream',
                structuredData: {},
                rawResponse: `Generic Document
This is a sample text that would be extracted from a generic document.
It contains multiple lines of text to simulate real OCR output.
The quality and accuracy of the text extraction may vary depending on the document type and quality.`,
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
