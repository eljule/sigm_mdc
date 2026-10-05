import React from 'react';
import { CustomFieldDefinition } from '../../types/itam';

interface DynamicFieldsRendererProps {
  schema: CustomFieldDefinition[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export const DynamicFieldsRenderer: React.FC<DynamicFieldsRendererProps> = ({
  schema,
  values,
  onChange,
  errors = {},
  disabled = false,
}) => {
  if (!schema || schema.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Esta categoría no tiene campos técnicos específicos configurados. Los activos usarán únicamente los datos generales.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {schema.map((field) => {
        const value = values[field.key] !== undefined ? values[field.key] : (field.defaultValue ?? '');
        const hasError = !!errors[field.key];

        return (
          <div
            key={field.key}
            className={`space-y-1.5 ${
              field.type === 'textarea' ? 'md:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                htmlFor={`dynamic_${field.key}`}
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                {field.label}
                {field.required && (
                  <span className="text-rose-500 font-bold" title="Campo obligatorio">
                    *
                  </span>
                )}
              </label>
              {field.unit && (
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {field.unit}
                </span>
              )}
            </div>

            {/* Field Types */}
            {field.type === 'text' && (
              <input
                id={`dynamic_${field.key}`}
                type="text"
                disabled={disabled}
                placeholder={field.placeholder || `Ingrese ${field.label.toLowerCase()}`}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border transition-all outline-none ${
                  hasError
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            )}

            {field.type === 'number' && (
              <input
                id={`dynamic_${field.key}`}
                type="number"
                disabled={disabled}
                placeholder={field.placeholder || '0'}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full text-xs px-3 py-2 rounded-lg border transition-all outline-none ${
                  hasError
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            )}

            {field.type === 'select' && (
              <div className="relative">
                <select
                  id={`dynamic_${field.key}`}
                  disabled={disabled}
                  value={value}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-lg border transition-all outline-none appearance-none ${
                    hasError
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">-- Seleccione una opción --</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            )}

            {field.type === 'boolean' && (
              <label
                htmlFor={`dynamic_${field.key}`}
                className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <input
                  id={`dynamic_${field.key}`}
                  type="checkbox"
                  disabled={disabled}
                  checked={Boolean(value)}
                  onChange={(e) => onChange(field.key, e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {Boolean(value) ? 'Sí / Habilitado' : 'No / No aplica'}
                </span>
              </label>
            )}

            {field.type === 'textarea' && (
              <textarea
                id={`dynamic_${field.key}`}
                rows={2}
                disabled={disabled}
                placeholder={field.placeholder || `Detalles de ${field.label.toLowerCase()}`}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border transition-all outline-none resize-none ${
                  hasError
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            )}

            {hasError && (
              <p className="text-[11px] text-rose-500 font-medium">{errors[field.key]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
