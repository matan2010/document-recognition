import { Injectable, Logger } from '@nestjs/common';
import { OpenRouterConfig } from '../../config/openrouter.config';

export interface LeaseAgreementData {
  tenantName?: string;
  landlordName?: string;
  propertyAddress?: string;
  leaseTerm?: string;
  startDate?: string;
  endDate?: string;
  monthlyRent?: string;
  securityDeposit?: string;
  specialConditions?: string[];
  [key: string]: any; // Allow for additional fields
}

export interface OpenRouterResponse {
  data: LeaseAgreementData;
  metadata: {
    processedAt: string;
    provider: string;
    model: string;
  };
}

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);

  constructor(private openRouterConfig: OpenRouterConfig) {}

  async processLeaseAgreement(documentText: string): Promise<OpenRouterResponse> {
    try {
      this.logger.log('Processing lease agreement with OpenRouter API');
      
      const apiKey = this.openRouterConfig.getApiKey();
      if (!apiKey) {
        throw new Error('OpenRouter API key is not configured');
      }

      const apiUrl = this.openRouterConfig.getApiUrl();
      const model ='deepseek/deepseek-r1:free';// this.openRouterConfig.getModel();

      const systemPrompt = `
אתה עוזר מומחה שמחלץ מידע מובנה מהסכמי שכירות.

חלץ את המידע הבא והחזר רק אובייקט JSON תקף עם השדות הבאים:
- tenantName: השמות המלאים של כל השוכרים
- landlordName: השמות המלאים של כל המשכירים או מנהלי הנכסים
- monthlyRent: סכום שכר הדירה החודשי

אם שדה לא נמצא אז תשאיר אותו ריק .

אין לכלול הסברים, הערות או עיצוב הנחות בתשובתך.
החזר רק אובייקט JSON תקף.`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: documentText
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API returned status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Extract the assistant's response
      const assistantMessage = responseData.choices[0]?.message?.content;
      
      // Try to parse the response as JSON
      let parsedData: LeaseAgreementData;
      try {
        // The response might be a JSON string or might contain JSON within markdown code blocks
        const jsonMatch = assistantMessage.match(/```json\s*([\s\S]*?)\s*```/) || 
                          assistantMessage.match(/```\s*([\s\S]*?)\s*```/);
        
        if (jsonMatch && jsonMatch[1]) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          // Try parsing the whole response as JSON
          parsedData = JSON.parse(assistantMessage);
        }
      } catch (error) {
        this.logger.warn('Failed to parse OpenRouter response as JSON, returning raw response');
        parsedData = { rawResponse: assistantMessage };
      }

      return {
        data: parsedData,
        metadata: {
          processedAt: new Date().toISOString(),
          provider: 'openrouter',
          model: model
        }
      };
    } catch (error) {
      this.logger.error('OpenRouter API processing failed:', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
