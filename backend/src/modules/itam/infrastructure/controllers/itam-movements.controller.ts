import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ManageMovementsUseCase } from '../../application/use-cases/manage-movements.use-case';
import { CreateMovementDto } from '../../application/dtos/itam-extended.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller('api/v1/itam/movements')
export class ItamMovementsController {
  constructor(private readonly manageMovementsUseCase: ManageMovementsUseCase) {}

  @Get()
  async list(@Query('assetId') assetId?: string) {
    const list = await this.manageMovementsUseCase.listMovements(assetId);
    return ApiResponseDto.ok(list, 'Historial de movimientos y transferencias obtenido');
  }

  @Get('acta/:actaNumber')
  async getByActa(@Param('actaNumber') actaNumber: string) {
    const item = await this.manageMovementsUseCase.getMovementByActaNumber(actaNumber);
    return ApiResponseDto.ok(item, 'Acta de movimiento obtenida');
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const item = await this.manageMovementsUseCase.getMovementById(id);
    return ApiResponseDto.ok(item, 'Detalle de movimiento obtenido');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateMovementDto) {
    const item = await this.manageMovementsUseCase.createMovement(dto);
    return ApiResponseDto.ok(item, 'Movimiento registrado y acta generada con éxito');
  }
}
