import { IsInt, IsOptional } from 'class-validator';

export class LikesDto {
  @IsOptional()
  @IsInt()
  image?: number;

  @IsOptional()
  @IsInt()
  aimodel?: number;
}
