import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsArray,
} from 'class-validator';
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../infrastructure/persistence/entities/ticket.typeorm.entity';
import { TrimUpper, TrimLower, Trim } from '../../../../common/transformers/string-sanitizer.transformer';

export class CreateTicketDto {
  @TrimUpper()
  @IsString()
  @IsNotEmpty({ message: 'El nombre del solicitante es requerido' })
  applicantName!: string;

  @Trim()
  @IsString()
  @IsOptional()
  applicantPhone?: string;

  @TrimLower()
  @IsString()
  @IsOptional()
  applicantEmail?: string;

  @IsUUID()
  @IsOptional()
  applicantId?: string;

  @IsUUID()
  @IsOptional()
  officeId?: string;

  @TrimUpper()
  @IsString()
  @IsNotEmpty({ message: 'La oficina o dependencia es requerida' })
  officeName!: string;

  @IsUUID()
  @IsOptional()
  assetId?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  assetComputerCode?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  assetCategory?: string;

  @IsEnum(TicketCategory)
  @IsNotEmpty()
  category!: TicketCategory;

  @IsEnum(TicketPriority)
  @IsNotEmpty()
  priority!: TicketPriority;

  @IsString()
  @IsNotEmpty({ message: 'El asunto es requerido' })
  subject!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción de la falla es requerida' })
  description!: string;

  @IsString()
  @IsOptional()
  evidencePhotoUrl?: string;
}

export class TakeTicketDto {
  @IsUUID()
  @IsOptional()
  technicianId?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del técnico es requerido' })
  technicianName!: string;

  @IsString()
  @IsOptional()
  technicianPhone?: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status!: TicketStatus;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  technicianNotes?: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;
}

export class AddTechnicalDetailDto {
  @IsString()
  @IsOptional()
  confirmedCategory?: string;

  @IsString()
  @IsNotEmpty({ message: 'El diagnóstico verificado es requerido' })
  realDiagnosis!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción técnica de la solución es requerida' })
  solutionApplied!: string;

  @IsString()
  @IsOptional()
  technicianObservations?: string;

  @IsBoolean()
  @IsOptional()
  isDefinitiveDecommission?: boolean;

  @IsString()
  @IsOptional()
  decommissionReason?: string;

  @IsString()
  @IsOptional()
  decommissionDestination?: string;

  @IsBoolean()
  @IsOptional()
  publishToKnowledgeBase?: boolean;

  @IsString()
  @IsOptional()
  knowledgeBaseTitle?: string;

  @IsString()
  @IsNotEmpty()
  technicianName!: string;
}

export class AddSupplyToTicketDto {
  @IsUUID()
  @IsNotEmpty()
  supplyId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  technicianName!: string;
}

export class AssignProvisionalAssetDto {
  @IsUUID()
  @IsNotEmpty()
  temporaryAssetId!: string;

  @IsUUID()
  @IsNotEmpty()
  damagedAssetId!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  technicianName!: string;
}

export class ReturnProvisionalAssetDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  technicianName!: string;
}

export class UserConformityDto {
  @IsBoolean()
  userConformity!: boolean;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  userRating?: number;

  @IsString()
  @IsOptional()
  userFeedback?: string;

  @IsString()
  @IsNotEmpty()
  applicantName!: string;
}

export class CreateKnowledgeArticleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsOptional()
  symptoms?: string;

  @IsString()
  @IsNotEmpty()
  solutionSteps!: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsUUID()
  @IsOptional()
  sourceTicketId?: string;

  @IsString()
  @IsOptional()
  sourceTicketNumber?: string;

  @IsString()
  @IsNotEmpty()
  authorTechnicianName!: string;
}

export class ReassignTechnicianDto {
  @IsUUID()
  @IsOptional()
  technicianId?: string;

  @IsString()
  @IsNotEmpty()
  technicianName!: string;

  @IsString()
  @IsOptional()
  technicianPhone?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsNotEmpty()
  assignedBy!: string;
}
