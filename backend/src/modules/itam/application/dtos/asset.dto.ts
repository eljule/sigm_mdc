import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsObject, IsBoolean } from 'class-validator';
import { AssetStatus, AssetPhysicalCondition } from '../../domain/entities/asset.entity';
import { TrimUpper, Trim } from '../../../../common/transformers/string-sanitizer.transformer';

export class CreateAssetDto {
  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido' })
  @IsNotEmpty({ message: 'La categoría del activo es requerida' })
  categoryId!: string;

  @IsUUID('4', { message: 'El ID de la marca debe ser un UUID válido' })
  @IsNotEmpty({ message: 'La marca del activo es requerida' })
  brandId!: string;

  @IsUUID('4', { message: 'El ID del modelo debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El modelo del activo es requerido' })
  modelId!: string;

  @TrimUpper()
  @IsOptional()
  @IsString()
  patrimonialCode?: string;

  @TrimUpper()
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @TrimUpper()
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsEnum(AssetStatus, { message: 'Estado operativo inválido' })
  status?: AssetStatus;

  @IsOptional()
  @IsEnum(AssetPhysicalCondition, { message: 'Condición física inválida' })
  physicalCondition?: AssetPhysicalCondition;

  @TrimUpper()
  @IsOptional()
  @IsString()
  office?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID del custodio debe ser un UUID válido' })
  assignedPersonId?: string;

  @Trim()
  @IsOptional()
  @IsString()
  acquisitionDate?: string;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @IsOptional()
  @IsUUID('4')
  parentAssetId?: string;

  @TrimUpper()
  @IsOptional()
  @IsString()
  supplier?: string;

  @Trim()
  @IsOptional()
  @IsString()
  warrantyEndDate?: string;

  @IsOptional()
  @IsBoolean()
  isLoanable?: boolean;

  @Trim()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @IsOptional()
  @IsUUID('4')
  brandId?: string;

  @IsOptional()
  @IsUUID('4')
  modelId?: string;

  @IsOptional()
  @IsUUID('4')
  parentAssetId?: string;

  @TrimUpper()
  @IsOptional()
  @IsString()
  supplier?: string;

  @Trim()
  @IsOptional()
  @IsString()
  warrantyEndDate?: string;

  @IsOptional()
  @IsBoolean()
  isLoanable?: boolean;

  @TrimUpper()
  @IsOptional()
  @IsString()
  patrimonialCode?: string;

  @TrimUpper()
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @TrimUpper()
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsEnum(AssetPhysicalCondition)
  physicalCondition?: AssetPhysicalCondition;

  @TrimUpper()
  @IsOptional()
  @IsString()
  office?: string;

  @IsOptional()
  @IsUUID('4')
  assignedPersonId?: string;

  @Trim()
  @IsOptional()
  @IsString()
  acquisitionDate?: string;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @Trim()
  @IsOptional()
  @IsString()
  notes?: string;
}
