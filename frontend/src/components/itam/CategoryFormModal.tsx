import React, { useState } from 'react';
import { AssetCategory, CreateCategoryPayload, UpdateCategoryPayload } from '../../types/itam';
import { itamService } from '../../services/itam.service';

interface CategoryFormModalProps {
  categoryToEdit?: AssetCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (category: AssetCategory) => void;
}

const PRESET_ICONS = ['💻', '🖥️', '🖨️', '🖱️', '📱', '📡', '🖲️', '🔌', '🔋', '🎧', '📹', '📦'];
const PRESET_COLORS = [
  '#2563eb', // Blue
  '#0891b2', // Cyan
  '#16a34a', // Green
  '#d97706', // Amber
  '#9333ea', // Purple
  '#e11d48', // Rose
  '#4f46e5', // Indigo
  '#475569', // Slate
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  categoryToEdit,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isEditing = !!categoryToEdit;

  const [name, setName] = useState(categoryToEdit?.name || '');
  const [code, setCode] = useState(categoryToEdit?.code || '');
  const [description, setDescription] = useState(categoryToEdit?.description || '');
  const [icon, setIcon] = useState(categoryToEdit?.icon || '💻');
  const [color, setColor] = useState(categoryToEdit?.color || '#2563eb');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('El nombre de la categoría es obligatorio.');
      return;
    }
    if (!isEditing && !code.trim()) {
      setErrorMsg('El código de prefijo es obligatorio (ej. PC, MON, LAP).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && categoryToEdit) {
        const payload: UpdateCategoryPayload = {
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          color,
        };
        const res = await itamService.updateCategory(categoryToEdit.id, payload);
        if (res.success && res.data) {
          onSaved(res.data);
          onClose();
        } else {
          setErrorMsg(res.error || 'Error al actualizar categoría');
        }
      } else {
        const payload: CreateCategoryPayload = {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
          icon,
          color,
          customFieldsSchema: [],
        };
        const res = await itamService.createCategory(payload);
        if (res.success && res.data) {
          onSaved(res.data);
          onClose();
        } else {
          setErrorMsg(res.error || 'Error al crear categoría');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de red');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Editar Categoría de Activos' : 'Nueva Categoría Tecnológica'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Clasificación de equipamiento informático municipal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/50">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Servidor Rack / Blade, Switch de Red"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!isEditing && !code) {
                  // Auto-suggest code
                  const words = e.target.value.trim().split(/\s+/);
                  if (words.length >= 2) {
                    setCode((words[0].substring(0, 2) + words[1].substring(0, 1)).toUpperCase());
                  } else if (words[0]?.length >= 3) {
                    setCode(words[0].substring(0, 3).toUpperCase());
                  }
                }
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Código / Prefijo Correlativo * (Ej. MDC-TI-
              <span className="font-mono text-blue-600 font-bold">{code || 'XXX'}</span>-0001)
            </label>
            <input
              type="text"
              maxLength={6}
              disabled={isEditing}
              required
              placeholder="Ej. SRV, SWT, UPS"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
            />
            {isEditing && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                El código de prefijo no puede modificarse para proteger la integridad de los códigos ya generados.
              </span>
            )}
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Ícono Representativo
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-transform ${
                    icon === ic
                      ? 'scale-110 bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Color Distintivo
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setColor(col)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === col ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Descripción Institucional (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Breve alcance sobre qué equipos abarca esta categoría..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Categoría' : 'Crear Categoría'}
          </button>
        </div>
      </div>
    </div>
  );
};
