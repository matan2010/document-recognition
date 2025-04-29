import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenRouterConfig {
  constructor(private configService: ConfigService) {}

  getApiKey(): string {
    // First try to get from environment variables
    const envKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (envKey) {
      return envKey;
    }
    
    // If not found in environment, use a default key (REPLACE THIS WITH YOUR ACTUAL KEY)
    // WARNING: This is not secure for production use
    return 'your_openrouter_api_key_here';
  }

  getApiUrl(): string {
    return this.configService.get<string>('OPENROUTER_API_URL') || 'https://openrouter.ai/api/v1/chat/completions';
  }

  getModel(): string {
    return this.configService.get<string>('OPENROUTER_MODEL') || 'anthropic/claude-3-opus:beta';
  }
}
