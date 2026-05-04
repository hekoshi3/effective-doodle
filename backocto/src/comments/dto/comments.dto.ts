import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CommentDto {
  @IsNotEmpty()
  @IsString()
  text!: string;

  @IsOptional()
  @IsInt()
  image?: number;

  @IsOptional()
  @IsInt()
  aimodel?: number;
}
