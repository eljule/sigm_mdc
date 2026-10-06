import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Trim } from '../../../../common/transformers/string-sanitizer.transformer';
import { SecondaryAction } from '../../domain/entities/module.entity';

export class UpdateModuleDto {
  @Trim()
  @IsString()
  @IsOptional()
  code?: string;

  @Trim()
  @IsString()
  @IsOptional()
  name?: string;

  @Trim()
  @IsString()
  @IsOptional()
  description?: string;

  @Trim()
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @Trim()
  @IsString()
  @IsOptional()
  route?: string;

  @Trim()
  @IsString()
  @IsOptional()
  accentColor?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresAuth?: boolean;

  @IsOptional()
  secondaryAction?: SecondaryAction | null;

  @IsBoolean()
  @IsOptional()
  isUnderMaintenance?: boolean;

  @IsString()
  @IsOptional()
  maintenanceMessage?: string | null;

  @IsString()
  @IsOptional()
  estimatedRecoveryTime?: string | null;
}
