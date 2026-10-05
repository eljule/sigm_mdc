'use client';

import React, { useState } from 'react';
import { SubsystemPermissionGroup, PermissionItem } from '../../types/admin';

interface PermissionsCatalogViewProps {
  groups: SubsystemPermissionGroup[];
  totalPermissions: number;
}

const getCategoryBadge = (perm: PermissionItem) => {
  const cat = (perm.category || 'GENERAL').toUpperCase();
  const code = (perm.code || '').toLowerCase();

  let actionLabel = 'Gestión Integral';
  let badgeStyle = {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
  };

  if (code.includes('create') || code.includes('issue') || code.includes('register')) {
    actionLabel = 'Creación / Registro';
    badgeStyle = {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-800',
    };
  } else if (code.includes('view') || code.includes('read') || code.includes('list')) {
    actionLabel = 'Lectura / Consulta';
    badgeStyle = {
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-300 dark:border-sky-800',
    };
  } else if (
    code.includes('update') ||
    code.includes('edit') ||
    code.includes('assign') ||
    code.includes('resolve')
  ) {
    actionLabel = 'Modificación / Flujo';
    badgeStyle = {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
    };
  } else if (code.includes('delete') || code.includes('remove')) {
    actionLabel = 'Baja / Eliminación';
    badgeStyle = {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800',
    };
  }

  return { cat, actionLabel, badgeStyle };
};

export const PermissionsCatalogView: React.FC<PermissionsCatalogViewProps> = ({
  groups,
  totalPermissions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubsystem, setSelectedSubsystem] = useState('TODOS');

  // Filtrado defensivo de permisos
  const filteredGroups = (groups || [])
    .map((group) => {
      if (selectedSubsystem !== 'TODOS' && group.subsystemCode !== selectedSubsystem) {
        return null;
      }

      const permissions = group.permissions || [];
      const filteredItems = permissions.filter((perm) => {
        const nameStr = (perm?.name || '').toLowerCase();
        const codeStr = (perm?.code || '').toLowerCase();
        const descStr = (perm?.description || '').toLowerCase();
        const catStr = (perm?.category || '').toLowerCase();
        const search = searchTerm.trim().toLowerCase();

        if (!search) return true;

        return (
          nameStr.includes(search) ||
          codeStr.includes(search) ||
          descStr.includes(search) ||
          catStr.includes(search)
        );
      });

      return {
        ...group,
        permissions: filteredItems,
      };
    })
    .filter((g): g is SubsystemPermissionGroup => g !== null && g.permissions.length > 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header del Catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Catálogo de Permisos Granulares
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
              {totalPermissions} permisos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Diccionario oficial de operaciones autorizables estructuradas por subsistema del SIGM Castilla.
          </p>
        </div>

        {/* Resumen por Subsistemas */}
        <div className="flex flex-wrap items-center gap-2">
          {(groups || []).map((g) => (
            <div
              key={g.subsystemCode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {(g.permissions || []).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Filtros y Búsqueda */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs de Subsistema */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedSubsystem('TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSubsystem === 'TODOS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todos ({totalPermissions})
            </button>
            {(groups || []).map((g) => (
              <button
                key={g.subsystemCode}
                onClick={() => setSelectedSubsystem(g.subsystemCode)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  selectedSubsystem === g.subsystemCode
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                <span>{g.subsystemName}</span>
                <span className="text-[10px] opacity-80">({(g.permissions || []).length})</span>
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por código (ej. admin.users.create)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 3. Listado Agrupado por Subsistema */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-3xl mb-2">🔍</p>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No se encontraron permisos coincidentes
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Intente ajustar los términos de búsqueda o cambiar los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div
              key={group.subsystemCode}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Cabecera del Subsistema */}
              <div
                className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800"
                style={{
                  borderLeftColor: group.color,
                  borderLeftWidth: '6px',
                }}
              >
                <div className="flex items-center space-x-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                    style={{ backgroundColor: group.color }}
                  >
                    🔑
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {group.subsystemName}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      subsistema: {group.subsystemCode}
                    </span>
                  </div>
                </div>

                <span
                  className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: group.color }}
                >
                  {(group.permissions || []).length} permisos
                </span>
              </div>

              {/* Grid de Permisos */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(group.permissions || []).map((perm) => {
                  const { cat, actionLabel, badgeStyle } = getCategoryBadge(perm);
                  return (
                    <div
                      key={perm.id || perm.code}
                      className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Cabecera de la tarjeta: Código & Categoría */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono font-bold text-[11px] text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 truncate">
                            {perm.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                          >
                            {actionLabel}
                          </span>
                        </div>

                        {/* Nombre del Permiso */}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                          {perm.name || perm.code}
                        </h4>

                        {/* Descripción de Alcance */}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                          {perm.description || 'Sin descripción adicional'}
                        </p>
                      </div>

                      {/* Estado */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Activo en SIGM</span>
                        </span>
                        <span className="text-slate-400 uppercase font-mono font-bold">
                          {cat}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
