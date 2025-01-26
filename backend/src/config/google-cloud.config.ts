import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class GoogleCloudConfig {
  constructor(private configService: ConfigService) {}

  private cachedCredentials: any = null;

  async getCredentials(): Promise<any> {
    if (this.cachedCredentials) {
      return this.cachedCredentials;
    }

    const credentialsPath = this.getCredentialsPath();
    
    try {
      // Check if credentials file exists
      await fs.promises.access(credentialsPath);
      
      // Read and parse credentials
      const credentials = JSON.parse(
        await fs.promises.readFile(credentialsPath, 'utf8')
      );

      // Basic validation of required fields
      if (!this.validateCredentials(credentials)) {
        throw new Error('Invalid credentials format');
      }

      this.cachedCredentials = credentials;
      return credentials;
    } catch (error) {
      throw new Error(`Failed to load Google Cloud credentials: ${error.message}`);
    }
  }

  getCredentialsPath(): string {
    // First check if path is specified in environment
    const envPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    if (envPath) {
      return envPath;
    }

    // Default to local credentials file
    return path.join(process.cwd(), 'backend', 'credentials', 'google-credentials.json');
  }

  private validateCredentials(credentials: any): boolean {
    const requiredFields = [
      'type',
      'project_id',
      'private_key_id',
      'private_key',
      'client_email',
    ];

    return requiredFields.every(field => credentials[field]);
  }

  async getProjectId(): Promise<string> {
    const credentials = await this.getCredentials();
    return credentials.project_id;
  }

  getDocumentAILocation(): string {
    return this.configService.get<string>('GOOGLE_DOCUMENT_AI_LOCATION') || 'us';
  }

  getDocumentAIProcessorId(): string {
    return (
      this.configService.get<string>('GOOGLE_DOCUMENT_AI_PROCESSOR_ID') ||
      '1d6981e46b0d570b'
    );
  }
}
