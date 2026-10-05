import { AssetModel } from '../../../domain/entities/asset-model.entity';
import { AssetModelTypeOrmEntity } from '../entities/asset-model.typeorm.entity';

export class AssetModelMapper {
  static toDomain(orm: AssetModelTypeOrmEntity): AssetModel {
    return new AssetModel({
      id: orm.id,
      name: orm.name,
      brandId: orm.brandId,
      brandName: orm.brand?.name,
      categoryId: orm.categoryId,
      categoryName: orm.category?.name,
      description: orm.description ?? undefined,
      isActive: orm.isActive,
    });
  }

  static toPersistence(domain: AssetModel): Partial<AssetModelTypeOrmEntity> {
    const obj = domain.toObject();
    const persistence: Partial<AssetModelTypeOrmEntity> = {
      name: obj.name,
      brandId: obj.brandId,
      categoryId: obj.categoryId || null,
      description: obj.description,
      isActive: obj.isActive,
    };
    if (obj.id) {
      persistence.id = obj.id;
    }
    return persistence;
  }
}
