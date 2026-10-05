import { Module, ApiResponse } from '../types/module';

export const FALLBACK_MODULES: Module[] = [
  {
    id: 'f1e2d3c4-b5a6-4789-9101-112131415161',
    code: 'central_dashboard',
    name: 'Dashboard Central y Configuración',
    description: 'Núcleo y launcher del SIGM con accesos consolidados, métricas generales y administración de parámetros.',
    iconUrl: 'icons/dashboard.svg',
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
    iconUrl: 'icons/transport.svg',
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
    iconUrl: 'icons/inventory.svg',
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
    iconUrl: 'icons/helpdesk.svg',
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
