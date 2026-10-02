import React from 'react';

export const Banner: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#105d38] via-[#0e5231] to-[#0a3d24] text-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-700/50 shadow-inner">
      {/* Patrón de fondo geométrico sutil */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
        aria-hidden="true"
      />

      {/* Resplandor decorativo */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-medium mb-3 backdrop-blur-sm shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Plataforma Oficial de Servicios Internos</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
          SISTEMA INTEGRADO DE GESTIÓN MUNICIPAL
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
          Selecciona el subsistema autorizado para acceder o registrar una solicitud de asistencia técnica.
        </p>
      </div>
    </section>
  );
};
