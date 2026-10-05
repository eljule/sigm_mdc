import { AssetBrand } from '../../../domain/entities/asset-brand.entity';
import { AssetBrandTypeOrmEntity } from '../entities/asset-brand.typeorm.entity';

export class AssetBrandMapper {
  static toDomain(orm: AssetBrandTypeOrmEntity): AssetBrand {
    return new AssetBrand({
      id: orm.id,
      name: orm.name,
      description: orm.description ?? undefined,
      isActive: orm.isActive,
    });
  }

  static toPersistence(domain: AssetBrand): Partial<AssetBrandTypeOrmEntity> {
    const obj = domain.toObject();
    const persistence: Partial<AssetBrandTypeOrmEntity> = {
      name: obj.name,
      description: obj.description,
      isActive: obj.isActive,
    };
    if (obj.id) {
      persistence.id = obj.id;
    }
    return persistence;
  }
}
