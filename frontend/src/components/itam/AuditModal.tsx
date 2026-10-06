'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { InventoryAudit, ConciliationReport } from '@/types/itam';
import { itamService } from '@/services/itam.service';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditId?: string | null;
  onUpdated: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  auditId,
  onUpdated,
}) => {
  const [report, setReport] = useState<ConciliationReport | null>(null);
  const [auditDetail, setAuditDetail] = useState<InventoryAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New audit form states
  const [isCreatingNew, setIsCreatingNew] = useState(!auditId);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [title, setTitle] = useState(`Inventario Físico Anual ${new Date().getFullYear()}`);
  const [notes, setNotes] = useState('');

  // Quick verification in-field form states (RF-12 tablet / barcode scan)
  const [scannedCode, setScannedCode] = useState('');
  const [foundOffice, setFoundOffice] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('Técnico de Control Patrimonial');
  const [verificationStatus, setVerificationStatus] = useState<'CONCILIADO' | 'TRASLADADO_NO_AUTORIZADO' | 'NO_HABIDO'>('CONCILIADO');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const loadAuditData = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [rep, detail] = await Promise.all([
        itamService.getConciliationReport(id),
        itamService.getAuditById(id),
      ]);
      setReport(rep);
      setAuditDetail(detail);
    } catch {
      setError('Error al cargar la información de la auditoría');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auditId) {
      setIsCreatingNew(false);
      loadAuditData(auditId);
    } else {
      setIsCreatingNew(true);
    }
  }, [auditId, loadAuditData]);

  if (!isOpen) return null;

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await itamService.createAudit({
      year,
      title: title.trim(),
      notes: notes.trim() || undefined,
    });

    setLoading(false);
    if (res.success && res.data) {
      onUpdated();
      loadAuditData(res.data.id);
    } else {
      setError(res.error || 'Error al iniciar la auditoría anual');
    }
  };

  const handleQuickVerify = async (assetId: string, expectedOffice?: string | null) => {
    if (!report?.audit.id) return;
    const finalOffice = foundOffice.trim() || expectedOffice || 'Oficina No Especificada';
    const isRelocated = expectedOffice && finalOffice.toLowerCase() !== expectedOffice.toLowerCase();
    const finalStatus = isRelocated ? 'TRASLADADO_NO_AUTORIZADO' : verificationStatus;

    setLoading(true);
    const res = await itamService.verifyAssetAudit({
      auditId: report.audit.id,
      assetId,
      foundOffice: finalOffice,
      status: finalStatus,
      verifiedBy: verifiedBy.trim(),
    });

    setLoading(false);
    if (res.success) {
      setScannedCode('');
      loadAuditData(report.audit.id);
      onUpdated();
    } else {
      setError(res.error || 'Error al registrar verificación');
    }
  };

  const handleCloseAudit = async () => {
    if (!report?.audit.id) return;
    if (!confirm('¿Está seguro de cerrar el inventario anual? Una vez cerrado no se admitirán más conciliaciones.')) {
      return;
    }
    setLoading(true);
    const res = await itamService.closeAudit(report.audit.id, 'Cierre formal de inventario físico anual');
    setLoading(false);
    if (res.success) {
      loadAuditData(report.audit.id);
      onUpdated();
    } else {
      setError(res.error || 'Error al cerrar auditoría');
    }
  };

  const verifications = report?.verifications || [];
  const filteredVerifications = verifications.filter((v) => {
    if (filterStatus === 'ALL') return true;
    return v.status === filterStatus;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-base font-bold">
                {isCreatingNew
                  ? 'Apertura de Inventario Físico Anual (RF-11)'
                  : `Auditoría & Conciliación Física: ${report?.audit.title || 'Inventario'}`}
              </h2>
              <p className="text-xs text-indigo-200">
                {isCreatingNew
                  ? 'Generación de fotografía (snapshot) del inventario por año fiscal'
                  : `Año Fiscal ${report?.audit.year} — Estado: ${report?.audit.status}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold">✕</button>
            </div>
          )}

          {isCreatingNew ? (
            /* Creation Form */
            <form onSubmit={handleCreateAudit} className="space-y-4 max-w-xl mx-auto py-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>Requisito RF-11 (Cierres y Aperturas de Inventario Anual):</strong> Al crear la auditoría se congelará una fotografía (snapshot) de todos los activos, sus ubicaciones actuales y custodios para contrastar contra el levantamiento en campo.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Año Fiscal de Inventario <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título / Denominación de la Auditoría <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas / Base Legal / Resolución de Inicio</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Conforme a Resolución de Alcaldía N° 045-2026-MDC/A..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-50"
                >
                  {loading ? 'Generando Snapshot...' : 'Tomar Snapshot & Aperturar Inventario'}
                </button>
              </div>
            </form>
          ) : (
            /* Audit Detail & Conciliation Dashboard */
            report && (
              <div className="space-y-6">
                {/* Summary KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Esperados</p>
                    <p className="text-xl font-bold text-slate-900">{report.summary.total}</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                    <p className="text-[11px] font-semibold text-emerald-700 uppercase">Conciliados</p>
                    <p className="text-xl font-bold text-emerald-800">{report.summary.conciliados}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                    <p className="text-[11px] font-semibold text-amber-700 uppercase">Traslados No Aut.</p>
                    <p className="text-xl font-bold text-amber-800">{report.summary.trasladosNoAutorizados}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                    <p className="text-[11px] font-semibold text-rose-700 uppercase">No Habidos / Falt.</p>
                    <p className="text-xl font-bold text-rose-800">{report.summary.noHabidos}</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-center">
                    <p className="text-[11px] font-semibold text-indigo-700 uppercase">Progreso Físico</p>
                    <p className="text-xl font-bold text-indigo-800">{report.summary.progressPercentage}%</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Avance de Verificación Física en Campo</span>
                    <span className="font-semibold text-slate-700">{report.summary.progressPercentage}% completado</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${report.summary.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Scanner Box (RF-12 Tablet in Field / Barcode Scanner) */}
                {report.audit.status === 'EN_PROCESO' && (
                  <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📱</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                          Levantamiento Rápido en Campo (Tablet / Lector de Código de Barras / QR)
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">RNF-04 Optimizado para tablets</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Escanear Código (MDC-TI-PC-0001)..."
                        value={scannedCode}
                        onChange={(e) => setScannedCode(e.target.value.toUpperCase())}
                        className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-400 font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Oficina donde fue hallado..."
                        value={foundOffice}
                        onChange={(e) => setFoundOffice(e.target.value)}
                        className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-400"
                      />
                      <select
                        value={verificationStatus}
                        onChange={(e: any) => setVerificationStatus(e.target.value)}
                        className="px-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-indigo-400"
                      >
                        <option value="CONCILIADO">Hallado en su Oficina (Conciliado)</option>
                        <option value="TRASLADADO_NO_AUTORIZADO">Trasladado sin Autorización</option>
                        <option value="NO_HABIDO">No Habido / Faltante</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const match = verifications.find(
                            (v) =>
                              v.asset?.computerCode.toUpperCase() === scannedCode.trim() ||
                              v.asset?.patrimonialCode === scannedCode.trim() ||
                              v.assetId === scannedCode.trim(),
                          );
                          if (match) {
                            handleQuickVerify(match.assetId, match.expectedOffice);
                          } else {
                            setError(`El activo "${scannedCode}" no pertenece a este inventario o no existe.`);
                          }
                        }}
                        disabled={!scannedCode.trim() || loading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
                      >
                        Registrar Conciliación
                      </button>
                    </div>
                  </div>
                )}

                {/* Filter and Table of Assets */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Detalle de Activos del Snapshot ({filteredVerifications.length})
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Filtrar:</span>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white focus:outline-none"
                      >
                        <option value="ALL">Todos los Registros</option>
                        <option value="PENDIENTE">Pendientes de Verificación</option>
                        <option value="CONCILIADO">Conciliados (Conformes)</option>
                        <option value="TRASLADADO_NO_AUTORIZADO">Traslados No Autorizados</option>
                        <option value="NO_HABIDO">No Habidos / Faltantes</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Código Informático</th>
                          <th className="p-2.5">Patrimonial</th>
                          <th className="p-2.5">Equipo / Modelo</th>
                          <th className="p-2.5">Oficina Esperada</th>
                          <th className="p-2.5">Oficina Hallada</th>
                          <th className="p-2.5">Estado Conciliación</th>
                          <th className="p-2.5 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredVerifications.map((v) => {
                          let badgeClass = 'bg-slate-100 text-slate-700';
                          if (v.status === 'CONCILIADO') badgeClass = 'bg-emerald-100 text-emerald-800';
                          if (v.status === 'TRASLADADO_NO_AUTORIZADO') badgeClass = 'bg-amber-100 text-amber-800';
                          if (v.status === 'NO_HABIDO' || v.status === 'FALTANTE') badgeClass = 'bg-rose-100 text-rose-800';

                          return (
                            <tr key={v.id} className="hover:bg-slate-50 transition">
                              <td className="p-2.5 font-mono font-bold text-indigo-700">{v.asset?.computerCode}</td>
                              <td className="p-2.5 font-mono text-slate-500">{v.asset?.patrimonialCode || 'S/C'}</td>
                              <td className="p-2.5">
                                {v.asset?.categoryName || ''} - {v.asset?.brandName || ''} {v.asset?.modelName || ''}
                              </td>
                              <td className="p-2.5 text-slate-700">{v.expectedOffice || 'Sin Oficina'}</td>
                              <td className="p-2.5 font-semibold text-slate-900">{v.foundOffice || '-'}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                                  {v.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-right">
                                {report.audit.status === 'EN_PROCESO' && (
                                  <button
                                    onClick={() => handleQuickVerify(v.assetId, v.expectedOffice)}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-semibold"
                                  >
                                    Verificar
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            {report?.audit.status === 'EN_PROCESO' && (
              <button
                type="button"
                onClick={handleCloseAudit}
                disabled={loading}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                🔒 Cerrar Inventario Anual Definitivo
              </button>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
