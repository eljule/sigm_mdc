'use client';

import React from 'react';
import { Person } from '../../types/admin';

interface PersonCeaseDetailModalProps {
  person: Person;
  onClose: () => void;
}

export const PersonCeaseDetailModal: React.FC<PersonCeaseDetailModalProps> = ({
  person,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold"
        >
          &times;
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-lg font-bold">
            📋
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Registro Histórico de Cese Laboral
            </h3>
            <p className="text-xs text-slate-500">
              Detalle formal del colaborador cesado en la Municipalidad
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Colaborador</span>
            <p className="text-sm font-black text-slate-900 dark:text-white">{person.fullName}</p>
            <p className="text-slate-500">
              {person.documentType}: {person.documentNumber} &bull; {person.laborCondition || 'CAS'}
            </p>
            <p className="text-slate-500 mt-1">
              Última Dependencia: <strong className="text-slate-700 dark:text-slate-300">{person.office || 'MDC'}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                Fecha de Cese
              </span>
              <p className="text-sm font-extrabold text-rose-700 dark:text-rose-300 mt-0.5">
                {person.departureDate || 'No registrada'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Estado Laboral</span>
              <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                CESADO
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Motivo del Cese</span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
              {person.cessationReason || 'TÉRMINO O DESVINCULACIÓN LABORAL'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-800 dark:text-blue-300">
            <strong>Trámites Ciudadanos:</strong> Este registro se conserva intacto en la base de datos municipal. Si el ciudadano realiza trámites presenciales o en línea en Rentas o Transportes, sus datos de identidad están disponibles sin duplicación.
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
