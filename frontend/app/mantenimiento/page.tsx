'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Module } from '../../src/types/module';
import { getModuleByIdOrCode } from '../../src/services/modules.service';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { Footer } from '../../src/components/Footer';

function MaintenanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleCode = searchParams.get('code') || searchParams.get('subsystem') || 'general';

  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState(false);

  const fetchModule = async () => {
    if (!moduleCode || moduleCode === 'general') {
      setLoading(false);
      return;
    }
    try {
      const data = await getModuleByIdOrCode(moduleCode);
      setModuleData(data);
      if (data && !data.isUnderMaintenance) {
        setRestoredNotice(true);
      }
    } catch (err) {
      console.warn('Error al consultar estado de mantenimiento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModule();
  }, [moduleCode]);

  const handleRecheck = async () => {
    setIsChecking(true);
    try {
      const data = await getModuleByIdOrCode(moduleCode);
      setModuleData(data);
      if (data && !data.isUnderMaintenance) {
        setRestoredNotice(true);
      }
    } finally {
      setTimeout(() => setIsChecking(false), 600);
    }
  };

  const title = moduleData?.name || 'Subsistema Municipal';
  const message =
    moduleData?.maintenanceMessage ||
    'Este subsistema se encuentra temporalmente en mantenimiento preventivo y optimización de servicios por parte de la Oficina de Desarrollo Tecnológico (ODT).';
  const recoveryTime =
    moduleData?.estimatedRecoveryTime ||
    'Aproximadamente 30 a 60 minutos (En verificación técnica)';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Header institucional */}
      <header className="w-full bg-[#0d4f2f] dark:bg-slate-900 border-b border-emerald-800 dark:border-slate-800 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => router.push('/modulos')}
          >
            <Image
              src="/images/logo-castilla.png"
              alt="Escudo de Castilla"
              width={38}
              height={50}
              priority
              className="w-9 h-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-200/90">
                Municipalidad Distrital de Castilla
              </span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                SIGM <span className="font-light text-emerald-200">| Estado del Sistema</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => router.push('/modulos')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600/40 text-white transition-colors"
            >
              ← Panel de Subsistemas
            </button>
          </div>
        </div>
      </header>

      {/* Notificación si el mantenimiento ya culminó */}
      {restoredNotice && (
        <div className="bg-emerald-500 text-white px-4 py-3 text-center text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center space-x-2 animate-fadeIn">
          <span>🎉 ¡El subsistema ha restablecido sus operaciones! Ya puede ingresar con normalidad.</span>
          {moduleData?.route && (
            <button
              onClick={() => router.push(moduleData.route)}
              className="ml-3 px-3 py-1 bg-white text-emerald-800 rounded font-bold hover:bg-emerald-50 transition-colors shadow-sm"
            >
              Ingresar Ahora &rarr;
            </button>
          )}
        </div>
      )}

      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-10 relative overflow-hidden">
          {/* Acento superior de color */}
          <div
            className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
            style={{
              backgroundColor: moduleData?.accentColor || undefined,
            }}
          />

          {/* Badge superior */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wide self-start">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping inline-block" />
              <span>Modo Mantenimiento en Curso</span>
            </div>

            {moduleData?.route && (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 self-start">
                Ruta: {moduleData.route}
              </span>
            )}
          </div>

          {/* Gráfico central e Icono */}
          <div className="text-center my-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 mb-4 shadow-inner relative group">
              <span className="text-5xl animate-bounce">⚙️</span>
              <span className="absolute -bottom-1 -right-1 text-2xl">⏳</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold tracking-wider">
              Sistema Integrado de Gestión Municipal (SIGM - Castilla)
            </p>
          </div>

          {/* Mensaje descriptivo */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-center">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          {/* Caja destacada: Tiempo Aproximado de Recuperación */}
          <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-amber-100/60 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/60 shadow-sm text-center">
            <div className="flex items-center justify-center space-x-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
              <span>⏱️ Tiempo Estimado de Espera y Recuperación</span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-900 dark:text-amber-200 tracking-tight my-1">
              {recoveryTime}
            </div>
            <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80 max-w-md mx-auto leading-normal">
              El equipo de la Oficina de Desarrollo Tecnológico (ODT) se encuentra desplegando las mejoras técnicas para garantizar la integridad y rendimiento del subsistema.
            </p>
          </div>

          {/* Indicador de fases / pipeline */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center mb-4">
              Progreso de la Intervención
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] sm:text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold">
                <div>✓ Fase 1</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">Pausa Operativa</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-bold animate-pulse">
                <div>⟳ Fase 2</div>
                <div className="text-[10px] font-normal">Mantenimiento</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 font-medium">
                <div>○ Fase 3</div>
                <div className="text-[10px] font-normal">Restablecimiento</div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRecheck}
              disabled={isChecking}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span className={isChecking ? 'animate-spin' : ''}>⟳</span>
              <span>{isChecking ? 'Verificando estado...' : 'Verificar Disponibilidad'}</span>
            </button>

            <button
              onClick={() => router.push('/modulos')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all duration-200"
            >
              Volver a Subsistemas
            </button>

            <a
              href="/soporte"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs sm:text-sm text-center transition-all duration-200"
            >
              Mesa de Ayuda (Soporte)
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">
          Cargando estado del subsistema...
        </div>
      }
    >
      <MaintenanceContent />
    </Suspense>
  );
}
