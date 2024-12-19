import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
    @ApiProperty({ description: 'Document title', required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ description: 'Client reference ID (company\'s internal ID)', required: true })
    @IsString()
    // @IsUUID()
    clientId: string;
}
