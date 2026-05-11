import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AiModelType } from '../../generated/prisma/client';

export class UpdateModelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  model_type?: AiModelType;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  featured_imageId?: number;
}
