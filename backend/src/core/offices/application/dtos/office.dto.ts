import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { TrimUpper, Trim } from '../../../../common/transformers/string-sanitizer.transformer';

export class CreateOfficeDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  code!: string;

  @TrimUpper()
  @IsString()
  @IsNotEmpty()
  acronym!: string;

  @TrimUpper()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  parentName?: string | null;

  @Trim()
  @IsString()
  @IsOptional()
  parentId?: string | null;

  @TrimUpper()
  @IsString()
  @IsOptional()
  sede?: string;

  @IsNumber()
  @IsOptional()
  level?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateOfficeDto {
  @Trim()
  @IsString()
  @IsOptional()
  code?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  acronym?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  name?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  parentName?: string | null;

  @Trim()
  @IsString()
  @IsOptional()
  parentId?: string | null;

  @TrimUpper()
  @IsString()
  @IsOptional()
  sede?: string;

  @IsNumber()
  @IsOptional()
  level?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
