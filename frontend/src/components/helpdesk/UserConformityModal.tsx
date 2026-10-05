'use client';

import React, { useState } from 'react';
import { Ticket, UserConformityPayload } from '@/types/helpdesk';

interface UserConformityModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onSubmit: (payload: UserConformityPayload) => Promise<void>;
}

export const UserConformityModal: React.FC<UserConformityModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('Solución verificada satisfactoriamente.');
  const [isConforming, setIsConforming] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        userConformity: isConforming,
        userRating: isConforming ? rating : undefined,
        userFeedback: feedback,
        applicantName: ticket.applicantName,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar la conformidad');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Mecanismo de Conformidad de Cierre (RF-05)</h3>
            <p className="text-xs text-blue-100">Ticket: {ticket.ticketNumber} - {ticket.subject}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
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

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
            <p><span className="font-semibold">Técnico que atendió:</span> {ticket.assignedTechnicianName || 'Soporte TI'}</p>
            <p><span className="font-semibold">Diagnóstico:</span> {ticket.technicalDetail?.realDiagnosis || 'Mantenimiento preventivo / correctivo realizado.'}</p>
            <p><span className="font-semibold">Solución aplicada:</span> {ticket.technicalDetail?.solutionApplied || 'Equipo configurado y verificado operativamente.'}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              ¿El equipo o servicio se encuentra funcionando correctamente?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConforming(true);
                  if (feedback === 'El problema continúa o el equipo no quedó operativo.') {
                    setFeedback('Solución verificada satisfactoriamente.');
                  }
                }}
                className={`flex items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  isConforming
                    ? 'bg-green-50 border-green-500 text-green-700 shadow-sm ring-2 ring-green-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Sí, Doy mi Visto Bueno
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsConforming(false);
                  setFeedback('El problema continúa o el equipo no quedó operativo.');
                }}
                className={`flex items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                  !isConforming
                    ? 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-2 ring-red-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <svg className="w-4 h-4 mr-1.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                No, Aún presenta falla
              </button>
            </div>
          </div>

          {isConforming && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Calificación de Atención del Técnico:
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-7 h-7 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="text-xs font-semibold text-amber-600 ml-2">
                  {rating === 5 ? 'Excelente' : rating === 4 ? 'Muy Bueno' : rating === 3 ? 'Bueno' : rating === 2 ? 'Regular' : 'Malo'}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isConforming ? 'Comentarios / Agradecimiento:' : 'Detalle de por qué no está conforme:'}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              required
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={isConforming ? 'Ej. Atención muy rápida y oportuna...' : 'Describa el inconveniente que aún persiste...'}
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
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
              className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors shadow-sm ${
                isConforming ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {submitting
                ? 'Registrando...'
                : isConforming
                ? 'Confirmar y Cerrar Ticket'
                : 'Devolver Ticket a Atención'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
