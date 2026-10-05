import React from 'react';

interface IconProps {
  className?: string;
}

export const CoatOfArmsCastillaIcon: React.FC<IconProps> = ({ className = 'w-9 h-9' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Escudo Municipal de Castilla"
  >
    <path
      d="M24 4L7 9V22C7 32.5 14.5 41.5 24 44C33.5 41.5 41 32.5 41 22V9L24 4Z"
      className="fill-emerald-800 dark:fill-emerald-950 stroke-emerald-400 dark:stroke-emerald-300"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M24 7L10 11V22C10 30.5 16 38 24 40.5C32 38 38 30.5 38 22V11L24 7Z"
      className="fill-emerald-700/60 dark:fill-emerald-900/60"
    />
    <rect x="17" y="22" width="14" height="12" rx="1" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
    <path d="M16 19H32V22H16V19Z" fill="#FACC15" />
    <path d="M18 16H20V19H18V16ZM23 16H25V19H23V16ZM28 16H30V19H28V16Z" fill="#EAB308" />
    <rect x="22" y="27" width="4" height="7" rx="2" fill="#854D0E" />
    <circle cx="24" cy="12" r="3" fill="#FDE047" />
  </svg>
);

export const DashboardIllustration: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="42" fill="#DCFCE7" />
    <rect x="24" y="24" width="22" height="22" rx="4" fill="#16A34A" />
    <rect x="52" y="24" width="24" height="14" rx="4" fill="#86EFAC" />
    <rect x="52" y="44" width="24" height="32" rx="4" fill="#22C55E" />
    <rect x="24" y="52" width="22" height="24" rx="4" fill="#4ADE80" />
    <path d="M28 32H38M28 38H34" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M56 56H68M56 62H64M56 68H62" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TransportIllustration: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="42" fill="#FFEDD5" />
    <rect x="26" y="32" width="44" height="28" rx="6" fill="#EA580C" />
    <rect x="30" y="36" width="16" height="12" rx="2" fill="#FED7AA" />
    <rect x="50" y="36" width="16" height="12" rx="2" fill="#FED7AA" />
    <circle cx="34" cy="65" r="9" fill="#431407" />
    <circle cx="34" cy="65" r="4" fill="#F97316" />
    <circle cx="64" cy="65" r="9" fill="#431407" />
    <circle cx="64" cy="65" r="4" fill="#F97316" />
    <path d="M70 42H76C78 42 79 44 79 46V54H70V42Z" fill="#C2410C" />
    <line x1="20" y1="74" x2="80" y2="74" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const ItamIllustration: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="42" fill="#DBEAFE" />
    <rect x="25" y="24" width="50" height="14" rx="3" fill="#2563EB" />
    <rect x="25" y="42" width="50" height="14" rx="3" fill="#1D4ED8" />
    <rect x="25" y="60" width="50" height="14" rx="3" fill="#1E40AF" />
    <circle cx="32" cy="31" r="2" fill="#60A5FA" />
    <circle cx="38" cy="31" r="2" fill="#4ADE80" />
    <circle cx="32" cy="49" r="2" fill="#60A5FA" />
    <circle cx="38" cy="49" r="2" fill="#4ADE80" />
    <circle cx="32" cy="67" r="2" fill="#60A5FA" />
    <circle cx="38" cy="67" r="2" fill="#FACC15" />
    <line x1="48" y1="31" x2="68" y2="31" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    <line x1="48" y1="49" x2="68" y2="49" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
    <line x1="48" y1="67" x2="68" y2="67" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const HelpdeskIllustration: React.FC<IconProps> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="50" cy="50" r="42" fill="#F3E8FF" />
    <path
      d="M32 48C32 38.0589 40.0589 30 50 30C59.9411 30 68 38.0589 68 48V56"
      stroke="#7C3AED"
      strokeWidth="5"
      strokeLinecap="round"
    />
    <rect x="28" y="46" width="8" height="16" rx="4" fill="#6D28D9" />
    <rect x="64" y="46" width="8" height="16" rx="4" fill="#6D28D9" />
    <path
      d="M66 58C66 65 60 70 52 70H48"
      stroke="#7C3AED"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <circle cx="45" cy="70" r="4" fill="#A855F7" />
    <circle cx="50" cy="46" r="8" fill="#DDD6FE" />
    <path d="M47 46L49 48L53 44" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const UserLoginIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const TicketIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

