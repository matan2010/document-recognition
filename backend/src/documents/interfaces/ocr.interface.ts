export interface OcrMetadata {
    processedAt: string;
    provider: string;
    pages: number;
    mimeType: string;
    documentType?: string;
    structuredData: Record<string, string>;
    rawResponse: any;
}

export interface OcrResult {
    text: string;
    confidence: number;
    metadata: OcrMetadata;
}

export interface IOcrService {
    processDocument(filePath: string): Promise<OcrResult>;
    validateDocument(filePath: string): Promise<boolean>;
}
