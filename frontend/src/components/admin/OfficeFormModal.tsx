'use client';

import React, { useState, useEffect } from 'react';
import { OfficeItem, CreateOfficePayload, UpdateOfficePayload } from '../../types/office';

interface OfficeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  officeToEdit?: OfficeItem | null;
  existingOffices: OfficeItem[];
  sedesList: string[];
}

export const OfficeFormModal: React.FC<OfficeFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  officeToEdit,
  existingOffices,
  sedesList,
}) => {
  const [code, setCode] = useState('');
  const [acronym, setAcronym] = useState('');
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [sede, setSede] = useState('PALACIO MUNICIPAL (SEDE PRINCIPAL)');
  const [customSede, setCustomSede] = useState('');
  const [isCustomSede, setIsCustomSede] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (officeToEdit) {
      setCode(officeToEdit.code);
      setAcronym(officeToEdit.acronym);
      setName(officeToEdit.name);
      setParentId(officeToEdit.parentId || '');
      setIsActive(officeToEdit.isActive);

      if (sedesList.includes(officeToEdit.sede)) {
        setSede(officeToEdit.sede);
        setIsCustomSede(false);
        setCustomSede('');
      } else {
        setSede('OTRA');
        setIsCustomSede(true);
        setCustomSede(officeToEdit.sede);
      }
    } else {
      setCode('');
      setAcronym('');
      setName('');
      setParentId('');
      setSede(sedesList[0] || 'PALACIO MUNICIPAL (SEDE PRINCIPAL)');
      setIsCustomSede(false);
      setCustomSede('');
      setIsActive(true);
    }
    setError(null);
  }, [officeToEdit, isOpen, sedesList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !acronym.trim() || !name.trim()) {
      setError('Por favor complete los campos obligatorios (Código, Sigla y Nombre).');
      return;
    }

    const finalSede = isCustomSede ? customSede.trim() : sede;
    if (!finalSede) {
      setError('Por favor especifique la Sede de la dependencia.');
      return;
    }

    const selectedParent = existingOffices.find((o) => o.id === parentId);

    setLoading(true);
    try {
      const { officeService } = await import('../../services/office.service');

      if (officeToEdit) {
        const payload: UpdateOfficePayload = {
          code: code.trim(),
          acronym: acronym.trim().toUpperCase(),
          name: name.trim().toUpperCase(),
          parentId: parentId || null,
          parentName: selectedParent ? selectedParent.name : null,
          sede: finalSede.toUpperCase(),
          isActive,
        };
        await officeService.updateOffice(officeToEdit.id, payload);
      } else {
        const payload: CreateOfficePayload = {
          code: code.trim(),
          acronym: acronym.trim().toUpperCase(),
          name: name.trim().toUpperCase(),
          parentId: parentId || null,
          parentName: selectedParent ? selectedParent.name : null,
          sede: finalSede.toUpperCase(),
          isActive,
        };
        await officeService.createOffice(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la dependencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <span className="text-xl">🏢</span>
            </div>
            <div>
              <h3 className="font-bold text-base">
                {officeToEdit ? 'Editar Dependencia / Oficina' : 'Nueva Dependencia / Oficina'}
              </h3>
              <p className="text-xs text-emerald-100">
                Estructura orgánica de la Municipalidad Distrital de Castilla
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código Orgánico *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej. 03.02.05.01"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                required
              />
              <span className="text-[10px] text-slate-400">Jerárquico (ej. 01, 02.01, 03.01.01)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sigla Oficial *
              </label>
              <input
                type="text"
                value={acronym}
                onChange={(e) => setAcronym(e.target.value)}
                placeholder="Ej. ODT, OSTR, GAT"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo de la Dependencia *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. OFICINA DE DESARROLLO TECNOLÓGICO"
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dependencia Superior (Padre Orgánico)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- Sin Dependencia Superior (Órgano Raíz / Nivel 1) --</option>
              {existingOffices
                .filter((o) => !officeToEdit || o.id !== officeToEdit.id)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.code} - [{o.acronym}] {o.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Campo Sede Municipal (Requerimiento Específico) */}
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
                <span>📍</span>
                <span>Sede Municipal de Ubicación *</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomSede(!isCustomSede)}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
              >
                {isCustomSede ? '← Seleccionar sede existente' : '+ Escribir otra sede'}
              </button>
            </div>

            {!isCustomSede ? (
              <select
                value={sede}
                onChange={(e) => {
                  if (e.target.value === 'OTRA') {
                    setIsCustomSede(true);
                  } else {
                    setSede(e.target.value);
                  }
                }}
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800 dark:text-slate-200"
              >
                {sedesList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="OTRA">+ Registrar / Especificar nueva Sede...</option>
              </select>
            ) : (
              <input
                type="text"
                value={customSede}
                onChange={(e) => setCustomSede(e.target.value)}
                placeholder="Ej. SEDE ANEXO BIBLIOTECA MUNICIPAL"
                className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-semibold text-slate-800 dark:text-slate-200"
                required
              />
            )}
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Indica la sede física o local institucional donde opera esta dependencia.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="isActiveCheck" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              Dependencia Activa en el Organigrama Municipal
            </label>
          </div>

          <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : officeToEdit ? 'Actualizar Dependencia' : 'Registrar Dependencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
