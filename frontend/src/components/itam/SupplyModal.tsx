'use client';

import React, { useState } from 'react';
import { Supply } from '@/types/itam';
import { itamService } from '@/services/itam.service';

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  supply?: Supply | null;
  onSuccess: (supply: Supply) => void;
}

const SUPPLY_CATEGORIES = [
  { value: 'TONER_TINTA', label: 'Tóner e Insumos de Impresión' },
  { value: 'CABLEADO_RED', label: 'Cableado y Tendido de Red (UTP / Fibra)' },
  { value: 'CONECTORES', label: 'Conectores RJ-45, Jacks y Patch Panels' },
  { value: 'PASTA_TERMICA', label: 'Pastas Térmicas y Disipadores' },
  { value: 'REPUESTOS_HARDWARE', label: 'Repuestos de Hardware (Fuentes, Discos)' },
  { value: 'HERRAMIENTAS', label: 'Herramientas de Soporte TI' },
];

const UNITS = ['UNIDAD', 'METROS', 'BOBINA', 'CAJA', 'TUBO', 'PAQUETE'];

export const SupplyModal: React.FC<SupplyModalProps> = ({
  isOpen,
  onClose,
  supply,
  onSuccess,
}) => {
  const isEditing = Boolean(supply);
  const [name, setName] = useState(supply?.name || '');
  const [category, setCategory] = useState(supply?.category || 'TONER_TINTA');
  const [unit, setUnit] = useState(supply?.unit || 'UNIDAD');
  const [stock, setStock] = useState<number>(supply?.stock ?? 10);
  const [minStock, setMinStock] = useState<number>(supply?.minStock ?? 2); // Default 2 as per SRS
  const [location, setLocation] = useState(supply?.location || 'Almacén ODT - Estante 1');
  const [notes, setNotes] = useState(supply?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick adjust stock mode
  const [adjustMode, setAdjustMode] = useState(false);
  const [delta, setDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (adjustMode && supply) {
      if (delta === 0 || !adjustReason.trim()) {
        setError('Debe especificar una cantidad distinta de cero y un motivo para el ajuste.');
        setLoading(false);
        return;
      }
      const res = await itamService.adjustSupplyStock(supply.id, {
        quantityDelta: delta,
        reason: adjustReason.trim(),
      });
      setLoading(false);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Error al ajustar stock');
      }
      return;
    }

    if (!name.trim()) {
      setError('El nombre del insumo es obligatorio.');
      setLoading(false);
      return;
    }

    if (isEditing && supply) {
      const res = await itamService.updateSupply(supply.id, {
        name: name.trim(),
        category,
        unit,
        minStock,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setLoading(false);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Error al actualizar insumo');
      }
    } else {
      const res = await itamService.createSupply({
        name: name.trim(),
        category,
        unit,
        stock,
        minStock,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setLoading(false);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Error al crear insumo');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2 className="text-base font-bold">
                {adjustMode
                  ? 'Ajuste de Stock en Almacén'
                  : isEditing
                  ? 'Editar Insumo / Consumible'
                  : 'Registrar Insumo Tecnológico'}
              </h2>
              <p className="text-xs text-cyan-100">
                {supply ? `${supply.name} (Stock: ${supply.stock} ${supply.unit})` : 'Inventario de Consumibles TI'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="font-bold">✕</button>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAdjustMode(!adjustMode)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                {adjustMode ? 'Volver a edición de datos' : '¿Registrar Entrada / Salida de Stock?'}
              </button>
            </div>
          )}

          {adjustMode ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Insumo:</span>
                  <span className="font-bold text-slate-800">{supply?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stock Actual:</span>
                  <span className="font-mono font-bold text-indigo-700">{supply?.stock} {supply?.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Variación de Cantidad (+ para ingreso, - para retiro o merma) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={delta}
                  onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
                  placeholder="Ej. +10 o -2"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo del Ajuste <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ingreso por Orden de Compra N° 124 / Merma por rotura"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Insumo / Descripción <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Tóner HP LaserJet 58A Negro / Bobina UTP Cat6 305m"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría de Insumo <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    {SUPPLY_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidad de Medida <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {!isEditing && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Stock Inicial <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Umbral Crítico de Alerta (Min Stock) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">SRS: Alerta visual si stock es ≤ 2 unidades.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ubicación en Almacén / Estante
                </label>
                <input
                  type="text"
                  placeholder="Ej. Almacén TI - Estante 3B"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas / Modelos Compatibles</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Compatible con impresoras HP LaserJet M404dw y M428fdw..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              {loading ? 'Guardando...' : adjustMode ? 'Confirmar Ajuste' : isEditing ? 'Guardar Cambios' : 'Registrar Insumo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
