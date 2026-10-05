import {
  Asset,
  AssetCategory,
  AssetBrand,
  AssetModel,
  AssetStatistics,
  CreateAssetPayload,
  UpdateAssetPayload,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CustomFieldDefinition,
  Software,
  AssetSoftware,
  AssetMovement,
  CreateMovementPayload,
  Supply,
  MaintenanceOrder,
  CreateMaintenanceOrderPayload,
  CompleteMaintenancePayload,
  AssetLoan,
  CreateLoanPayload,
  InventoryAudit,
  ConciliationReport,
} from '../types/itam';
import { ApiResponse } from '../types/module';

const getBaseUrl = (): string => {
  return (
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : process.env.INTERNAL_API_URL) ||
    'http://localhost:4000'
  );
};

export const itamService = {
  // ---------------------------------------------------------------------------
  // CATEGORÍAS & ESQUEMAS DINÁMICOS (RF-03)
  // ---------------------------------------------------------------------------
  async getCategories(): Promise<AssetCategory[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/categories`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<AssetCategory[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener categorías:', err);
    }
    return [];
  },

  async createCategory(payload: CreateCategoryPayload): Promise<{ success: boolean; data?: AssetCategory; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.message || 'Error al crear categoría' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<{ success: boolean; data?: AssetCategory; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.message || 'Error al actualizar categoría' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async updateCategoryFieldsSchema(
    id: string,
    schema: CustomFieldDefinition[],
  ): Promise<{ success: boolean; data?: AssetCategory; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/categories/${id}/fields-schema`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customFieldsSchema: schema }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.message || 'Error al actualizar esquema dinámico' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/categories/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      return { success: json.success, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  // ---------------------------------------------------------------------------
  // MARCAS & MODELOS (RF-01)
  // ---------------------------------------------------------------------------
  async getBrands(): Promise<AssetBrand[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/catalogs/brands`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<AssetBrand[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener marcas:', err);
    }
    return [];
  },

  async createBrand(payload: { name: string; description?: string }): Promise<{ success: boolean; data?: AssetBrand; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/catalogs/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.message || 'Error al crear marca' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async getModels(brandId?: string, categoryId?: string): Promise<AssetModel[]> {
    const baseUrl = getBaseUrl();
    const query = new URLSearchParams();
    if (brandId) query.append('brandId', brandId);
    if (categoryId) query.append('categoryId', categoryId);

    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/catalogs/models?${query.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<AssetModel[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener modelos:', err);
    }
    return [];
  },

  async createModel(payload: {
    name: string;
    brandId: string;
    categoryId?: string;
    description?: string;
  }): Promise<{ success: boolean; data?: AssetModel; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/catalogs/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.message || 'Error al crear modelo' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  // ---------------------------------------------------------------------------
  // GESTIÓN DE ACTIVOS (RF-04, RF-05, RF-17)
  // ---------------------------------------------------------------------------
  async getAssets(filters?: {
    categoryId?: string;
    brandId?: string;
    status?: string;
    office?: string;
    search?: string;
  }): Promise<Asset[]> {
    const baseUrl = getBaseUrl();
    const query = new URLSearchParams();
    if (filters?.categoryId) query.append('categoryId', filters.categoryId);
    if (filters?.brandId) query.append('brandId', filters.brandId);
    if (filters?.status) query.append('status', filters.status);
    if (filters?.office) query.append('office', filters.office);
    if (filters?.search) query.append('search', filters.search);

    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets?${query.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<Asset[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener activos:', err);
    }
    return [];
  },

  async getAssetById(id: string): Promise<Asset | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets/${id}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<Asset> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener activo por ID:', err);
    }
    return null;
  },

  async getAssetByCode(code: string): Promise<Asset | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets/code/${encodeURIComponent(code)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<Asset> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener activo por código:', err);
    }
    return null;
  },

  async getLoanableAssets(): Promise<Asset[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets/loanable`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<Asset[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener activos para préstamo:', err);
    }
    return [];
  },

  async linkChildAsset(parentId: string, childId: string): Promise<{ success: boolean; data?: Asset; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets/${parentId}/link-child`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async unlinkChildAsset(childId: string): Promise<{ success: boolean; data?: Asset; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets/${childId}/unlink-child`, {
        method: 'POST',
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async createAsset(payload: CreateAssetPayload): Promise<{ success: boolean; data?: Asset; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.message || 'Error al registrar activo' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async updateAsset(id: string, payload: UpdateAssetPayload): Promise<{ success: boolean; data?: Asset; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        return { success: true, data: json.data };
      }
      return { success: false, error: json.message || 'Error al actualizar activo' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async deleteAsset(id: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      return { success: json.success, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async getStatistics(): Promise<AssetStatistics | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/assets/statistics`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<AssetStatistics> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener estadísticas:', err);
    }
    return null;
  },

  // ---------------------------------------------------------------------------
  // CATÁLOGO DE SOFTWARE & INSTALACIONES (RF-02 & RF-06)
  // ---------------------------------------------------------------------------
  async getSoftwareList(): Promise<Software[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/software`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<Software[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener catálogo de software:', err);
    }
    return [];
  },

  async createSoftware(payload: Partial<Software>): Promise<{ success: boolean; data?: Software; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/software`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async updateSoftware(id: string, payload: Partial<Software>): Promise<{ success: boolean; data?: Software; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/software/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async deleteSoftware(id: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/software/${id}`, { method: 'DELETE' });
      const json = await res.json();
      return { success: json.success, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async getInstalledSoftware(assetId: string): Promise<AssetSoftware[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/software/asset/${assetId}`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<AssetSoftware[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener software instalado:', err);
    }
    return [];
  },

  async assignSoftware(assetId: string, softwareId: string, licenseKeyUsed?: string): Promise<{ success: boolean; data?: AssetSoftware; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/software/asset/${assetId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ softwareId, licenseKeyUsed }),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async removeSoftware(assetId: string, softwareId: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/software/asset/${assetId}/remove/${softwareId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      return { success: json.success, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  // ---------------------------------------------------------------------------
  // MOVIMIENTOS, TRASLADOS Y ACTAS (RF-07, RF-08, RF-09, RF-10)
  // ---------------------------------------------------------------------------
  async getMovements(assetId?: string): Promise<AssetMovement[]> {
    const baseUrl = getBaseUrl();
    const query = assetId ? `?assetId=${assetId}` : '';
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/movements${query}`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<AssetMovement[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener movimientos:', err);
    }
    return [];
  },

  async getMovementByActa(actaNumber: string): Promise<AssetMovement | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/movements/acta/${encodeURIComponent(actaNumber)}`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<AssetMovement> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener movimiento por acta:', err);
    }
    return null;
  },

  async createMovement(payload: CreateMovementPayload): Promise<{ success: boolean; data?: AssetMovement; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  // ---------------------------------------------------------------------------
  // MANTENIMIENTOS & INSUMOS (RF-13, RF-14, RF-15, RF-16)
  // ---------------------------------------------------------------------------
  async getMaintenanceOrders(assetId?: string, status?: string): Promise<MaintenanceOrder[]> {
    const baseUrl = getBaseUrl();
    const query = new URLSearchParams();
    if (assetId) query.append('assetId', assetId);
    if (status) query.append('status', status);

    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/maintenance/orders?${query.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<MaintenanceOrder[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener órdenes de mantenimiento:', err);
    }
    return [];
  },

  async getMaintenanceOrderById(id: string): Promise<MaintenanceOrder | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/maintenance/orders/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<MaintenanceOrder> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener orden de mantenimiento:', err);
    }
    return null;
  },

  async createMaintenanceOrder(payload: CreateMaintenanceOrderPayload): Promise<{ success: boolean; data?: MaintenanceOrder; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/maintenance/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async completeMaintenanceOrder(id: string, payload: CompleteMaintenancePayload): Promise<{ success: boolean; data?: MaintenanceOrder; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/maintenance/orders/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async getSupplies(): Promise<Supply[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/maintenance/supplies`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<Supply[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener insumos:', err);
    }
    return [];
  },

  async getCriticalSupplies(): Promise<Supply[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/maintenance/supplies/critical`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<Supply[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener insumos críticos:', err);
    }
    return [];
  },

  async createSupply(payload: Partial<Supply>): Promise<{ success: boolean; data?: Supply; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/maintenance/supplies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async updateSupply(id: string, payload: Partial<Supply>): Promise<{ success: boolean; data?: Supply; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/maintenance/supplies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async adjustSupplyStock(id: string, payload: { quantityDelta: number; reason: string }): Promise<{ success: boolean; data?: Supply; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/maintenance/supplies/${id}/adjust-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  // ---------------------------------------------------------------------------
  // PRÉSTAMOS & RESERVAS (RF-17, RF-18, RF-19, RF-20)
  // ---------------------------------------------------------------------------
  async getLoans(status?: string): Promise<AssetLoan[]> {
    const baseUrl = getBaseUrl();
    const query = status ? `?status=${status}` : '';
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/loans${query}`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<AssetLoan[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener préstamos:', err);
    }
    return [];
  },

  async getDelayedLoans(): Promise<AssetLoan[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/loans/alerts/delayed`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<AssetLoan[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener préstamos retrasados:', err);
    }
    return [];
  },

  async getLoanById(id: string): Promise<AssetLoan | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/loans/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<AssetLoan> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener préstamo por ID:', err);
    }
    return null;
  },

  async createLoan(payload: CreateLoanPayload): Promise<{ success: boolean; data?: AssetLoan; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async returnLoan(id: string, payload: { returnCondition: string; notes?: string }): Promise<{ success: boolean; data?: AssetLoan; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/loans/${id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  // ---------------------------------------------------------------------------
  // AUDITORÍA ANUAL & CONCILIACIÓN FÍSICA (RF-11, RF-12)
  // ---------------------------------------------------------------------------
  async getAudits(): Promise<InventoryAudit[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/audits`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<InventoryAudit[]> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener auditorías:', err);
    }
    return [];
  },

  async getAuditById(id: string): Promise<InventoryAudit | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/audits/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<InventoryAudit> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener auditoría:', err);
    }
    return null;
  },

  async getConciliationReport(id: string): Promise<ConciliationReport | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/audits/${id}/report`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<ConciliationReport> = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn('[ItamService] Error al obtener reporte de conciliación:', err);
    }
    return null;
  },

  async createAudit(payload: { year: number; title: string; notes?: string }): Promise<{ success: boolean; data?: InventoryAudit; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/audits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async verifyAssetAudit(payload: {
    auditId: string;
    assetId: string;
    foundOffice: string;
    status: string;
    verifiedBy?: string;
    notes?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/audits/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },

  async closeAudit(id: string, notes?: string): Promise<{ success: boolean; data?: InventoryAudit; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/itam/audits/${id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const json = await res.json();
      return { success: res.ok && json.success, data: json.data, error: json.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de red' };
    }
  },
};
