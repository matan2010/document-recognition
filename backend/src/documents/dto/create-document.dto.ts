import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Define valid document types
export enum DocumentType {
  ID = 'id',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'driversLicense'
}

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Client reference ID',
    example: 'CLIENT001'
  })
  @IsString()
  clientId: string;

  @ApiProperty({
    description: 'Document title',
    example: 'Israeli ID Card'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Type of document to process',
    enum: DocumentType,
    example: DocumentType.ID,
    default: DocumentType.ID
  })
  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType = DocumentType.ID;

  @ApiPropertyOptional({
    description: 'Additional metadata for the document',
    example: {
      issueDate: '2024-01-19',
      expiryDate: '2034-01-19'
    }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
