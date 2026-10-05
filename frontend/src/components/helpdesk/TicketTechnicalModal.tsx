'use client';

import React, { useState } from 'react';
import { Ticket, AddTechnicalDetailPayload } from '@/types/helpdesk';

interface TicketTechnicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onSubmit: (payload: AddTechnicalDetailPayload) => Promise<void>;
  currentUser?: string;
}

export const TicketTechnicalModal: React.FC<TicketTechnicalModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
  currentUser = 'Técnico de Soporte TI',
}) => {
  const [confirmedCategory, setConfirmedCategory] = useState<string>(ticket.category);
  const [realDiagnosis, setRealDiagnosis] = useState<string>('');
  const [solutionApplied, setSolutionApplied] = useState<string>('');
  const [technicianObservations, setTechnicianObservations] = useState<string>('');
  const [isDefinitiveDecommission, setIsDefinitiveDecommission] = useState<boolean>(false);
  const [decommissionReason, setDecommissionReason] = useState<string>(
    'Daño estructural irreparable por sobrecarga eléctrica / falla interna grave.',
  );
  const [decommissionDestination, setDecommissionDestination] = useState<string>(
    'Almacén Central Municipal / Chatarreo RAEE',
  );
  const [publishToKnowledgeBase, setPublishToKnowledgeBase] = useState<boolean>(false);
  const [knowledgeBaseTitle, setKnowledgeBaseTitle] = useState<string>(
    `Solución a ${ticket.subject}`,
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realDiagnosis.trim() || !solutionApplied.trim()) {
      setError('El diagnóstico verificado y la solución implementada son obligatorios.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        confirmedCategory,
        realDiagnosis,
        solutionApplied,
        technicianObservations: technicianObservations || undefined,
        isDefinitiveDecommission,
        decommissionReason: isDefinitiveDecommission ? decommissionReason : undefined,
        decommissionDestination: isDefinitiveDecommission ? decommissionDestination : undefined,
        publishToKnowledgeBase,
        knowledgeBaseTitle: publishToKnowledgeBase ? knowledgeBaseTitle : undefined,
        technicianName: ticket.assignedTechnicianName || currentUser,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el diagnóstico técnico');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base md:text-lg">Diagnóstico y Resolución Técnica (RF-08)</h3>
            <p className="text-xs text-emerald-100">
              Ticket: {ticket.ticketNumber} | Solicitante: {ticket.applicantName} ({ticket.officeName})
            </p>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Resumen de lo reportado */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-700">Asunto Reportado:</span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">
                {ticket.category} - Prioridad {ticket.priority}
              </span>
            </div>
            <p className="text-slate-800 font-medium">{ticket.subject}</p>
            <p className="text-slate-500 mt-1 italic">{ticket.description}</p>
            {ticket.assetComputerCode && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-blue-700 font-mono text-[11px]">
                Activo vinculado: {ticket.assetComputerCode} ({ticket.assetCategory || 'TI'})
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoría Técnica Confirmada:
              </label>
              <select
                value={confirmedCategory}
                onChange={(e) => setConfirmedCategory(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="HARDWARE">HARDWARE (Falla física, monitor, PC, teclado, impresora)</option>
                <option value="SOFTWARE">SOFTWARE (Sistemas, virus, Windows, Office, SIGM)</option>
                <option value="RED_INTERNET">RED / INTERNET (Conectividad, cableado, switch, Wi-Fi)</option>
                <option value="PERMISOS">PERMISOS / ACCESOS (Carpetas, credenciales, correo)</option>
                <option value="OTROS">OTROS (Consultas o asesoría técnica)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Técnico Responsable:
              </label>
              <input
                type="text"
                disabled
                value={ticket.assignedTechnicianName || currentUser}
                className="w-full text-xs p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Causa Raíz / Diagnóstico Técnico Verificado *:
            </label>
            <textarea
              value={realDiagnosis}
              onChange={(e) => setRealDiagnosis(e.target.value)}
              required
              rows={2}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Ej. Cable de poder con falsos contactos en terminal / Conector RJ45 quebrado / Memoria RAM con sectores sucios..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción Técnica de la Solución Implementada *:
            </label>
            <textarea
              value={solutionApplied}
              onChange={(e) => setSolutionApplied(e.target.value)}
              required
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Ej. Se reemplazó el conector RJ-45 Cat6 ponchándolo con norma 568B, se testeó con probador de red y se comprobó respuesta a gateway 192.168.1.1 con latencia <1ms..."
            />
          </div>

          {/* Opción de Declarar Baja Técnica (RF-11) */}
          <div className="border border-red-200 bg-red-50/50 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center space-x-2.5">
              <input
                type="checkbox"
                id="checkDecommission"
                checked={isDefinitiveDecommission}
                onChange={(e) => setIsDefinitiveDecommission(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
              />
              <label htmlFor="checkDecommission" className="text-xs font-bold text-red-900 cursor-pointer">
                Declarar Activo Inoperativo / Procede a Baja Técnica (RF-11)
              </label>
            </div>
            <p className="text-[11px] text-red-700 pl-6 leading-tight">
              Marcar si el bien es irreparable. El sistema generará automáticamente el Acta de Baja Técnica oficial en PDF para remitir a Control Patrimonial.
            </p>

            {isDefinitiveDecommission && (
              <div className="pl-6 space-y-2 pt-2 border-t border-red-200">
                <div>
                  <label className="block text-[11px] font-semibold text-red-900 mb-0.5">
                    Causal de Baja (Directiva SBN):
                  </label>
                  <input
                    type="text"
                    value={decommissionReason}
                    onChange={(e) => setDecommissionReason(e.target.value)}
                    className="w-full text-xs p-2 border border-red-300 rounded bg-white text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-red-900 mb-0.5">
                    Destino Final Recomendado:
                  </label>
                  <input
                    type="text"
                    value={decommissionDestination}
                    onChange={(e) => setDecommissionDestination(e.target.value)}
                    className="w-full text-xs p-2 border border-red-300 rounded bg-white text-slate-800 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Opción de Publicar en Base de Conocimientos (RF-14) */}
          <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center space-x-2.5">
              <input
                type="checkbox"
                id="checkKB"
                checked={publishToKnowledgeBase}
                onChange={(e) => setPublishToKnowledgeBase(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="checkKB" className="text-xs font-bold text-blue-900 cursor-pointer">
                ¿Desea publicar esta solución en la Base de Conocimientos? (RF-14)
              </label>
            </div>
            <p className="text-[11px] text-blue-700 pl-6 leading-tight">
              Creará automáticamente un artículo técnico para estandarizar resoluciones futuras entre todos los técnicos de soporte.
            </p>

            {publishToKnowledgeBase && (
              <div className="pl-6 pt-2">
                <label className="block text-[11px] font-semibold text-blue-900 mb-0.5">
                  Título de la Guía de Solución:
                </label>
                <input
                  type="text"
                  value={knowledgeBaseTitle}
                  onChange={(e) => setKnowledgeBaseTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-blue-300 rounded bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end space-x-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              {submitting ? 'Guardando Resolución...' : 'Guardar y Marcar Resuelto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
