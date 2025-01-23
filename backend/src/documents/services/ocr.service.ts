import { Injectable, Logger } from '@nestjs/common';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { ConfigService } from '@nestjs/config';
import { IOcrService, OcrResult } from '../interfaces/ocr.interface';
import * as fs from 'fs';

@Injectable()
export class OcrService implements IOcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly client: DocumentProcessorServiceClient;
  private readonly location: string;
  private readonly processorId: string;

  constructor(private configService: ConfigService) {
    this.location =
      this.configService.get<string>('GOOGLE_DOCUMENT_AI_LOCATION') || 'us';
    this.processorId = this.configService.get<string>(
      'GOOGLE_DOCUMENT_AI_PROCESSOR_ID',
    );

    this.client = new DocumentProcessorServiceClient({
      credentials: {
        client_email: this.configService.get<string>('GOOGLE_CLIENT_EMAIL'),
        private_key: this.configService
          .get<string>('GOOGLE_PRIVATE_KEY')
          .replace(/\\n/g, '\n'),
      },
      projectId: this.configService.get<string>('GOOGLE_PROJECT_ID'),
    });
  }

  async processDocument(filePath: string): Promise<OcrResult> {
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

      if (!document || !document.text) {
        throw new Error('No text was extracted from the document');
      }

      // Calculate average confidence across all pages
      const confidence = document.pages?.reduce((acc, page) => 
        acc + (page.layout?.confidence || 0), 0) / (document.pages?.length || 1) * 100;

      return {
        text: document.text,
        confidence: confidence || 0,
        metadata: {
          mimeType: document.mimeType,
          pageCount: document.pages?.length || 1,
          processingTime: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `Document AI processing failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async validateDocument(filePath: string): Promise<boolean> {
    try {
      const result = await this.processDocument(filePath);
      // Consider a document valid if:
      // 1. It has extracted text
      // 2. The confidence is above 50%
      return result.text.length > 0 && result.confidence > 50;
    } catch (error) {
      this.logger.error(
        `Document validation failed: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  private getMimeType(filePath: string): string {
    const ext = filePath.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'tiff':
        return 'image/tiff';
      default:
        throw new Error(`Unsupported file extension: ${ext}`);
    }
  }
}
