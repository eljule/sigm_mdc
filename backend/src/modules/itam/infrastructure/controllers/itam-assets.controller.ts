import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ManageAssetsUseCase } from '../../application/use-cases/manage-assets.use-case';
import { CreateAssetDto, UpdateAssetDto } from '../../application/dtos/asset.dto';
import { AssetStatus } from '../../domain/entities/asset.entity';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller('api/v1/itam/assets')
export class ItamAssetsController {
  constructor(private readonly manageAssetsUseCase: ManageAssetsUseCase) {}

  @Get()
  async getAssets(
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('status') status?: AssetStatus,
    @Query('office') office?: string,
    @Query('assignedPersonId') assignedPersonId?: string,
    @Query('search') search?: string,
  ) {
    const list = await this.manageAssetsUseCase.listAssets({
      categoryId,
      brandId,
      status,
      office,
      assignedPersonId,
      search,
    });
    return ApiResponseDto.ok(list.map((a) => a.toObject()), 'Activos tecnológicos obtenidos');
  }

  @Get('statistics')
  async getStatistics() {
    const stats = await this.manageAssetsUseCase.getStatistics();
    return ApiResponseDto.ok(stats, 'Estadísticas de inventario obtenidas');
  }

  @Get('loanable')
  async getLoanable() {
    const list = await this.manageAssetsUseCase.getLoanableAssets();
    return ApiResponseDto.ok(list.map((a) => a.toObject()), 'Activos disponibles para préstamo obtenidos');
  }

  @Get('code/:code')
  async getByCode(@Param('code') code: string) {
    const asset = await this.manageAssetsUseCase.getAssetByComputerCode(code);
    return ApiResponseDto.ok(asset.toObject(), 'Ficha técnica de activo obtenida por código');
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const asset = await this.manageAssetsUseCase.getAssetById(id);
    return ApiResponseDto.ok(asset.toObject(), 'Detalle del activo obtenido');
  }

  @Post(':id/link-child')
  async linkChild(@Param('id') id: string, @Body('childId') childId: string) {
    const child = await this.manageAssetsUseCase.linkChildAsset(id, childId);
    return ApiResponseDto.ok(child.toObject(), 'Componente hijo vinculado al activo padre con éxito');
  }

  @Post(':id/unlink-child')
  async unlinkChild(@Param('id') id: string) {
    const child = await this.manageAssetsUseCase.unlinkChildAsset(id);
    return ApiResponseDto.ok(child.toObject(), 'Componente desvinculado con éxito');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createAsset(@Body() dto: CreateAssetDto) {
    const created = await this.manageAssetsUseCase.createAsset(dto);
    return ApiResponseDto.ok(created.toObject(), 'Activo tecnológico registrado con éxito');
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateAsset(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    const updated = await this.manageAssetsUseCase.updateAsset(id, dto);
    return ApiResponseDto.ok(updated.toObject(), 'Activo tecnológico actualizado');
  }

  @Delete(':id')
  async deleteAsset(@Param('id') id: string) {
    const deleted = await this.manageAssetsUseCase.deleteAsset(id);
    return ApiResponseDto.ok({ deleted }, 'Activo eliminado');
  }
}
