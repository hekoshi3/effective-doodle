import { IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  username!: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}
