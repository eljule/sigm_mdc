import { AssetCategory } from '../../../domain/entities/asset-category.entity';
import { AssetCategoryTypeOrmEntity } from '../entities/asset-category.typeorm.entity';

export class AssetCategoryMapper {
  static toDomain(orm: AssetCategoryTypeOrmEntity): AssetCategory {
    return new AssetCategory({
      id: orm.id,
      name: orm.name,
      code: orm.code,
      description: orm.description ?? undefined,
      icon: orm.icon,
      color: orm.color,
      customFieldsSchema: orm.customFieldsSchema || [],
      isActive: orm.isActive,
    });
  }

  static toPersistence(domain: AssetCategory): Partial<AssetCategoryTypeOrmEntity> {
    const obj = domain.toObject();
    const persistence: Partial<AssetCategoryTypeOrmEntity> = {
      name: obj.name,
      code: obj.code,
      description: obj.description,
      icon: obj.icon,
      color: obj.color,
      customFieldsSchema: obj.customFieldsSchema,
      isActive: obj.isActive,
    };
    if (obj.id) {
      persistence.id = obj.id;
    }
    return persistence;
  }
}
