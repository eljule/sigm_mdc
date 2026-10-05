'use client';

import React, { useState, useEffect } from 'react';
import { Person, PersonCessationInfo, CeasePersonPayload, CeasePersonResult } from '../../types/admin';
import { adminService } from '../../services/admin.service';

interface PersonCeaseModalProps {
  person: Person;
  onClose: () => void;
  onSuccess: (result: CeasePersonResult) => void;
}

const COMMON_REASONS = [
  'RENUNCIA VOLUNTARIA',
  'TÉRMINO DE CONTRATO CAS',
  'TÉRMINO DE DESIGNACIÓN DIRECTIVA',
  'CULMINACIÓN DE ORDEN DE SERVICIO (LOCACIÓN)',
  'MUTUO DISENSO',
  'JUBILACIÓN',
  'DESTITUCIÓN O SANCIÓN ADMINISTRATIVA',
  'FALLECIMIENTO',
  'OTRO MOTIVO INSTITUCIONAL',
];

const DEFAULT_WAREHOUSE_OFFICE =
  'SUBGERENCIA DE TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES - ALMACÉN TI';

export const PersonCeaseModal: React.FC<PersonCeaseModalProps> = ({
  person,
  onClose,
  onSuccess,
}) => {
  const [loadingInfo, setLoadingInfo] = useState<boolean>(true);
  const [cessationInfo, setCessationInfo] = useState<PersonCessationInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [departureDate, setDepartureDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [cessationReason, setCessationReason] = useState<string>(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [deactivateUser, setDeactivateUser] = useState<boolean>(true);
  const [returnAssetsToWarehouse, setReturnAssetsToWarehouse] = useState<boolean>(true);
  const [warehouseOffice, setWarehouseOffice] = useState<string>(DEFAULT_WAREHOUSE_OFFICE);
  const [authorizedBy, setAuthorizedBy] = useState<string>('SUBGERENCIA DE RECURSOS HUMANOS');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const loadInfo = async () => {
      setLoadingInfo(true);
      setError(null);
      try {
        const info = await adminService.getPersonCessationInfo(person.id);
        if (isMounted) {
          setCessationInfo(info);
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudo cargar la información de activos y usuario asociado.');
        }
      } finally {
        if (isMounted) {
          setLoadingInfo(false);
        }
      }
    };
    loadInfo();
    return () => {
      isMounted = false;
    };
  }, [person.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalReason =
      cessationReason === 'OTRO MOTIVO INSTITUCIONAL'
        ? customReason.trim().toUpperCase()
        : cessationReason;

    if (!finalReason) {
      setError('Especifique el motivo del cese laboral');
      return;
    }

    if (!departureDate) {
      setError('La fecha de cese es obligatoria');
      return;
    }

    setIsSubmitting(true);

    const payload: CeasePersonPayload = {
      departureDate,
      cessationReason: finalReason,
      deactivateUser,
      returnAssetsToWarehouse,
      warehouseOffice,
      authorizedBy: authorizedBy.trim(),
      notes: notes.trim() || undefined,
    };

    const res = await adminService.ceasePerson(person.id, payload);
    setIsSubmitting(false);

    if (res.success && res.result) {
      onSuccess(res.result);
      onClose();
    } else {
      setError(res.error || 'Error al procesar el cese del colaborador');
    }
  };

  const hasAssets = (cessationInfo?.assignedAssets?.length ?? 0) > 0;
  const hasUser = Boolean(cessationInfo?.userAccount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl font-bold shadow-inner">
              🛑
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Cese Laboral y Entrega de Cargo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Procedimiento formal de desvinculación, bloqueo de credenciales y custodia de bienes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold leading-none p-1 rounded-lg"
          >
            &times;
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Tarjeta del Colaborador */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Colaborador Municipal a Cesar
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {person.fullName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {person.documentType}: <strong className="text-slate-700 dark:text-slate-200">{person.documentNumber}</strong>
                  {person.position && <> &bull; Cargo: <strong className="text-slate-700 dark:text-slate-200">{person.position}</strong></>}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {person.laborCondition || 'CAS'}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[240px]">
                  {person.office || 'Municipalidad de Castilla'}
                </p>
              </div>
            </div>
          </div>

          {loadingInfo ? (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
              <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
              <span>Verificando cuentas de usuario y custodia de activos TI...</span>
            </div>
          ) : (
            <>
              {/* Sección 1: Impacto en Personas y Usuarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1.1 Estado de Persona */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
                    <span className="text-base">🗂️</span>
                    <span>Registro en Base de Datos</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    El registro <strong>NO se elimina</strong> para proteger la auditoría histórica de tickets y resoluciones.
                    El estado laboral pasará a <strong className="text-rose-600 dark:text-rose-400">CESADO</strong>.
                  </p>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-900/40">
                    ✓ Podrá interactuar a futuro como <strong>Administrado (Ciudadano)</strong> sin duplicar su DNI.
                  </div>
                </div>

                {/* 1.2 Cuenta de Usuario */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
                    <span className="text-base">🔐</span>
                    <span>Cuenta de Acceso SIGM</span>
                  </div>
                  {hasUser && cessationInfo?.userAccount ? (
                    <div className="space-y-2">
                      <div className="text-[11px] p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                        Usuario: <strong>{cessationInfo.userAccount.username}</strong> ({cessationInfo.userAccount.role})
                      </div>
                      <label className="flex items-center space-x-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deactivateUser}
                          onChange={(e) => setDeactivateUser(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Bloquear cuenta inmediatamente
                        </span>
                      </label>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      No registra cuenta de usuario activa en el sistema.
                    </p>
                  )}
                </div>
              </div>

              {/* Sección 2: Activos TI en Custodia (Entrega de Cargo) */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white">
                    <span className="text-base">💻</span>
                    <span>Custodia de Activos Tecnológicos (ITAM)</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      hasAssets
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {cessationInfo?.assignedAssets?.length || 0} activos en custodia
                  </span>
                </div>

                {hasAssets ? (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Los siguientes equipos están bajo la responsabilidad del colaborador. Se generará un
                      <strong> Acta Oficial de Movimiento (DEVOLUCIÓN A ALMACÉN)</strong> por cada bien para
                      completar la entrega de cargo formal.
                    </p>

                    <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold sticky top-0">
                          <tr>
                            <th className="py-2 px-3">Código</th>
                            <th className="py-2 px-3">Categoría</th>
                            <th className="py-2 px-3">Marca / Modelo</th>
                            <th className="py-2 px-3 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {cessationInfo?.assignedAssets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                                {asset.computerCode}
                                {asset.patrimonialCode && (
                                  <span className="block text-[9px] text-slate-400 font-normal">
                                    Pat: {asset.patrimonialCode}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                                {asset.categoryName}
                              </td>
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                                {asset.brandName} &bull; {asset.modelName}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                  {asset.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                      <label className="flex items-center space-x-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={returnAssetsToWarehouse}
                          onChange={(e) => setReturnAssetsToWarehouse(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Desvincular bienes y retornar a Almacén / Stock Disponible
                        </span>
                      </label>

                      {returnAssetsToWarehouse && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Oficina / Depósito de Recepción
                          </label>
                          <input
                            type="text"
                            value={warehouseOffice}
                            onChange={(e) => setWarehouseOffice(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
                    <span>✓</span>
                    <span>El colaborador no tiene activos tecnológicos asignados a su custodia.</span>
                  </div>
                )}
              </div>

              {/* Sección 3: Datos Formales del Cese */}
              <form id="cease-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Fecha Oficial de Cese / Término *
                    </label>
                    <input
                      type="date"
                      required
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Motivo del Cese *
                    </label>
                    <select
                      value={cessationReason}
                      onChange={(e) => setCessationReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                    >
                      {COMMON_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {cessationReason === 'OTRO MOTIVO INSTITUCIONAL' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Especifique el motivo *
                    </label>
                    <input
                      type="text"
                      required
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Ej. TRASLADO DEFINITIVO A OTRA ENTIDAD PÚBLICA"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white uppercase"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Documento de Respaldo / Autorizado Por
                    </label>
                    <input
                      type="text"
                      value={authorizedBy}
                      onChange={(e) => setAuthorizedBy(e.target.value)}
                      placeholder="Ej. RESOLUCIÓN DE ALCALDÍA N° 120-2026-MDC"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Observaciones / Notas
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej. Entrega conforme de sellos y credenciales de acceso"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer con Acciones */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="cease-form"
            disabled={isSubmitting || loadingInfo}
            className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando Cese...</span>
              </>
            ) : (
              <>
                <span>🛑</span>
                <span>Confirmar Cese y Entrega de Cargo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
