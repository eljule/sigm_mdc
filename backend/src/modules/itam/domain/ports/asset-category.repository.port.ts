import { AssetCategory } from '../entities/asset-category.entity';

export abstract class AssetCategoryRepositoryPort {
  abstract findAll(): Promise<AssetCategory[]>;
  abstract findById(id: string): Promise<AssetCategory | null>;
  abstract findByCode(code: string): Promise<AssetCategory | null>;
  abstract save(category: AssetCategory): Promise<AssetCategory>;
  abstract delete(id: string): Promise<boolean>;
}
