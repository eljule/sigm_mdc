import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AssetCategoryRepositoryPort } from '../../domain/ports/asset-category.repository.port';
import { AssetCategory, CustomFieldDefinition } from '../../domain/entities/asset-category.entity';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from '../dtos/asset-category.dto';

@Injectable()
export class ManageCategoriesUseCase {
  constructor(private readonly categoryRepository: AssetCategoryRepositoryPort) {}

  async listCategories(): Promise<AssetCategory[]> {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<AssetCategory> {
    const found = await this.categoryRepository.findById(id);
    if (!found) {
      throw new NotFoundException(`Categoría de activo con ID ${id} no encontrada`);
    }
    return found;
  }

  async createCategory(dto: CreateAssetCategoryDto): Promise<AssetCategory> {
    const existing = await this.categoryRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Ya existe una categoría con el código "${dto.code.toUpperCase()}"`);
    }

    const category = new AssetCategory({
      id: '',
      name: dto.name.trim(),
      code: dto.code.trim().toUpperCase(),
      description: dto.description?.trim() || '',
      icon: dto.icon || '💻',
      color: dto.color || '#2563eb',
      customFieldsSchema: dto.customFieldsSchema || [],
      isActive: dto.isActive !== false,
    });

    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, dto: UpdateAssetCategoryDto): Promise<AssetCategory> {
    const category = await this.getCategoryById(id);

    category.updateDetails({
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      color: dto.color,
      customFieldsSchema: dto.customFieldsSchema,
      isActive: dto.isActive,
    });

    return this.categoryRepository.save(category);
  }

  async updateFieldsSchema(id: string, schema: CustomFieldDefinition[]): Promise<AssetCategory> {
    const category = await this.getCategoryById(id);
    category.updateDetails({ customFieldsSchema: schema });
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<boolean> {
    await this.getCategoryById(id);
    return this.categoryRepository.delete(id);
  }
}
