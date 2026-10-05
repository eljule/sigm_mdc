import { Asset, AssetStatus } from '../entities/asset.entity';

export interface AssetFilterOptions {
  categoryId?: string;
  brandId?: string;
  status?: AssetStatus;
  office?: string;
  assignedPersonId?: string;
  search?: string;
}

export abstract class AssetRepositoryPort {
  abstract findAll(filters?: AssetFilterOptions): Promise<Asset[]>;
  abstract findById(id: string): Promise<Asset | null>;
  abstract findByComputerCode(computerCode: string): Promise<Asset | null>;
  abstract findByPatrimonialCode(patrimonialCode: string): Promise<Asset | null>;
  abstract countByCategoryCode(categoryCode: string): Promise<number>;
  abstract save(asset: Asset): Promise<Asset>;
  abstract delete(id: string): Promise<boolean>;
  abstract getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
  }>;
}
