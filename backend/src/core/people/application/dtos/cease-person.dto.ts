import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { TrimUpper } from '../../../../common/transformers/string-sanitizer.transformer';

export class CeasePersonDto {
  @IsString()
  @IsNotEmpty({ message: 'La fecha de cese es requerida' })
  departureDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'El motivo del cese es obligatorio' })
  @TrimUpper()
  cessationReason!: string;

  @IsOptional()
  @IsBoolean()
  deactivateUser?: boolean;

  @IsOptional()
  @IsBoolean()
  returnAssetsToWarehouse?: boolean;

  @IsOptional()
  @IsString()
  @TrimUpper()
  warehouseOffice?: string;

  @IsOptional()
  @IsString()
  @TrimUpper()
  authorizedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export interface PersonCessationInfoItem {
  person: {
    id: string;
    fullName: string;
    documentType: string;
    documentNumber: string;
    type: string;
    position: string | null;
    office: string | null;
    laborCondition: string | null;
    laborStatus: string;
    isActive: boolean;
    entryDate: string | null;
  };
  userAccount: {
    id: string;
    username: string;
    fullName: string;
    role: string;
    isActive: boolean;
  } | null;
  assignedAssets: Array<{
    id: string;
    computerCode: string;
    patrimonialCode: string | null;
    categoryName: string;
    brandName: string;
    modelName: string;
    status: string;
    office: string | null;
  }>;
}

export interface CeasePersonResult {
  personId: string;
  fullName: string;
  laborStatus: string;
  departureDate: string;
  cessationReason: string;
  userDeactivated: boolean;
  returnedAssetsCount: number;
  actasGenerated: string[];
}
