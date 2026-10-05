import { IsNotEmpty, IsString, IsEnum, IsOptional, IsEmail, IsBoolean, ValidateIf } from 'class-validator';
import { PersonType, DocumentType } from '../../domain/entities/person.entity';
import { TrimUpper, TrimLower, Trim } from '../../../../common/transformers/string-sanitizer.transformer';

export class CreatePersonDto {
  @IsEnum(['ADMINISTRADO', 'PERSONAL'], {
    message: 'El tipo debe ser ADMINISTRADO o PERSONAL',
  })
  @IsNotEmpty()
  type!: PersonType;

  @IsEnum(['DNI', 'RUC', 'CE', 'PASAPORTE'])
  @IsNotEmpty()
  documentType!: DocumentType;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  documentNumber!: string;

  @TrimUpper()
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  firstName!: string;

  @TrimUpper()
  @IsString()
  @IsNotEmpty({ message: 'El apellido paterno es obligatorio' })
  paternalSurname!: string;

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

  // Personal
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

  // Administrado
  @TrimUpper()
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsBoolean()
  @IsOptional()
  allowsOnlineAccess?: boolean;
}
