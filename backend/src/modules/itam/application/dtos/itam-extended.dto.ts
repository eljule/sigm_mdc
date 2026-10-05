import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// -----------------------------------------------------------------------------
// SOFTWARE DTOs (RF-02 & RF-06)
// -----------------------------------------------------------------------------
export class CreateSoftwareDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del software es requerido' })
  name!: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  developer?: string;

  @IsOptional()
  @IsString()
  licenseType?: string; // OEM, RETAIL, VOLUMEN, OPEN_SOURCE, SUSCRIPCION

  @IsOptional()
  @IsString()
  licenseKey?: string;

  @IsOptional()
  @IsNumber()
  totalLicenses?: number;

  @IsOptional()
  @IsString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSoftwareDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  developer?: string;

  @IsOptional()
  @IsString()
  licenseType?: string;

  @IsOptional()
  @IsString()
  licenseKey?: string;

  @IsOptional()
  @IsNumber()
  totalLicenses?: number;

  @IsOptional()
  @IsString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AssignSoftwareDto {
  @IsUUID('4')
  @IsNotEmpty()
  softwareId!: string;

  @IsOptional()
  @IsString()
  licenseKeyUsed?: string;
}

// -----------------------------------------------------------------------------
// MOVEMENTS & TRANSFERS DTOs (RF-07, RF-08, RF-09, RF-10)
// -----------------------------------------------------------------------------
export class CreateMovementDto {
  @IsUUID('4')
  @IsNotEmpty({ message: 'El activo es requerido' })
  assetId!: string;

  @IsString()
  @IsNotEmpty({ message: 'La oficina de destino es requerida' })
  toOffice!: string;

  @IsOptional()
  @IsUUID('4')
  toPersonId?: string;

  @IsString()
  @IsNotEmpty({ message: 'El motivo del traslado es requerido' })
  reason!: string;

  @IsOptional()
  @IsString()
  movementType?: string; // ASIGNACION_INICIAL, TRANSFERENCIA, DEVOLUCION_ALMACEN, BAJA_TECNICA

  @IsOptional()
  @IsString()
  technicianName?: string;

  @IsOptional()
  @IsString()
  newCustodianName?: string;

  @IsOptional()
  @IsBoolean()
  includeChildrenInTransfer?: boolean;

  @IsOptional()
  @IsBoolean()
  cascadeChildren?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

// -----------------------------------------------------------------------------
// SUPPLIES DTOs (RF-14)
// -----------------------------------------------------------------------------
export class CreateSupplyDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del insumo es requerido' })
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNumber()
  stock!: number;

  @IsOptional()
  @IsNumber()
  minStock?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  compatibleModels?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSupplyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsNumber()
  minStock?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  compatibleModels?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AdjustSupplyStockDto {
  @IsNumber()
  @IsNotEmpty({ message: 'La cantidad a ajustar es requerida' })
  quantityDelta!: number;

  @IsString()
  @IsNotEmpty({ message: 'El motivo del ajuste es requerido' })
  reason!: string;
}

// -----------------------------------------------------------------------------
// MAINTENANCE DTOs (RF-13, RF-15, RF-16)
// -----------------------------------------------------------------------------
export class ConsumeSupplyDto {
  @IsUUID('4')
  @IsNotEmpty()
  supplyId!: string;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;
}

export class CreateMaintenanceOrderDto {
  @IsUUID('4')
  @IsNotEmpty({ message: 'El activo a intervenir es requerido' })
  assetId!: string;

  @IsOptional()
  @IsString()
  type?: string; // PREVENTIVO, CORRECTIVO

  @IsOptional()
  @IsString()
  maintenanceType?: string;

  @IsOptional()
  @IsString()
  priority?: string; // BAJA, MEDIA, ALTA, URGENTE

  @IsOptional()
  @IsString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  reportedFailure?: string;

  @IsOptional()
  @IsString()
  failureReported?: string;

  @IsOptional()
  @IsString()
  technicianName?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  supplies?: ConsumeSupplyDto[];
}

export class CompleteMaintenanceOrderDto {
  @IsString()
  @IsNotEmpty({ message: 'El diagnóstico técnico es requerido' })
  diagnosis!: string;

  @IsString()
  @IsNotEmpty({ message: 'Las acciones realizadas son requeridas' })
  actionsTaken!: string;

  @IsOptional()
  @IsString()
  technicianName?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsumeSupplyDto)
  suppliesUsed?: ConsumeSupplyDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConsumeSupplyDto)
  supplies?: ConsumeSupplyDto[];
}

// -----------------------------------------------------------------------------
// LOANS & RESERVATIONS DTOs (RF-17, RF-18, RF-19, RF-20)
// -----------------------------------------------------------------------------
export class CreateAssetLoanDto {
  @IsString()
  @IsNotEmpty({ message: 'La dependencia solicitante es requerida' })
  requestingOffice!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del responsable solicitante es requerido' })
  borrowerName!: string;

  @IsOptional()
  @IsUUID('4')
  requestingPersonId?: string;

  @IsString()
  @IsNotEmpty({ message: 'La fecha y hora de inicio es requerida' })
  startDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'La fecha estimada de retorno es requerida' })
  expectedReturnDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'El motivo del evento/reunión es requerido' })
  eventReason!: string;

  @IsArray()
  @IsNotEmpty({ message: 'Debe seleccionar al menos un activo para el préstamo' })
  assetIds!: string[];

  @IsOptional()
  @IsString()
  technicianName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReturnAssetLoanDto {
  @IsString()
  @IsNotEmpty({ message: 'La condición de retorno del equipo es requerida' })
  returnCondition!: string; // BUENO, CON_OBSERVACIONES, DAÑADO

  @IsOptional()
  @IsString()
  notes?: string;
}

// -----------------------------------------------------------------------------
// INVENTORY AUDIT & CONCILIATION DTOs (RF-11, RF-12)
// -----------------------------------------------------------------------------
export class CreateInventoryAuditDto {
  @IsNumber()
  @IsNotEmpty({ message: 'El año fiscal de inventario es requerido' })
  year!: number;

  @IsString()
  @IsNotEmpty({ message: 'El título del inventario anual es requerido' })
  title!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class VerifyAssetAuditDto {
  @IsUUID('4')
  @IsNotEmpty()
  auditId!: string;

  @IsUUID('4')
  @IsNotEmpty()
  assetId!: string;

  @IsString()
  @IsNotEmpty()
  foundOffice!: string;

  @IsString()
  @IsNotEmpty()
  status!: string; // CONCILIADO, TRASLADADO_NO_AUTORIZADO, NO_HABIDO, DETERIORADO

  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
