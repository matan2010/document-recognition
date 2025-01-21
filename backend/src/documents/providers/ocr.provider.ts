import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleOcrService } from '../services/google-ocr.service';
import { MockOcrService } from '../services/mock-ocr.service';
import { IOcrService } from '../interfaces/ocr.interface';

export const OCR_SERVICE = 'OCR_SERVICE';

export const OcrServiceProvider: Provider = {
    provide: OCR_SERVICE,
    useFactory: (configService: ConfigService): IOcrService => {
        const useGoogleOcrStr = configService.get<string>('USE_GOOGLE_OCR');
        // Convert string to boolean, only true if the string is exactly 'true'
        const useGoogleOcr = useGoogleOcrStr === 'true';
        
        if (useGoogleOcr) {
            return new GoogleOcrService(configService);
        }
        
        return new MockOcrService();
    },
    inject: [ConfigService],
};
