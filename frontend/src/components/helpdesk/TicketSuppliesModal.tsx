'use client';

import React, { useState, useEffect } from 'react';
import { Ticket, AddSupplyToTicketPayload } from '@/types/helpdesk';
import { Supply } from '@/types/itam';
import { itamService } from '@/services/itam.service';

interface TicketSuppliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onSubmit: (payload: AddSupplyToTicketPayload) => Promise<void>;
  currentUser?: string;
}

export const TicketSuppliesModal: React.FC<TicketSuppliesModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onSubmit,
  currentUser = 'Técnico de Soporte TI',
}) => {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [selectedSupplyId, setSelectedSupplyId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadWarehouseSupplies();
    }
  }, [isOpen]);

  const loadWarehouseSupplies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itamService.getSupplies();
      setSupplies(data);
      if (data.length > 0) {
        setSelectedSupplyId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar catálogo de insumos de almacén');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedSupply = supplies.find((s) => s.id === selectedSupplyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplyId) {
      setError('Seleccione un insumo de almacén');
      return;
    }

    if (selectedSupply && selectedSupply.stock < quantity) {
      setError(`Stock insuficiente en almacén. Disponible: ${selectedSupply.stock} ${selectedSupply.unit}`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        supplyId: selectedSupplyId,
        quantity,
        notes: notes || undefined,
        technicianName: ticket.assignedTechnicianName || currentUser,
      });
      setNotes('');
      setQuantity(1);
      await loadWarehouseSupplies();
    } catch (err: any) {
      setError(err.message || 'Error al descargar insumo de almacén');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base md:text-lg">Almacén de Insumos - Descargo Automático (RF-09)</h3>
            <p className="text-xs text-amber-100">Ticket: {ticket.ticketNumber} - {ticket.subject}</p>
          </div>
          <button onClick={onClose} className="text-amber-200 hover:text-white">
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

          {/* Formulario para agregar insumo */}
          <form onSubmit={handleSubmit} className="bg-amber-50/60 border border-amber-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Registrar Consumo de Repuesto / Consumible en este Ticket
            </h4>

            {loading ? (
              <p className="text-xs text-slate-500 py-2">Consultando inventario de almacén...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Insumo / Repuesto de Almacén:
                    </label>
                    <select
                      value={selectedSupplyId}
                      onChange={(e) => setSelectedSupplyId(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {supplies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code}) - Stock: {s.stock} {s.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Cantidad Utilizada:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedSupply?.stock || 99}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-xs p-2 border border-slate-300 rounded bg-white text-center font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {selectedSupply && (
                  <div className="flex justify-between items-center text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                    <span>Stock actual: <strong className="text-slate-800">{selectedSupply.stock} {selectedSupply.unit}</strong></span>
                    <span>Costo unitario: <strong>S/ {Number(selectedSupply.unitCost || 0).toFixed(2)}</strong></span>
                    <span className="font-semibold text-amber-700">
                      Total descargo: S/ {(Number(selectedSupply.unitCost || 0) * quantity).toFixed(2)}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Justificación o Ubicación de Instalación:
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Instalado en el puesto de trabajo de Mesa de Partes..."
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors shadow-sm"
                  >
                    {submitting ? 'Descargando de Almacén...' : 'Descargar Insumo'}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Listado de insumos ya agregados */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Insumos ya Utilizados y Descargados en este Ticket ({ticket.supplies?.length || 0})
            </h4>

            {!ticket.supplies || ticket.supplies.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 text-center border border-dashed rounded-lg">
                No se han descargado insumos para este ticket todavía.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 border-b">
                    <tr>
                      <th className="p-2.5">Código</th>
                      <th className="p-2.5">Insumo</th>
                      <th className="p-2.5 text-center">Cantidad</th>
                      <th className="p-2.5 text-right">Costo Unit.</th>
                      <th className="p-2.5">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(ticket.supplies || []).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-500">{s.supplyCode}</td>
                        <td className="p-2.5 font-medium text-slate-800">{s.supplyName}</td>
                        <td className="p-2.5 text-center font-bold text-amber-700">{s.quantity} {s.unit}</td>
                        <td className="p-2.5 text-right font-mono">S/ {Number(s.unitCost).toFixed(2)}</td>
                        <td className="p-2.5 text-slate-500 text-[11px]">{s.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
