import React, { useState, useEffect } from 'react';
import { Module } from '../../types/module';

interface SubsystemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Module>) => Promise<void>;
  subsystemToEdit: Module | null;
}

const PRESET_ICONS = ['🏢', '🚗', '💻', '🎧', '📊', '📑', '🏛️', '🛡️', '⚙️', '📂', '💳', '🚚'];
const PRESET_COLORS = [
  '#16a34a', // Verde institucional
  '#ea580c', // Naranja transportes
  '#2563eb', // Azul ITAM
  '#7c3aed', // Morado Soporte
  '#059669', // Esmeralda
  '#dc2626', // Rojo
  '#0891b2', // Cian
  '#d97706', // Ámbar
];

const getCleanIcon = (iconUrl?: string, code?: string) => {
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
  if (iconUrl && iconMap[iconUrl]) return iconMap[iconUrl];
  if (code && iconMap[code]) return iconMap[code];
  return iconUrl || '🏢';
};

export const SubsystemFormModal: React.FC<SubsystemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subsystemToEdit,
}) => {
  const isEditing = Boolean(subsystemToEdit);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('🏢');
  const [route, setRoute] = useState('');
  const [accentColor, setAccentColor] = useState('#16a34a');
  const [order, setOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subsystemToEdit) {
      setCode(subsystemToEdit.code);
      setName(subsystemToEdit.name);
      setDescription(subsystemToEdit.description);
      setIconUrl(getCleanIcon(subsystemToEdit.iconUrl, subsystemToEdit.code));
      setRoute(subsystemToEdit.route);
      setAccentColor(subsystemToEdit.accentColor || '#16a34a');
      setOrder(subsystemToEdit.order || 1);
      setIsActive(subsystemToEdit.isActive ?? true);
      setRequiresAuth(subsystemToEdit.requiresAuth ?? true);
    } else {
      setCode('');
      setName('');
      setDescription('');
      setIconUrl('🏢');
      setRoute('/');
      setAccentColor('#16a34a');
      setOrder(5);
      setIsActive(true);
      setRequiresAuth(true);
    }
    setError(null);
  }, [subsystemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Partial<Module> = {
        name: name.trim(),
        description: description.trim(),
        iconUrl: iconUrl.trim(),
        route: route.trim(),
        accentColor: accentColor.trim(),
        order: Number(order),
        isActive,
        requiresAuth,
      };

      if (!isEditing) {
        payload.code = code.trim().toLowerCase();
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el subsistema');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Encabezado */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{iconUrl || '🏢'}</span>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {isEditing ? 'Editar Subsistema SIGM' : 'Registrar Nuevo Subsistema'}
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                {isEditing
                  ? `Modificando especificaciones de "${subsystemToEdit?.name}"`
                  : 'Añada un nuevo módulo o subsistema a la plataforma municipal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Código Único */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                Código Identificador (Slug)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                disabled={isEditing}
                required
                placeholder="ej. rentas_tributaria"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-60 font-mono"
              />
              <span className="text-[10px] text-slate-400">Identificador en permisos y base de datos.</span>
            </div>

            {/* Nombre del Subsistema */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                Nombre del Subsistema
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="ej. Administración Tributaria (Rentas)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Descripción Funcional
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              placeholder="Describa el alcance de este subsistema..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ruta Frontend */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                Ruta de Acceso (URL)
              </label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                required
                placeholder="ej. /rentas"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>

            {/* Orden de Prioridad */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                Orden de Visualización
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                min={1}
                required
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Icono / Emoji */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Icono Representativo (Emoji o SVG)
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                required
                className="w-24 text-center text-lg p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
              <span className="text-xs text-slate-500">Seleccione un emoji rápido:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIconUrl(emoji)}
                  className={`w-8 h-8 rounded-lg border text-base flex items-center justify-center transition-all ${
                    iconUrl === emoji
                      ? 'bg-emerald-100 border-emerald-500 scale-110 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color de Acento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              Color Distintivo de Acento
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5"
              />
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {accentColor}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    accentColor === c ? 'scale-125 border-slate-900 dark:border-white shadow' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Opciones de Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Subsistema Activo en el Sistema</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresAuth}
                onChange={(e) => setRequiresAuth(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Requiere Autenticación / Roles</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting && <span className="animate-spin">⟳</span>}
              <span>{isEditing ? 'Guardar Cambios' : 'Registrar Subsistema'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
