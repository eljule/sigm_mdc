'use client';

import React, { useState } from 'react';
import { Asset, MaintenanceOrder, Supply } from '@/types/itam';
import { itamService } from '@/services/itam.service';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: Asset | null;
  existingOrder?: MaintenanceOrder | null;
  suppliesList: Supply[];
  onSuccess: (order: MaintenanceOrder) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  asset,
  existingOrder,
  suppliesList,
  onSuccess,
}) => {
  const isCompleting = Boolean(existingOrder && existingOrder.status !== 'COMPLETADO');

  // Form states for creating order
  const [maintenanceType, setMaintenanceType] = useState<'PREVENTIVO' | 'CORRECTIVO'>(
    existingOrder?.maintenanceType || 'PREVENTIVO',
  );
  const [scheduledDate, setScheduledDate] = useState<string>(
    existingOrder?.scheduledDate || new Date().toISOString().split('T')[0],
  );
  const [priority, setPriority] = useState<'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'>(
    existingOrder?.priority || 'MEDIA',
  );
  const [failureReported, setFailureReported] = useState<string>(existingOrder?.failureReported || '');
  const [technicianName, setTechnicianName] = useState<string>(
    existingOrder?.technicianName || 'Técnico de Soporte TI',
  );
  const [notes, setNotes] = useState<string>(existingOrder?.notes || '');

  // Form states for completing order
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [actionsTaken, setActionsTaken] = useState<string>('');
  const [suppliesUsed, setSuppliesUsed] = useState<{ supplyId: string; quantity: number }[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSupplyRow = () => {
    if (suppliesList.length === 0) return;
    setSuppliesUsed([...suppliesUsed, { supplyId: suppliesList[0].id, quantity: 1 }]);
  };

  const handleRemoveSupplyRow = (index: number) => {
    setSuppliesUsed(suppliesUsed.filter((_, i) => i !== index));
  };

  const handleSupplyChange = (index: number, supplyId: string, quantity: number) => {
    const updated = [...suppliesUsed];
    updated[index] = { supplyId, quantity: Math.max(1, quantity) };
    setSuppliesUsed(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isCompleting && existingOrder) {
      if (!diagnosis.trim() || !actionsTaken.trim()) {
        setError('El diagnóstico y las acciones realizadas son requeridos para finalizar el mantenimiento.');
        setLoading(false);
        return;
      }

      const res = await itamService.completeMaintenanceOrder(existingOrder.id, {
        diagnosis: diagnosis.trim(),
        actionsTaken: actionsTaken.trim(),
        technicianName: technicianName.trim(),
        supplies: suppliesUsed,
        notes: notes.trim() || undefined,
      });

      setLoading(false);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Error al finalizar la orden de mantenimiento');
      }
    } else {
      if (!asset) {
        setError('Debe seleccionar un activo tecnológico.');
        setLoading(false);
        return;
      }

      const res = await itamService.createMaintenanceOrder({
        assetId: asset.id,
        maintenanceType,
        scheduledDate,
        priority,
        technicianName: technicianName.trim(),
        failureReported: maintenanceType === 'CORRECTIVO' ? failureReported.trim() : undefined,
        notes: notes.trim() || undefined,
      });

      setLoading(false);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Error al programar orden de mantenimiento');
      }
    }
  };

  const targetAsset = asset || existingOrder?.asset;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{isCompleting ? '✅' : '🛠️'}</span>
            <div>
              <h2 className="text-base font-bold">
                {isCompleting ? `Finalizar Orden de Trabajo (${existingOrder?.orderNumber})` : 'Programar / Registrar Mantenimiento'}
              </h2>
              <p className="text-xs text-amber-100">
                {targetAsset?.computerCode} — {targetAsset?.brandName} {targetAsset?.modelName} ({targetAsset?.office})
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

          {!isCompleting ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Mantenimiento <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={maintenanceType}
                    onChange={(e: any) => setMaintenanceType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="PREVENTIVO">Preventivo (Programado / Rutinario)</option>
                    <option value="CORRECTIVO">Correctivo (Falla Reportada / Reparación)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prioridad <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica (Operatividad Comprometida)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Programada <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Técnico Responsable
                  </label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {maintenanceType === 'CORRECTIVO' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Falla Reportada / Síntomas <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Pantalla azul al iniciar Windows, ventilador ruidoso, no enciende..."
                    value={failureReported}
                    onChange={(e) => setFailureReported(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas / Instrucciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el acceso al área, requerimientos técnicos..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* Completing Order Section */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <p className="font-bold text-amber-900">Finalizar Orden {existingOrder?.orderNumber}</p>
                <p className="text-amber-800">
                  {existingOrder?.maintenanceType === 'CORRECTIVO'
                    ? `Falla Reportada: ${existingOrder.failureReported}`
                    : 'Mantenimiento Preventivo Programado'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnóstico Técnico Realizado <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Pasta térmica degradada, exceso de polvo en disipador, memoria RAM sucia..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Acciones / Solución Ejecutada <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Limpieza con soplador, cambio de pasta térmica Arctic MX-4, reinstalación de drivers..."
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              {/* RF-15: Supplies consumed section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Insumos / Repuestos Utilizados (Descargo automático RF-15)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSupplyRow}
                    className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition"
                  >
                    + Agregar Insumo
                  </button>
                </div>

                {suppliesUsed.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No se descargaron insumos de almacén para este servicio.</p>
                ) : (
                  <div className="space-y-2">
                    {suppliesUsed.map((su, idx) => {
                      const selectedSup = suppliesList.find((s) => s.id === su.supplyId);
                      return (
                        <div key={idx} className="flex items-center space-x-2">
                          <select
                            value={su.supplyId}
                            onChange={(e) => handleSupplyChange(idx, e.target.value, su.quantity)}
                            className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            {suppliesList.map((sup) => (
                              <option key={sup.id} value={sup.id}>
                                {sup.name} (Stock: {sup.stock} {sup.unit})
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="1"
                            max={selectedSup ? selectedSup.stock : 999}
                            value={su.quantity}
                            onChange={(e) => handleSupplyChange(idx, su.supplyId, parseInt(e.target.value) || 1)}
                            className="w-20 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-center"
                          />
                          <span className="text-[11px] text-slate-500 w-16">{selectedSup?.unit || 'unid'}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSupplyRow(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs px-2 py-1"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              * Conforme al RF-16, se emitirá la Ficha Técnica / Hoja de Servicio Oficial.
            </span>
            <div className="flex space-x-2">
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
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                {loading ? 'Guardando...' : isCompleting ? 'Finalizar & Generar Hoja' : 'Guardar Orden'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
