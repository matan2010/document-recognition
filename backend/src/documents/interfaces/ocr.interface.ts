export interface OcrResult {
    text: string;
    confidence: number;
    metadata: Record<string, any>;
}

export interface IOcrService {
    processDocument(filePath: string): Promise<OcrResult>;
    validateDocument(filePath: string): Promise<boolean>;
}
