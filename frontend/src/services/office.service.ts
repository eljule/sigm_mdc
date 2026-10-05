import { OfficeItem, CreateOfficePayload, UpdateOfficePayload, OfficeFilters } from '../types/office';

const getBaseUrl = (): string => {
  return (
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : process.env.INTERNAL_API_URL) ||
    'http://localhost:4000'
  );
};

export const officeService = {
  async getOffices(filters?: OfficeFilters): Promise<OfficeItem[]> {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sede && filters.sede !== 'TODAS') params.append('sede', filters.sede);
    if (filters?.level) params.append('level', filters.level.toString());
    if (filters?.parentName) params.append('parentName', filters.parentName);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    try {
      const res = await fetch(`${baseUrl}/api/v1/offices?${params.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[officeService] Error fetching offices:', e);
    }
    return [];
  },

  async getOfficeTree(): Promise<OfficeItem[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/offices/tree`, {
        cache: 'no-store',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[officeService] Error fetching office tree:', e);
    }
    return [];
  },

  async getSedes(): Promise<string[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/offices/sedes`, {
        cache: 'no-store',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[officeService] Error fetching sedes:', e);
    }
    return [
      'PALACIO MUNICIPAL (SEDE PRINCIPAL)',
      'SEDE ADMINISTRACIÓN TRIBUTARIA (RENTAS)',
      'SEDE DESARROLLO URBANO Y OBRAS',
      'SEDE MAESTRANZA Y SERVICIOS PÚBLICOS',
      'SEDE MERCADO DE CASTILLA',
      'SEDE PROGRAMAS SOCIALES (DEMUNA / OMAPED / CIAM)',
      'SEDE SEGURIDAD CIUDADANA / BASE SERENAZGO',
    ];
  },

  async getOfficeById(id: string): Promise<OfficeItem | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/offices/${id}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[officeService] Error fetching office by id:', e);
    }
    return null;
  },

  async createOffice(payload: CreateOfficePayload): Promise<OfficeItem> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/offices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear la dependencia');
    }
    return res.json();
  },

  async updateOffice(id: string, payload: UpdateOfficePayload): Promise<OfficeItem> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/offices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al actualizar la dependencia');
    }
    return res.json();
  },

  async deleteOffice(id: string): Promise<void> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/offices/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al eliminar la dependencia');
    }
  },
};
