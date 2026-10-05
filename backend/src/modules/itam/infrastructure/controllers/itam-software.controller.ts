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
import { ManageSoftwareUseCase } from '../../application/use-cases/manage-software.use-case';
import { CreateSoftwareDto, UpdateSoftwareDto, AssignSoftwareDto } from '../../application/dtos/itam-extended.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller('api/v1/itam/software')
export class ItamSoftwareController {
  constructor(private readonly manageSoftwareUseCase: ManageSoftwareUseCase) {}

  @Get()
  async list() {
    const list = await this.manageSoftwareUseCase.listSoftware();
    return ApiResponseDto.ok(list, 'Catálogo de software obtenido');
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const item = await this.manageSoftwareUseCase.getSoftwareById(id);
    return ApiResponseDto.ok(item, 'Software obtenido');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateSoftwareDto) {
    const item = await this.manageSoftwareUseCase.createSoftware(dto);
    return ApiResponseDto.ok(item, 'Software institucional registrado');
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id') id: string, @Body() dto: UpdateSoftwareDto) {
    const item = await this.manageSoftwareUseCase.updateSoftware(id, dto);
    return ApiResponseDto.ok(item, 'Software institucional actualizado');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deleted = await this.manageSoftwareUseCase.deleteSoftware(id);
    return ApiResponseDto.ok({ deleted }, 'Software eliminado');
  }

  @Get('asset/:assetId')
  async getByAsset(@Param('assetId') assetId: string) {
    const installed = await this.manageSoftwareUseCase.getInstalledSoftwareByAsset(assetId);
    return ApiResponseDto.ok(installed, 'Software instalado en el equipo obtenido');
  }

  @Post('asset/:assetId/assign')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async assign(@Param('assetId') assetId: string, @Body() dto: AssignSoftwareDto) {
    const assigned = await this.manageSoftwareUseCase.assignSoftwareToAsset(assetId, dto);
    return ApiResponseDto.ok(assigned, 'Software asignado e instalado en el activo');
  }

  @Delete('asset/:assetId/remove/:softwareId')
  async remove(@Param('assetId') assetId: string, @Param('softwareId') softwareId: string) {
    const removed = await this.manageSoftwareUseCase.removeSoftwareFromAsset(assetId, softwareId);
    return ApiResponseDto.ok({ removed }, 'Software desinstalado del activo');
  }
}
