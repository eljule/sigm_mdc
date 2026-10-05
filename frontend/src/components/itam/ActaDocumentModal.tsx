'use client';

import React, { useRef } from 'react';
import { Asset, AssetMovement, MaintenanceOrder, AssetLoan } from '@/types/itam';

export type ActaType = 'ASIGNACION' | 'TRANSFERENCIA' | 'MANTENIMIENTO' | 'PRESTAMO';

interface ActaDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ActaType;
  movement?: AssetMovement | null;
  asset?: Asset | null;
  maintenance?: MaintenanceOrder | null;
  loan?: AssetLoan | null;
}

export const ActaDocumentModal: React.FC<ActaDocumentModalProps> = ({
  isOpen,
  onClose,
  type,
  movement,
  asset,
  maintenance,
  loan,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const getTitle = () => {
    switch (type) {
      case 'ASIGNACION':
        return 'ACTA DE ASIGNACIÓN Y ENTREGA DE EQUIPO TI';
      case 'TRANSFERENCIA':
        return 'FICHA DE MOVIMIENTO Y TRANSFERENCIA ENTRE DEPENDENCIAS';
      case 'MANTENIMIENTO':
        return 'HOJA DE SERVICIO E INFORME TÉCNICO DE MANTENIMIENTO';
      case 'PRESTAMO':
        return 'ACTA DE SALIDA Y RETORNO DE PRÉSTAMO TEMPORAL';
      default:
        return 'ACTA OFICIAL DE ACTIVO TI';
    }
  };

  const getDocCode = () => {
    if (movement?.actaNumber) return movement.actaNumber;
    if (maintenance?.orderNumber) return maintenance.orderNumber;
    if (loan?.loanNumber) return loan.loanNumber;
    return `MDC-TI-DOC-${new Date().getFullYear()}-0001`;
  };

  const effectiveAsset = asset || movement?.asset || maintenance?.asset;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center space-x-3">
            <span className="text-xl">📄</span>
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase text-indigo-400">
                Documentación Oficial Digital
              </h2>
              <p className="text-xs text-slate-300">
                {getTitle()} — {getDocCode()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition-all"
            >
              <span>🖨️</span>
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div ref={printRef} className="p-8 sm:p-12 text-slate-800 text-sm leading-relaxed bg-white">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  República del Perú
                </p>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  MUNICIPALIDAD DISTRITAL DE CASTILLA
                </h1>
                <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">
                  Oficina de Tecnologías de la Información y Sistemas
                </p>
                <p className="text-[11px] text-slate-500">
                  Plaza Luis Montero S/N - Castilla, Piura | Teléf: (073) 345678
                </p>
              </div>
              <div className="text-right">
                <div className="border-2 border-indigo-700 rounded-lg px-4 py-2 bg-indigo-50/50">
                  <p className="text-[10px] font-bold text-indigo-900 uppercase">Documento Oficial</p>
                  <p className="text-sm font-mono font-bold text-slate-900">{getDocCode()}</p>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Fecha de Emisión: {today}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-base font-bold text-slate-900 tracking-wide uppercase underline decoration-indigo-600 decoration-2 underline-offset-4">
                {getTitle()}
              </h2>
            </div>
          </div>

          {/* Body Content based on Type */}
          {/* 1. General Context */}
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">1. Datos Generales de la Operación</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Tipo de Trámite:</p>
                <p className="font-semibold text-slate-900">{type}</p>
              </div>
              <div>
                <p className="text-slate-500">Fecha de Registro:</p>
                <p className="font-semibold text-slate-900">
                  {movement?.movementDate || maintenance?.scheduledDate || loan?.startDate || today}
                </p>
              </div>
              {movement && (
                <>
                  <div>
                    <p className="text-slate-500">Dependencia de Origen:</p>
                    <p className="font-semibold text-slate-900">{movement.fromOffice || 'Almacén Central TI'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Dependencia de Destino:</p>
                    <p className="font-semibold text-slate-900">{movement.toOffice}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Motivo del Traslado:</p>
                    <p className="font-semibold text-slate-900">{movement.reason}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Técnico Informático:</p>
                    <p className="font-semibold text-slate-900">{movement.technicianName}</p>
                  </div>
                </>
              )}
              {maintenance && (
                <>
                  <div>
                    <p className="text-slate-500">Tipo de Mantenimiento:</p>
                    <p className="font-semibold text-slate-900">{maintenance.maintenanceType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Estado de Orden:</p>
                    <p className="font-semibold text-slate-900">{maintenance.status}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Técnico Asignado:</p>
                    <p className="font-semibold text-slate-900">{maintenance.technicianName || 'Soporte TI'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Falla / Motivo Reportado:</p>
                    <p className="font-semibold text-slate-900">{maintenance.failureReported || 'Mantenimiento preventivo periódico'}</p>
                  </div>
                </>
              )}
              {loan && (
                <>
                  <div>
                    <p className="text-slate-500">Dependencia Solicitante:</p>
                    <p className="font-semibold text-slate-900">{loan.department}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Funcionario Responsable:</p>
                    <p className="font-semibold text-slate-900">{loan.requestingPerson}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Fecha Estimada de Devolución:</p>
                    <p className="font-semibold text-slate-900">{loan.estimatedEndDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Motivo / Evento:</p>
                    <p className="font-semibold text-slate-900">{loan.reason}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Main Asset Technical Sheet */}
          {effectiveAsset && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">2. Especificaciones Técnicas del Activo Principal</h3>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <tbody>
                  <tr className="bg-slate-100">
                    <td className="border border-slate-300 p-2 font-semibold w-1/4">Código Informático</td>
                    <td className="border border-slate-300 p-2 font-mono font-bold text-indigo-700 w-1/4">
                      {effectiveAsset.computerCode}
                    </td>
                    <td className="border border-slate-300 p-2 font-semibold w-1/4">Código Patrimonial SBN</td>
                    <td className="border border-slate-300 p-2 font-mono font-bold w-1/4">
                      {effectiveAsset.patrimonialCode || 'SIN CÓDIGO SBN'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold">Categoría</td>
                    <td className="border border-slate-300 p-2">{effectiveAsset.categoryName || 'N/A'}</td>
                    <td className="border border-slate-300 p-2 font-semibold">Número de Serie</td>
                    <td className="border border-slate-300 p-2 font-mono">{effectiveAsset.serialNumber || 'S/N'}</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="border border-slate-300 p-2 font-semibold">Marca / Modelo</td>
                    <td className="border border-slate-300 p-2">
                      {effectiveAsset.brandName} {effectiveAsset.modelName}
                    </td>
                    <td className="border border-slate-300 p-2 font-semibold">Estado Operativo / Condición</td>
                    <td className="border border-slate-300 p-2">
                      <span className="font-bold">{effectiveAsset.status}</span> ({effectiveAsset.physicalCondition})
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 p-2 font-semibold">Ubicación / Oficina</td>
                    <td className="border border-slate-300 p-2">{effectiveAsset.office || 'Oficina TI'}</td>
                    <td className="border border-slate-300 p-2 font-semibold">Custodio / Responsable</td>
                    <td className="border border-slate-300 p-2">{effectiveAsset.assignedPersonName || 'Sin asignar'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Dynamic specs if available */}
              {effectiveAsset.specifications && Object.keys(effectiveAsset.specifications).length > 0 && (
                <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Componentes Técnicos Internos (Parametrización Dinámica RF-03):
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    {Object.entries(effectiveAsset.specifications).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}: </span>
                        <span className="font-semibold text-slate-800">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Subcomponents (Padre-Hijo RF-05) */}
          {effectiveAsset?.childAssets && effectiveAsset.childAssets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">
                3. Subcomponentes y Periféricos Vinculados (Relación Jerárquica RF-05)
              </h3>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-left">
                    <th className="border border-slate-300 p-2">Código Informático</th>
                    <th className="border border-slate-300 p-2">Categoría</th>
                    <th className="border border-slate-300 p-2">Marca / Modelo</th>
                    <th className="border border-slate-300 p-2">N° Serie</th>
                    <th className="border border-slate-300 p-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveAsset.childAssets.map((ch) => (
                    <tr key={ch.id}>
                      <td className="border border-slate-300 p-2 font-mono font-bold text-indigo-700">{ch.computerCode}</td>
                      <td className="border border-slate-300 p-2">{ch.categoryName || 'Periférico'}</td>
                      <td className="border border-slate-300 p-2">{ch.brandName} {ch.modelName}</td>
                      <td className="border border-slate-300 p-2 font-mono">{ch.serialNumber || 'S/N'}</td>
                      <td className="border border-slate-300 p-2 font-semibold">{ch.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Maintenance details (if applicable) */}
          {maintenance && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase mb-2">4. Acciones Técnicas e Insumos Utilizados</h3>
              <div className="p-3 bg-slate-50 border border-slate-300 rounded mb-3 text-xs">
                <p className="font-semibold text-slate-900">Diagnóstico:</p>
                <p className="text-slate-700 mb-2">{maintenance.diagnosis || 'Revisión y diagnóstico preventivo rutinario.'}</p>
                <p className="font-semibold text-slate-900">Trabajo Realizado:</p>
                <p className="text-slate-700">{maintenance.actionsTaken || 'Limpieza de componentes, optimización de software y test operativo.'}</p>
              </div>

              {maintenance.suppliesUsed && maintenance.suppliesUsed.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-700 uppercase mb-1">Insumos y Repuestos Descargados de Stock (RF-15):</p>
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-left">
                        <th className="border border-slate-300 p-2">Insumo</th>
                        <th className="border border-slate-300 p-2">Categoría</th>
                        <th className="border border-slate-300 p-2">Cantidad Utilizada</th>
                        <th className="border border-slate-300 p-2">Unidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenance.suppliesUsed.map((su) => (
                        <tr key={su.id}>
                          <td className="border border-slate-300 p-2 font-semibold">{su.supply?.name}</td>
                          <td className="border border-slate-300 p-2">{su.supply?.category}</td>
                          <td className="border border-slate-300 p-2 font-bold text-indigo-700">{su.quantityUsed}</td>
                          <td className="border border-slate-300 p-2">{su.supply?.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. Terms and Signatures */}
          <div className="mt-8 border-t border-slate-300 pt-4">
            <p className="text-[11px] text-slate-600 text-justify mb-8 leading-relaxed">
              <strong>DECLARACIÓN DE CONFORMIDAD:</strong> Mediante el presente documento, las partes dan fe de la veracidad de la información
              técnica detallada, así como del estado de operatividad de los equipos entregados o intervenidos. El custodio asume la responsabilidad
              directa de su custodia y uso exclusivo para las funciones encomendadas en la Municipalidad Distrital de Castilla, conforme a las
              directivas internas de control patrimonial y seguridad de la información.
            </p>

            <div className="grid grid-cols-2 gap-12 pt-12">
              <div className="text-center border-t border-slate-900 pt-2">
                <p className="font-bold text-xs text-slate-900 uppercase">
                  {movement?.technicianName || maintenance?.technicianName || 'Técnico de Soporte TI'}
                </p>
                <p className="text-[11px] text-slate-500">Subgerencia de Informática y Sistemas</p>
                <p className="text-[10px] text-slate-400">Entrega Conforme</p>
              </div>
              <div className="text-center border-t border-slate-900 pt-2">
                <p className="font-bold text-xs text-slate-900 uppercase">
                  {movement?.newCustodianName || loan?.requestingPerson || effectiveAsset?.assignedPersonName || 'Jefe de Área / Funcionario Custodio'}
                </p>
                <p className="text-[11px] text-slate-500">Dependencia Usuaria / Receptora</p>
                <p className="text-[10px] text-slate-400">Recepción y Conformidad</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 flex justify-between items-center">
            <span>SIGM - Sistema Integrado de Gestión Municipal | Municipalidad Distrital de Castilla</span>
            <span className="font-mono">Página 1 de 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
