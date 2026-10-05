'use client';

import React, { useState } from 'react';
import { RoleItem } from '../../types/admin';

interface RolesManagementViewProps {
  roles: RoleItem[];
  totalPermissionsCount: number;
  onOpenCreateModal: () => void;
  onEditRole: (role: RoleItem) => void;
  onDeleteRole: (role: RoleItem) => void;
  onConfigurePermissions: (role: RoleItem) => void;
}

const SUBSYSTEM_BADGES: Record<string, { name: string; color: string; icon: string }> = {
  central_dashboard: { name: 'Dashboard Central', color: '#16a34a', icon: '🏢' },
  transport_licenses: { name: 'Licencias de Transporte', color: '#ea580c', icon: '🚗' },
  it_inventory: { name: 'Inventario TI (ITAM)', color: '#2563eb', icon: '💻' },
  helpdesk_support: { name: 'Soporte y Helpdesk', color: '#7c3aed', icon: '🎧' },
  global: { name: 'Multisubsistema (Global)', color: '#0d9488', icon: '🌐' },
};

export const RolesManagementView: React.FC<RolesManagementViewProps> = ({
  roles,
  totalPermissionsCount,
  onOpenCreateModal,
  onEditRole,
  onDeleteRole,
  onConfigurePermissions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subsystemFilter, setSubsystemFilter] = useState('TODOS');

  // Filtrado
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSubsystem =
      subsystemFilter === 'TODOS' || role.subsystemCode === subsystemFilter;

    return matchesSearch && matchesSubsystem;
  });

  const systemRolesCount = roles.filter((r) => r.isSystem).length;
  const customRolesCount = roles.filter((r) => !r.isSystem).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header con Título y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Mantenimiento de Roles Institucionales
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              {roles.length} roles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administre los perfiles institucionales de la Municipalidad de Castilla y configure los permisos asociados a cada función.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:shadow-lg flex items-center space-x-2 shrink-0"
        >
          <span className="text-base font-bold">+</span>
          <span>Nuevo Rol Institucional</span>
        </button>
      </div>

      {/* 2. Tarjetas de Resumen Rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Roles Registrados
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{roles.length}</p>
            <p className="text-[10px] text-slate-500">Perfiles de seguridad activos</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-lg font-bold">
            🎭
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Roles Base del Sistema
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{systemRolesCount}</p>
            <p className="text-[10px] text-slate-500">Protegidos contra eliminación accidental</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg font-bold">
            🔒
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Roles Personalizados
            </span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{customRolesCount}</p>
            <p className="text-[10px] text-slate-500">Creados por la administración municipal</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-lg font-bold">
            👤
          </div>
        </div>
      </div>

      {/* 3. Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSubsystemFilter('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subsystemFilter === 'TODOS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Todos ({roles.length})
          </button>
          {Object.entries(SUBSYSTEM_BADGES).map(([key, info]) => {
            const count = roles.filter((r) => r.subsystemCode === key).length;
            if (count === 0 && key !== 'global') return null;
            return (
              <button
                key={key}
                onClick={() => setSubsystemFilter(key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
                  subsystemFilter === key
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.name}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por rol, código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 4. Tabla de Roles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Listado de Roles ({filteredRoles.length})
          </h3>
          <span className="text-xs text-slate-400">
            Haga clic en &quot;⚡ Asignar Permisos&quot; para configurar privilegios por módulo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Rol & Identificador</th>
                <th className="py-3 px-4">Ámbito / Subsistema</th>
                <th className="py-3 px-4">Descripción Funcional</th>
                <th className="py-3 px-4">Permisos Concedidos</th>
                <th className="py-3 px-4 text-center">Tipo</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredRoles.map((role) => {
                const subInfo = SUBSYSTEM_BADGES[role.subsystemCode] || SUBSYSTEM_BADGES.global;
                const permissionsCount = role.permissionCodes?.length || 0;
                const percent = totalPermissionsCount > 0 ? Math.round((permissionsCount / totalPermissionsCount) * 100) : 0;

                return (
                  <tr key={role.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Rol & Identificador */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs font-bold"
                          style={{
                            backgroundColor: `${subInfo.color}20`,
                            color: subInfo.color,
                          }}
                        >
                          {subInfo.icon}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-xs">
                            {role.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {role.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Subsistema */}
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: subInfo.color }}
                      >
                        <span>{subInfo.icon}</span>
                        <span>{subInfo.name}</span>
                      </span>
                    </td>

                    {/* Descripción */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs">
                      <p className="line-clamp-2 leading-relaxed">{role.description || 'Sin descripción definida'}</p>
                    </td>

                    {/* Permisos Concedidos */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-emerald-700 dark:text-emerald-400">
                            {permissionsCount} de {totalPermissionsCount}
                          </span>
                          <span className="text-slate-400 font-mono">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Tipo: Sistema vs Personalizado */}
                    <td className="py-3.5 px-4 text-center">
                      {role.isSystem ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                          <span>🔒</span>
                          <span>Sistema</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-700">
                          <span>👤</span>
                          <span>Personalizado</span>
                        </span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        Activo
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onConfigurePermissions(role)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-100 transition-colors flex items-center space-x-1"
                          title="Asignar y configurar permisos granulares"
                        >
                          <span>⚡</span>
                          <span className="hidden sm:inline">Permisos</span>
                        </button>

                        <button
                          onClick={() => onEditRole(role)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                          title="Editar detalles del rol"
                        >
                          ✏️
                        </button>

                        {!role.isSystem && (
                          <button
                            onClick={() => onDeleteRole(role)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs transition-colors"
                            title="Eliminar rol personalizado"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
