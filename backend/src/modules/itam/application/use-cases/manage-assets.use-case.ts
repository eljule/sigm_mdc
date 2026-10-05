import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { AssetRepositoryPort, AssetFilterOptions } from '../../domain/ports/asset.repository.port';
import { AssetCategoryRepositoryPort } from '../../domain/ports/asset-category.repository.port';
import { AssetBrandRepositoryPort } from '../../domain/ports/asset-brand.repository.port';
import { AssetModelRepositoryPort } from '../../domain/ports/asset-model.repository.port';
import { Asset, AssetStatus, AssetPhysicalCondition } from '../../domain/entities/asset.entity';
import { CreateAssetDto, UpdateAssetDto } from '../dtos/asset.dto';

@Injectable()
export class ManageAssetsUseCase {
  constructor(
    private readonly assetRepo: AssetRepositoryPort,
    private readonly categoryRepo: AssetCategoryRepositoryPort,
    private readonly brandRepo: AssetBrandRepositoryPort,
    private readonly modelRepo: AssetModelRepositoryPort,
  ) {}

  async listAssets(filters?: AssetFilterOptions): Promise<Asset[]> {
    return this.assetRepo.findAll(filters);
  }

  async getAssetById(id: string): Promise<Asset> {
    const found = await this.assetRepo.findById(id);
    if (!found) {
      throw new NotFoundException(`Activo tecnológico con ID ${id} no encontrado`);
    }
    return found;
  }

  async getAssetByComputerCode(computerCode: string): Promise<Asset> {
    const found = await this.assetRepo.findByComputerCode(computerCode);
    if (!found) {
      throw new NotFoundException(`Activo con código informático "${computerCode}" no encontrado`);
    }
    return found;
  }

  async createAsset(dto: CreateAssetDto): Promise<Asset> {
    // 1. Validar categoría
    const category = await this.categoryRepo.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException(`La categoría con ID ${dto.categoryId} no existe`);
    }

    // 2. Validar marca y modelo
    const brand = await this.brandRepo.findById(dto.brandId);
    if (!brand) {
      throw new NotFoundException(`La marca con ID ${dto.brandId} no existe`);
    }

    const model = await this.modelRepo.findById(dto.modelId);
    if (!model) {
      throw new NotFoundException(`El modelo con ID ${dto.modelId} no existe`);
    }

    // 3. Validar código patrimonial único si se suministra
    if (dto.patrimonialCode && dto.patrimonialCode.trim()) {
      const existingPat = await this.assetRepo.findByPatrimonialCode(dto.patrimonialCode.trim());
      if (existingPat) {
        throw new ConflictException(
          `Ya existe un activo registrado con el código patrimonial "${dto.patrimonialCode.trim()}"`,
        );
      }
    }

    // 4. Validar especificaciones dinámicas requeridas por el schema de la categoría
    const specs = dto.specifications || {};
    const schema = category.customFieldsSchema || [];
    for (const field of schema) {
      if (field.required) {
        const val = specs[field.key];
        if (val === undefined || val === null || val === '') {
          throw new BadRequestException(
            `El campo técnico "${field.label}" es obligatorio para la categoría ${category.name}`,
          );
        }
      }
    }

    // 5. Auto-generar código informático estructurado: MDC-TI-{CAT}-{0001}
    const computerCode = await this.generateUniqueComputerCode(category.code);

    const asset = new Asset({
      id: '',
      computerCode,
      patrimonialCode: dto.patrimonialCode?.trim() || null,
      serialNumber: dto.serialNumber?.trim() || null,
      categoryId: dto.categoryId,
      brandId: dto.brandId,
      modelId: dto.modelId,
      parentAssetId: dto.parentAssetId || null,
      supplier: dto.supplier?.trim() || null,
      warrantyEndDate: dto.warrantyEndDate || null,
      isLoanable: dto.isLoanable === true,
      color: dto.color?.trim() || null,
      status: dto.status || AssetStatus.OPERATIVO,
      physicalCondition: dto.physicalCondition || AssetPhysicalCondition.BUENO,
      office: dto.office?.trim() || null,
      assignedPersonId: dto.assignedPersonId || null,
      acquisitionDate: dto.acquisitionDate || null,
      specifications: specs,
      notes: dto.notes?.trim() || null,
      isActive: true,
    });

