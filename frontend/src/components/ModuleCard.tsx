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
  const primaryButtonLabel = isHelpdesk
    ? isReportante
      ? 'Mis Tickets (Seguimiento)'
      : 'Ingresar al Panel'
    : 'Ingresar al Sistema';

  return (
    <article className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/90 dark:border-slate-700/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      {/* 1. Borde superior con acento de color distintivo */}
      <div
        className="w-full h-1.5"
        style={{ backgroundColor: module.accentColor }}
        aria-hidden="true"
      />

      <div className="p-6 flex-1 flex flex-col items-center text-center">
        {/* 2. Ilustración gráfica centrada */}
        <div className="my-3 flex items-center justify-center">
          {renderIllustration()}
        </div>

        {/* 3. Título del módulo */}
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 leading-snug">
          {module.name}
        </h2>

        {/* 4. Descripción funcional */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
          {module.description}
        </p>
      </div>

      {/* 5. Botones de acción principal y secundaria */}
      <div className="px-6 pb-6 pt-2 flex flex-col space-y-2.5">
        {/* Botón principal */}
        <a
          href={module.route}
          className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all duration-200 hover:shadow group/btn"
        >
          <span>{primaryButtonLabel}</span>
          <span className="transition-transform duration-200 group-hover/btn:translate-x-1">
            <ArrowRightIcon className="w-4 h-4" />
          </span>
        </a>

        {/* Botón secundario si está configurado (ej. Soporte: Generar Ticket) */}
        {module.secondaryAction && (
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
