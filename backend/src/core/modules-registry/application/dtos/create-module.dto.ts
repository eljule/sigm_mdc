import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Trim } from '../../../../common/transformers/string-sanitizer.transformer';
import { SecondaryAction } from '../../domain/entities/module.entity';

export class CreateModuleDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El código del subsistema es obligatorio' })
  code!: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El nombre del subsistema es obligatorio' })
  name!: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'La descripción del subsistema es obligatoria' })
  description!: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El icono o emoji del subsistema es obligatorio' })
  iconUrl!: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'La ruta de acceso es obligatoria' })
  route!: string;

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
  maintenanceMessage?: string;

  @IsString()
  @IsOptional()
  estimatedRecoveryTime?: string;
}
