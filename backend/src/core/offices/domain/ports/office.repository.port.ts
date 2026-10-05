import { OfficeEntity } from '../../infrastructure/persistence/entities/office.entity';

export interface OfficeFilters {
  search?: string;
  sede?: string;
  level?: number;
  parentName?: string;
  isActive?: boolean;
}

export abstract class OfficeRepositoryPort {
  abstract findAll(filters?: OfficeFilters): Promise<OfficeEntity[]>;
  abstract findById(id: string): Promise<OfficeEntity | null>;
  abstract findByCode(code: string): Promise<OfficeEntity | null>;
  abstract findByName(name: string): Promise<OfficeEntity | null>;
  abstract findTree(): Promise<OfficeEntity[]>;
  abstract findDistinctSedes(): Promise<string[]>;
  abstract create(data: Partial<OfficeEntity>): Promise<OfficeEntity>;
  abstract update(id: string, data: Partial<OfficeEntity>): Promise<OfficeEntity>;
  abstract delete(id: string): Promise<void>;
  abstract count(): Promise<number>;
}