    return this.assetRepo.save(asset);
  }

  async updateAsset(id: string, dto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.getAssetById(id);

    const categoryId = dto.categoryId || asset.categoryId;
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Categoría no encontrada`);
    }

    if (dto.brandId) {
      const brand = await this.brandRepo.findById(dto.brandId);
      if (!brand) throw new NotFoundException(`Marca no encontrada`);
    }

    if (dto.modelId) {
      const model = await this.modelRepo.findById(dto.modelId);
      if (!model) throw new NotFoundException(`Modelo no encontrado`);
    }

    // Validar código patrimonial si cambió
    if (
      dto.patrimonialCode &&
      dto.patrimonialCode.trim() !== (asset.patrimonialCode || '').trim()
    ) {
      const existingPat = await this.assetRepo.findByPatrimonialCode(dto.patrimonialCode.trim());
      if (existingPat && existingPat.id !== id) {
        throw new ConflictException(
          `Ya existe otro activo con el código patrimonial "${dto.patrimonialCode.trim()}"`,
        );
      }
    }

    // Validar especificaciones si fueron enviadas
    if (dto.specifications) {
      const schema = category.customFieldsSchema || [];
      for (const field of schema) {
        if (field.required) {
          const val = dto.specifications[field.key];
          if (val === undefined || val === null || val === '') {
            throw new BadRequestException(
              `El campo técnico "${field.label}" es obligatorio para la categoría ${category.name}`,
            );
          }
        }
      }
    }

    asset.updateDetails({
      patrimonialCode: dto.patrimonialCode,
      serialNumber: dto.serialNumber,
      categoryId: dto.categoryId,
      brandId: dto.brandId,
      modelId: dto.modelId,
      parentAssetId: dto.parentAssetId,
      supplier: dto.supplier,
      warrantyEndDate: dto.warrantyEndDate,
      isLoanable: dto.isLoanable,
      color: dto.color,
      status: dto.status,
      physicalCondition: dto.physicalCondition,
      office: dto.office,
      assignedPersonId: dto.assignedPersonId,
      acquisitionDate: dto.acquisitionDate,
      specifications: dto.specifications,
      notes: dto.notes,
    });

    return this.assetRepo.save(asset);
  }

  /**
   * RF-05: Relación Jerárquica Componentes (Padre - Hijo)
   * Vincular periférico o componente hijo a un activo padre
   */
  async linkChildAsset(parentId: string, childId: string): Promise<Asset> {
    if (parentId === childId) {
      throw new BadRequestException('Un activo no puede vincularse como subcomponente de sí mismo');
    }

    const parent = await this.getAssetById(parentId);
    const child = await this.getAssetById(childId);

    // Actualizar el hijo con el ID del padre y heredar oficina y custodio
    child.updateDetails({
      parentAssetId: parent.id,
      office: parent.office,
      assignedPersonId: parent.assignedPersonId,
    });

    return this.assetRepo.save(child);
  }

  /**
   * Desvincular periférico o componente hijo
   */
  async unlinkChildAsset(childId: string): Promise<Asset> {
    const child = await this.getAssetById(childId);
    child.updateDetails({
      parentAssetId: null,
    });
    return this.assetRepo.save(child);
  }

  /**
   * RF-17: Listar activos disponibles para préstamo temporal
   */
  async getLoanableAssets(): Promise<Asset[]> {
    const all = await this.assetRepo.findAll();
    return all.filter((a) => a.isLoanable);
  }

  async deleteAsset(id: string): Promise<boolean> {
    await this.getAssetById(id);
    return this.assetRepo.delete(id);
  }

  async getStatistics() {
    return this.assetRepo.getStatistics();
  }

  /**
   * Genera correlativo estructurado único: MDC-TI-{CODE}-{0001}
   */
  private async generateUniqueComputerCode(categoryCode: string): Promise<string> {
    const cleanCode = categoryCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let correlative = (await this.assetRepo.countByCategoryCode(cleanCode)) + 1;

    let candidate = `MDC-TI-${cleanCode}-${String(correlative).padStart(4, '0')}`;
    let exists = await this.assetRepo.findByComputerCode(candidate);

    while (exists) {
      correlative += 1;
      candidate = `MDC-TI-${cleanCode}-${String(correlative).padStart(4, '0')}`;
      exists = await this.assetRepo.findByComputerCode(candidate);
    }

    return candidate;
  }
}
