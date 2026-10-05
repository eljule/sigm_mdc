import { Asset, AssetStatus, AssetPhysicalCondition } from '../../../domain/entities/asset.entity';
import { AssetTypeOrmEntity } from '../entities/asset.typeorm.entity';

export class AssetMapper {
  static toDomain(orm: AssetTypeOrmEntity): Asset {
    let assignedName: string | null = null;
    if (orm.assignedPerson) {
      const parts = [orm.assignedPerson.firstName, orm.assignedPerson.paternalSurname, orm.assignedPerson.maternalSurname];
      assignedName = parts.filter(Boolean).join(' ');
    }

    const children = (orm.childAssets || []).map((ch) => ({
      id: ch.id,
      computerCode: ch.computerCode,
      patrimonialCode: ch.patrimonialCode,
      serialNumber: ch.serialNumber,
      categoryName: ch.category?.name,
      brandName: ch.brand?.name,
      modelName: ch.model?.name,
      status: ch.status,
    }));

    return new Asset({
      id: orm.id,
      computerCode: orm.computerCode,
      patrimonialCode: orm.patrimonialCode,
      serialNumber: orm.serialNumber,
      categoryId: orm.categoryId,
      categoryName: orm.category?.name,
      categoryCode: orm.category?.code,
      brandId: orm.brandId,
      brandName: orm.brand?.name,
      modelId: orm.modelId,
      modelName: orm.model?.name,
      parentAssetId: orm.parentAssetId,
      parentAssetComputerCode: orm.parentAsset?.computerCode,
      childAssets: children,
      supplier: orm.supplier,
      warrantyEndDate: orm.warrantyEndDate,
      isLoanable: orm.isLoanable,
      color: orm.color,
      status: (orm.status as AssetStatus) || AssetStatus.OPERATIVO,
      physicalCondition: (orm.physicalCondition as AssetPhysicalCondition) || AssetPhysicalCondition.BUENO,
      office: orm.office,
      assignedPersonId: orm.assignedPersonId,
      assignedPersonName: assignedName,
      acquisitionDate: orm.acquisitionDate,
      specifications: orm.specifications || {},
      notes: orm.notes,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toPersistence(domain: Asset): Partial<AssetTypeOrmEntity> {
    const obj = domain.toObject();
    const persistence: Partial<AssetTypeOrmEntity> = {
      computerCode: obj.computerCode,
      patrimonialCode: obj.patrimonialCode || null,
      serialNumber: obj.serialNumber || null,
      categoryId: obj.categoryId,
      brandId: obj.brandId,
      modelId: obj.modelId,
      parentAssetId: obj.parentAssetId || null,
      supplier: obj.supplier || null,
      warrantyEndDate: obj.warrantyEndDate || null,
      isLoanable: obj.isLoanable === true,
      color: obj.color || null,
      status: obj.status,
      physicalCondition: obj.physicalCondition,
      office: obj.office || null,
      assignedPersonId: obj.assignedPersonId || null,
      acquisitionDate: obj.acquisitionDate || null,
      specifications: obj.specifications || {},
      notes: obj.notes || null,
      isActive: obj.isActive,
    };
    if (obj.id) {
      persistence.id = obj.id;
    }
    return persistence;
  }
}
