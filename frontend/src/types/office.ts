export interface OfficeItem {
  id: string;
  code: string;
  acronym: string;
  name: string;
  parentName: string | null;
  parentId: string | null;
  sede: string;
  level: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  parent?: OfficeItem | null;
  children?: OfficeItem[];
}

export interface CreateOfficePayload {
  code: string;
  acronym: string;
  name: string;
  parentName?: string | null;
  parentId?: string | null;
  sede?: string;
  level?: number;
  isActive?: boolean;
}

export interface UpdateOfficePayload {
  code?: string;
  acronym?: string;
  name?: string;
  parentName?: string | null;
  parentId?: string | null;
  sede?: string;
  level?: number;
  isActive?: boolean;
}

export interface OfficeFilters {
  search?: string;
  sede?: string;
  level?: number;
  parentName?: string;
  isActive?: boolean;
}
