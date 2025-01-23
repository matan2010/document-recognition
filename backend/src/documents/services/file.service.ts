import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);
    private readonly uploadDir = path.join(process.cwd(), 'uploads');
    private readonly allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/tiff'
    ];

    constructor() {
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    isValidFile(file: Express.Multer.File): boolean {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (!file.buffer || file.buffer.length === 0) {
            throw new BadRequestException('File is empty');
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Unsupported file type: ${file.mimetype}. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new BadRequestException(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        }

        return true;
    }

    async saveFile(file: Express.Multer.File, companyId: string): Promise<{ filePath: string; hash: string }> {
        try {
            // Validate file
            this.isValidFile(file);

            // Create company-specific directory
            const companyDir = path.join(this.uploadDir, companyId);
            if (!fs.existsSync(companyDir)) {
                fs.mkdirSync(companyDir, { recursive: true });
            }

            // Generate file hash
            const hash = crypto
                .createHash('sha256')
                .update(file.buffer)
                .digest('hex');

            // Create unique filename with sanitized original name
            const sanitizedName = this.sanitizeFileName(file.originalname);
            const fileName = `${Date.now()}-${hash.substring(0, 8)}-${sanitizedName}`;
            const filePath = path.join(companyDir, fileName);

            // Save file
            await fs.promises.writeFile(filePath, file.buffer);

            this.logger.log(`File saved successfully: ${filePath}`);
            return { filePath, hash };

        } catch (error) {
            this.logger.error(`Failed to save file: ${error.message}`, error.stack);
            throw error;
        }
    }

    private sanitizeFileName(fileName: string): string {
        // Remove any path components
        fileName = path.basename(fileName);
        
        // Replace any non-alphanumeric characters (except dots and dashes) with underscores
        fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Ensure the filename doesn't start with dots or dashes
        fileName = fileName.replace(/^[.-]+/, '');
        
        return fileName;
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
                this.logger.log(`File deleted successfully: ${filePath}`);
            }
        } catch (error) {
            this.logger.error(`Failed to delete file: ${filePath}`, error.stack);
            throw error;
        }
    }

    async getFileStats(filePath: string): Promise<fs.Stats> {
        try {
            return await fs.promises.stat(filePath);
        } catch (error) {
            this.logger.error(`Failed to get file stats: ${filePath}`, error.stack);
            throw error;
        }
    }
}
