'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, AssignProvisionalAssetPayload, ReturnProvisionalAssetPayload } from '@/types/helpdesk';
import { Asset } from '@/types/itam';
import { itamService } from '@/services/itam.service';

interface TicketProvisionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onAssign: (payload: AssignProvisionalAssetPayload) => Promise<void>;
  onReturn: (loanId: string, payload: ReturnProvisionalAssetPayload) => Promise<void>;
  currentUser?: string;
}

export const TicketProvisionalModal: React.FC<TicketProvisionalModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onAssign,
  onReturn,
  currentUser = 'Técnico de Soporte TI',
}) => {
  const [loanableAssets, setLoanableAssets] = useState<Asset[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedTempAssetId, setSelectedTempAssetId] = useState<string>('');
  const [selectedDamagedAssetId, setSelectedDamagedAssetId] = useState<string>(ticket.assetId || '');
  const [notes, setNotes] = useState<string>('Asignado temporalmente para no paralizar operaciones.');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itamService.getAssets();
      setAllAssets(data);
      // Activos para préstamo
      const loans = data.filter((a) => a.isLoanable && a.status === 'OPERATIVO');
      setLoanableAssets(loans);
      if (loans.length > 0) {
        setSelectedTempAssetId(loans[0].id);
      }
      if (ticket.assetId) {
        setSelectedDamagedAssetId(ticket.assetId);
      } else if (data.length > 0) {
        setSelectedDamagedAssetId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar inventario de activos');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTempAssetId || !selectedDamagedAssetId) {
      setError('Seleccione el activo provisional y el activo averiado');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onAssign({
        temporaryAssetId: selectedTempAssetId,
        damagedAssetId: selectedDamagedAssetId,
        notes: notes || undefined,
        technicianName: ticket.assignedTechnicianName || currentUser,
      });
      await loadAssets();
    } catch (err: any) {
      setError(err.message || 'Error al asignar activo provisional');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (loanId: string) => {
    if (!confirm('¿Confirma que el equipo original fue reparado y reinstalado, y que el componente provisional retorna al stock de reserva?')) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onReturn(loanId, {
        technicianName: ticket.assignedTechnicianName || currentUser,
        notes: 'Equipo original reparado y probado con éxito en puesto de trabajo.',
      });
      await loadAssets();
    } catch (err: any) {
      setError(err.message || 'Error al devolver componente provisional');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base md:text-lg">Préstamo de Emergencia / Activo Provisional (RF-10)</h3>
            <p className="text-xs text-purple-200">Ticket: {ticket.ticketNumber} - {ticket.subject}</p>
          </div>
          <button onClick={onClose} className="text-purple-200 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Formulario de Asignación */}
          <form onSubmit={handleAssign} className="bg-purple-50/60 border border-purple-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide">
              Asignar Equipo o Periférico de Reserva mientras el Original pasa a Laboratorio
            </h4>

            {loading ? (
              <p className="text-xs text-slate-500 py-2">Consultando flota de reserva para préstamos...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Activo Provisional (Stock Reserva TI):
                    </label>
                    <select
                      value={selectedTempAssetId}
                      onChange={(e) => setSelectedTempAssetId(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      {loanableAssets.length === 0 ? (
                        <option value="">No hay activos de préstamo disponibles</option>
                      ) : (
                        loanableAssets.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.computerCode} - {a.brandName} {a.modelName} ({a.categoryName})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Activo / Componente Averiado (Va a Taller):
                    </label>
                    <select
                      value={selectedDamagedAssetId}
                      onChange={(e) => setSelectedDamagedAssetId(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      {allAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.computerCode} - {a.brandName} {a.modelName} ({a.categoryName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Motivo / Observaciones del Préstamo de Emergencia:
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || loanableAssets.length === 0}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded transition-colors shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Asignando Provisional...' : 'Asignar Activo Provisional'}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Historial de Préstamos del Ticket */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Componentes Provisionales Asignados a este Ticket ({ticket.loans?.length || 0})
            </h4>

            {!ticket.loans || ticket.loans.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 text-center border border-dashed rounded-lg">
                No se han realizado préstamos provisionales para este ticket.
              </p>
            ) : (
              <div className="space-y-2">
                {(ticket.loans || []).map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center text-xs gap-2"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-purple-800 font-mono">
                          Provisional: {loan.temporaryAssetCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            loan.status === 'PRESTADO'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{loan.temporaryAssetName}</p>
                      <p className="text-[11px] text-slate-500">
                        Sustituyendo a averiado: <strong className="text-red-700">{loan.damagedAssetCode}</strong> ({loan.damagedAssetName})
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 self-end md:self-auto">
                      {loan.status === 'PRESTADO' ? (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => handleReturn(loan.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors shadow-sm"
                        >
                          ✓ Devolver al Stock
                        </button>
                      ) : (
                        <span className="text-[11px] text-green-700 font-semibold">
                          Retornado ({loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'OK'})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
