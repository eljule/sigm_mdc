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
  Query,
} from '@nestjs/common';
import { GetActiveModulesUseCase } from '../../application/use-cases/get-active-modules.use-case';
import { ManageModulesUseCase } from '../../application/use-cases/manage-modules.use-case';
import { ModuleResponseDto } from '../../application/dtos/module-response.dto';
import { CreateModuleDto } from '../../application/dtos/create-module.dto';
import { UpdateModuleDto } from '../../application/dtos/update-module.dto';
import { SetMaintenanceDto } from '../../application/dtos/set-maintenance.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

/**
 * Adaptador de entrada primario (Controlador REST).
 * Expone endpoints para el catálogo de subsistemas, lanzador y gestión de mantenimiento.
 */
@Controller('api/v1/modules')
export class ModuleController {
  constructor(
    private readonly getActiveModulesUseCase: GetActiveModulesUseCase,
    private readonly manageModulesUseCase: ManageModulesUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getModules(
    @Query('all') all?: string,
    @Query('allowed') allowed?: string,
  ): Promise<ApiResponseDto<ModuleResponseDto[]>> {
    if (all === 'true') {
      const allModules = await this.manageModulesUseCase.findAll();
      return ApiResponseDto.ok(
        allModules,
        'Catálogo completo de subsistemas recuperado exitosamente',
      );
    }

    let modules = await this.getActiveModulesUseCase.execute();

    if (allowed && allowed.trim().length > 0) {
      const allowedList = allowed.split(',').map((c) => c.trim().toLowerCase());
      modules = modules.filter((m) => allowedList.includes(m.code.toLowerCase()));
    }

    return ApiResponseDto.ok(
      modules,
      'Módulos del lanzador recuperados exitosamente',
    );
  }

  @Get(':idOrCode')
  @HttpCode(HttpStatus.OK)
  async getModuleByIdOrCode(
    @Param('idOrCode') idOrCode: string,
  ): Promise<ApiResponseDto<ModuleResponseDto>> {
    const module = await this.manageModulesUseCase.findByIdOrCode(idOrCode);
    return ApiResponseDto.ok(module, 'Subsistema encontrado');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createModule(
    @Body() dto: CreateModuleDto,
  ): Promise<ApiResponseDto<ModuleResponseDto>> {
    const module = await this.manageModulesUseCase.create(dto);
    return ApiResponseDto.ok(module, 'Subsistema registrado exitosamente');
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateModule(
    @Param('id') id: string,
    @Body() dto: UpdateModuleDto,
  ): Promise<ApiResponseDto<ModuleResponseDto>> {
    const module = await this.manageModulesUseCase.update(id, dto);
    return ApiResponseDto.ok(module, 'Subsistema actualizado exitosamente');
  }

  @Patch(':id/maintenance')
  @HttpCode(HttpStatus.OK)
  async setMaintenance(
    @Param('id') id: string,
    @Body() dto: SetMaintenanceDto,
  ): Promise<ApiResponseDto<ModuleResponseDto>> {
    const module = await this.manageModulesUseCase.setMaintenance(id, dto);
    const msg = module.isUnderMaintenance
      ? `El subsistema "${module.name}" ha sido puesto en MODO MANTENIMIENTO`
      : `El subsistema "${module.name}" ha sido RESTABLECIDO y se encuentra operativo`;
    return ApiResponseDto.ok(module, msg);
  }
}
