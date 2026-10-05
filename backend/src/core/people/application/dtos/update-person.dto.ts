import { IsString, IsEnum, IsOptional, IsEmail, IsBoolean, ValidateIf } from 'class-validator';
import { PersonType, DocumentType } from '../../domain/entities/person.entity';
import { TrimUpper, TrimLower, Trim } from '../../../../common/transformers/string-sanitizer.transformer';

export class UpdatePersonDto {
  @IsEnum(['ADMINISTRADO', 'PERSONAL'], {
    message: 'El tipo debe ser ADMINISTRADO o PERSONAL',
  })
  @IsOptional()
  type?: PersonType;

  @IsEnum(['DNI', 'RUC', 'CE', 'PASAPORTE'])
  @IsOptional()
  documentType?: DocumentType;

  @Trim()
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  firstName?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  paternalSurname?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  maternalSurname?: string;

  @TrimLower()
  @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @IsOptional()
  email?: string;

  @Trim()
  @IsString()
  @IsOptional()
  phone?: string;

  @Trim()
  @IsString()
  @IsOptional()
  address?: string;

  // Atributos específicos para PERSONAL
  @TrimUpper()
  @IsString()
  @IsOptional()
  position?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  office?: string;

  @TrimUpper()
  @IsString()
  @IsOptional()
  laborCondition?: string;

  @Trim()
  @IsString()
  @IsOptional()
  entryDate?: string;

  // Atributos específicos para ADMINISTRADO
  @TrimUpper()
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsBoolean()
  @IsOptional()
  allowsOnlineAccess?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
