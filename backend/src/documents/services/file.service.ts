import { Injectable, Logger } from '@nestjs/common';
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

    async saveFile(file: Express.Multer.File, companyId: string): Promise<{ filePath: string; hash: string }> {
        try {
            // Validate file type
            if (!this.allowedMimeTypes.includes(file.mimetype)) {
                throw new Error(`Unsupported file type: ${file.mimetype}`);
            }

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

            // Create unique filename
            const fileName = `${Date.now()}-${hash.substring(0, 8)}-${file.originalname}`;
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

    isValidFile(file: Express.Multer.File): boolean {
        return (
            file &&
            file.buffer &&
            file.originalname &&
            this.allowedMimeTypes.includes(file.mimetype)
        );
    }
}
