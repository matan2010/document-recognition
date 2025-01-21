import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({
    description: 'Additional metadata for the document',
    example: {
      documentType: 'ID_CARD',
      issueDate: '2024-01-19',
      expiryDate: '2034-01-19'
    }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
