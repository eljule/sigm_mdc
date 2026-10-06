import React, { useState, useEffect } from 'react';
import { Module } from '../../types/module';

interface SubsystemMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    isUnderMaintenance: boolean;
    maintenanceMessage: string;
    estimatedRecoveryTime: string;
  }) => Promise<void>;
  subsystem: Module | null;
}

const PRESET_TIMES = [
  '15 minutos',
  '30 minutos',
  '45 minutos',
  '1 hora',
  '2 horas',
  'Fin de jornada (18:00 hrs)',
  'Hasta nuevo aviso',
];

export const SubsystemMaintenanceModal: React.FC<SubsystemMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subsystem,
}) => {
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [estimatedRecoveryTime, setEstimatedRecoveryTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subsystem) {
      setIsUnderMaintenance(Boolean(subsystem.isUnderMaintenance));
      setMaintenanceMessage(
        subsystem.maintenanceMessage ||
          'Este subsistema se encuentra temporalmente suspendido por trabajos de mantenimiento y optimización de servidores.',
      );
      setEstimatedRecoveryTime(subsystem.estimatedRecoveryTime || '30 minutos');
    }
    setError(null);
  }, [subsystem, isOpen]);

  if (!isOpen || !subsystem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        isUnderMaintenance,
        maintenanceMessage: maintenanceMessage.trim(),
        estimatedRecoveryTime: estimatedRecoveryTime.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado de mantenimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all">
        {/* Encabezado */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🛠️</span>
            <div>
              <h3 className="text-lg font-black tracking-tight">Gestión de Mantenimiento</h3>
              <p className="text-xs text-amber-100 font-medium">
                {subsystem.name} ({subsystem.code})
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Toggle de Mantenimiento */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Poner en Modo Mantenimiento
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isUnderMaintenance
                  ? '⚠️ Los usuarios verán la pantalla de mantenimiento con el tiempo de espera.'
                  : '✅ El subsistema se encuentra 100% operativo y accesible.'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isUnderMaintenance}
                onChange={(e) => setIsUnderMaintenance(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Mensaje de Mantenimiento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Mensaje Informativo para Usuarios
            </label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={3}
              required={isUnderMaintenance}
              placeholder="Explique el motivo del mantenimiento..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Tiempo Aproximado de Recuperación */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Tiempo Estimado de Recuperación / Espera
            </label>
            <input
              type="text"
              value={estimatedRecoveryTime}
              onChange={(e) => setEstimatedRecoveryTime(e.target.value)}
              required={isUnderMaintenance}
              placeholder="Ej: 30 minutos, 2 horas, Hoy 17:00..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold"
            />

            {/* Presets Rápidos */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_TIMES.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setEstimatedRecoveryTime(time)}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                    estimatedRecoveryTime === time
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-200 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Enlace para previsualizar */}
          <div className="pt-2 text-right">
            <a
              href={`/mantenimiento?code=${encodeURIComponent(subsystem.code)}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
            >
              👁️ Previsualizar Vista de Mantenimiento en pestaña nueva &rarr;
            </a>
          </div>

          {/* Botones de acción */}
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting && <span className="animate-spin">⟳</span>}
              <span>{isUnderMaintenance ? 'Guardar y Activar Mantenimiento' : 'Guardar y Restablecer Operatividad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
