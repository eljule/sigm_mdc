import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ManageAuditsUseCase } from '../../application/use-cases/manage-audits.use-case';
import { CreateInventoryAuditDto, VerifyAssetAuditDto } from '../../application/dtos/itam-extended.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller('api/v1/itam/audits')
export class ItamAuditsController {
  constructor(private readonly manageAuditsUseCase: ManageAuditsUseCase) {}

  @Get()
  async list() {
    const list = await this.manageAuditsUseCase.listAudits();
    return ApiResponseDto.ok(list, 'Auditorías anuales de inventario obtenidas');
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const item = await this.manageAuditsUseCase.getAuditById(id);
    return ApiResponseDto.ok(item, 'Detalle de auditoría de inventario obtenido');
  }

  @Get(':id/report')
  async getReport(@Param('id') id: string) {
    const report = await this.manageAuditsUseCase.getConciliationReport(id);
    return ApiResponseDto.ok(report, 'Reporte de conciliación física vs. patrimonial obtenido');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateInventoryAuditDto) {
    const item = await this.manageAuditsUseCase.createAudit(dto);
    return ApiResponseDto.ok(item, 'Auditoría anual iniciada y corte de inventario (snapshot) generado');
  }

  @Post('verify')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async verifyAsset(@Body() dto: VerifyAssetAuditDto) {
    const item = await this.manageAuditsUseCase.verifyAsset(dto);
    return ApiResponseDto.ok(item, 'Verificación física y conciliación registrada');
  }

  @Post(':id/close')
  async closeAudit(@Param('id') id: string, @Body('notes') notes?: string) {
    const item = await this.manageAuditsUseCase.closeAudit(id, notes);
    return ApiResponseDto.ok(item, 'Auditoría anual cerrada exitosamente');
  }
}
