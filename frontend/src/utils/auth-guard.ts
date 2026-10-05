import { UserSummary } from '../types/auth';

/**
 * Verifica si un usuario tiene acceso a un módulo específico del SIGM.
 * ROOT y Administrador Central tienen acceso irrestricto.
 */
export function canAccessModule(user: UserSummary | null, moduleCode: string): boolean {
  if (!user) return false;
  if (user.username?.toUpperCase() === 'ROOT') return true;
  if (user.role?.toLowerCase() === 'administrador central') return true;

  if (Array.isArray(user.allowedModules)) {
    return user.allowedModules.map((m) => m.toLowerCase()).includes(moduleCode.toLowerCase());
  }

  return false;
}

/**
 * Determina si el usuario tiene perfil de solicitante / reportante general.
 * Este perfil NO es técnico informático y solo registra y da seguimiento a sus incidencias.
 */
export function isReportanteUser(user: UserSummary | null): boolean {
  if (!user) return true;
  if (user.username?.toUpperCase() === 'ROOT') return false;
  if (user.role?.toLowerCase() === 'administrador central') return false;

  const roleUpper = (user.role || '').toUpperCase();
  return (
    roleUpper.includes('REPORTANTE') ||
    roleUpper.includes('PERSONAL GENERAL') ||
    roleUpper.includes('SOLICITANTE') ||
    roleUpper.includes('OPERADOR DE TRANSPORTES')
  );
}

/**
 * Determina si el usuario tiene rol técnico o administrativo en TI.
 */
export function isTechnicianOrAdmin(user: UserSummary | null): boolean {
  if (!user) return false;
  if (user.username?.toUpperCase() === 'ROOT') return true;
  if (user.role?.toLowerCase() === 'administrador central') return true;

  const roleLower = (user.role || '').toLowerCase();
  return (
    (roleLower.includes('técnico') ||
      roleLower.includes('tecnico') ||
      roleLower.includes('sistemas') ||
      roleLower.includes('itam') ||
      roleLower.includes('soporte')) &&
    !isReportanteUser(user)
  );
}
