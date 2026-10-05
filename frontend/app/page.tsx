'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService, DEMO_USERS } from '../src/services/auth.service';
import { EyeIcon, EyeOffIcon } from '../src/components/Icons';
import { ThemeToggle } from '../src/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();

  // Estados del formulario
  const [username, setUsername] = useState<string>('ROOT');
  const [password, setPassword] = useState<string>('admin123');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  // Si ya tiene sesión activa, permitir navegación directa a módulos
  useEffect(() => {
    const existing = authService.getCurrentUser();
    if (existing) {
      router.replace('/modulos');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Por favor ingrese su nombre de usuario.');
      return;
    }
    if (!password) {
      setErrorMessage('Por favor ingrese su contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.login({
        username: username.trim(),
        password,
        rememberMe,
      });

      if (result.success && result.user) {
        // Redirigir al lanzador con los módulos autorizados
        router.push('/modulos');
      } else {
        setErrorMessage(result.error || 'Credenciales de acceso incorrectas.');
      }
    } catch {
      setErrorMessage('Error de comunicación con el servidor. Intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Autocompletar cuentas de prueba
  const handleSelectDemoUser = (key: 'root' | 'jperez' | 'mgomez') => {
    const demo = DEMO_USERS[key];
    if (demo) {
      setUsername(demo.user.username);
      setPassword(demo.password);
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. PANEL IZQUIERDO: Hero institucional verde con Glassmorphism           */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-7/12 min-h-[460px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden bg-gradient-to-br from-[#06381e] via-[#084928] to-[#042413] text-white">
        {/* Patrón de resplandor radial de fondo */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* 1.1 Badge superior: ECOSISTEMA MODULAR SIGM */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-emerald-100 uppercase">
              ECOSISTEMA MODULAR SIGM
            </span>
          </div>

          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* 1.2 Tarjeta central Glassmorphism */}
        <div className="relative z-10 my-auto py-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-emerald-950/50 backdrop-blur-xl border border-white/15 rounded-2xl p-7 sm:p-9 shadow-2xl transition-all duration-300 hover:border-white/25">
            {/* Escudo con logotipo */}
            <div className="flex flex-col items-start mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Image
                  src="/images/logo-castilla.png"
                  alt="Escudo Municipal de Castilla"
                  width={48}
                  height={64}
                  priority
                  className="w-11 h-auto object-contain drop-shadow"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                    Municipalidad de
                  </span>
                  <span className="text-base font-black tracking-tight text-white uppercase">
                    Castilla
                  </span>
                </div>
              </div>
            </div>

            {/* Título de la tarjeta */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Municipalidad Distrital de Castilla
            </h1>

            {/* Descripción funcional */}
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal mb-6">
              Acceso exclusivo para colaboradores y personal técnico autorizado. Gestione los servicios
              tributarios, soporte helpdesk e inventarios tecnológicos de forma centralizada.
            </p>

            {/* Bullet institucional */}
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-emerald-300 pt-2 border-t border-emerald-700/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Innovación y Eficiencia al servicio del ciudadano.</span>
            </div>
          </div>
        </div>

        {/* 1.3 Footer institucional del panel verde */}
        <div className="relative z-10 text-[11px] sm:text-xs text-emerald-300/70 font-mono tracking-wide">
          &copy; 2026 Municipalidad de Castilla - ODT v13.19.0
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PANEL DERECHO: Formulario de Login Limpio                             */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-5/12 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-white dark:bg-slate-900 transition-colors duration-200">
        {/* Theme toggle en esquina superior derecha desktop */}
        <div className="hidden lg:flex justify-end">
          <ThemeToggle />
        </div>

        {/* Contenedor central del formulario */}
        <div className="max-w-sm w-full mx-auto my-auto py-6">
          {/* Escudo centrado y branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <Image
              src="/images/logo-castilla.png"
              alt="Escudo Castilla"
              width={52}
              height={70}
              priority
              className="w-12 h-auto object-contain drop-shadow-sm mb-2"
            />
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-700 dark:text-slate-300">
              MUNICIPALIDAD DE CASTILLA
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-4 tracking-tight">
              Entre a su cuenta
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              &iquest;No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline focus:outline-none"
              >
                Solicitar Registro de Usuario
              </button>
            </p>
          </div>

          {/* Banner de error si las credenciales fallan */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2 animate-fadeIn">
              <span className="font-bold text-sm">⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo: Usuario */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Usuario <span className="text-rose-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. ROOT o usuario institucional"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 transition-all"
              />
            </div>

            {/* Campo: Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Contrase&ntilde;a <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4 text-slate-500" />
                  ) : (
                    <EyeIcon className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox: Recordarme */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500/40"
                />
                <span>Recordarme</span>
              </label>
            </div>

            {/* Botón Entrar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0d6e3c] hover:bg-[#0b5c32] active:bg-[#094d29] disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition-all duration-200 hover:shadow flex items-center justify-center space-x-2 group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </div>

            {/* Enlace: Volver al Portal Principal */}
            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => router.push('/modulos')}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium inline-flex items-center space-x-1 transition-colors"
              >
                <span>&larr; Volver al Portal Principal</span>
              </button>
            </div>
          </form>

          {/* Selector de perfiles de prueba (Demo Helper) */}
          <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 text-center">
              Cuentas para prueba de permisos
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectDemoUser('root')}
                className="p-1.5 rounded-md border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold hover:bg-emerald-100/80 transition-colors text-center"
                title="Acceso total a 4 módulos"
              >
                👑 ROOT
                <span className="block text-[9px] font-normal text-emerald-600 dark:text-emerald-400">
                  4 módulos
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('jperez')}
                className="p-1.5 rounded-md border border-blue-200 dark:border-blue-800/60 bg-blue-50/60 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 font-semibold hover:bg-blue-100/80 transition-colors text-center"
                title="Acceso a TI, Soporte y Dashboard"
              >
                💻 jperez
                <span className="block text-[9px] font-normal text-blue-600 dark:text-blue-400">
                  3 módulos
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('mgomez')}
                className="p-1.5 rounded-md border border-purple-200 dark:border-purple-800/60 bg-purple-50/60 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 font-semibold hover:bg-purple-100/80 transition-colors text-center"
                title="Acceso a Transportes y Soporte"
              >
                🎫 mgomez
                <span className="block text-[9px] font-normal text-purple-600 dark:text-purple-400">
                  2 módulos
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Enlace institucional al pie del form */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-600">
          Oficina de Desarrollo Tecnol&oacute;gico &bull; Municipalidad Distrital de Castilla
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL DE SOLICITUD DE REGISTRO                                        */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              aria-label="Cerrar modal"
            >
              &times;
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                ODT
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Solicitud de Cuenta de Usuario
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pol&iacute;ticas de Seguridad de la Informaci&oacute;n
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              El acceso al SIGM est&aacute; restringido a servidores p&uacute;blicos de la Municipalidad Distrital
              de Castilla. Si requiere una cuenta o ampliaci&oacute;n de permisos a un subsistema:
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs space-y-2 mb-5">
              <div>
                <strong className="text-slate-700 dark:text-slate-200">Mesa de Ayuda Inform&aacute;tica:</strong>
                <p className="text-slate-500 dark:text-slate-400">Anexo telef&oacute;nico interno: <strong>104 / 108</strong></p>
              </div>
              <div>
                <strong className="text-slate-700 dark:text-slate-200">Correo Electr&oacute;nico Oficial:</strong>
                <p className="text-emerald-700 dark:text-emerald-400 font-mono">soporte.odt@castilla.gob.pe</p>
              </div>
              <div>
                <strong className="text-slate-700 dark:text-slate-200">Requisitos:</strong>
                <p className="text-slate-500 dark:text-slate-400">Memorando o visto bueno de la jefatura de su unidad org&aacute;nica.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRegisterModal(false)}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
