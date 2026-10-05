import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AssetBrandRepositoryPort } from '../../domain/ports/asset-brand.repository.port';
import { AssetModelRepositoryPort } from '../../domain/ports/asset-model.repository.port';
import { AssetBrand } from '../../domain/entities/asset-brand.entity';
import { AssetModel } from '../../domain/entities/asset-model.entity';
import {
  CreateAssetBrandDto,
  UpdateAssetBrandDto,
  CreateAssetModelDto,
  UpdateAssetModelDto,
} from '../dtos/asset-catalogs.dto';

@Injectable()
export class ManageCatalogsUseCase {
  constructor(
    private readonly brandRepo: AssetBrandRepositoryPort,
    private readonly modelRepo: AssetModelRepositoryPort,
  ) {}

  // ===========================================================================
  // MARCAS
  // ===========================================================================
  async listBrands(): Promise<AssetBrand[]> {
    return this.brandRepo.findAll();
  }

  async getBrandById(id: string): Promise<AssetBrand> {
    const found = await this.brandRepo.findById(id);
    if (!found) {
      throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    }
    return found;
  }

  async createBrand(dto: CreateAssetBrandDto): Promise<AssetBrand> {
    const existing = await this.brandRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Ya existe una marca con el nombre "${dto.name.trim()}"`);
    }

    const brand = new AssetBrand({
      id: '',
      name: dto.name.trim(),
      description: dto.description?.trim() || '',
      isActive: dto.isActive !== false,
    });

    return this.brandRepo.save(brand);
  }

  async updateBrand(id: string, dto: UpdateAssetBrandDto): Promise<AssetBrand> {
    const brand = await this.getBrandById(id);
    brand.update(dto.name, dto.description, dto.isActive);
    return this.brandRepo.save(brand);
  }

  async deleteBrand(id: string): Promise<boolean> {
    await this.getBrandById(id);
    return this.brandRepo.delete(id);
  }

  // ===========================================================================
  // MODELOS
  // ===========================================================================
  async listModels(brandId?: string, categoryId?: string): Promise<AssetModel[]> {
    return this.modelRepo.findAll(brandId, categoryId);
  }

  async getModelById(id: string): Promise<AssetModel> {
    const found = await this.modelRepo.findById(id);
    if (!found) {
      throw new NotFoundException(`Modelo con ID ${id} no encontrado`);
    }
    return found;
  }

  async createModel(dto: CreateAssetModelDto): Promise<AssetModel> {
    await this.getBrandById(dto.brandId);

    const existing = await this.modelRepo.findByNameAndBrand(dto.name, dto.brandId);
    if (existing) {
      throw new ConflictException(`Ya existe este modelo para la marca seleccionada`);
    }

    const model = new AssetModel({
      id: '',
      name: dto.name.trim(),
      brandId: dto.brandId,
      categoryId: dto.categoryId || null,
      description: dto.description?.trim() || '',
      isActive: dto.isActive !== false,
    });

    return this.modelRepo.save(model);
  }

  async updateModel(id: string, dto: UpdateAssetModelDto): Promise<AssetModel> {
    const model = await this.getModelById(id);
    if (dto.brandId) {
      await this.getBrandById(dto.brandId);
    }

    model.update({
      name: dto.name,
      brandId: dto.brandId,
      categoryId: dto.categoryId,
      description: dto.description,
      isActive: dto.isActive,
    });

    return this.modelRepo.save(model);
  }

  async deleteModel(id: string): Promise<boolean> {
    await this.getModelById(id);
    return this.modelRepo.delete(id);
  }
}
