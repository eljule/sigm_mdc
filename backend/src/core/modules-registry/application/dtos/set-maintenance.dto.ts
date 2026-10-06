import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SetMaintenanceDto {
  @IsBoolean()
  @IsNotEmpty({ message: 'El estado isUnderMaintenance es obligatorio' })
  isUnderMaintenance!: boolean;

  @IsString()
  @IsOptional()
  maintenanceMessage?: string | null;

  @IsString()
  @IsOptional()
  estimatedRecoveryTime?: string | null;
}
