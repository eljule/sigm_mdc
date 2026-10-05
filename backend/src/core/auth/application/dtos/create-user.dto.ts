import { IsNotEmpty, IsString, IsArray, IsOptional, IsEmail, MinLength, ValidateIf } from 'class-validator';
import { TrimLower, TrimUpper } from '../../../../common/transformers/string-sanitizer.transformer';

export class CreateUserDto {
  @TrimLower()
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña inicial es obligatoria' })
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password!: string;

  @TrimUpper()
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName!: string;

  @TrimLower()
  @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  @IsOptional()
  email?: string;

  @TrimUpper()
  @IsString()
  @IsNotEmpty({ message: 'El rol principal es obligatorio' })
  role!: string;

  @IsArray({ message: 'Los módulos permitidos deben ser una lista' })
  allowedModules!: string[];

  @IsString()
  @IsOptional()
  personId?: string;
}

export class UpdatePermissionsDto {
  @TrimUpper()
  @IsString()
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  role!: string;

  @IsArray({ message: 'Los módulos permitidos deben ser una lista' })
  allowedModules!: string[];
}
