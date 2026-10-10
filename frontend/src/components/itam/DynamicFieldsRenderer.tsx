import React from 'react';
import { CustomFieldDefinition } from '../../types/itam';

interface DynamicFieldsRendererProps {
  schema: CustomFieldDefinition[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

interface TagListFieldProps {
  id: string;
  field: CustomFieldDefinition;
  items: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
  hasError?: boolean;
}

const TagListField: React.FC<TagListFieldProps> = ({
  id,
  field,
  items = [],
  onChange,
  disabled = false,
  hasError = false,
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleAddItem = (itemToAdd?: string) => {
    const trimmed = (itemToAdd ?? inputValue).trim();
    if (!trimmed) return;
    if (!items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    if (!itemToAdd) {
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const presetOptions = field.options || [];

  return (
    <div className="space-y-2">
      {/* Contenedor de Etiquetas Visuales */}
      <div
        className={`min-h-[42px] p-2 rounded-xl border flex flex-wrap items-center gap-1.5 transition-all ${
          hasError
            ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {items.length === 0 ? (
          <span className="text-xs text-slate-400 italic px-1">
            Ningún elemento agregado aún. Escriba abajo o seleccione de las sugerencias.
          </span>
        ) : (
          items.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs"
            >
              <span>{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-emerald-600 hover:text-rose-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors ml-0.5 text-xs font-bold"
                  title="Eliminar elemento"
                >
                  ✕
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {/* Input de agregar elemento */}
      {!disabled && (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={field.placeholder || `Escriba un ${field.label.toLowerCase()} y presione Enter o "+ Agregar"`}
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="button"
            onClick={() => handleAddItem()}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors shrink-0"
          >
            + Agregar
          </button>
        </div>
      )}

      {/* Opciones sugeridas predefinidas */}
      {!disabled && presetOptions.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Sugeridos:
          </span>
          {presetOptions.map((opt) => {
            const isAlreadyAdded = items.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                disabled={isAlreadyAdded}
                onClick={() => handleAddItem(opt)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                  isAlreadyAdded
                    ? 'opacity-40 line-through bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                    : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700'
                }`}
                title={isAlreadyAdded ? 'Ya agregado' : 'Clic para agregar'}
              >
                + {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
        const isArrayType = field.type === 'tags' || field.type === 'list';

        return (
          <div
            key={field.key}
            className={`space-y-1.5 ${
              field.type === 'textarea' || isArrayType ? 'md:col-span-2' : ''
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

            {isArrayType && (
              <TagListField
                id={`dynamic_${field.key}`}
                field={field}
                items={Array.isArray(value) ? value : []}
                onChange={(newItems) => onChange(field.key, newItems)}
                disabled={disabled}
                hasError={hasError}
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
