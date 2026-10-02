import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-4 transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center space-y-2">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Municipalidad Distrital de Castilla &copy; 2026 &bull; Todos los derechos reservados. &bull; Desarrollado por{' '}
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">ODT</span>
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-500">
          Oficina de Desarrollo Tecnológico &bull; Transformación Digital y Transparencia
        </p>
      </div>
    </footer>
  );
};
