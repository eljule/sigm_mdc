import { AssetBrand } from '../entities/asset-brand.entity';

export abstract class AssetBrandRepositoryPort {
  abstract findAll(): Promise<AssetBrand[]>;
  abstract findById(id: string): Promise<AssetBrand | null>;
  abstract findByName(name: string): Promise<AssetBrand | null>;
  abstract save(brand: AssetBrand): Promise<AssetBrand>;
  abstract delete(id: string): Promise<boolean>;
}
