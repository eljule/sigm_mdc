import React from 'react';
import { Header } from '../src/components/Header';
import { Banner } from '../src/components/Banner';
import { ModuleCard } from '../src/components/ModuleCard';
import { Footer } from '../src/components/Footer';
import { getActiveModules } from '../src/services/modules.service';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Server Component: Llamada al endpoint de NestJS (con fallback controlado si el backend está iniciando)
  const modules = await getActiveModules();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header institucional verde con logo, theme switch y login */}
      <Header />

      {/* 2. Banner superior verde con título y subtítulo oficial */}
      <Banner />

      {/* 3. Grid responsivo de tarjetas de subsistemas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Subsistemas Disponibles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Seleccione el módulo al que desea ingresar según sus credenciales asignadas.
            </p>
          </div>
          <div className="self-start sm:self-auto flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{modules.length} subsistemas activos</span>
          </div>
        </div>

        {/* Cuadrícula responsiva: 1 columna en móviles, 2 en tablets y 4 en pantallas grandes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <ModuleCard key={module.id || module.code} module={module} />
          ))}
        </div>
      </main>

      {/* 4. Footer institucional */}
      <Footer />
    </div>
  );
}
