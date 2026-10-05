'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { OfficeItem } from '../../types/office';
import { officeService } from '../../services/office.service';
import { OfficeFormModal } from './OfficeFormModal';

export const OfficesManagementView: React.FC = () => {
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [treeOffices, setTreeOffices] = useState<OfficeItem[]>([]);
  const [sedesList, setSedesList] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedSede, setSelectedSede] = useState<string>('TODAS');
  const [selectedLevel, setSelectedLevel] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

  // Modal de creación / edición
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [officeToEdit, setOfficeToEdit] = useState<OfficeItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, tree, sedes] = await Promise.all([
        officeService.getOffices(),
        officeService.getOfficeTree(),
        officeService.getSedes(),
      ]);
      setOffices(list);
      setTreeOffices(tree);
      setSedesList(sedes);
    } catch (err) {
      console.error('Error al cargar dependencias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setOfficeToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (office: OfficeItem) => {
    setOfficeToEdit(office);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Está seguro de eliminar la dependencia "${name}"?`)) {
      try {
        await officeService.deleteOffice(id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  // Filtrado
  const filteredOffices = useMemo(() => {
    return offices.filter((o) => {
      const matchesSearch =
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.code.toLowerCase().includes(search.toLowerCase()) ||
        o.acronym.toLowerCase().includes(search.toLowerCase()) ||
        (o.parentName && o.parentName.toLowerCase().includes(search.toLowerCase()));

      const matchesSede = selectedSede === 'TODAS' || o.sede === selectedSede;
      const matchesLevel =
        selectedLevel === 'TODOS' || o.level === parseInt(selectedLevel, 10);

      return matchesSearch && matchesSede && matchesLevel;
    });
  }, [offices, search, selectedSede, selectedLevel]);

  // Colores para sedes
  const getSedeBadgeColor = (sedeName: string) => {
    if (sedeName.includes('PRINCIPAL')) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (sedeName.includes('RENTAS') || sedeName.includes('TRIBUTARIA')) {
      return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
    if (sedeName.includes('OBRAS') || sedeName.includes('DESARROLLO URBANO')) {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    if (sedeName.includes('MAESTRANZA') || sedeName.includes('SERVICIOS PÚBLICOS')) {
      return 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    }
    if (sedeName.includes('SERENAZGO') || sedeName.includes('SEGURIDAD')) {
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    if (sedeName.includes('MERCADO')) {
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    if (sedeName.includes('SOCIAL') || sedeName.includes('DEMUNA')) {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  // Nivel badge label
  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Nivel 1 (Alta Dirección / Gerencia)';
      case 2:
        return 'Nivel 2 (Subgerencia / Of. Gral.)';
      case 3:
        return 'Nivel 3 (Oficina / Unidad)';
      case 4:
        return 'Nivel 4 (Subunidad / Área)';
      default:
        return `Nivel ${level}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-300 tracking-wider uppercase mb-1">
            <span>🏛️</span>
            <span>MUNICIPALIDAD DISTRITAL DE CASTILLA</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Estructura Orgánica y Dependencias
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl">
            Catálogo jerárquico de oficinas, gerencias, subgerencias y unidades organizacionales con asignación de sede física institucional.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
          >
            <span className="text-base">➕</span>
            <span>Nueva Dependencia</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Dependencias</span>
            <span className="text-base">🏢</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {offices.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Estructura ROF</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Sedes Municipales</span>
            <span className="text-base">📍</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {sedesList.length}
          </div>
          <span className="text-[11px] text-slate-500">Locales institucionales</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Alta Dirección y Gerencias</span>
            <span className="text-base">👔</span>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {offices.filter((o) => o.level === 1).length}
          </div>
          <span className="text-[11px] text-slate-500">Nivel 1 institucional</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Subgerencias y Unidades</span>
            <span className="text-base">📂</span>
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {offices.filter((o) => o.level > 1).length}
          </div>
          <span className="text-[11px] text-slate-500">Áreas operativas</span>
        </div>
      </div>

      {/* Barra de Filtros y Switch de Vista */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código (ej. 03.02), sigla (ej. ODT) o nombre..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filtro por Sede (Requerimiento Clave) */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              📍 Sede:
            </label>
            <select
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
              className="text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="TODAS">Todas las Sedes ({offices.length})</option>
              {sedesList.map((s) => (
                <option key={s} value={s}>
                  {s} ({offices.filter((o) => o.sede === s).length})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Nivel */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Nivel:
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="TODOS">Todos los Niveles</option>
              <option value="1">Nivel 1: Alta Dirección / Gerencias</option>
              <option value="2">Nivel 2: Subgerencias / Of. Generales</option>
              <option value="3">Nivel 3: Oficinas</option>
              <option value="4">Nivel 4: Unidades / Áreas</option>
            </select>
          </div>

          {/* Toggle Tabla / Árbol */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              📋 Tabla
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'tree'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🌳 Organigrama
            </button>
          </div>
        </div>
      </div>

      {/* Contenido: Modo Tabla o Modo Árbol */}
      {loading ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="animate-spin text-3xl mb-3">🔄</div>
          <p className="text-xs text-slate-500">Cargando estructura orgánica...</p>
        </div>
      ) : viewMode === 'table' ? (
        /* VISTA TABLA DETALLADA */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-24">Código</th>
                  <th className="py-3.5 px-3 w-20">Sigla</th>
                  <th className="py-3.5 px-4">Dependencia / Oficina</th>
                  <th className="py-3.5 px-4">Dependencia Superior</th>
                  <th className="py-3.5 px-4">Sede de Ubicación</th>
                  <th className="py-3.5 px-3 w-24 text-center">Nivel</th>
                  <th className="py-3.5 px-3 w-20 text-center">Estado</th>
                  <th className="py-3.5 px-4 w-24 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredOffices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                      No se encontraron dependencias que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  filteredOffices.map((office) => (
                    <tr
                      key={office.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {office.code}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[10px] border border-slate-200 dark:border-slate-700">
                          {office.acronym}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {office.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {office.parentName ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-slate-400">↳</span>
                            <span className="text-[11px] truncate max-w-xs">{office.parentName}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">-- Órgano Superior --</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getSedeBadgeColor(
                            office.sede,
                          )}`}
                        >
                          <span>📍</span>
                          <span className="truncate max-w-[200px]">{office.sede}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Nivel {office.level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            office.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {office.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(office)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"
                            title="Editar dependencia"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(office.id, office.name)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-600 dark:text-rose-400 transition-colors"
                            title="Eliminar dependencia"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center">
            <span>
              Mostrando {filteredOffices.length} de {offices.length} dependencias registradas
            </span>
            <span className="text-[11px] text-slate-400">ROF Municipalidad Distrital de Castilla</span>
          </div>
        </div>
      ) : (
        /* VISTA ORGANIGRAMA JERÁRQUICO (ÁRBOL) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Árbol Jerárquico Organizacional
              </h3>
              <p className="text-xs text-slate-400">
                Visualización anidada por niveles de mando y dependencias adscritas.
              </p>
            </div>
            <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">
              {treeOffices.length} Órganos Principales
            </span>
          </div>

          <div className="space-y-3">
            {treeOffices.map((rootNode) => (
              <TreeNode key={rootNode.id} node={rootNode} onEdit={handleEdit} getSedeBadgeColor={getSedeBadgeColor} />
            ))}
          </div>
        </div>
      )}

      {/* Modal Formulario */}
      <OfficeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadData}
        officeToEdit={officeToEdit}
        existingOffices={offices}
        sedesList={sedesList}
      />
    </div>
  );
};

// Componente recursivo para renderizar nodos del árbol
const TreeNode: React.FC<{
  node: OfficeItem;
  onEdit: (node: OfficeItem) => void;
  getSedeBadgeColor: (sede: string) => string;
}> = ({ node, onEdit, getSedeBadgeColor }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
      <div className="flex items-start md:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 flex-1">
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold"
            >
              {expanded ? '▼' : '►'}
            </button>
          )}
          <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {node.code}
          </span>
          <span className="font-mono font-black text-xs text-slate-800 dark:text-slate-200">
            [{node.acronym}]
          </span>
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            {node.name}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSedeBadgeColor(
              node.sede,
            )}`}
          >
            📍 {node.sede}
          </span>
          <button
            onClick={() => onEdit(node)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs text-blue-600"
            title="Editar"
          >
            ✏️
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="pl-6 pt-3 mt-2 border-l-2 border-emerald-300 dark:border-emerald-700 space-y-2">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              getSedeBadgeColor={getSedeBadgeColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};
