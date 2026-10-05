import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ManageMaintenanceUseCase } from '../../application/use-cases/manage-maintenance.use-case';
import {
  CreateSupplyDto,
  UpdateSupplyDto,
  AdjustSupplyStockDto,
  CreateMaintenanceOrderDto,
  CompleteMaintenanceOrderDto,
} from '../../application/dtos/itam-extended.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller('api/v1/itam/maintenance')
export class ItamMaintenanceController {
  constructor(private readonly manageMaintenanceUseCase: ManageMaintenanceUseCase) {}

  // ---------------------------------------------------------------------------
  // ÓRDENES DE MANTENIMIENTO (RF-13, RF-15, RF-16)
  // ---------------------------------------------------------------------------
  @Get('orders')
  async listOrders(@Query('assetId') assetId?: string, @Query('status') status?: string) {
    const list = await this.manageMaintenanceUseCase.listOrders(assetId, status);
    return ApiResponseDto.ok(list, 'Órdenes de mantenimiento obtenidas');
  }

  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    const item = await this.manageMaintenanceUseCase.getOrderById(id);
    return ApiResponseDto.ok(item, 'Ficha técnica / Hoja de servicio de mantenimiento obtenida');
  }

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createOrder(@Body() dto: CreateMaintenanceOrderDto) {
    const item = await this.manageMaintenanceUseCase.createOrder(dto);
    return ApiResponseDto.ok(item, 'Orden de trabajo de mantenimiento creada con éxito');
  }

  @Post('orders/:id/complete')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async completeOrder(@Param('id') id: string, @Body() dto: CompleteMaintenanceOrderDto) {
    try {
      const item = await this.manageMaintenanceUseCase.completeOrder(id, dto);
      return ApiResponseDto.ok(item, 'Mantenimiento finalizado, insumos descargados e informe generado');
    } catch (err: any) {
      console.error('Error in completeOrder:', err);
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // GESTIÓN DE INSUMOS Y CONSUMIBLES (RF-14, RNF KPIs)
  // ---------------------------------------------------------------------------
  @Get('supplies')
  async listSupplies() {
    const list = await this.manageMaintenanceUseCase.listSupplies();
    return ApiResponseDto.ok(list, 'Catálogo e inventario de consumibles e insumos obtenido');
  }

  @Get('supplies/critical')
  async listCriticalSupplies() {
    const list = await this.manageMaintenanceUseCase.getCriticalSupplies();
    return ApiResponseDto.ok(list, 'Insumos con stock crítico (< 2 unidades o bajo mínimo)');
  }

  @Get('supplies/:id')
  async getSupplyById(@Param('id') id: string) {
    const item = await this.manageMaintenanceUseCase.getSupplyById(id);
    return ApiResponseDto.ok(item, 'Insumo obtenido');
  }

  @Post('supplies')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createSupply(@Body() dto: CreateSupplyDto) {
    const item = await this.manageMaintenanceUseCase.createSupply(dto);
    return ApiResponseDto.ok(item, 'Insumo tecnológico registrado');
  }

  @Put('supplies/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateSupply(@Param('id') id: string, @Body() dto: UpdateSupplyDto) {
    const item = await this.manageMaintenanceUseCase.updateSupply(id, dto);
    return ApiResponseDto.ok(item, 'Insumo tecnológico actualizado');
  }

  @Post('supplies/:id/adjust-stock')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async adjustStock(@Param('id') id: string, @Body() dto: AdjustSupplyStockDto) {
    const item = await this.manageMaintenanceUseCase.adjustStock(id, dto);
    return ApiResponseDto.ok(item, 'Stock de insumo ajustado con éxito');
  }
}
