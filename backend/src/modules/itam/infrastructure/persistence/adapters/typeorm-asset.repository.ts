import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AssetRepositoryPort, AssetFilterOptions } from '../../../domain/ports/asset.repository.port';
import { Asset, AssetStatus } from '../../../domain/entities/asset.entity';
import { AssetTypeOrmEntity } from '../entities/asset.typeorm.entity';
import { AssetMapper } from '../mappers/asset.mapper';

@Injectable()
export class TypeOrmAssetRepository implements AssetRepositoryPort {
  constructor(
    @InjectRepository(AssetTypeOrmEntity)
    private readonly repo: Repository<AssetTypeOrmEntity>,
  ) {}

  async findAll(filters?: AssetFilterOptions): Promise<Asset[]> {
    const qb = this.repo
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.category', 'category')
      .leftJoinAndSelect('asset.brand', 'brand')
      .leftJoinAndSelect('asset.model', 'model')
      .leftJoinAndSelect('asset.assignedPerson', 'person')
      .leftJoinAndSelect('asset.parentAsset', 'parentAsset')
      .leftJoinAndSelect('asset.childAssets', 'childAssets')
      .leftJoinAndSelect('childAssets.category', 'childCategory')
      .leftJoinAndSelect('childAssets.brand', 'childBrand')
      .leftJoinAndSelect('childAssets.model', 'childModel');

    if (filters?.categoryId) {
      qb.andWhere('asset.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters?.brandId) {
      qb.andWhere('asset.brandId = :brandId', { brandId: filters.brandId });
    }

    if (filters?.status) {
      qb.andWhere('asset.status = :status', { status: filters.status });
    }

    if (filters?.office) {
      qb.andWhere('asset.office = :office', { office: filters.office });
    }

    if (filters?.assignedPersonId) {
      qb.andWhere('asset.assignedPersonId = :assignedPersonId', {
        assignedPersonId: filters.assignedPersonId,
      });
    }

    if (filters?.search && filters.search.trim()) {
      const search = `%${filters.search.trim()}%`;
      qb.andWhere(
        '(asset.computerCode ILIKE :search OR asset.patrimonialCode ILIKE :search OR asset.serialNumber ILIKE :search OR model.name ILIKE :search OR brand.name ILIKE :search OR person.firstName ILIKE :search OR person.paternalSurname ILIKE :search)',
        { search },
      );
    }

    qb.orderBy('asset.createdAt', 'DESC');

    const list = await qb.getMany();
    return list.map(AssetMapper.toDomain);
  }

  async findById(id: string): Promise<Asset | null> {
    const found = await this.repo.findOne({
      where: { id },
      relations: [
        'category',
        'brand',
        'model',
        'assignedPerson',
        'parentAsset',
        'childAssets',
        'childAssets.category',
        'childAssets.brand',
        'childAssets.model',
      ],
    });
    return found ? AssetMapper.toDomain(found) : null;
  }

  async findByComputerCode(computerCode: string): Promise<Asset | null> {
    const found = await this.repo.findOne({
      where: { computerCode: computerCode.trim().toUpperCase() },
      relations: [
        'category',
        'brand',
        'model',
        'assignedPerson',
        'parentAsset',
        'childAssets',
        'childAssets.category',
        'childAssets.brand',
        'childAssets.model',
      ],
    });
    return found ? AssetMapper.toDomain(found) : null;
  }

  async findByPatrimonialCode(patrimonialCode: string): Promise<Asset | null> {
    const found = await this.repo.findOne({
      where: { patrimonialCode: patrimonialCode.trim() },
      relations: [
        'category',
        'brand',
        'model',
        'assignedPerson',
        'parentAsset',
        'childAssets',
        'childAssets.category',
        'childAssets.brand',
        'childAssets.model',
      ],
    });
    return found ? AssetMapper.toDomain(found) : null;
  }

  async countByCategoryCode(categoryCode: string): Promise<number> {
    const count = await this.repo
      .createQueryBuilder('asset')
      .innerJoin('asset.category', 'cat')
      .where('cat.code = :code', { code: categoryCode.toUpperCase() })
      .getCount();
    return count;
  }

  async save(asset: Asset): Promise<Asset> {
    const persistence = AssetMapper.toPersistence(asset);
    const saved = await this.repo.save(persistence);
    const reloaded = await this.findById(saved.id!);
    return reloaded || AssetMapper.toDomain(saved as AssetTypeOrmEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected || 0) > 0;
  }

  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const total = await this.repo.count();

    const statusCounts = await this.repo
      .createQueryBuilder('asset')
      .select('asset.status', 'status')
      .addSelect('COUNT(asset.id)', 'count')
      .groupBy('asset.status')
      .getRawMany();

    const categoryCounts = await this.repo
      .createQueryBuilder('asset')
      .innerJoin('asset.category', 'cat')
      .select('cat.name', 'categoryName')
      .addSelect('COUNT(asset.id)', 'count')
      .groupBy('cat.name')
      .getRawMany();

    const byStatus: Record<string, number> = {
      [AssetStatus.OPERATIVO]: 0,
      [AssetStatus.EN_MANTENIMIENTO]: 0,
      [AssetStatus.EN_DESUSO]: 0,
      [AssetStatus.PARA_BAJA]: 0,
      [AssetStatus.EN_CUSTODIA]: 0,
    };
    statusCounts.forEach((row) => {
      byStatus[row.status] = Number(row.count);
    });

    const byCategory: Record<string, number> = {};
    categoryCounts.forEach((row) => {
      byCategory[row.categoryName] = Number(row.count);
    });

    return {
      total,
      byStatus,
      byCategory,
    };
  }
}
