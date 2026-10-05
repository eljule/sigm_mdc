import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { AssetModelRepositoryPort } from '../../../domain/ports/asset-model.repository.port';
import { AssetModel } from '../../../domain/entities/asset-model.entity';
import { AssetModelTypeOrmEntity } from '../entities/asset-model.typeorm.entity';
import { AssetModelMapper } from '../mappers/asset-model.mapper';

@Injectable()
export class TypeOrmAssetModelRepository implements AssetModelRepositoryPort {
  constructor(
    @InjectRepository(AssetModelTypeOrmEntity)
    private readonly repo: Repository<AssetModelTypeOrmEntity>,
  ) {}

  async findAll(brandId?: string, categoryId?: string): Promise<AssetModel[]> {
    const where: FindOptionsWhere<AssetModelTypeOrmEntity> = {};
    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;

    const list = await this.repo.find({
      where,
      relations: ['brand', 'category'],
      order: { name: 'ASC' },
    });
    return list.map(AssetModelMapper.toDomain);
  }

  async findById(id: string): Promise<AssetModel | null> {
    const found = await this.repo.findOne({
      where: { id },
      relations: ['brand', 'category'],
    });
    return found ? AssetModelMapper.toDomain(found) : null;
  }

  async findByNameAndBrand(name: string, brandId: string): Promise<AssetModel | null> {
    const found = await this.repo.findOne({
      where: { name: ILike(name.trim()), brandId },
      relations: ['brand', 'category'],
    });
    return found ? AssetModelMapper.toDomain(found) : null;
  }

  async save(model: AssetModel): Promise<AssetModel> {
    const persistence = AssetModelMapper.toPersistence(model);
    const saved = await this.repo.save(persistence);
    const reloaded = await this.findById(saved.id!);
    return reloaded || AssetModelMapper.toDomain(saved as AssetModelTypeOrmEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected || 0) > 0;
  }
}
