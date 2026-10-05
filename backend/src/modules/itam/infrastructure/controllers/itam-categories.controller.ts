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
import { ManageCategoriesUseCase } from '../../application/use-cases/manage-categories.use-case';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from '../../application/dtos/asset-category.dto';
import { CustomFieldDefinition } from '../../domain/entities/asset-category.entity';
import { ApiResponseDto } from '../../../../common/dto/api-response.dto';

@Controller('api/v1/itam/categories')
export class ItamCategoriesController {
  constructor(private readonly manageCategoriesUseCase: ManageCategoriesUseCase) {}

  @Get()
  async getCategories() {
    const list = await this.manageCategoriesUseCase.listCategories();
    return ApiResponseDto.ok(list.map((c) => c.toObject()), 'Categorías de activos obtenidas');
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const category = await this.manageCategoriesUseCase.getCategoryById(id);
    return ApiResponseDto.ok(category.toObject(), 'Detalle de categoría obtenido');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createCategory(@Body() dto: CreateAssetCategoryDto) {
    const created = await this.manageCategoriesUseCase.createCategory(dto);
    return ApiResponseDto.ok(created.toObject(), 'Categoría creada con éxito');
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateAssetCategoryDto) {
    const updated = await this.manageCategoriesUseCase.updateCategory(id, dto);
    return ApiResponseDto.ok(updated.toObject(), 'Categoría actualizada');
  }

  @Put(':id/fields-schema')
  async updateFieldsSchema(
    @Param('id') id: string,
    @Body('customFieldsSchema') schema: CustomFieldDefinition[],
  ) {
    const updated = await this.manageCategoriesUseCase.updateFieldsSchema(id, schema || []);
    return ApiResponseDto.ok(
      updated.toObject(),
      'Esquema de campos técnicos de la categoría actualizado',
    );
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    const deleted = await this.manageCategoriesUseCase.deleteCategory(id);
    return ApiResponseDto.ok({ deleted }, 'Categoría eliminada');
  }
}
