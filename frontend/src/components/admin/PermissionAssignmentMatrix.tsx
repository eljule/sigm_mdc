'use client';

import React, { useState, useEffect } from 'react';
import { RoleItem, SubsystemPermissionGroup, PermissionItem } from '../../types/admin';

interface PermissionAssignmentMatrixProps {
  roles: RoleItem[];
  subsystemGroups: SubsystemPermissionGroup[];
  totalPermissionsCount: number;
  allPermissions: PermissionItem[];
  selectedRoleId?: string | null;
  onSelectRole: (role: RoleItem) => void;
  onSaveAssignment: (roleId: string, permissionCodes: string[]) => Promise<boolean>;
}

const SUBSYSTEM_META: Record<string, { icon: string; name: string; color: string; border: string; bgActive: string }> = {
  central_dashboard: {
    icon: '🏢',
    name: 'Dashboard Central y Configuración',
    color: '#16a34a',
    border: 'border-emerald-500',
    bgActive: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  transport_licenses: {
    icon: '🚗',
    name: 'Licencias de Transportes',
    color: '#ea580c',
    border: 'border-orange-500',
    bgActive: 'bg-orange-50 dark:bg-orange-950/40',
  },
  it_inventory: {
    icon: '💻',
    name: 'Inventario TI (ITAM)',
    color: '#2563eb',
    border: 'border-blue-500',
    bgActive: 'bg-blue-50 dark:bg-blue-950/40',
  },
  helpdesk_support: {
    icon: '🎧',
    name: 'Soporte y Helpdesk',
    color: '#7c3aed',
    border: 'border-purple-500',
    bgActive: 'bg-purple-50 dark:bg-purple-950/40',
  },
};

export const PermissionAssignmentMatrix: React.FC<PermissionAssignmentMatrixProps> = ({
  roles,
  subsystemGroups,
  totalPermissionsCount,
  allPermissions,
  selectedRoleId,
  onSelectRole,
  onSaveAssignment,
}) => {
  const currentRole = roles.find((r) => r.id === selectedRoleId) || roles[0] || null;

  // Set de permisos actualmente marcados para el rol seleccionado
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar estado cuando cambia el rol seleccionado
  useEffect(() => {
    if (currentRole) {
      const initialCodes = new Set(currentRole.permissionCodes || []);
      setSelectedPermissions(initialCodes);
      setHasChanges(false);
    }
  }, [currentRole?.id, currentRole?.permissionCodes]);

  // Alternar un permiso individual
  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      checkChanges(next);
      return next;
    });
  };

  // Marcar todos los permisos de un subsistema
  const selectAllInSubsystem = (subsystemCode: string) => {
    const group = subsystemGroups.find((g) => g.subsystemCode === subsystemCode);
    if (!group) return;

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      group.permissions.forEach((p) => next.add(p.code));
      checkChanges(next);
      return next;
    });
  };

  // Desmarcar todos los permisos de un subsistema
  const unselectAllInSubsystem = (subsystemCode: string) => {
    const group = subsystemGroups.find((g) => g.subsystemCode === subsystemCode);
    if (!group) return;

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      group.permissions.forEach((p) => next.delete(p.code));
      checkChanges(next);
      return next;
    });
  };

  // Marcar todos los permisos de la plataforma
  const selectAllPlatform = () => {
    const next = new Set(allPermissions.map((p) => p.code));
    setSelectedPermissions(next);
    checkChanges(next);
  };

  // Desmarcar todos los permisos de la plataforma
  const unselectAllPlatform = () => {
    const next = new Set<string>();
    setSelectedPermissions(next);
    checkChanges(next);
  };

  // Verificar si hay cambios sin guardar
  const checkChanges = (currentSet: Set<string>) => {
    if (!currentRole) return;
    const originalSet = new Set(currentRole.permissionCodes || []);
    if (currentSet.size !== originalSet.size) {
      setHasChanges(true);
      return;
    }
    for (const code of currentSet) {
      if (!originalSet.has(code)) {
        setHasChanges(true);
        return;
      }
    }
    setHasChanges(false);
  };

  // Restablecer cambios
  const handleReset = () => {
    if (!currentRole) return;
    setSelectedPermissions(new Set(currentRole.permissionCodes || []));
    setHasChanges(false);
  };

  // Guardar asignación en el backend
  const handleSave = async () => {
    if (!currentRole) return;
    setIsSaving(true);
    try {
      const success = await onSaveAssignment(
        currentRole.id,
        Array.from(selectedPermissions),
      );
      if (success) {
        setHasChanges(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentRole) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
        <p className="text-slate-500">No hay roles registrados para asignar permisos.</p>
      </div>
    );
  }

  const assignedCount = selectedPermissions.size;
  const percentage = totalPermissionsCount > 0 ? Math.round((assignedCount / totalPermissionsCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* 1. Header de la Matriz */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Matriz de Asignación de Permisos por Rol
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              Control Granular
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Seleccione el rol a configurar y active o desactive los permisos por módulo de manera interactiva.
          </p>
        </div>

        {/* Botón de guardado rápido si hay cambios */}
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 ${
            hasChanges
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>💾</span>
          )}
          <span>Guardar Permisos del Rol</span>
        </button>
      </div>

      {/* 2. Selector Visual de Rol */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
          Seleccione el Rol Institucional a Configurar:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {roles.map((r) => {
            const isSelected = r.id === currentRole.id;
            const rPermissionsCount = r.permissionCodes?.length || 0;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRole(r)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {r.name}
                  </span>
                  {r.isSystem && (
                    <span className="text-[10px]" title="Rol del Sistema">
                      🔒
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{r.code}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {isSelected ? assignedCount : rPermissionsCount} de {totalPermissionsCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Barra Informativa del Rol Activo */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl font-bold shadow-inner shrink-0">
            🎭
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {currentRole.name}
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {currentRole.code}
              </span>
              {currentRole.isSystem && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Rol del Sistema
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              {currentRole.description || 'Configuración de privilegios de acceso para este perfil.'}
            </p>
          </div>
        </div>

        {/* Métricas y Acciones Rápidas */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          <div className="text-right sm:pr-4 sm:border-r border-slate-200 dark:border-slate-800">
            <div className="text-sm font-black text-slate-900 dark:text-white">
              <span className="text-emerald-600 dark:text-emerald-400">{assignedCount}</span> /{' '}
              <span>{totalPermissionsCount}</span> permisos
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {percentage}% de cobertura de plataforma
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllPlatform}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-colors"
              title="Marcar todos los permisos del sistema"
            >
              ✓ Marcar Todos
            </button>
            <button
              onClick={unselectAllPlatform}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-200 transition-colors"
              title="Desmarcar todos los permisos"
            >
              ✕ Desmarcar Todos
            </button>
          </div>
        </div>
      </div>

      {/* 4. Módulos y Permisos Granulares */}
      <div className="space-y-6">
        {subsystemGroups.map((group) => {
          const meta = SUBSYSTEM_META[group.subsystemCode] || {
            icon: '⚙️',
            name: group.subsystemName,
            color: group.color,
            border: 'border-slate-400',
            bgActive: 'bg-slate-50 dark:bg-slate-900',
          };

          // Contar cuántos de este módulo están asignados
          const activeInGroup = group.permissions.filter((p) =>
            selectedPermissions.has(p.code),
          ).length;
          const isAllGroupSelected =
            activeInGroup === group.permissions.length && group.permissions.length > 0;

          return (
            <div
              key={group.subsystemCode}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Cabecera del Módulo con Toggle Rápido */}
              <div
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800"
                style={{
                  borderLeftColor: meta.color,
                  borderLeftWidth: '6px',
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {meta.name}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-500">
                      {activeInGroup} de {group.permissions.length} privilegios concedidos
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => selectAllInSubsystem(group.subsystemCode)}
                    disabled={isAllGroupSelected}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-colors"
                  >
                    ✓ Todo el módulo
                  </button>
                  <button
                    type="button"
                    onClick={() => unselectAllInSubsystem(group.subsystemCode)}
                    disabled={activeInGroup === 0}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-colors"
                  >
                    ✕ Ninguno
                  </button>
                </div>
              </div>

              {/* Grid de Permisos con Switch Interactivo */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {group.permissions.map((perm) => {
                  const isChecked = selectedPermissions.has(perm.code);
                  return (
                    <div
                      key={perm.id || perm.code}
                      onClick={() => togglePermission(perm.code)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                        isChecked
                          ? `border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-500 shadow-xs`
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div>
                        {/* Cabecera con Switch */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 truncate">
                            {perm.code}
                          </span>

                          {/* Toggle Switch Visual */}
                          <div
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 ${
                              isChecked ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                isChecked ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Nombre del Permiso */}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 leading-snug">
                          {perm.name || perm.code}
                        </h4>

                        {/* Descripción */}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                          {perm.description || 'Sin descripción adicional'}
                        </p>
                      </div>

                      {/* Estado en el pie */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                        <span
                          className={`font-bold uppercase tracking-wider ${
                            isChecked
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {isChecked ? '✓ Habilitado' : '○ Denegado'}
                        </span>
                        <span className="font-mono text-slate-400 uppercase font-semibold">
                          {perm.category || 'GENERAL'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Barra Flotante Inferior de Guardado (Sticky Action Bar) */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-72 sm:right-8 z-40">
        <div className="bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <span className="font-bold text-slate-200">
                Rol: {currentRole.name} &bull;{' '}
              </span>
              <span className="text-emerald-400 font-bold">
                {assignedCount} permisos seleccionados
              </span>
              {hasChanges && (
                <span className="ml-2 text-amber-300 font-medium animate-pulse">
                  (¡Cambios sin guardar!)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-xl border border-slate-600 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
              >
                Restablecer
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 ${
                hasChanges
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isSaving && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{hasChanges ? '💾 Guardar Asignación' : '✓ Permisos al día'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
