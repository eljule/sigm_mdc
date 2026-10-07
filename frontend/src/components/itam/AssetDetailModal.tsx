import React from 'react';
import { Asset, AssetCategory } from '../../types/itam';

interface AssetDetailModalProps {
  asset: Asset;
  category?: AssetCategory;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onManageChildren?: (asset: Asset) => void;
  onGenerateActa?: (asset: Asset) => void;
  onMoveAsset?: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  category,
  isOpen,
  onClose,
  onEdit,
  onManageChildren,
  onGenerateActa,
  onMoveAsset,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIVO':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
      case 'EN_MANTENIMIENTO':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800';
      case 'EN_CUSTODIA':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-300 dark:border-blue-800';
      case 'EN_DESUSO':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700';
      case 'PARA_BAJA':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // QR Code URL via Google Charts API or quick SVG
  const qrData = JSON.stringify({
    code: asset.computerCode,
    sbn: asset.patrimonialCode || 'N/A',
    model: `${asset.brandName} ${asset.modelName}`,
    office: asset.office || 'MDC',
    custodian: asset.assignedPersonName || 'ALMACÉN TI',
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    qrData
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-xl text-emerald-700 dark:text-emerald-400">
              💻
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-emerald-800 dark:text-emerald-300">
                  {asset.computerCode}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(
                    asset.status
                  )}`}
                >
                  {asset.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ficha Técnica Patrimonial e Informática • Municipalidad Distrital de Castilla
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Imprimir Etiqueta / Ficha"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Banner: Equipment Summary + QR Code */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-800/40 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {asset.categoryName || 'Equipo Tecnológico'}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {asset.brandName} {asset.modelName}
              </h3>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Código Patrimonial SBN</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {asset.patrimonialCode || 'No registrado'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Número de Serie</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {asset.serialNumber || 'S/N'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Condición Física</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {asset.physicalCondition}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Color</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {asset.color || 'Estándar'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Proveedor / Compra</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {asset.supplier || 'No especificado'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Garantía Fabr.</span>
                  <span className={`font-semibold ${asset.warrantyEndDate && new Date(asset.warrantyEndDate) < new Date() ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {asset.warrantyEndDate ? `${asset.warrantyEndDate} ${new Date(asset.warrantyEndDate) < new Date() ? '(Vencida)' : '(Vigente)'}` : 'Sin registrar'}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Tag */}
            <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col items-center gap-1.5 shrink-0">
              <img
                src={qrUrl}
                alt={`QR ${asset.computerCode}`}
                className="w-28 h-28 object-contain"
              />
              <span className="text-[10px] font-mono font-bold text-slate-700 tracking-tight">
                {asset.computerCode}
              </span>
            </div>
          </div>

          {/* Dependencia y Custodio */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Asignación y Custodia Institucional
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                  🏢
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Oficina / Dependencia</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {asset.office || 'Sin oficina asignada (Almacén TI)'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                  👤
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Custodio Responsable</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {asset.assignedPersonName || 'No asignado a personal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Periféricos / Subcomponentes Vinculados (RF-05 Padre-Hijo) */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>🔗</span> Subcomponentes Vinculados (Padre - Hijo)
              </h4>
              {onManageChildren && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onManageChildren(asset);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  Gestionar Periféricos
                </button>
              )}
            </div>

            {asset.childAssets && asset.childAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {asset.childAssets.map((child) => (
                  <div key={child.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-200/60 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold font-mono text-blue-600 dark:text-blue-400 block">
                        {child.computerCode}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        {child.brandName} {child.modelName} ({child.categoryName})
                      </span>
                      {child.serialNumber && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          S/N: {child.serialNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                      {child.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Este equipo no tiene periféricos vinculados como hijos (mouse, monitor, teclado, estabilizador).
              </p>
            )}
          </div>

          {/* Especificaciones Técnicas Dinámicas */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Especificaciones Técnicas Registradas ({asset.categoryName})
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-semibold">
                Esquema Dinámico
              </span>
            </div>

            {asset.specifications && Object.keys(asset.specifications).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {Object.entries(asset.specifications).map(([key, val]) => {
                  const fieldDef = category?.customFieldsSchema?.find((f) => f.key === key);
                  const label = fieldDef?.label || key.replace(/_/g, ' ').toUpperCase();
                  const displayValue =
                    typeof val === 'boolean' ? (val ? 'Sí' : 'No') : String(val);

                  return (
                    <div
                      key={key}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col"
                    >
                      <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                        {label} {fieldDef?.unit && `(${fieldDef.unit})`}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {displayValue || '-'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No se registraron especificaciones técnicas particulares para este activo.
              </p>
            )}
          </div>

          {/* Notas */}
          {asset.notes && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">
                Observaciones y Notas
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {asset.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cerrar
            </button>
            {onGenerateActa && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGenerateActa(asset);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-100 shadow-sm transition-colors"
              >
                <span>📄</span> Acta Oficial PDF
              </button>
            )}
            {onMoveAsset && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onMoveAsset(asset);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <span>🔄</span> Trasladar / Asignar
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(asset);
            }}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar Activo
          </button>
        </div>
      </div>
    </div>
  );
};
