import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ManageOfficesUseCase } from '../../application/use-cases/manage-offices.use-case';
import { CreateOfficeDto, UpdateOfficeDto } from '../../application/dtos/office.dto';

@Controller('api/v1/offices')
export class OfficeController {
  constructor(private readonly useCase: ManageOfficesUseCase) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('sede') sede?: string,
    @Query('level') level?: string,
    @Query('parentName') parentName?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.useCase.findAll({
      search,
      sede,
      level: level ? parseInt(level, 10) : undefined,
      parentName,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('tree')
  async findTree() {
    return this.useCase.findTree();
  }

  @Get('sedes')
  async findSedes() {
    return this.useCase.findSedes();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.useCase.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateOfficeDto) {
    return this.useCase.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOfficeDto) {
    return this.useCase.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.useCase.delete(id);
    return { success: true, message: 'Oficina eliminada correctamente' };
  }
}
