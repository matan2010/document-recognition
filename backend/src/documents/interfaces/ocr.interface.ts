export interface OcrMetadata {
    processedAt: string;
    provider: string;
    pages: number;
    mimeType: string;
    structuredData?: any;
    rawResponse?: any;
    [key: string]: any;
}

export interface OcrResult {
    text: string;
    confidence: number;
    metadata: {
        provider: string;
        pages: number;
        mimeType: string;
        structuredData?: any;
        rawResponse?: any;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface IOcrService {
    processDocument(filePath: string, documentType?: string): Promise<OcrResult>;
    validateDocument(filePath: string): Promise<boolean>;
}
