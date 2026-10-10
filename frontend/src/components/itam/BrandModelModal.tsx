import React, { useState, useEffect } from 'react';
import { AssetBrand, AssetCategory, AssetModel } from '../../types/itam';
import { itamService } from '../../services/itam.service';

interface BrandModelModalProps {
  type: 'brand' | 'model';
  brands: AssetBrand[];
  categories: AssetCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  itemToEdit?: AssetBrand | AssetModel | null;
}

export const BrandModelModal: React.FC<BrandModelModalProps> = ({
  type,
  brands,
  categories,
  isOpen,
  onClose,
  onSaved,
  itemToEdit,
}) => {
  const isBrand = type === 'brand';
  const isEditing = !!itemToEdit;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (itemToEdit) {
        setName(itemToEdit.name || '');
        setDescription(itemToEdit.description || '');
        setIsActive(itemToEdit.isActive !== false);

        if (!isBrand) {
          const m = itemToEdit as AssetModel;
          setBrandId(m.brandId || (brands[0]?.id || ''));
          setCategoryId(m.categoryId || '');
        }
      } else {
        setName('');
        setDescription('');
        setIsActive(true);
        setBrandId(brands[0]?.id || '');
        setCategoryId('');
      }
    }
  }, [isOpen, itemToEdit, isBrand, brands]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg(`El nombre del ${isBrand ? 'fabricante/marca' : 'modelo'} es requerido.`);
      return;
    }

    if (!isBrand && !brandId) {
      setErrorMsg('Debe seleccionar la marca a la que pertenece el modelo.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isBrand) {
        if (isEditing && itemToEdit) {
          const res = await itamService.updateBrand(itemToEdit.id, {
            name: name.trim(),
            description: description.trim() || undefined,
            isActive,
          });
          if (res.success) {
            onSaved();
            onClose();
          } else {
            setErrorMsg(res.error || 'Error al actualizar la marca');
          }
        } else {
          const res = await itamService.createBrand({
            name: name.trim(),
            description: description.trim() || undefined,
          });
          if (res.success) {
            onSaved();
            onClose();
          } else {
            setErrorMsg(res.error || 'Error al guardar la marca');
          }
        }
      } else {
        // Model
        if (isEditing && itemToEdit) {
          const res = await itamService.updateModel(itemToEdit.id, {
            name: name.trim(),
            brandId,
            categoryId: categoryId || undefined,
            description: description.trim() || undefined,
            isActive,
          });
          if (res.success) {
            onSaved();
            onClose();
          } else {
            setErrorMsg(res.error || 'Error al actualizar el modelo');
          }
        } else {
          const res = await itamService.createModel({
            name: name.trim(),
            brandId,
            categoryId: categoryId || undefined,
            description: description.trim() || undefined,
          });
          if (res.success) {
            onSaved();
            onClose();
          } else {
            setErrorMsg(res.error || 'Error al guardar el modelo');
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de comunicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header institucional */}
        <div className="px-6 py-4 border-b border-emerald-800 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#0d4f2f] via-[#105d38] to-[#0a3d24] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 flex items-center justify-center font-bold text-lg shadow-inner">
              {isBrand ? '🏷️' : '📦'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing
                  ? `Editar ${isBrand ? 'Marca' : 'Modelo'}`
                  : `Registrar ${isBrand ? 'Nueva Marca' : 'Nuevo Modelo'}`}
              </h2>
              <p className="text-xs text-emerald-200/90">
                {isEditing ? `Modificación en catálogo institucional` : 'Catálogos de Hardware y Software TI'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
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

          {!isBrand && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Marca Fabricante *
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Categoría Habitual (Opcional)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">-- General / Múltiples Categorías --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isBrand ? 'Nombre de la Marca *' : 'Nombre del Modelo / Línea *'}
            </label>
            <input
              type="text"
              required
              placeholder={isBrand ? 'Ej. Asus, Cisco, Canon' : 'Ej. Latitude 5420, LaserJet Pro'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Descripción / Notas (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre serie o características..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isActiveCheck"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
              />
              <label
                htmlFor="isActiveCheck"
                className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                Estado Activo (disponible para asignación a activos)
              </label>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? 'Guardando...'
              : isEditing
              ? `Actualizar ${isBrand ? 'Marca' : 'Modelo'}`
              : `Guardar ${isBrand ? 'Marca' : 'Modelo'}`}
          </button>
        </div>
      </div>
    </div>
  );
};
