import { AssetModel } from '../entities/asset-model.entity';

export abstract class AssetModelRepositoryPort {
  abstract findAll(brandId?: string, categoryId?: string): Promise<AssetModel[]>;
  abstract findById(id: string): Promise<AssetModel | null>;
  abstract findByNameAndBrand(name: string, brandId: string): Promise<AssetModel | null>;
  abstract save(model: AssetModel): Promise<AssetModel>;
  abstract delete(id: string): Promise<boolean>;
}
