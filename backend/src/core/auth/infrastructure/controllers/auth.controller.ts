import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { ManageUsersUseCase, UserDetailDto } from '../../application/use-cases/manage-users.use-case';
import { LoginDto } from '../../application/dtos/login.dto';
import { CreateUserDto, UpdatePermissionsDto } from '../../application/dtos/create-user.dto';
import { AuthResponseDto } from '../../application/dtos/auth-response.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

export const SYSTEM_ROLE_PRESETS = [
  {
    role: 'Administrador Central',
    description: 'Acceso total y configuración de todos los subsistemas del SIGM.',
    allowedModules: ['central_dashboard', 'transport_licenses', 'it_inventory', 'helpdesk_support'],
    color: '#16a34a',
  },
  {
    role: 'Técnico de Soporte e ITAM',
    description: 'Gestión de activos tecnológicos, marcas, modelos y atención operativa de incidencias informáticas.',
    allowedModules: ['central_dashboard', 'it_inventory', 'helpdesk_support'],
    color: '#2563eb',
  },
  {
    role: 'Operador de Transportes',
    description: 'Empadronamiento de vehículos menores, emisión de licencias y fiscalización.',
    allowedModules: ['transport_licenses', 'helpdesk_support'],
    color: '#ea580c',
  },
  {
    role: 'Personal General / Reportante',
    description: 'Acceso al portal de solicitudes y emisión de tickets de soporte técnico institucional.',
    allowedModules: ['helpdesk_support'],
    color: '#7c3aed',
  },
];

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly manageUsersUseCase: ManageUsersUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<AuthResponseDto>> {
    const authResult = await this.loginUseCase.execute(loginDto);
    return ApiResponseDto.ok(authResult, 'Autenticación exitosa');
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async listUsers(): Promise<ApiResponseDto<UserDetailDto[]>> {
    const users = await this.manageUsersUseCase.listAll();
    return ApiResponseDto.ok(users, 'Listado de usuarios obtenido exitosamente');
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createUser(@Body() dto: CreateUserDto): Promise<ApiResponseDto<UserDetailDto>> {
    const user = await this.manageUsersUseCase.createUser(dto);
    return ApiResponseDto.ok(user, 'Usuario y permisos configurados exitosamente');
  }

  @Put('users/:id/permissions')
  @HttpCode(HttpStatus.OK)
  async updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionsDto,
  ): Promise<ApiResponseDto<UserDetailDto>> {
    const updated = await this.manageUsersUseCase.updatePermissions(id, dto);
    return ApiResponseDto.ok(updated, 'Permisos actualizados correctamente');
  }

  @Patch('users/:id/toggle-status')
  @HttpCode(HttpStatus.OK)
  async toggleStatus(@Param('id') id: string): Promise<ApiResponseDto<UserDetailDto>> {
    const updated = await this.manageUsersUseCase.toggleActive(id);
    return ApiResponseDto.ok(updated, 'Estado del usuario actualizado');
  }

  @Get('roles-templates')
  @HttpCode(HttpStatus.OK)
  async getRolesTemplates(): Promise<ApiResponseDto<typeof SYSTEM_ROLE_PRESETS>> {
    return ApiResponseDto.ok(
      SYSTEM_ROLE_PRESETS,
      'Plantillas de roles y permisos del SIGM obtenidas',
    );
  }
}
