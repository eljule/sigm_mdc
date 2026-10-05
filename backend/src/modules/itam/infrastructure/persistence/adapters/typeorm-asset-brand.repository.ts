import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { AssetBrandRepositoryPort } from '../../../domain/ports/asset-brand.repository.port';
import { AssetBrand } from '../../../domain/entities/asset-brand.entity';
import { AssetBrandTypeOrmEntity } from '../entities/asset-brand.typeorm.entity';
import { AssetBrandMapper } from '../mappers/asset-brand.mapper';

@Injectable()
export class TypeOrmAssetBrandRepository implements AssetBrandRepositoryPort {
  constructor(
    @InjectRepository(AssetBrandTypeOrmEntity)
    private readonly repo: Repository<AssetBrandTypeOrmEntity>,
  ) {}

  async findAll(): Promise<AssetBrand[]> {
    const list = await this.repo.find({ order: { name: 'ASC' } });
    return list.map(AssetBrandMapper.toDomain);
  }

  async findById(id: string): Promise<AssetBrand | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? AssetBrandMapper.toDomain(found) : null;
  }

  async findByName(name: string): Promise<AssetBrand | null> {
    const found = await this.repo.findOne({ where: { name: ILike(name.trim()) } });
    return found ? AssetBrandMapper.toDomain(found) : null;
  }

  async save(brand: AssetBrand): Promise<AssetBrand> {
    const persistence = AssetBrandMapper.toPersistence(brand);
    const saved = await this.repo.save(persistence);
    return AssetBrandMapper.toDomain(saved as AssetBrandTypeOrmEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected || 0) > 0;
  }
}
