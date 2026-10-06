import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIGM | Sistema Integrado de Gestión Municipal - Castilla',
  description:
    'Portal oficial de acceso y lanzador de subsistemas de la Municipalidad Distrital de Castilla. Desarrollado por Ing. Julio Chavez Crisanto.',
  keywords: ['Castilla', 'SIGM', 'Municipalidad', 'Gestión Municipal', 'ITAM', 'Helpdesk', 'Transportes'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
