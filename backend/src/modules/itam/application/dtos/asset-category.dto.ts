import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { CustomFieldDefinition } from '../../domain/entities/asset-category.entity';

export class CreateAssetCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de prefijo es obligatorio (ej. PC, MON, LAP)' })
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  customFieldsSchema?: CustomFieldDefinition[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAssetCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsArray()
  customFieldsSchema?: CustomFieldDefinition[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
