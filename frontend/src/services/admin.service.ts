import { Person, UserDetail, RolePreset } from '../types/admin';
import { ApiResponse } from '../types/module';

const getBaseUrl = (): string => {
  return (
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : process.env.INTERNAL_API_URL) ||
    'http://localhost:4000'
  );
};

export const adminService = {
  // ---------------------------------------------------------------------------
  // PERSONAS (ADMINISTRADOS Y PERSONAL)
  // ---------------------------------------------------------------------------
  async getPeople(filter?: { type?: string; search?: string }): Promise<{
    items: Person[];
    counts: { total: number; personal: number; administrados: number };
  }> {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams();
    if (filter?.type && filter.type !== 'TODOS') params.append('type', filter.type);
    if (filter?.search) params.append('search', filter.search);

    try {
      const res = await fetch(`${baseUrl}/api/v1/people?${params.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<{
          items: Person[];
          counts: { total: number; personal: number; administrados: number };
        }> = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[AdminService] Error al obtener personas del backend:', e);
    }

    return {
      items: [],
      counts: { total: 0, personal: 0, administrados: 0 },
    };
  },

  async createPerson(data: Partial<Person>): Promise<{ success: boolean; person?: Person; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json: ApiResponse<Person> = await res.json();
      if (res.ok && json.success) {
        return { success: true, person: json.data };
      }
      return { success: false, error: json.message || 'Error al registrar la persona' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  },

  async updatePerson(
    id: string,
    data: Partial<Person>,
  ): Promise<{ success: boolean; person?: Person; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/people/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json: ApiResponse<Person> = await res.json();
      if (res.ok && json.success) {
        return { success: true, person: json.data };
      }
      return { success: false, error: json.message || 'Error al actualizar la persona' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  },

  // ---------------------------------------------------------------------------
  // USUARIOS, ROLES Y PERMISOS
  // ---------------------------------------------------------------------------
  async getUsers(): Promise<UserDetail[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/users`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<UserDetail[]> = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[AdminService] Error al obtener usuarios del backend:', e);
    }
    return [];
  },

  async createUser(payload: {
    username: string;
    password: string;
    fullName: string;
    email?: string;
    role: string;
    allowedModules: string[];
    personId?: string;
  }): Promise<{ success: boolean; user?: UserDetail; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<UserDetail> = await res.json();
      if (res.ok && json.success) {
        return { success: true, user: json.data };
      }
      return { success: false, error: json.message || 'Error al crear usuario' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  },

  async updatePermissions(
    userId: string,
    role: string,
    allowedModules: string[],
  ): Promise<{ success: boolean; user?: UserDetail; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, allowedModules }),
      });

      const json: ApiResponse<UserDetail> = await res.json();
      if (res.ok && json.success) {
        return { success: true, user: json.data };
      }
      return { success: false, error: json.message || 'Error al actualizar permisos' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  },

  async toggleUserStatus(userId: string): Promise<boolean> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/users/${userId}/toggle-status`, {
        method: 'PATCH',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getRolePresets(): Promise<RolePreset[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/roles-templates`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<RolePreset[]> = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[AdminService] Error al obtener plantillas de roles:', e);
    }

    return [
      {
        role: 'Administrador Central',
        description: 'Acceso total y configuración de todos los subsistemas del SIGM.',
        allowedModules: ['central_dashboard', 'transport_licenses', 'it_inventory', 'helpdesk_support'],
        color: '#16a34a',
      },
      {
        role: 'Técnico de Soporte e ITAM',
        description: 'Gestión de activos tecnológicos, marcas, modelos y atención de incidencias.',
        allowedModules: ['central_dashboard', 'it_inventory', 'helpdesk_support'],
        color: '#2563eb',
      },
      {
        role: 'Operador de Transportes',
        description: 'Empadronamiento de vehículos menores, licencias y fiscalización.',
        allowedModules: ['transport_licenses', 'helpdesk_support'],
        color: '#ea580c',
      },
      {
        role: 'Personal General / Reportante',
        description: 'Emisión de tickets de asistencia técnica y consultas generales.',
        allowedModules: ['helpdesk_support'],
        color: '#7c3aed',
      },
    ];
  },

  // ---------------------------------------------------------------------------
  // MANTENIMIENTO DE ROLES Y ASIGNACIÓN DE PERMISOS
  // ---------------------------------------------------------------------------
  async getRoles(): Promise<import('../types/admin').RoleItem[]> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/roles`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<import('../types/admin').RoleItem[]> = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[AdminService] Error al obtener roles:', e);
    }
    return [];
  },

  async createRole(data: import('../types/admin').CreateRolePayload): Promise<{
    success: boolean;
    role?: import('../types/admin').RoleItem;
    error?: string;
  }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json: ApiResponse<import('../types/admin').RoleItem> = await res.json();
      if (res.ok && json.success) {
        return { success: true, role: json.data };
      }
      return { success: false, error: json.message || 'Error al crear el rol' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  },

  async updateRole(
    id: string,
    data: Partial<import('../types/admin').CreateRolePayload>,
  ): Promise<{ success: boolean; role?: import('../types/admin').RoleItem; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/roles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json: ApiResponse<import('../types/admin').RoleItem> = await res.json();
      if (res.ok && json.success) {
        return { success: true, role: json.data };
      }
      return { success: false, error: json.message || 'Error al actualizar el rol' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  },

  async assignPermissionsToRole(
    roleId: string,
    permissionCodes: string[],
  ): Promise<{ success: boolean; role?: import('../types/admin').RoleItem; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionCodes }),
      });
      const json: ApiResponse<import('../types/admin').RoleItem> = await res.json();
      if (res.ok && json.success) {
        return { success: true, role: json.data };
      }
      return { success: false, error: json.message || 'Error al asignar permisos al rol' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  },

  async deleteRole(id: string): Promise<{ success: boolean; error?: string }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/roles/${id}`, { method: 'DELETE' });
      const json: ApiResponse<{ deleted: boolean }> = await res.json();
      if (res.ok && json.success) {
        return { success: true };
      }
      return { success: false, error: json.message || 'Error al eliminar rol' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  },

  // ---------------------------------------------------------------------------
  // CATÁLOGO DE PERMISOS
  // ---------------------------------------------------------------------------
  async getPermissions(): Promise<{
    groups: import('../types/admin').SubsystemPermissionGroup[];
    total: number;
    items: import('../types/admin').PermissionItem[];
  }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/permissions`, { cache: 'no-store' });
      if (res.ok) {
        const json: ApiResponse<{
          groups: import('../types/admin').SubsystemPermissionGroup[];
          total: number;
          items: import('../types/admin').PermissionItem[];
        }> = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[AdminService] Error al obtener catálogo de permisos:', e);
    }
    return { groups: [], total: 0, items: [] };
  },

  // ---------------------------------------------------------------------------
  // CESE LABORAL Y ENTREGA DE CARGO (PERSONAL MUNICIPAL)
  // ---------------------------------------------------------------------------
  async getPersonCessationInfo(
    personId: string,
  ): Promise<import('../types/admin').PersonCessationInfo | null> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/people/${personId}/cessation-info`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json: ApiResponse<import('../types/admin').PersonCessationInfo> = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[AdminService] Error al obtener información de cese:', e);
    }
    return null;
  },

  async ceasePerson(
    personId: string,
    payload: import('../types/admin').CeasePersonPayload,
  ): Promise<{
    success: boolean;
    result?: import('../types/admin').CeasePersonResult;
    error?: string;
  }> {
    const baseUrl = getBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/api/v1/people/${personId}/cease`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<import('../types/admin').CeasePersonResult> = await res.json();
      if (res.ok && json.success && json.data) {
        return { success: true, result: json.data };
      }
      return { success: false, error: json.message || 'Error al procesar el cese laboral' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  },
};
