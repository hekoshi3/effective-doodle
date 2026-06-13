import { IsNumber, IsOptional, IsString } from 'class-validator';

export class BaseQueryDto {
  @IsOptional() @IsString() ordering?: string;
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsString() created_after?: string;
  @IsOptional() @IsString() feed?: string;
  @IsOptional() @IsString() model_type?: string;
  @IsOptional() @IsString() download_count?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() min_likes?: string;
  @IsOptional() @IsNumber() linked_model?: number;
}
