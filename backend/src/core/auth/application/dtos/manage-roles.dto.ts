import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol es obligatorio' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'El código del rol es obligatorio' })
  code!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'El subsistema asociado es obligatorio' })
  subsystemCode!: string; // 'GLOBAL', 'central_dashboard', 'transport_licenses', etc.

  @IsArray()
  @IsOptional()
  permissionCodes?: string[];
}

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  subsystemCode!: string;

  @IsArray()
  @IsOptional()
  permissionCodes?: string[];
}

export class AssignPermissionsDto {
  @IsArray({ message: 'La lista de códigos de permisos es obligatoria' })
  permissionCodes!: string[];
}

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty({ message: 'El código de permiso es obligatorio' })
  code!: string; // ej: 'admin.users.create'

  @IsString()
  @IsNotEmpty({ message: 'El nombre del permiso es obligatorio' })
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'El subsistema es obligatorio' })
  subsystemCode!: string;

  @IsString()
  @IsOptional()
  category?: string;
}
