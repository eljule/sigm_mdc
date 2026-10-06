import { Module, ApiResponse } from '../types/module';

export const FALLBACK_MODULES: Module[] = [
  {
    id: 'f1e2d3c4-b5a6-4789-9101-112131415161',
    code: 'central_dashboard',
    name: 'Dashboard Central y Configuración',
    description: 'Núcleo y launcher del SIGM con accesos consolidados, métricas generales y administración de parámetros.',
    iconUrl: '🏢',
    route: '/admin',
    accentColor: '#16a34a', // Verde institucional
    order: 1,
    isActive: true,
    requiresAuth: true,
    secondaryAction: null,
  },
  {
    id: 'a1b2c3d4-e5f6-4789-9101-112131415162',
    code: 'transport_licenses',
    name: 'Licencias de Transportes',
    description: 'Empadronamiento de vehículos menores, licencias de conducir y registro de mototaxis del distrito.',
    iconUrl: '🚗',
    route: '/transportes',
    accentColor: '#ea580c', // Naranja vibrante
    order: 2,
    isActive: true,
    requiresAuth: true,
    secondaryAction: null,
  },
  {
    id: 'b1c2d3e4-f5a6-4789-9101-112131415163',
    code: 'it_inventory',
    name: 'Inventario y Gestión TI',
    description: 'Gestión de activos de hardware y software (ITAM), asignación por dependencias y control de garantías.',
    iconUrl: '💻',
    route: '/itam',
    accentColor: '#2563eb', // Azul corporativo
    order: 3,
    isActive: true,
    requiresAuth: true,
    secondaryAction: null,
  },
  {
    id: 'c1d2e3f4-a5b6-4789-9101-112131415164',
    code: 'helpdesk_support',
    name: 'Soporte Técnico y Helpdesk',
    description: 'Mesa de partes y resolución de incidencias informáticas, seguimiento de tickets y atención a usuarios.',
    iconUrl: '🎧',
    route: '/soporte',
    accentColor: '#7c3aed', // Morado
    order: 4,
    isActive: true,
    requiresAuth: true,
    secondaryAction: {
      label: 'Generar Ticket de Soporte',
      route: '/soporte/nuevo-ticket',
      variant: 'outline',
    },
  },
];

/**
 * Consulta los módulos activos al backend de NestJS.
 * Admite comunicación interna de red Docker (INTERNAL_API_URL=http://backend:4000)
 * o acceso de desarrollo local (NEXT_PUBLIC_API_URL=http://localhost:4000).
 * Si el backend está iniciando o no responde, utiliza un fallback seguro con los 4 módulos iniciales.
 * Permite filtrar por códigos autorizados para el usuario activo.
 */
export async function getActiveModules(allowedCodes?: string[]): Promise<Module[]> {
  // En SSR dentro de Docker se prefiere INTERNAL_API_URL; en cliente o local NEXT_PUBLIC_API_URL
  const baseUrl =
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : process.env.INTERNAL_API_URL) ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';

  const filterModules = (list: Module[]): Module[] => {
    if (allowedCodes === undefined) {
      return list;
    }
    if (allowedCodes.length === 0) {
      return [];
    }
    const set = new Set(allowedCodes.map((c) => c.toLowerCase()));
    return list.filter((m) => set.has(m.code.toLowerCase()));
  };

  try {
    const query = allowedCodes && allowedCodes.length > 0 ? `?allowed=${encodeURIComponent(allowedCodes.join(','))}` : '';
    const res = await fetch(`${baseUrl}/api/v1/modules${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[ModulesService] Estado de respuesta ${res.status}. Usando fallback local.`);
      return filterModules(FALLBACK_MODULES);
    }

    const responseJson: ApiResponse<Module[]> = await res.json();
    if (responseJson.success && Array.isArray(responseJson.data)) {
      return filterModules(responseJson.data);
    }

    return filterModules(FALLBACK_MODULES);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.info(`[ModulesService] Backend no accesible (${msg}). Utilizando datos de contingencia.`);
    return filterModules(FALLBACK_MODULES);
  }
}

function getBaseUrl(): string {
  return (
    (typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : process.env.INTERNAL_API_URL) ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000'
  );
}

/**
 * Obtiene todos los subsistemas (incluidos inactivos y en mantenimiento) para el panel de administración.
 */
export async function getAllModules(): Promise<Module[]> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/v1/modules?all=true`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const responseJson: ApiResponse<Module[]> = await res.json();
      if (responseJson.success && Array.isArray(responseJson.data)) {
        return responseJson.data;
      }
    }
  } catch (error) {
    console.warn('[ModulesService] Error al obtener todos los subsistemas:', error);
  }
  return FALLBACK_MODULES;
}

/**
 * Obtiene un subsistema por código o UUID.
 */
export async function getModuleByIdOrCode(idOrCode: string): Promise<Module | null> {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/v1/modules/${encodeURIComponent(idOrCode)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const responseJson: ApiResponse<Module> = await res.json();
      if (responseJson.success && responseJson.data) {
        return responseJson.data;
      }
    }
  } catch (error) {
    console.warn(`[ModulesService] Error al obtener subsistema ${idOrCode}:`, error);
  }

  // Fallback local por código
  const fallback = FALLBACK_MODULES.find(
    (m) => m.code.toLowerCase() === idOrCode.toLowerCase() || m.id === idOrCode,
  );
  return fallback || null;
}

/**
 * Registra un nuevo subsistema en el núcleo SIGM.
 */
export async function createModule(data: Partial<Module>): Promise<Module> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseJson = await res.json();
  if (!res.ok || !responseJson.success) {
    throw new Error(responseJson.message || 'Error al registrar nuevo subsistema');
  }

  return responseJson.data;
}

/**
 * Actualiza los parámetros de un subsistema existente.
 */
export async function updateModule(id: string, data: Partial<Module>): Promise<Module> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/modules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const responseJson = await res.json();
  if (!res.ok || !responseJson.success) {
    throw new Error(responseJson.message || 'Error al actualizar subsistema');
  }

  return responseJson.data;
}

/**
 * Conmuta o establece el modo mantenimiento de un subsistema.
 */
export async function setModuleMaintenance(
  id: string,
  payload: {
    isUnderMaintenance: boolean;
    maintenanceMessage?: string | null;
    estimatedRecoveryTime?: string | null;
  },
): Promise<Module> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/v1/modules/${id}/maintenance`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const responseJson = await res.json();
  if (!res.ok || !responseJson.success) {
    throw new Error(responseJson.message || 'Error al actualizar estado de mantenimiento');
  }

  return responseJson.data;
}

