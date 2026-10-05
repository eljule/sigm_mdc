'use client';

import React, { useState } from 'react';
import { Asset } from '@/types/itam';
import { itamService } from '@/services/itam.service';

interface ChildAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentAsset: Asset;
  allAssets: Asset[];
  onUpdated: () => void;
}

export const ChildAssetsModal: React.FC<ChildAssetsModalProps> = ({
  isOpen,
  onClose,
  parentAsset,
  allAssets,
  onUpdated,
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Potential child assets: not this asset, not currently assigned to another parent, and operative
  const candidateAssets = allAssets.filter(
    (a) => a.id !== parentAsset.id && !a.parentAssetId && a.status === 'OPERATIVO',
  );

  const handleLink = async () => {
    if (!selectedChildId) return;
    setLoading(true);
    setError(null);
    const res = await itamService.linkChildAsset(parentAsset.id, selectedChildId);
    setLoading(false);
    if (res.success) {
      setSelectedChildId('');
      onUpdated();
    } else {
      setError(res.error || 'Error al vincular componente');
    }
  };

  const handleUnlink = async (childId: string) => {
    setLoading(true);
    setError(null);
    const res = await itamService.unlinkChildAsset(childId);
    setLoading(false);
    if (res.success) {
      onUpdated();
    } else {
      setError(res.error || 'Error al desvincular componente');
    }
  };

  const currentChildren = parentAsset.childAssets || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔗</span>
            <div>
              <h2 className="text-base font-bold">Relación Jerárquica Componentes (Padre - Hijo)</h2>
              <p className="text-xs text-blue-100">
                {parentAsset.computerCode} — {parentAsset.brandName} {parentAsset.modelName} ({parentAsset.office || 'Sin Oficina'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold">✕</button>
            </div>
          )}

          {/* Explanation note */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
            <strong>Requisito RF-05:</strong> En una estación de trabajo (activo padre), vincule teclado, mouse, monitor y estabilizador como activos independientes con su propio código o serie. Al realizar un traslado, podrá moverlos conjuntamente en bloque.
          </div>

          {/* Add Child Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Vincular Nuevo Periférico / Componente Hijo
            </h3>
            <div className="flex gap-2">
              <select
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Seleccionar periférico disponible ({candidateAssets.length} disponibles) --</option>
                {candidateAssets.map((cand) => (
                  <option key={cand.id} value={cand.id}>
                    [{cand.computerCode}] {cand.categoryName} - {cand.brandName} {cand.modelName} (S/N: {cand.serialNumber || 'S/N'})
                  </option>
                ))}
              </select>
              <button
                onClick={handleLink}
                disabled={!selectedChildId || loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                {loading ? 'Vinculando...' : 'Asociar'}
              </button>
            </div>
          </div>

          {/* Current Linked Children List */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Componentes Vinculados Actualmente ({currentChildren.length})
            </h3>
            {currentChildren.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No tiene componentes hijos asociados. Seleccione un periférico arriba para asociarlo a esta PC.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {currentChildren.map((ch) => (
                  <div key={ch.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">💻</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-blue-700">{ch.computerCode}</span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded">
                            {ch.categoryName || 'Componente'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {ch.brandName} {ch.modelName} | Serie: <span className="font-mono">{ch.serialNumber || 'S/N'}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnlink(ch.id)}
                      disabled={loading}
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium transition"
                    >
                      Desvincular
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
