'use client';

import React, { useState } from 'react';
import { Ticket } from '@/types/helpdesk';

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onSubmit: (payload: {
    technicianId?: string;
    technicianName: string;
    technicianPhone?: string;
    reason?: string;
    assignedBy: string;
  }) => Promise<void>;
  currentUser?: string;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
  currentUser = 'Coordinador de Soporte TI',
}) => {
  const technicians = [
    { name: 'Ing. Carlos Mendoza (Soporte TI)', phone: 'Anexo 104' },
    { name: 'Téc. Roberto Valdiviezo', phone: 'Anexo 105' },
    { name: 'Téc. Luis Alberto Morales', phone: 'Anexo 106' },
  ];

  const [selectedTech, setSelectedTech] = useState<string>(technicians[0].name);
  const [reason, setReason] = useState<string>('Balanceo de carga de trabajo y prioridad técnica.');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const tech = technicians.find((t) => t.name === selectedTech) || technicians[0];
      await onSubmit({
        technicianName: tech.name,
        technicianPhone: tech.phone,
        reason,
        assignedBy: currentUser,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al reasignar ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Asignación y Reasignación Manual (RF-13)</h3>
            <p className="text-xs text-slate-300">Ticket: {ticket.ticketNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="text-xs bg-slate-50 p-3 rounded border border-slate-200">
            <p><span className="font-semibold">Técnico actual:</span> {ticket.assignedTechnicianName || 'Sin asignar (En cola abierta)'}</p>
            <p><span className="font-semibold">Oficina solicitante:</span> {ticket.officeName}</p>
            <p><span className="font-semibold">Asunto:</span> {ticket.subject}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asignar a Técnico Especialista:
            </label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {technicians.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo de Asignación / Reasignación:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              {submitting ? 'Asignando...' : 'Confirmar Asignación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
