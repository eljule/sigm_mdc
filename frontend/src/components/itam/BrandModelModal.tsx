import React, { useState } from 'react';
import { AssetBrand, AssetCategory } from '../../types/itam';
import { itamService } from '../../services/itam.service';

interface BrandModelModalProps {
  type: 'brand' | 'model';
  brands: AssetBrand[];
  categories: AssetCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const BrandModelModal: React.FC<BrandModelModalProps> = ({
  type,
  brands,
  categories,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isBrand = type === 'brand';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de comunicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              {isBrand ? '🏷️' : '📦'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isBrand ? 'Registrar Nueva Marca' : 'Registrar Nuevo Modelo'}
              </h2>
              <p className="text-xs text-slate-500">Catálogos de Hardware y Software TI</p>
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

          {!isBrand && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Marca Fabricante *
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
            {isSubmitting ? 'Guardando...' : `Guardar ${isBrand ? 'Marca' : 'Modelo'}`}
          </button>
        </div>
      </div>
    </div>
  );
};
