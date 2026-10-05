'use client';

import React from 'react';
import { Ticket } from '@/types/helpdesk';

interface DecommissionActModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
}

export const DecommissionActModal: React.FC<DecommissionActModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const actNumber = ticket.technicalDetail?.decommissionActNumber || `ACTA-BAJA-${new Date().getFullYear()}-0001`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Barra superior de controles (no imprimible) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
            <span className="font-semibold text-sm">
              Documento Oficial: Informe Técnico de Baja Patrimonial (SRS RF-11 / RNF-05)
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Vista del documento imprimible en formato A4 */}
        <div className="p-8 md:p-12 overflow-y-auto font-serif text-slate-800 bg-white print:p-0 print:m-0">
          {/* Encabezado Municipal */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-bold text-xs text-center p-1">
                ESCUDO CASTILLA
              </div>
              <div className="text-center flex-1 px-4">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  Municipalidad Distrital de Castilla
                </h1>
                <p className="text-xs text-slate-600 font-sans uppercase font-medium tracking-wide">
                  Provincia y Departamento de Piura - Perú
                </p>
                <p className="text-xs text-slate-500 font-sans">
                  Gerencia de Administración y Finanzas | Subgerencia de Informática y Sistemas
                </p>
              </div>
              <div className="w-24 text-right flex flex-col items-end">
                <div className="text-[10px] font-mono text-slate-500 font-sans">N° EXPEDIENTE</div>
                <div className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {actNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Título Principal del Informe Técnico */}
          <div className="text-center my-6">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-2 inline-block">
              INFORME TÉCNICO DE DECLARATORIA DE INOPERATIVIDAD Y BAJA PATRIMONIAL
            </h2>
            <div className="text-xs text-slate-500 font-sans mt-1">
              Remitido a la Subgerencia de Control Patrimonial y Margesí de Bienes
            </div>
          </div>

          {/* Tabla de Metadatos Generales */}
          <div className="bg-slate-50 border border-slate-300 rounded-md p-4 mb-6 font-sans text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block">Fecha de Emisión:</span>
                <span className="font-semibold text-slate-800">{today}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ticket Helpdesk Origen:</span>
                <span className="font-semibold text-blue-700">{ticket.ticketNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Oficina / Dependencia:</span>
                <span className="font-semibold text-slate-800">{ticket.officeName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Técnico Dictaminante:</span>
                <span className="font-semibold text-slate-800">{ticket.assignedTechnicianName || 'Técnico de Soporte TI'}</span>
              </div>
            </div>
          </div>

          {/* 1. Identificación del Activo Tecnológico */}
          <div className="mb-6 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-l-4 border-red-600 pl-2 mb-3">
              1. Identificación del Equipo Tecnológico Evaluado
            </h3>
            <table className="w-full text-xs border border-slate-300">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-100/50">
                  <td className="p-2.5 font-semibold text-slate-600 w-1/4 border-r border-slate-200">Código Informático:</td>
                  <td className="p-2.5 font-mono font-bold text-blue-800 w-1/4 border-r border-slate-200">{ticket.assetComputerCode || 'N/A (Periférico / Insumo)'}</td>
                  <td className="p-2.5 font-semibold text-slate-600 w-1/4 border-r border-slate-200">Categoría de Activo:</td>
                  <td className="p-2.5 text-slate-800 w-1/4">{ticket.assetCategory || ticket.category}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-semibold text-slate-600 border-r border-slate-200">Asunto Reportado:</td>
                  <td className="p-2.5 text-slate-800 border-r border-slate-200 font-medium" colSpan={3}>
                    {ticket.subject}
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-600 border-r border-slate-200">Usuario Custodio:</td>
                  <td className="p-2.5 text-slate-800 border-r border-slate-200">{ticket.applicantName}</td>
                  <td className="p-2.5 font-semibold text-slate-600 border-r border-slate-200">Estado Técnico Final:</td>
                  <td className="p-2.5 font-bold text-red-600">INOPERATIVO / PROCEDE A BAJA</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Diagnóstico Técnico y Causa Raíz */}
          <div className="mb-6 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-l-4 border-red-600 pl-2 mb-3">
              2. Diagnóstico Técnico de Laboratorio y Verificación de Falla
            </h3>
            <div className="border border-slate-300 rounded p-3 text-xs text-slate-700 bg-slate-50/50 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">Causa Raíz Verificada:</p>
              <p className="mb-3">{ticket.technicalDetail?.realDiagnosis || 'Falla electromecánica irreparable sin posibilidad de reposición económica.'}</p>
              <p className="font-semibold text-slate-900 mb-1">Acción Técnica Realizada y Justificación de Baja:</p>
              <p>{ticket.technicalDetail?.solutionApplied || 'Se realizaron pruebas exhaustivas de laboratorio determinando daño estructural irreversible. La adquisición de repuestos supera el 60% del valor residual de adquisición.'}</p>
            </div>
          </div>

          {/* 3. Causal Legal de Baja y Destino Final */}
          <div className="mb-8 font-sans">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-l-4 border-red-600 pl-2 mb-3">
              3. Causal Técnica y Destino Final del Bien
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="border border-slate-300 rounded p-3">
                <span className="font-semibold text-slate-800 block mb-1">Causal de Baja (Directiva SBN):</span>
                <span className="text-slate-600 leading-relaxed">
                  {ticket.technicalDetail?.decommissionReason || 'Obsolescencia tecnológica y estado de inoperatividad irreparable.'}
                </span>
              </div>
              <div className="border border-slate-300 rounded p-3">
                <span className="font-semibold text-slate-800 block mb-1">Destino Final Recomendado:</span>
                <span className="text-slate-600 leading-relaxed">
                  {ticket.technicalDetail?.decommissionDestination || 'Almacén Central Municipal / Chatarreo / Disposición Final RAEE.'}
                </span>
              </div>
            </div>
          </div>

          {/* Bloque Legal de Conformidad */}
          <div className="text-[11px] text-slate-500 font-sans italic border-t border-slate-300 pt-3 mb-10 leading-tight">
            Se emite el presente Informe Técnico de acuerdo con las normativas de la Dirección General de Abastecimiento (DGA) y la Superintendencia Nacional de Bienes Estatales (SBN) para los fines de desincorporación física y contable del bien en el Inventario Patrimonial de la Municipalidad Distrital de Castilla.
          </div>

          {/* Bloque de Firmas Cuádruple */}
          <div className="grid grid-cols-3 gap-8 pt-8 font-sans text-center text-xs">
            <div className="border-t border-slate-800 pt-2">
              <div className="font-bold text-slate-900">{ticket.assignedTechnicianName || 'Técnico Evaluador'}</div>
              <div className="text-[10px] text-slate-600">Técnico de Soporte TI</div>
              <div className="text-[10px] text-slate-400">Oficina de Informática y Sistemas</div>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <div className="font-bold text-slate-900">Ing. Jefe de Sistemas</div>
              <div className="text-[10px] text-slate-600">Jefe de la Unidad de TI (V° B°)</div>
              <div className="text-[10px] text-slate-400">Municipalidad Distrital de Castilla</div>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <div className="font-bold text-slate-900">Control Patrimonial</div>
              <div className="text-[10px] text-slate-600">Recepción y Baja de Margesí</div>
              <div className="text-[10px] text-slate-400">Gerencia de Administración y Finanzas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
