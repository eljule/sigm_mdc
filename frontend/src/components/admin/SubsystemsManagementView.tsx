import React, { useState, useEffect, useMemo } from 'react';
import { Module } from '../../types/module';
import {
  getAllModules,
  createModule,
  updateModule,
  setModuleMaintenance,
} from '../../services/modules.service';
import { SubsystemFormModal } from './SubsystemFormModal';
import { SubsystemMaintenanceModal } from './SubsystemMaintenanceModal';
import { Pagination } from '../Pagination';

const renderModuleIcon = (mod: Module) => {
  const iconMap: Record<string, string> = {
    central_dashboard: '🏢',
    'icons/dashboard.svg': '🏢',
    transport_licenses: '🚗',
    'icons/transport.svg': '🚗',
    it_inventory: '💻',
    'icons/inventory.svg': '💻',
    helpdesk_support: '🎧',
    'icons/helpdesk.svg': '🎧',
  };

  const iconVal = iconMap[mod.iconUrl] || iconMap[mod.code] || mod.iconUrl || '🏢';

  if (iconVal.endsWith('.svg') || iconVal.endsWith('.png') || iconVal.endsWith('.webp')) {
    const src = iconVal.startsWith('http') || iconVal.startsWith('/') ? iconVal : `/${iconVal}`;
    return (
      <img
        src={src}
        alt={mod.name}
        className="w-7 h-7 object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  return <span className="text-2xl leading-none select-none">{iconVal}</span>;
};

export const SubsystemsManagementView: React.FC = () => {
  const [subsystems, setSubsystems] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'>('ALL');

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedSubsystem, setSelectedSubsystem] = useState<Module | null>(null);

  // Notificaciones
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Paginación
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const loadSubsystems = async () => {
    setIsLoading(true);
    try {
      const data = await getAllModules();
      setSubsystems(data);
    } catch (err: any) {
      console.error('Error al cargar subsistemas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubsystems();
  }, []);

  const handleCreateNew = () => {
    setSelectedSubsystem(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (subsystem: Module) => {
    setSelectedSubsystem(subsystem);
    setIsFormModalOpen(true);
  };

  const handleOpenMaintenance = (subsystem: Module) => {
    setSelectedSubsystem(subsystem);
    setIsMaintenanceModalOpen(true);
  };

  const handleSaveSubsystem = async (data: Partial<Module>) => {
    try {
      if (selectedSubsystem && (selectedSubsystem.id || selectedSubsystem.code)) {
        const idToUpdate = selectedSubsystem.id || selectedSubsystem.code;
        const { code: _code, ...updatePayload } = data;
        await updateModule(idToUpdate, updatePayload);
        setAlertNotice({
          type: 'success',
          message: `Subsistema "${data.name || selectedSubsystem.name}" actualizado correctamente.`,
        });
      } else {
        await createModule(data);
        setAlertNotice({
          type: 'success',
          message: `Nuevo subsistema "${data.name}" registrado en el SIGM exitosamente.`,
        });
      }
      await loadSubsystems();
      setTimeout(() => setAlertNotice(null), 5000);
    } catch (err: any) {
      throw err;
    }
  };

  const handleSaveMaintenance = async (payload: {
    isUnderMaintenance: boolean;
    maintenanceMessage: string;
    estimatedRecoveryTime: string;
  }) => {
    if (!selectedSubsystem) return;
    try {
      await setModuleMaintenance(selectedSubsystem.id || selectedSubsystem.code, payload);
      setAlertNotice({
        type: 'success',
        message: payload.isUnderMaintenance
          ? `Subsistema "${selectedSubsystem.name}" puesto en MODO MANTENIMIENTO.`
          : `Subsistema "${selectedSubsystem.name}" restablecido a servicio normal.`,
      });
      await loadSubsystems();
      setTimeout(() => setAlertNotice(null), 5000);
    } catch (err: any) {
      throw err;
    }
  };

  // Filtrado
  const filteredSubsystems = useMemo(() => {
    return subsystems.filter((mod) => {
      const matchesSearch =
        mod.name.toLowerCase().includes(search.toLowerCase()) ||
        mod.code.toLowerCase().includes(search.toLowerCase()) ||
        mod.route.toLowerCase().includes(search.toLowerCase()) ||
        mod.description.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'ACTIVE') return mod.isActive && !mod.isUnderMaintenance;
      if (statusFilter === 'INACTIVE') return !mod.isActive;
      if (statusFilter === 'MAINTENANCE') return Boolean(mod.isUnderMaintenance);

      return true;
    });
  }, [subsystems, search, statusFilter]);

  // Reiniciar a página 1 al filtrar
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const paginatedSubsystems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSubsystems.slice(start, start + pageSize);
  }, [filteredSubsystems, page, pageSize]);

  // Métricas
  const totalCount = subsystems.length;
  const activeCount = subsystems.filter((s) => s.isActive && !s.isUnderMaintenance).length;
  const maintenanceCount = subsystems.filter((s) => s.isUnderMaintenance).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header con métricas y botón de creación */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-3xl">🧩</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Catálogo de Subsistemas SIGM
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Administración centralizada de módulos distritales, rutas, estados operativos y modo de mantenimiento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Badges de métricas */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
              Total: <strong>{totalCount}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
              Activos: <strong>{activeCount}</strong>
            </span>
            {maintenanceCount > 0 && (
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800 animate-pulse">
                🛠️ Mantenimiento: <strong>{maintenanceCount}</strong>
              </span>
            )}
          </div>

          {/* Botón Nuevo Subsistema */}
          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <span>+</span>
            <span>Nuevo Subsistema</span>
          </button>
        </div>
      </div>

      {/* Alerta de notificación si hubo acción */}
      {alertNotice && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold border shadow-sm flex items-center justify-between animate-fadeIn ${
            alertNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <span>{alertNotice.message}</span>
          <button onClick={() => setAlertNotice(null)} className="font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* 2. Barra de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código o ruta..."
            className="w-full text-xs p-2.5 pl-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Operativos ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('MAINTENANCE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'MAINTENANCE'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            En Mantenimiento ({maintenanceCount})
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'INACTIVE'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Inactivos ({subsystems.filter((s) => !s.isActive).length})
          </button>
        </div>
      </div>

      {/* 3. Grid de Subsistemas */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-medium">Cargando catálogo de subsistemas...</p>
        </div>
      ) : paginatedSubsystems.length === 0 ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-3xl block mb-2">🔍</span>
          <p className="text-sm font-semibold">No se encontraron subsistemas coincidentes</p>
          <p className="text-xs mt-1">Pruebe ajustando el término de búsqueda o los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedSubsystems.map((mod) => {
            const isMaintenance = Boolean(mod.isUnderMaintenance);

            return (
              <div
                key={mod.code}
                className={`p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between relative overflow-hidden ${
                  isMaintenance
                    ? 'border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                {/* Borde superior con acento de color */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: isMaintenance ? '#f59e0b' : mod.accentColor }}
                />

                <div>
                  {/* Fila superior: Icono, Código y Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
                        {renderModuleIcon(mod)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate">
                          {mod.code}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {mod.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isMaintenance ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                          🛠️ Mantenimiento
                        </span>
                      ) : mod.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ● Activo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          ○ Inactivo
                        </span>
                      )}

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Ruta: {mod.route}
                      </span>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {mod.description}
                  </p>

                  {/* Detalle si está en mantenimiento */}
                  {isMaintenance && (
                    <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>⏱️ Espera: {mod.estimatedRecoveryTime || 'No especificada'}</span>
                        <a
                          href={`/mantenimiento?code=${encodeURIComponent(mod.code)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-amber-700 dark:text-amber-300 underline font-semibold hover:text-amber-800"
                        >
                          👁️ Ver Pantalla
                        </a>
                      </div>
                      {mod.maintenanceMessage && (
                        <p className="text-[10px] text-amber-800 dark:text-amber-300/90 italic line-clamp-1">
                          &quot;{mod.maintenanceMessage}&quot;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Acciones del Subsistema */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-1.5">
                    {/* Botón Poner/Gestionar Mantenimiento */}
                    <button
                      onClick={() => handleOpenMaintenance(mod)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors border flex items-center space-x-1 ${
                        isMaintenance
                          ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                          : 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}
                      title="Gestionar estado de mantenimiento para este subsistema"
                    >
                      <span>🛠️</span>
                      <span>{isMaintenance ? 'Mantenimiento Activo' : 'Mantenimiento'}</span>
                    </button>

                    {/* Botón Editar Parámetros */}
                    <button
                      onClick={() => handleEdit(mod)}
                      className="px-2.5 py-1.5 rounded-lg font-semibold text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                      title="Modificar especificaciones del subsistema"
                    >
                      ✏️ Editar
                    </button>
                  </div>

                  {/* Enlace para Ingresar */}
                  <a
                    href={mod.route}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                  >
                    Ingresar &rarr;
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Paginación */}
      <Pagination
        currentPage={page}
        totalItems={filteredSubsystems.length}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* 5. Modales */}
      <SubsystemFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveSubsystem}
        subsystemToEdit={selectedSubsystem}
      />

      <SubsystemMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSave={handleSaveMaintenance}
        subsystem={selectedSubsystem}
      />
    </div>
  );
};
