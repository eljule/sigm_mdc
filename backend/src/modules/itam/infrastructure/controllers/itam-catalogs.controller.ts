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
import { ManageCatalogsUseCase } from '../../application/use-cases/manage-catalogs.use-case';
import {
  CreateAssetBrandDto,
  UpdateAssetBrandDto,
  CreateAssetModelDto,
  UpdateAssetModelDto,
} from '../../application/dtos/asset-catalogs.dto';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller(['api/v1/itam', 'api/v1/itam/catalogs'])
export class ItamCatalogsController {
  constructor(private readonly manageCatalogsUseCase: ManageCatalogsUseCase) {}

  // ===========================================================================
  // MARCAS
  // ===========================================================================
  @Get('brands')
  async getBrands() {
    const list = await this.manageCatalogsUseCase.listBrands();
    return ApiResponseDto.ok(list.map((b) => b.toObject()), 'Marcas de activos obtenidas');
  }

  @Post('brands')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createBrand(@Body() dto: CreateAssetBrandDto) {
    const created = await this.manageCatalogsUseCase.createBrand(dto);
    return ApiResponseDto.ok(created.toObject(), 'Marca registrada con éxito');
  }

  @Put('brands/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateBrand(@Param('id') id: string, @Body() dto: UpdateAssetBrandDto) {
    const updated = await this.manageCatalogsUseCase.updateBrand(id, dto);
    return ApiResponseDto.ok(updated.toObject(), 'Marca actualizada');
  }

  @Delete('brands/:id')
  async deleteBrand(@Param('id') id: string) {
    const deleted = await this.manageCatalogsUseCase.deleteBrand(id);
    return ApiResponseDto.ok({ deleted }, 'Marca eliminada');
  }

  // ===========================================================================
  // MODELOS
  // ===========================================================================
  @Get('models')
  async getModels(
    @Query('brandId') brandId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const list = await this.manageCatalogsUseCase.listModels(brandId, categoryId);
    return ApiResponseDto.ok(list.map((m) => m.toObject()), 'Modelos de activos obtenidos');
  }

  @Post('models')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createModel(@Body() dto: CreateAssetModelDto) {
    const created = await this.manageCatalogsUseCase.createModel(dto);
    return ApiResponseDto.ok(created.toObject(), 'Modelo registrado con éxito');
  }

  @Put('models/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateModel(@Param('id') id: string, @Body() dto: UpdateAssetModelDto) {
    const updated = await this.manageCatalogsUseCase.updateModel(id, dto);
    return ApiResponseDto.ok(updated.toObject(), 'Modelo actualizado');
  }

  @Delete('models/:id')
  async deleteModel(@Param('id') id: string) {
    const deleted = await this.manageCatalogsUseCase.deleteModel(id);
    return ApiResponseDto.ok({ deleted }, 'Modelo eliminado');
  }
}
