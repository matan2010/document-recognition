import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['admin','normal'])
  role: string;

  @IsString()
  @IsNotEmpty()
  companyId: string;
}
