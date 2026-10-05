'use client';

import React, { useState, useEffect } from 'react';
import { RoleItem, CreateRolePayload } from '../../types/admin';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateRolePayload, roleId?: string) => Promise<boolean>;
  initialRole?: RoleItem | null;
}

const SUBSYSTEM_OPTIONS = [
  { code: 'global', name: 'Global (Multisubsistema)' },
  { code: 'central_dashboard', name: 'Dashboard Central y Configuración' },
  { code: 'transport_licenses', name: 'Licencias de Transportes' },
  { code: 'it_inventory', name: 'Inventario TI (ITAM)' },
  { code: 'helpdesk_support', name: 'Soporte y Helpdesk' },
];

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRole,
}) => {
  const isEditing = Boolean(initialRole);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [subsystemCode, setSubsystemCode] = useState('global');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (initialRole) {
      setName(initialRole.name);
      setCode(initialRole.code);
      setDescription(initialRole.description || '');
      setSubsystemCode(initialRole.subsystemCode || 'global');
      setAutoSlug(false);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setSubsystemCode('global');
      setAutoSlug(true);
    }
  }, [initialRole, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug && !isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setCode(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await onSave(
        {
          name: name.trim(),
          code: code.trim().toLowerCase(),
          description: description.trim(),
          subsystemCode,
        },
        initialRole?.id,
      );
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
        >
          &times;
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold shadow-sm">
            🎭
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {isEditing ? 'Editar Rol Institucional' : 'Crear Nuevo Rol Institucional'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditing
                ? 'Modifique la información base del rol institucional.'
                : 'Defina un nuevo rol para asignarle permisos granulares por subsistema.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Nombre del Rol */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del Rol *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej. Fiscalizador de Transportes"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Código Único del Rol */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Código Identificador (Slug) *
              </label>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {autoSlug ? 'Auto-generando' : 'Modo manual'}
                </button>
              )}
            </div>
            <input
              type="text"
              required
              disabled={isEditing && initialRole?.isSystem}
              value={code}
              onChange={(e) => {
                setAutoSlug(false);
                setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
              }}
              placeholder="Ej. transport_inspector"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            />
            {initialRole?.isSystem && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                🔒 El código de los roles del sistema no se puede modificar para preservar la integridad operativa.
              </p>
            )}
          </div>

          {/* Subsistema de Ámbito */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Subsistema de Ámbito Principal *
            </label>
            <select
              value={subsystemCode}
              onChange={(e) => setSubsystemCode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {SUBSYSTEM_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Descripción y Alcance de Responsabilidades
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa brevemente las facultades y el propósito institucional de este rol..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-60"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Rol'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
