import React from 'react';
import Image from 'next/image';
import { UserLoginIcon } from './Icons';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-[#0d4f2f] dark:bg-slate-900 border-b border-emerald-800 dark:border-slate-800 text-white shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
        {/* Lado izquierdo: Escudo oficial y branding institucional */}
        <div className="flex items-center space-x-3.5 group cursor-pointer">
          <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/logo-castilla.png"
              alt="Escudo Oficial del Distrito de Castilla"
              width={42}
              height={58}
              priority
              className="w-10 h-auto max-h-12 object-contain drop-shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-emerald-200/90 dark:text-emerald-400">
              Municipalidad Distrital de Castilla
            </span>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
              SIGM <span className="font-light text-emerald-200">| Sistema Integrado de Gestión Municipal</span>
            </span>
          </div>
        </div>

        {/* Lado derecho: Selector de tema y Botón de Inicio de Sesión */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <ThemeToggle />

          <a
            href="/login"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 active:translate-y-0"
          >
            <UserLoginIcon className="w-4 h-4 text-emerald-100" />
            <span>Iniciar Sesión</span>
          </a>
        </div>
      </div>
    </header>
  );
};
