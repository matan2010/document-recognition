import { PartialType, ApiProperty} from '@nestjs/swagger';
import { CreateDocumentDto } from './create-document.dto';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
    @ApiProperty({ description: 'Document title', required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ description: 'Document content', required: false })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiProperty({ description: 'Document metadata', required: false })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}