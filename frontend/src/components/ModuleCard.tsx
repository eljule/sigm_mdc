import React from 'react';
import { Module } from '../types/module';
import {
  DashboardIllustration,
  TransportIllustration,
  ItamIllustration,
  HelpdeskIllustration,
  ArrowRightIcon,
  TicketIcon,
} from './Icons';

interface ModuleCardProps {
  module: Module;
  isReportante?: boolean;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, isReportante = false }) => {
  // Renderizar la ilustración SVG correspondiente según el código del módulo
  const renderIllustration = (): React.ReactElement => {
    switch (module.code) {
      case 'central_dashboard':
        return <DashboardIllustration className="w-20 h-20 transition-transform duration-300 group-hover:scale-105" />;
      case 'transport_licenses':
        return <TransportIllustration className="w-20 h-20 transition-transform duration-300 group-hover:scale-105" />;
      case 'it_inventory':
        return <ItamIllustration className="w-20 h-20 transition-transform duration-300 group-hover:scale-105" />;
      case 'helpdesk_support':
        return <HelpdeskIllustration className="w-20 h-20 transition-transform duration-300 group-hover:scale-105" />;
      default:
        return <DashboardIllustration className="w-20 h-20 transition-transform duration-300 group-hover:scale-105" />;
    }
  };

  const isHelpdesk = module.code === 'helpdesk_support';
  const isMaintenance = Boolean(module.isUnderMaintenance);

  const targetRoute = isMaintenance
    ? `/mantenimiento?code=${encodeURIComponent(module.code)}`
    : module.route;

  const primaryButtonLabel = isMaintenance
    ? 'En Mantenimiento (Ver Espera)'
    : isHelpdesk
      ? isReportante
        ? 'Mis Tickets (Seguimiento)'
        : 'Ingresar al Panel'
      : 'Ingresar al Sistema';

  return (
    <article className={`group bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${
      isMaintenance
        ? 'border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-400/30'
        : 'border-slate-200/90 dark:border-slate-700/80'
    } hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden relative`}>
      {/* 1. Borde superior con acento de color distintivo */}
      <div
        className="w-full h-1.5"
        style={{ backgroundColor: isMaintenance ? '#f59e0b' : module.accentColor }}
        aria-hidden="true"
      />

      {/* Badge de mantenimiento si aplica */}
      {isMaintenance && (
        <div className="absolute top-3 right-3 z-10 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-[10px] font-bold text-amber-800 dark:text-amber-300 shadow-sm animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Mantenimiento</span>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col items-center text-center">
        {/* 2. Ilustración gráfica centrada */}
        <div className="my-3 flex items-center justify-center relative">
          {renderIllustration()}
          {isMaintenance && (
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full p-1.5 shadow-md text-xs">
              ⚙️
            </div>
          )}
        </div>

        {/* 3. Título del módulo */}
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 leading-snug">
          {module.name}
        </h2>

        {/* 4. Descripción funcional o mensaje de mantenimiento */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
          {isMaintenance && module.maintenanceMessage
            ? `⚠️ ${module.maintenanceMessage}`
            : module.description}
        </p>

        {isMaintenance && module.estimatedRecoveryTime && (
          <div className="mb-3 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            ⏱️ Espera aprox: {module.estimatedRecoveryTime}
          </div>
        )}
      </div>

      {/* 5. Botones de acción principal y secundaria */}
      <div className="px-6 pb-6 pt-2 flex flex-col space-y-2.5">
        {/* Botón principal */}
        <a
          href={targetRoute}
          className={`w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 hover:shadow group/btn ${
            isMaintenance
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <span>{primaryButtonLabel}</span>
          <span className="transition-transform duration-200 group-hover/btn:translate-x-1">
            <ArrowRightIcon className="w-4 h-4" />
          </span>
        </a>

        {/* Botón secundario si está configurado y no en mantenimiento */}
        {!isMaintenance && module.secondaryAction && (
          <a
            href={module.secondaryAction.route}
            className="w-full inline-flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs sm:text-sm font-semibold transition-all duration-200 hover:border-purple-400"
          >
            <TicketIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{module.secondaryAction.label}</span>
          </a>
        )}
      </div>
    </article>
  );
};
