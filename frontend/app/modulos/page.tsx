'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Module } from '../../src/types/module';
import { UserSummary } from '../../src/types/auth';
import { authService } from '../../src/services/auth.service';
import { getActiveModules } from '../../src/services/modules.service';
import { ModuleCard } from '../../src/components/ModuleCard';
import { Footer } from '../../src/components/Footer';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { UserLoginIcon } from '../../src/components/Icons';
import { isReportanteUser } from '../../src/utils/auth-guard';

export default function ModulosPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Verificar sesión
    const user = authService.getCurrentUser();
    if (!user) {
      router.replace('/');
      return;
    }

    setCurrentUser(user);

    // 2. Verificar si hubo un intento de acceso no autorizado redirigido
    if (typeof window !== 'undefined') {
      const deniedMsg = sessionStorage.getItem('sigm_access_denied_message');
      if (deniedMsg) {
        setAccessDeniedMessage(deniedMsg);
        sessionStorage.removeItem('sigm_access_denied_message');
      }
    }

    // 3. Cargar módulos autorizados según su perfil
    async function loadAuthorizedModules() {
      try {
        const allowedCodes =
          user?.role === 'Administrador Central' || user?.username.toUpperCase() === 'ROOT'
            ? undefined
            : user?.allowedModules;

        const data = await getActiveModules(allowedCodes);
        setModules(data);
      } catch (err) {
        console.error('Error al cargar módulos:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthorizedModules();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.replace('/');
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Verificando permisos y cargando módulos autorizados...</p>
      </div>
    );
  }

  const isRoot = currentUser.username.toUpperCase() === 'ROOT' || currentUser.role === 'Administrador Central';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 dark:bg-slate-950 transition-colors duration-200">
      {/* 1. Header con sesión de usuario */}
      <header className="w-full bg-[#0d4f2f] dark:bg-slate-900 border-b border-emerald-800 dark:border-slate-800 text-white shadow-md transition-colors duration-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
          {/* Lado izquierdo: Escudo oficial y branding */}
          <div className="flex items-center space-x-3.5 group cursor-pointer" onClick={() => router.push('/modulos')}>
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
                SIGM <span className="font-light text-emerald-200">| Panel de Subsistemas</span>
              </span>
            </div>
          </div>

          {/* Lado derecho: Perfil del usuario, Theme Switch y Logout */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />

            {/* Badge de usuario autenticado */}
            <div className="hidden md:flex items-center space-x-3 bg-emerald-900/60 dark:bg-slate-800/80 border border-emerald-700/50 dark:border-slate-700 px-3.5 py-1.5 rounded-lg text-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center font-bold text-white shadow-inner">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-white leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-emerald-300 font-medium">
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Botón Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-emerald-800/80 hover:bg-rose-700/90 dark:bg-slate-800 dark:hover:bg-rose-900 border border-emerald-600/40 hover:border-rose-500 text-white text-xs font-semibold shadow-sm transition-all duration-200"
              title="Cerrar sesión actual"
            >
              <UserLoginIcon className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alerta de Acceso No Autorizado / Redirección de Seguridad */}
      {accessDeniedMessage && (
        <div className="bg-amber-500/15 border-b border-amber-500/40 text-amber-900 dark:text-amber-200 px-4 py-3 sm:px-6 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-3">
              <span className="text-xl">⛔</span>
              <div>
                <strong className="font-bold">Acceso Restringido:</strong>{' '}
                <span>{accessDeniedMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setAccessDeniedMessage(null)}
              className="px-2 py-1 rounded hover:bg-amber-500/20 font-bold text-amber-900 dark:text-amber-200"
              title="Descartar mensaje"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. Banner con información del perfil autorizado */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#105d38] via-[#0e5231] to-[#0a3d24] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-emerald-700/50 shadow-inner">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/70 border border-emerald-500/40 text-emerald-200 text-xs font-medium mb-3 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sesión Activa: <strong>{currentUser.username}</strong> ({currentUser.role})</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            SISTEMA INTEGRADO DE GESTIÓN MUNICIPAL
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-emerald-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            {isRoot
              ? 'Cuenta con privilegios totales de administración. Todos los subsistemas distritales se encuentran habilitados.'
              : `Módulos habilitados específicamente para su perfil de ${currentUser.role}. Seleccione una opción para continuar.`}
          </p>
        </div>
      </section>

      {/* 3. Grid de Módulos Autorizados */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Subsistemas Autorizados
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Acceso concedido a {modules.length} subsistema{modules.length === 1 ? '' : 's'} conforme a las políticas de seguridad de la ODT.
            </p>
          </div>
          <div className="self-start sm:self-auto flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong>{modules.length}</strong> de 4 módulos asignados
            </span>
          </div>
        </div>

        {modules.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
              No se encontraron módulos autorizados para su usuario.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Comuníquese con la Oficina de Desarrollo Tecnológico (ODT) para solicitar asignación de subsistemas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module.id || module.code}
                module={module}
                isReportante={isReportanteUser(currentUser)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
