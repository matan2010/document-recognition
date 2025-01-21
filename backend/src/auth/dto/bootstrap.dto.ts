import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class BootstrapDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value?.trim())
    companyName: string;

    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value?.trim().toLowerCase())
    adminEmail: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    adminPassword: string;
}
