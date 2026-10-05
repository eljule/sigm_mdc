import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ManageRolesUseCase } from '../../application/use-cases/manage-roles.use-case';
import { ManagePermissionsUseCase } from '../../application/use-cases/manage-permissions.use-case';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  CreatePermissionDto,
} from '../../application/dtos/manage-roles.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller('api/v1')
export class RolesPermissionsController {
  constructor(
    private readonly manageRolesUseCase: ManageRolesUseCase,
    private readonly managePermissionsUseCase: ManagePermissionsUseCase,
  ) {}

  // ===========================================================================
  // ROLES
  // ===========================================================================
  @Get('roles')
  @HttpCode(HttpStatus.OK)
  async getRoles() {
    const roles = await this.manageRolesUseCase.listAll();
    return ApiResponseDto.ok(roles.map((r) => r.toObject()), 'Roles obtenidos exitosamente');
  }

  @Get('roles/:id')
  @HttpCode(HttpStatus.OK)
  async getRoleById(@Param('id') id: string) {
    const role = await this.manageRolesUseCase.findById(id);
    return ApiResponseDto.ok(role.toObject(), 'Detalle del rol recuperado');
  }

  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createRole(@Body() dto: CreateRoleDto) {
    const created = await this.manageRolesUseCase.createRole(dto);
    return ApiResponseDto.ok(created.toObject(), 'Rol institucional creado con éxito');
  }

  @Put('roles/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const updated = await this.manageRolesUseCase.updateRole(id, dto);
    return ApiResponseDto.ok(updated.toObject(), 'Rol actualizado exitosamente');
  }

  @Put('roles/:id/permissions')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    const updated = await this.manageRolesUseCase.assignPermissions(id, dto);
    return ApiResponseDto.ok(
      updated.toObject(),
      `Permisos actualizados correctamente para el rol "${updated.name}"`,
    );
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.OK)
  async deleteRole(@Param('id') id: string) {
    const deleted = await this.manageRolesUseCase.deleteRole(id);
    return ApiResponseDto.ok({ deleted }, 'Rol eliminado exitosamente');
  }

  // ===========================================================================
  // PERMISOS
  // ===========================================================================
  @Get('permissions')
  async getPermissions() {
    const groups = await this.managePermissionsUseCase.listGrouped();
    const flat = await this.managePermissionsUseCase.listAll();
    return ApiResponseDto.ok(
      {
        groups: groups.map((g) => ({
          subsystemCode: g.subsystemCode,
          subsystemName: g.subsystemName,
          color: g.color,
          permissions: g.permissions.map((p) => p.toObject()),
        })),
        total: flat.length,
        items: flat.map((p) => p.toObject()),
      },
      'Catálogo de permisos por subsistema obtenido',
    );
  }

  @Post('permissions')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createPermission(@Body() dto: CreatePermissionDto) {
    const created = await this.managePermissionsUseCase.create(dto);
    return ApiResponseDto.ok(created.toObject(), 'Permiso registrado exitosamente');
  }
}
