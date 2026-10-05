'use client';

import React, { useState, useEffect } from 'react';
import { Asset, AssetMovement } from '@/types/itam';
import { itamService } from '@/services/itam.service';
import { officeService } from '../../services/office.service';
import { OfficeItem } from '../../types/office';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onSuccess: (movement: AssetMovement) => void;
}

const COMMON_OFFICES = [
  'Alcaldía',
  'Gerencia Municipal',
  'Subgerencia de Informática y Sistemas',
  'Gerencia de Administración Tributaria (Rentas)',
  'Gerencia de Seguridad Ciudadana (Serenazgo)',
  'Subgerencia de Obras Públicas',
  'Oficina de Recursos Humanos',
  'Oficina de Trámite Documentario / Mesa de Partes',
  'Almacén General',
  'Gerencia de Desarrollo Social',
];

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSuccess,
}) => {
  const [toOffice, setToOffice] = useState('');
  const [movementType, setMovementType] = useState('TRASLADO');
  const [reason, setReason] = useState('');
  const [technicianName, setTechnicianName] = useState('Técnico de Soporte TI');
  const [newCustodianName, setNewCustodianName] = useState('');
  const [includeChildren, setIncludeChildren] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offices, setOffices] = useState<OfficeItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      officeService.getOffices().then(setOffices).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const childCount = asset.childAssets?.length || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toOffice.trim()) {
      setError('La oficina de destino es obligatoria.');
      return;
    }
    if (!reason.trim()) {
      setError('El motivo del traslado o asignación es obligatorio.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await itamService.createMovement({
      assetId: asset.id,
      toOffice: toOffice.trim(),
      movementType,
      reason: reason.trim(),
      technicianName: technicianName.trim(),
      includeChildrenInTransfer: includeChildren,
      notes: notes.trim() ? `${notes.trim()} (Nuevo Custodio: ${newCustodianName || 'No especificado'})` : (newCustodianName ? `Custodio: ${newCustodianName}` : undefined),
    });

    setLoading(false);

    if (res.success && res.data) {
      onSuccess(res.data);
      onClose();
    } else {
      setError(res.error || 'Error al procesar el movimiento');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h2 className="text-base font-bold">Registrar Movimiento / Reasignación</h2>
              <p className="text-xs text-emerald-100">
                {asset.computerCode} — {asset.brandName} {asset.modelName}
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

          {/* Current location card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Ubicación Actual:</span>
              <span className="font-bold text-slate-800">{asset.office || 'Almacén Central TI'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Custodio Actual:</span>
              <span className="font-semibold text-slate-700">{asset.assignedPersonName || 'Sin asignar'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Movimiento <span className="text-rose-500">*</span>
              </label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="TRASLADO">Traslado entre Áreas (RF-09)</option>
                <option value="ASIGNACION_INICIAL">Asignación Inicial (RF-08)</option>
                <option value="RETORNO">Retorno a Oficina de TI / Almacén</option>
                <option value="REASIGNACION">Reasignación de Custodio Interno</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Oficina / Dependencia Destino <span className="text-rose-500">*</span>
              </label>
              <input
                list="offices-list"
                type="text"
                placeholder="Ej. Gerencia de Rentas"
                value={toOffice}
                onChange={(e) => setToOffice(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
              <datalist id="offices-list">
                {offices.length > 0
                  ? offices.map((off) => (
                      <option
                        key={off.id}
                        value={`[${off.acronym}] ${off.name} - ${off.sede}`}
                      />
                    ))
                  : COMMON_OFFICES.map((off) => (
                      <option key={off} value={off} />
                    ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nuevo Responsable / Custodio
              </label>
              <input
                type="text"
                placeholder="Nombre del funcionario receptor"
                value={newCustodianName}
                onChange={(e) => setNewCustodianName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Técnico que Ejecuta el Traslado
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo de la Transferencia / Justificación <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Reubicación de personal por modernización de oficina"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Batch move children checkbox (RF-05) */}
          {childCount > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeChildren}
                  onChange={(e) => setIncludeChildren(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs text-emerald-900">
                  <span className="font-bold">Mover periféricos vinculados en lote ({childCount} componentes):</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Conforme a la regla RF-05, se actualizará automáticamente la oficina de los periféricos asociados (monitor, teclado, mouse, etc.).
                  </p>
                </div>
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observaciones Adicionales</label>
            <textarea
              rows={2}
              placeholder="Estado del equipo al momento del traslado, accesorios entregados..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              * Se generará automáticamente el Acta de Movimiento en PDF (RF-10)
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
              >
                {loading ? 'Generando Acta...' : 'Confirmar Traslado & Acta'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
