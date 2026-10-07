'use client';

import React, { useState } from 'react';
import { Ticket, TicketStatus } from '@/types/helpdesk';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onTakeTicket?: () => Promise<void>;
  onOpenTechnicalModal?: () => void;
  onOpenSuppliesModal?: () => void;
  onOpenProvisionalModal?: () => void;
  onOpenConformityModal?: () => void;
  onOpenDecommissionModal?: () => void;
  onOpenReassignModal?: () => void;
  onUpdateStatus?: (status: TicketStatus, reason?: string) => Promise<void>;
  currentUser?: string;
  isTechnicianOrAdmin?: boolean;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onTakeTicket,
  onOpenTechnicalModal,
  onOpenSuppliesModal,
  onOpenProvisionalModal,
  onOpenConformityModal,
  onOpenDecommissionModal,
  onOpenReassignModal,
  onUpdateStatus,
  currentUser = 'Técnico de Soporte TI',
  isTechnicianOrAdmin = true,
}) => {
  const [pauseReasonInput, setPauseReasonInput] = useState<string>('');
  const [showPauseInput, setShowPauseInput] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePause = async () => {
    if (!pauseReasonInput.trim()) {
      alert('Debe ingresar un motivo obligatorio para pausar el ticket.');
      return;
    }
    setActionLoading(true);
    try {
      if (onUpdateStatus) {
        await onUpdateStatus('EN_PAUSA', pauseReasonInput.trim());
      }
      setShowPauseInput(false);
      setPauseReasonInput('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      if (onUpdateStatus) {
        await onUpdateStatus('EN_ATENCION', 'Reanudación de labores técnicas.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendToLab = async () => {
    setActionLoading(true);
    try {
      if (onUpdateStatus) {
        await onUpdateStatus('EN_LABORATORIO', 'Equipo trasladado al taller de Informática para pruebas exhaustivas.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    const badges: Record<TicketStatus, { bg: string; text: string; label: string }> = {
      ABIERTO: { bg: 'bg-blue-100', text: 'text-blue-800', label: '1. Abierto / Pendiente' },
      EN_ATENCION: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: '2. En Atención Técnica' },
      EN_PAUSA: { bg: 'bg-amber-100', text: 'text-amber-800', label: '3. En Pausa / En Espera' },
      EN_LABORATORIO: { bg: 'bg-purple-100', text: 'text-purple-800', label: '4. En Taller / Laboratorio' },
      RESUELTO: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: '5. Resuelto (Visto Bueno Pendiente)' },
      CERRADO: { bg: 'bg-slate-100', text: 'text-slate-800', label: '6. Cerrado Formalmente' },
      CANCELADO: { bg: 'bg-red-100', text: 'text-red-800', label: '7. Cancelado' },
    };
    const b = badges[status] || badges.ABIERTO;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${b.bg} ${b.text}`}>
        {b.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICA':
        return <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">Crítica</span>;
      case 'ALTA':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">Alta</span>;
      case 'MEDIA':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">Media</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">Baja</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Encabezado */}
        <div className="bg-[#0d4f2f] px-6 py-4 text-white flex justify-between items-center border-b border-emerald-800">
          <div className="flex items-center space-x-3">
            <span className="font-mono font-bold text-lg text-emerald-300">{ticket.ticketNumber}</span>
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barra de Acciones Operativas */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Técnico Asignado:</span>
            <span className="font-bold text-slate-800">
              {ticket.assignedTechnicianName || 'Sin asignar (En cola abierta)'}
            </span>
            {ticket.assignedTechnicianPhone && (
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[11px] font-mono">
                {ticket.assignedTechnicianPhone}
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Si está ABIERTO */}
            {ticket.status === 'ABIERTO' && isTechnicianOrAdmin && (
              <>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={onTakeTicket}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-sm transition-colors"
                >
                  ⚡ Tomar Ticket / Atender
                </button>
                <button
                  type="button"
                  onClick={onOpenReassignModal}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors"
                >
                  Asignar a Técnico
                </button>
              </>
            )}

            {/* Si está EN_ATENCION o EN_LABORATORIO */}
            {(ticket.status === 'EN_ATENCION' || ticket.status === 'EN_LABORATORIO') && isTechnicianOrAdmin && (
              <>
                <button
                  type="button"
                  onClick={onOpenTechnicalModal}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-sm transition-colors"
                >
                  ✓ Diagnóstico & Solución
                </button>
                <button
                  type="button"
                  onClick={onOpenSuppliesModal}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium shadow-sm transition-colors"
                >
                  📦 Insumos Almacén ({ticket.supplies?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={onOpenProvisionalModal}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium shadow-sm transition-colors"
                >
                  🔄 Préstamo Provisional ({ticket.loans?.length || 0})
                </button>
                {ticket.status === 'EN_ATENCION' && (
                  <button
                    type="button"
                    onClick={handleSendToLab}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded font-medium transition-colors"
                  >
                    🔬 A Laboratorio
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPauseInput(!showPauseInput)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium transition-colors"
                >
                  ⏸️ Pausar
                </button>
              </>
            )}

            {/* Si está EN_PAUSA */}
            {ticket.status === 'EN_PAUSA' && isTechnicianOrAdmin && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleResume}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-sm transition-colors"
              >
                ▶️ Reanudar Atención
              </button>
            )}

            {/* Si está RESUELTO */}
            {ticket.status === 'RESUELTO' && (
              <button
                type="button"
                onClick={onOpenConformityModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-sm transition-colors"
              >
                ⭐ Otorgar Visto Bueno (Cierre)
              </button>
            )}

            {/* Si tiene acta de baja técnica generada */}
            {ticket.technicalDetail?.isDefinitiveDecommission && (
              <button
                type="button"
                onClick={onOpenDecommissionModal}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold shadow-sm transition-colors"
              >
                📄 Ver Acta de Baja (PDF)
              </button>
            )}
          </div>
        </div>

        {/* Diálogo de Pausa Justificada */}
        {showPauseInput && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 text-xs flex flex-col md:flex-row items-center gap-3 animate-fadeIn">
            <span className="font-bold text-amber-900 whitespace-nowrap">Motivo obligatorio de pausa (RF-12):</span>
            <input
              type="text"
              value={pauseReasonInput}
              onChange={(e) => setPauseReasonInput(e.target.value)}
              placeholder="Ej. Esperando compra de repuesto / Usuario en comisión de servicio..."
              className="flex-1 p-2 border border-amber-300 rounded bg-white text-slate-800 focus:outline-none"
            />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handlePause}
                disabled={actionLoading}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-sm"
              >
                Confirmar Pausa
              </button>
              <button
                type="button"
                onClick={() => setShowPauseInput(false)}
                className="px-3 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Datos del Solicitante y Activo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] border-b pb-1.5">
                Datos del Solicitante
              </h4>
              <p><span className="text-slate-500">Funcionario:</span> <strong className="text-slate-900">{ticket.applicantName}</strong></p>
              <p><span className="text-slate-500">Dependencia:</span> <strong className="text-slate-900">{ticket.officeName}</strong></p>
              <p><span className="text-slate-500">Contacto:</span> {ticket.applicantPhone || 'Sin anexo registrado'}</p>
              {ticket.applicantEmail && (
                <p><span className="text-slate-500">Correo:</span> {ticket.applicantEmail}</p>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] border-b pb-1.5">
                Activo Tecnológico Vinculado (QR)
              </h4>
              {ticket.assetComputerCode ? (
                <>
                  <p><span className="text-slate-500">Código Informático:</span> <span className="font-mono font-bold text-blue-700">{ticket.assetComputerCode}</span></p>
                  <p><span className="text-slate-500">Categoría:</span> {ticket.assetCategory || ticket.category}</p>
                  <p><span className="text-slate-500">Estado en Inventario:</span> <span className="font-semibold text-emerald-700">Registrado en Base ITAM</span></p>
                </>
              ) : (
                <p className="text-slate-400 italic py-2">
                  No se vinculó un activo específico con código QR (Falla general de servicio o software).
                </p>
              )}
            </div>
          </div>

          {/* Problema Reportado */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] border-b pb-1.5 flex justify-between items-center">
              <span>Incidencia Reportada</span>
              <span className="text-[10px] text-slate-400">Registrado: {new Date(ticket.createdAt).toLocaleString()}</span>
            </h4>
            <div className="text-sm font-bold text-slate-900">{ticket.subject}</div>
            <div className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 whitespace-pre-line">
              {ticket.description}
            </div>
            {ticket.evidencePhotoUrl && (
              <div className="pt-2">
                <span className="font-semibold block mb-1 text-slate-600">Foto o Captura de Evidencia:</span>
                <img
                  src={ticket.evidencePhotoUrl}
                  alt="Evidencia"
                  className="max-h-56 rounded border shadow-sm object-contain"
                />
              </div>
            )}
          </div>

          {/* Diagnóstico y Solución Técnica Registrada */}
          {ticket.technicalDetail && (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-4 space-y-3">
              <h4 className="font-bold uppercase tracking-wider text-emerald-900 text-[11px] border-b border-emerald-200 pb-1.5 flex justify-between items-center">
                <span>Diagnóstico y Solución Técnica Aplicada (RF-08)</span>
                {ticket.technicalDetail.isDefinitiveDecommission && (
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                    Baja Técnica: {ticket.technicalDetail.decommissionActNumber}
                  </span>
                )}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Diagnóstico / Causa Raíz:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded border border-emerald-200 leading-relaxed">
                    {ticket.technicalDetail.realDiagnosis}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5">Solución Técnica Implementada:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded border border-emerald-200 leading-relaxed">
                    {ticket.technicalDetail.solutionApplied}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Visto Bueno y Calificación del Usuario (RF-05) */}
          {ticket.userConformity !== null && ticket.userConformity !== undefined && (
            <div className="border border-indigo-200 bg-indigo-50/40 rounded-lg p-4 space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-indigo-900 text-[11px] border-b border-indigo-200 pb-1.5 flex justify-between items-center">
                <span>Visto Bueno de Cierre por el Solicitante (RF-05)</span>
                <span className="text-indigo-700 font-bold">
                  {ticket.userRating ? `★ ${ticket.userRating}/5 Estrellas` : ''}
                </span>
              </h4>
              <p className="text-slate-800 font-medium">
                Conformidad: <strong className={ticket.userConformity ? 'text-green-700' : 'text-red-700'}>
                  {ticket.userConformity ? '✓ Solución Aprobada y Conforme' : '✗ Solución Observada / No Conforme'}
                </strong>
              </p>
              {ticket.userFeedback && (
                <p className="text-slate-600 italic bg-white p-2.5 rounded border border-indigo-100">
                  &ldquo;{ticket.userFeedback}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Insumos y Préstamos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-3">
              <h5 className="font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1.5">
                Insumos Descargados de Almacén ({ticket.supplies?.length || 0})
              </h5>
              {!ticket.supplies || ticket.supplies.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">Sin consumo de repuestos en almacén.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {(ticket.supplies || []).map((s) => (
                    <li key={s.id} className="py-1 flex justify-between items-center text-[11px]">
                      <span>{s.supplyName}</span>
                      <strong className="text-amber-800 font-mono">{s.quantity} {s.unit}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg p-3">
              <h5 className="font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1.5">
                Activos Provisionales de Reserva ({ticket.loans?.length || 0})
              </h5>
              {!ticket.loans || ticket.loans.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">Sin equipos de sustitución temporal.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {(ticket.loans || []).map((l) => (
                    <li key={l.id} className="py-1 flex justify-between items-center text-[11px]">
                      <span>{l.temporaryAssetCode} ({l.temporaryAssetName})</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${l.status === 'PRESTADO' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {l.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Línea de Tiempo de Auditoría (RNF-04) */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <h4 className="font-bold uppercase tracking-wider text-slate-700 text-[11px] mb-3">
              Historial de Auditoría y Trazabilidad (RNF-04)
            </h4>
            {!ticket.auditLogs || ticket.auditLogs.length === 0 ? (
              <p className="text-slate-400 italic text-[11px]">Sin eventos de auditoría registrados.</p>
            ) : (
              <div className="space-y-2">
                {(ticket.auditLogs || []).map((log) => (
                  <div key={log.id} className="flex items-start space-x-2 text-[11px] border-l-2 border-blue-500 pl-2.5 py-0.5">
                    <span className="font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex-1">
                      <span className="font-bold text-slate-800">{log.action}: </span>
                      <span className="text-slate-600">{log.notes || log.newStatus}</span>
                      <span className="text-slate-400 block text-[10px]">Por: {log.performedByUserName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pie de modal */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
