import { Injectable, Logger } from '@nestjs/common';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { IOcrService, OcrResult } from '../interfaces/ocr.interface';
import { GoogleCloudConfig } from '../../config/google-cloud.config';
import * as fs from 'fs';
import * as path from 'path';
import { OpenRouterService } from './openrouter.service';

// Import processors configuration
import * as processors from './processors.json';

@Injectable()
export class GoogleOcrService implements IOcrService {
  private readonly logger = new Logger(GoogleOcrService.name);
  private readonly client: DocumentProcessorServiceClient;
  // private readonly location: string;
  // private readonly processorId: string;

  constructor(
    private googleConfig: GoogleCloudConfig,
    private openRouterService: OpenRouterService
  ) {
    try {
      // this.location = this.googleConfig.getDocumentAILocation();
      // this.processorId = this.googleConfig.getDocumentAIProcessorId();

      const credentialsPath = this.googleConfig.getCredentialsPath();
      this.logger.log('Initializing Document AI client');

      this.client = new DocumentProcessorServiceClient({
        keyFilename: credentialsPath,
      });

      this.logger.log('Document AI client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Document AI client:', error);
      throw error;
    }
  }

  async processDocument(filePath: string, documentType: string = 'id'): Promise<OcrResult> {
    try {
      this.logger.log(`Starting Document AI processing for file: ${filePath} with document type: ${documentType}`);

      // Validate file exists and is readable
      if (!(await this.validateDocument(filePath))) {
        throw new Error(`Invalid or unreadable file: ${filePath}`);
      }

      // Read the file into a buffer
      const buffer = await fs.promises.readFile(filePath);
      const mimeType = this.getMimeType(filePath);
      this.logger.log(
        `File read successfully. Size: ${buffer.length} bytes, MIME type: ${mimeType}`,
      );

      // Get project ID from credentials
      const projectId = await this.googleConfig.getProjectId();

      //get processor id from according document type
      const processor = processors[documentType];
      
      const name = `projects/${projectId}/locations/${processor.location}/processors/${processor.id}`;
      this.logger.log(`Using processor: ${name}`);

      // Configure the request
      const request = {
        name,
        rawDocument: {
          content: buffer,
          mimeType: mimeType,
        },
      };

      this.logger.log('Sending request to Document AI...');
      //throw new Error('test test test test');      // Process the document
        const [result] = await this.client.processDocument(request);

        if (!result.document) {
          throw new Error('No document in response from Document AI');
        }

        const document = result.document;
        this.logger.log(
          'Document processed successfully. Pages:',
          document.pages?.length,
        );

        // Calculate average confidence
        let confidence = 0;
        if (document.pages && document.pages.length > 0) {
          confidence =
            document.pages.reduce(
              (acc, page) => acc + (page.layout?.confidence || 0),
              0,
            ) / document.pages.length;
        }

        // Extract structured data from the document
        const extractStructuredData = (doc) => {
          const structuredData = {};
          
          if (doc.pages) {
            doc.pages.forEach((page, pageIndex) => {
              // Extract form fields
              page.formFields?.forEach(field => {
                if (field.fieldName?.textAnchor?.content && field.fieldValue?.textAnchor?.content) {
                  structuredData[field.fieldName.textAnchor.content.trim()] = field.fieldValue.textAnchor.content.trim();
                }
              });

              // Extract entities
              page.entities?.forEach(entity => {
                if (entity.type && entity.mentionText) {
                  structuredData[`${entity.type}`] = entity.mentionText;
                }
              });

              // Try to identify key-value pairs in paragraphs
              page.paragraphs?.forEach(paragraph => {
                const text = paragraph.textAnchor?.content || '';
                const keyValueMatch = text.match(/^([^:]+):(.+)$/);
                if (keyValueMatch) {
                  const [, key, value] = keyValueMatch;
                  const trimmedKey = key.trim();
                  const trimmedValue = value.trim();
                  if (trimmedKey && trimmedValue && !structuredData[trimmedKey]) {
                    structuredData[trimmedKey] = trimmedValue;
                  }
                }
              });
            });
          }
          
          return structuredData;
        };

        const structuredData = extractStructuredData(document);
        
        // For lease agreements, use OpenRouter API to extract additional structured data
        let openRouterData = {};
        if (documentType === 'leaseAgreement') {
          try {
            this.logger.log('Processing lease agreement with OpenRouter API');
            const openRouterResponse = await this.openRouterService.processLeaseAgreement(document.text || '');
            openRouterData = openRouterResponse.data;
            this.logger.log('Successfully processed lease agreement with OpenRouter API');
          } catch (error) {
            this.logger.error('OpenRouter processing failed:', error);
            // Continue with the regular response even if OpenRouter fails
          }
        }

        const response = {
          text: document.text || '',
          confidence: confidence,
          metadata: {
            processedAt: new Date().toISOString(),
            provider: documentType === 'leaseAgreement' 
              ? 'Google Document AI and OpenRouter'
              : 'Google Document AI',
            pages: document.pages?.length || 0,
            mimeType: document.mimeType,
            structuredData: documentType === 'leaseAgreement' 
              ? { ...structuredData, ...openRouterData }
              : structuredData,
            rawResponse: document,
            ...(documentType === 'leaseAgreement' && { openRouterData }),
          },
        };

        this.logger.log('Successfully created response object');
        return response;
      } catch (error) {
        this.logger.error('Document AI processing failed:', {
          error: error.message,
          code: error.code,
          details: error.details,
          stack: error.stack,
        });
        throw error;
      }
  }

  private getMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    switch (extension) {
      case '.pdf':
        return 'application/pdf';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.tiff':
      case '.tif':
        return 'image/tiff';
      default:
        return 'application/octet-stream';
    }
  }

  async validateDocument(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      const stats = await fs.promises.stat(filePath);
      return stats.isFile() && stats.size > 0;
    } catch {
      return false;
    }
  }
}
