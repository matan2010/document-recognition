import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
    @ApiProperty({ description: 'Client reference ID (company\'s internal ID)', required: true })
    @IsString()
    @IsNotEmpty()
    clientReferenceId: string;

    @ApiProperty({ description: 'Client name', required: true })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Client email', required: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
