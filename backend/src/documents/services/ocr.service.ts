import { Injectable, Logger } from '@nestjs/common';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class OcrService {
    private readonly logger = new Logger(OcrService.name);
    private readonly client: DocumentProcessorServiceClient;
    private readonly location: string;
    private readonly processorId: string;

    constructor(private configService: ConfigService) {
        this.location = this.configService.get<string>('GOOGLE_DOCUMENT_AI_LOCATION') || 'us';
        this.processorId = this.configService.get<string>('GOOGLE_DOCUMENT_AI_PROCESSOR_ID');
        
        this.client = new DocumentProcessorServiceClient({
            credentials: {
                client_email: this.configService.get<string>('GOOGLE_CLIENT_EMAIL'),
                private_key: this.configService.get<string>('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
            },
            projectId: this.configService.get<string>('GOOGLE_PROJECT_ID'),
        });
    }

    async processDocument(filePath: string): Promise<{ text: string; confidence: number }> {
        try {
            this.logger.log(`Starting Document AI processing for file: ${filePath}`);

            // Read the file
            const buffer = await fs.promises.readFile(filePath);
            const content = buffer.toString('base64');

            // Get the project ID from environment variables
            const projectId = this.configService.get<string>('GOOGLE_PROJECT_ID');
            
            // Format the resource name
            const name = `projects/${projectId}/locations/${this.location}/processors/${this.processorId}`;

            // Configure the request
            const request = {
                name,
                document: {
                    content,
                    mimeType: this.getMimeType(filePath),
                },
            };

            // Process the document
            const [result] = await this.client.processDocument(request);
            const { document } = result;

            // Calculate average confidence (simplified)
            const confidence = document.pages.reduce((acc, page) => 
                acc + (page.layout?.confidence || 0), 0) / document.pages.length;

            this.logger.log(`Document AI processing completed for file: ${filePath}`);

            return {
                text: document.text,
                confidence: confidence * 100, // Convert to percentage
            };
        } catch (error) {
            this.logger.error(`Document AI processing failed for file: ${filePath}`, error.stack);
            throw error;
        }
    }

    private getMimeType(filePath: string): string {
        const extension = filePath.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'application/pdf';
            case 'png':
                return 'image/png';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'tiff':
                return 'image/tiff';
            default:
                return 'application/pdf';
        }
    }

    async validateDocument(filePath: string): Promise<boolean> {
        try {
            const result = await this.processDocument(filePath);
            return result.confidence > 50; // Minimum confidence threshold
        } catch (error) {
            this.logger.error(`Document validation failed: ${filePath}`, error.stack);
            return false;
        }
    }
}
