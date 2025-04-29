import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FileService } from './services/file.service';
import { OcrServiceProvider } from './providers/ocr.provider';
import { GoogleCloudConfig } from '../config/google-cloud.config';
import { OpenRouterConfig } from '../config/openrouter.config';
import { OpenRouterService } from './services/openrouter.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    FileService,
    OcrServiceProvider,
    GoogleCloudConfig,
    OpenRouterConfig,
    OpenRouterService
  ],
  exports: [DocumentsService]
})
export class DocumentsModule {}
