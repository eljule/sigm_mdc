import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCategoryRepositoryPort } from '../../../domain/ports/asset-category.repository.port';
import { AssetCategory } from '../../../domain/entities/asset-category.entity';
import { AssetCategoryTypeOrmEntity } from '../entities/asset-category.typeorm.entity';
import { AssetCategoryMapper } from '../mappers/asset-category.mapper';

@Injectable()
export class TypeOrmAssetCategoryRepository implements AssetCategoryRepositoryPort {
  constructor(
    @InjectRepository(AssetCategoryTypeOrmEntity)
    private readonly repo: Repository<AssetCategoryTypeOrmEntity>,
  ) {}

  async findAll(): Promise<AssetCategory[]> {
    const list = await this.repo.find({ order: { name: 'ASC' } });
    return list.map(AssetCategoryMapper.toDomain);
  }

  async findById(id: string): Promise<AssetCategory | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? AssetCategoryMapper.toDomain(found) : null;
  }

  async findByCode(code: string): Promise<AssetCategory | null> {
    const found = await this.repo.findOne({ where: { code: code.toUpperCase() } });
    return found ? AssetCategoryMapper.toDomain(found) : null;
  }

  async save(category: AssetCategory): Promise<AssetCategory> {
    const persistence = AssetCategoryMapper.toPersistence(category);
    const saved = await this.repo.save(persistence);
    return AssetCategoryMapper.toDomain(saved as AssetCategoryTypeOrmEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected || 0) > 0;
  }
}
