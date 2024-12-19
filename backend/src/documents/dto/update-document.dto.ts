import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateDocumentDto } from './create-document.dto';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @ApiPropertyOptional({
    description: 'Document title',
    example: 'Updated Israeli ID Card'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Document content (OCR results)',
    example: 'Text content extracted from the document'
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the document',
    example: {
      documentType: 'ID_CARD',
      issueDate: '2024-01-19',
      expiryDate: '2034-01-19',
      lastModifiedBy: 'user@example.com'
    }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}