import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { GetActiveModulesUseCase } from '../../application/use-cases/get-active-modules.use-case';
import { ModuleResponseDto } from '../../application/dtos/module-response.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

/**
 * Adaptador de entrada primario (Controlador REST).
 * Expone el endpoint de consulta de módulos del lanzador del SIGM.
 */
@Controller('api/v1/modules')
export class ModuleController {
  constructor(private readonly getActiveModulesUseCase: GetActiveModulesUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getActiveModules(): Promise<ApiResponseDto<ModuleResponseDto[]>> {
    const modules = await this.getActiveModulesUseCase.execute();
    return ApiResponseDto.ok(
      modules,
      'Módulos del lanzador recuperados exitosamente',
    );
  }
}
