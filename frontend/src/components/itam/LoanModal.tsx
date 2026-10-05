'use client';

import React, { useState } from 'react';
import { Asset, AssetLoan } from '@/types/itam';
import { itamService } from '@/services/itam.service';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanableAssets: Asset[];
  existingLoan?: AssetLoan | null; // If returning
  onSuccess: (loan: AssetLoan) => void;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  loanableAssets,
  existingLoan,
  onSuccess,
}) => {
  const isReturning = Boolean(existingLoan && existingLoan.status !== 'DEVUELTO');

  // Form states for creating loan
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [department, setDepartment] = useState('');
  const [requestingPerson, setRequestingPerson] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedEndDate, setEstimatedEndDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('');

  // Form states for returning loan (RF-20)
  const [returnCondition, setReturnCondition] = useState<string>('BUENO');
  const [returnNotes, setReturnNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleAsset = (assetId: string) => {
    if (selectedAssetIds.includes(assetId)) {
      setSelectedAssetIds(selectedAssetIds.filter((id) => id !== assetId));
    } else {
      setSelectedAssetIds([...selectedAssetIds, assetId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isReturning && existingLoan) {
      const res = await itamService.returnLoan(existingLoan.id, {
        returnCondition,
        notes: returnNotes.trim() || undefined,
      });

      setLoading(false);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Error al procesar la devolución');
      }
    } else {
      if (selectedAssetIds.length === 0) {
        setError('Debe seleccionar al menos un equipo para el préstamo.');
        setLoading(false);
        return;
      }
      if (!department.trim() || !requestingPerson.trim() || !reason.trim()) {
        setError('Por favor complete la dependencia, funcionario solicitante y motivo del evento.');
        setLoading(false);
        return;
      }

      const res = await itamService.createLoan({
        assetIds: selectedAssetIds,
        department: department.trim(),
        requestingPerson: requestingPerson.trim(),
        reason: reason.trim(),
        startDate,
        estimatedEndDate,
        notes: notes.trim() || undefined,
      });

      setLoading(false);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Error al registrar el préstamo');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 to-indigo-800 text-white">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{isReturning ? '📥' : '📅'}</span>
            <div>
              <h2 className="text-base font-bold">
                {isReturning
                  ? `Devolución y Retorno de Préstamo (${existingLoan?.loanNumber})`
                  : 'Registrar Préstamo / Reserva Temporal de Activos'}
              </h2>
              <p className="text-xs text-purple-200">
                {isReturning
                  ? `Validación de estado físico al retorno (RF-20)`
                  : 'Gestión de Cañones, Laptops de Contingencia y Accesorios (RF-17, RF-18)'}
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

          {isReturning ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-purple-700 font-semibold">Dependencia:</span>
                  <span className="text-slate-800 font-bold">{existingLoan?.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700 font-semibold">Solicitante:</span>
                  <span className="text-slate-800">{existingLoan?.requestingPerson}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700 font-semibold">Fecha Préstamo:</span>
                  <span className="text-slate-800">{existingLoan?.startDate} al {existingLoan?.estimatedEndDate}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Validación del Estado Operativo al Retorno (RF-20) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="BUENO">Operativo y Conforme (Sin Daños)</option>
                  <option value="CON_OBSERVACIONES">Operativo con Observaciones Estéticas Menores</option>
                  <option value="DAÑADO">Dañado / Inoperativo (Enviar a Mantenimiento Correctivo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones de Recepción / Check de Accesorios
                </label>
                <textarea
                  rows={2}
                  placeholder="Verificación de cargadores, cables HDMI, puntero, estuche..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Asset selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seleccionar Activo(s) para Préstamo <span className="text-rose-500">*</span>
                </label>
                {loanableAssets.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    No hay activos marcados como disponibles para préstamo. En el catálogo de activos marque la casilla &quot;Disponible para préstamo&quot; en proyectores o laptops.
                  </p>
                ) : (
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 p-1">
                    {loanableAssets.map((ast) => {
                      const isSelected = selectedAssetIds.includes(ast.id);
                      return (
                        <div
                          key={ast.id}
                          onClick={() => handleToggleAsset(ast.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition ${
                            isSelected ? 'bg-purple-50 text-purple-900 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded text-purple-600"
                            />
                            <span className="font-mono text-purple-700">{ast.computerCode}</span>
                            <span>{ast.categoryName} - {ast.brandName} {ast.modelName}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] rounded ${
                            ast.status === 'OPERATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {ast.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dependencia Solicitante <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Gerencia de Rentas"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Funcionario / Solicitante <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del responsable"
                    value={requestingPerson}
                    onChange={(e) => setRequestingPerson(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Inicio / Salida <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Estimada de Devolución <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={estimatedEndDate}
                    onChange={(e) => setEstimatedEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo del Evento / Reunión / Capacitación <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Capacitación sobre nuevo TUPA en auditorio municipal"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observaciones / Accesorios Entregados</label>
                <textarea
                  rows={2}
                  placeholder="Incluye puntero láser, cable HDMI de 5m, estuche..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              * Se generará el Acta de Préstamo y Salida en PDF (RF-20).
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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                {loading ? 'Procesando...' : isReturning ? 'Confirmar Retorno & Acta' : 'Generar Préstamo & Acta'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
