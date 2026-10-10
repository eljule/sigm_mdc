import React, { useState, useEffect } from 'react';
import { AssetCategory, CustomFieldDefinition, FieldType } from '../../types/itam';
import { itamService } from '../../services/itam.service';
import { DynamicFieldsRenderer } from './DynamicFieldsRenderer';

interface CategorySchemaModalProps {
  category: AssetCategory;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updatedCategory: AssetCategory) => void;
}

interface EditableField extends CustomFieldDefinition {
  _id: string;
}

let fieldCounter = 0;
const generateFieldId = () => `f_${Date.now()}_${++fieldCounter}_${Math.random().toString(36).substr(2, 5)}`;

export const CategorySchemaModal: React.FC<CategorySchemaModalProps> = ({
  category,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [fields, setFields] = useState<EditableField[]>(() =>
    (category.customFieldsSchema || []).map((f) => ({
      ...f,
      _id: generateFieldId(),
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados para Drag and Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Sincronizar campos cuando se abre el modal o cambia la categoría de forma externa
  useEffect(() => {
    if (isOpen && category?.customFieldsSchema) {
      setFields(
        category.customFieldsSchema.map((f) => ({
          ...f,
          _id: generateFieldId(),
        }))
      );
    }
  }, [isOpen, category?.id]);

  if (!isOpen) return null;

  const handleAddField = () => {
    const newIndex = fields.length + 1;
    const newField: EditableField = {
      _id: generateFieldId(),
      key: `field_${newIndex}`,
      label: `Nuevo Parámetro ${newIndex}`,
      type: 'text',
      required: false,
      placeholder: '',
      unit: '',
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<EditableField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const handleRemoveField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
  };

  // Reordenar mediante botones (Subir / Bajar)
  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFields(updated);
  };

  // Handlers para Drag and Drop HTML5 nativo
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', `${index}`);
    } catch {
      // fallback
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...fields];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);
    setFields(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    setErrorMsg(null);

    // Validate fields have key and label
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      if (!f.key || !f.key.trim()) {
        setErrorMsg(`El campo #${i + 1} no tiene una clave técnica (key) definida.`);
        return;
      }
      if (!f.label || !f.label.trim()) {
        setErrorMsg(`El campo #${i + 1} no tiene una etiqueta descriptiva.`);
        return;
      }
      // Check duplicate keys
      const duplicates = fields.filter((item) => item.key.toLowerCase().trim() === f.key.toLowerCase().trim());
      if (duplicates.length > 1) {
        setErrorMsg(`La clave técnica "${f.key}" está duplicada. Cada parámetro debe tener una clave única.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const cleanSchema: CustomFieldDefinition[] = fields.map(({ _id, ...rest }) => rest);
      const res = await itamService.updateCategoryFieldsSchema(category.id, cleanSchema);
      if (res.success && res.data) {
        onSaved(res.data);
        onClose();
      } else {
        setErrorMsg(res.error || 'Error al guardar el esquema de especificaciones');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.icon || '💻'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Configuración de Parámetros Técnicos
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  {category.code}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define las especificaciones dinámicas que se solicitarán al registrar activos de{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{category.name}</span>.
              </p>
            </div>
          </div>

          {/* Tab Switcher: Editor / Preview */}
          <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Editor de Esquema ({fields.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Vista Previa en Vivo
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-rose-500 hover:text-rose-700"
              >
                ✕
              </button>
            </div>
          )}

          {activeTab === 'editor' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                    {fields.length === 0
                      ? 'No hay parámetros definidos aún. Haz clic en "Agregar Parámetro" para comenzar.'
                      : `Se han configurado ${fields.length} atributos técnicos para esta categoría.`}
                  </span>
                  {fields.length > 1 && (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span>💡</span>
                      <span>Puedes reordenar los parámetros usando las flechas (↑ / ↓) o arrastrando las tarjetas.</span>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Parámetro
                </button>
              </div>

              {/* Fields List */}
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field._id}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      draggedIndex === idx
                        ? 'opacity-40 border-dashed border-emerald-500 bg-emerald-50/20'
                        : dragOverIndex === idx
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Tirador de Arrastre */}
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                          title="Arrastra para reordenar la posición"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                          </svg>
                        </div>

                        <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {field.label || 'Parámetro sin nombre'}
                        </span>
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          key: {field.key}
                        </code>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Botón Mover Arriba */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveField(idx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                          title="Mover arriba"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>

                        {/* Botón Mover Abajo */}
                        <button
                          type="button"
                          disabled={idx === fields.length - 1}
                          onClick={() => handleMoveField(idx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                          title="Mover abajo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

                        {/* Botón Eliminar */}
                        <button
                          type="button"
                          onClick={() => handleRemoveField(idx)}
                          className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded transition-colors"
                          title="Eliminar parámetro"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Etiqueta Visible *
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => {
                            const newLabel = e.target.value;
                            // Auto-generate key if it's default
                            const autoKey = newLabel
                              .toLowerCase()
                              .trim()
                              .replace(/[\s\W-]+/g, '_');
                            handleUpdateField(idx, {
                              label: newLabel,
                              key: field.key.startsWith('field_') ? autoKey : field.key,
                            });
                          }}
                          placeholder="Ej. Procesador, RAM, Pulgadas"
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Clave Técnica (JSON key) *
                        </label>
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) =>
                            handleUpdateField(idx, {
                              key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                            })
                          }
                          placeholder="Ej. processor, ram_gb"
                          className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          Tipo de Dato
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            handleUpdateField(idx, { type: e.target.value as FieldType })
                          }
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="text">Texto simple</option>
                          <option value="number">Número</option>
                          <option value="select">Selección / Desplegable</option>
                          <option value="tags">Lista / Etiquetas dinámicas (Array)</option>
                          <option value="boolean">Booleano (Sí/No)</option>
                          <option value="textarea">Área de texto amplio</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-4 pt-4">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Obligatorio</span>
                        </label>

                        <div>
                          <input
                            type="text"
                            value={field.unit || ''}
                            onChange={(e) => handleUpdateField(idx, { unit: e.target.value })}
                            placeholder="Unidad (GB, '', Watts)"
                            className="w-24 text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Extended options for Select or Tags type */}
                    {(field.type === 'select' || field.type === 'tags' || field.type === 'list') && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                          {field.type === 'select'
                            ? 'Opciones de la lista desplegable (separadas por coma)'
                            : 'Opciones sugeridas para agregar rápido (opcional, separadas por coma)'}
                        </label>
                        <input
                          type="text"
                          value={(field.options || []).join(', ')}
                          onChange={(e) =>
                            handleUpdateField(idx, {
                              options: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder={
                            field.type === 'select'
                              ? 'Ej. 8 GB, 16 GB, 32 GB, 64 GB'
                              : 'Ej. Office 2021 LTSC, AutoCAD 2024, ArcGIS Pro, Antivirus ESET'
                          }
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* Placeholder */}
                    <div>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => handleUpdateField(idx, { placeholder: e.target.value })}
                        placeholder="Texto de sugerencia / placeholder (opcional)"
                        className="w-full text-xs px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
                Esta es la visualización exacta que verá el operador al registrar o editar activos pertenecientes a la categoría <strong>{category.name}</strong>.
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <DynamicFieldsRenderer
                  schema={fields}
                  values={previewValues}
                  onChange={(k, val) => setPreviewValues((prev) => ({ ...prev, [k]: val }))}
                />
              </div>

              {/* JSON preview */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Valores resultantes en JSON (PostgreSQL JSONB `specifications`)
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto max-h-40 border border-slate-800">
                  {JSON.stringify(previewValues, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando Esquema...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guardar Esquema Técnico</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
