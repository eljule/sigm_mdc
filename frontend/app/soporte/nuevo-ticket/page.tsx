'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreateTicketPayload, TicketCategory, TicketPriority } from '@/types/helpdesk';
import { helpdeskService } from '@/services/helpdesk.service';
import { authService } from '@/services/auth.service';
import { officeService } from '@/services/office.service';
import { OfficeItem } from '@/types/office';
import { canAccessModule } from '@/utils/auth-guard';

export default function NuevoTicketPage() {
  const router = useRouter();

  // Detección automática / datos del solicitante (RF-02)
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('Anexo 104');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [offices, setOffices] = useState<OfficeItem[]>([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (!canAccessModule(user, 'helpdesk_support')) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'sigm_access_denied_message',
          'Acceso no autorizado: Su usuario no cuenta con permisos para el subsistema de Soporte Técnico.',
        );
      }
      router.replace('/modulos');
      return;
    }

    if (user.fullName) setApplicantName(user.fullName);
    else if (user.username) setApplicantName(user.username);
    if (user.email) setApplicantEmail(user.email);

    // Cargar dependencias oficiales de la municipalidad
    officeService
      .getOffices()
      .then((list) => {
        setOffices(list);
        if (list.length > 0 && !officeName) {
          setOfficeName(list[0].name);
        }
      })
      .catch((err) => {
        console.warn('Error cargando dependencias para ticket:', err);
      });
  }, [router]);

  // Búsqueda o Escaneo QR (RF-03)
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [assetDetails, setAssetDetails] = useState<any>(null);
  const [lookingUpAsset, setLookingUpAsset] = useState(false);
  const [assetError, setAssetError] = useState<string | null>(null);

  // Formulario de Incidencia (RF-04)
  const [category, setCategory] = useState<TicketCategory>('HARDWARE');
  const [priority, setPriority] = useState<TicketPriority>('MEDIA');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookupAsset = async () => {
    if (!qrCodeInput.trim()) return;
    setLookingUpAsset(true);
    setAssetError(null);
    try {
      const data = await helpdeskService.lookupAsset(qrCodeInput.trim());
      setAssetDetails(data);
      if (data.office) setOfficeName(data.office);
      if (data.assignedPersonName) setApplicantName(data.assignedPersonName);
    } catch (err: any) {
      setAssetError(err.message || 'No se encontró ningún activo tecnológico con este código');
      setAssetDetails(null);
    } finally {
      setLookingUpAsset(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidencePhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Por favor complete el asunto y la descripción del inconveniente.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateTicketPayload = {
        applicantName,
        applicantPhone: applicantPhone || undefined,
        applicantEmail: applicantEmail || undefined,
        officeName,
        assetId: assetDetails?.id || undefined,
        assetComputerCode: assetDetails?.computerCode || (qrCodeInput.trim() || undefined),
        assetCategory: assetDetails?.categoryName || undefined,
        category,
        priority,
        subject,
        description,
        evidencePhotoUrl: evidencePhotoUrl || undefined,
      };

      const result = await helpdeskService.createTicket(payload);
      setCreatedTicketNumber(result.ticketNumber);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el ticket a soporte técnico');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Cabecera Municipal Ligera (Mobile-First RF-01) */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-40 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/soporte"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Volver a la Mesa de Ayuda"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
                MUNICIPALIDAD DISTRITAL DE CASTILLA
              </h1>
              <p className="text-[11px] text-blue-400 font-medium">
                Portal Ágil de Reporte de Incidencias TI
              </p>
            </div>
          </div>
          <Link
            href="/modulos"
            className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg font-semibold shadow transition-colors"
          >
            Módulos
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 md:p-6 max-w-2xl w-full mx-auto">
        {createdTicketNumber ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fadeIn space-y-5 border border-emerald-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Ticket Registrado con Éxito
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-3 font-mono">
                {createdTicketNumber}
              </h2>
              <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Su reporte ha sido recibido por la Oficina de Soporte Técnico TI. Un técnico revisará y atenderá su solicitud a la brevedad posible.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
              <p><span className="text-slate-500">Solicitante:</span> <strong>{applicantName}</strong></p>
              <p><span className="text-slate-500">Dependencia:</span> <strong>{officeName}</strong></p>
              <p><span className="text-slate-500">Asunto:</span> <strong>{subject}</strong></p>
              <p><span className="text-slate-500">Prioridad:</span> <span className="font-bold text-blue-700">{priority}</span></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => router.push('/soporte')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                📱 Ir a Mis Tickets de Seguimiento
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatedTicketNumber(null);
                  setSubject('');
                  setDescription('');
                  setEvidencePhotoUrl('');
                  setAssetDetails(null);
                  setQrCodeInput('');
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                + Reportar Otra Incidencia
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-5 text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200 block">
                Formulario de Soporte Técnico (SRS RF-01 / RF-04)
              </span>
              <h2 className="text-lg font-bold mt-1">Registrar Falla en su Puesto de Trabajo</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Complete los siguientes pasos para que un técnico sea asignado a su oficina.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              {/* Paso 1: Detección Automática de Dependencia y Responsable (RF-02) */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                    1. Datos de Identificación (RF-02)
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    Detección Automática
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nombre del Funcionario / Custodio *:
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Oficina o Dependencia Municipal *:
                    </label>
                    <input
                      type="text"
                      list="municipal-offices-list"
                      required
                      value={officeName}
                      onChange={(e) => setOfficeName(e.target.value)}
                      placeholder="Seleccione o busque su oficina..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <datalist id="municipal-offices-list">
                      {offices.map((o) => (
                        <option key={o.id} value={o.name}>
                          {o.sede ? `[${o.sede}] ${o.name}` : o.name}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Anexo o Teléfono Móvil:
                    </label>
                    <input
                      type="text"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="Ej. Anexo 104 / 969123456"
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Correo Institucional (Opcional):
                    </label>
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="usuario@castilla.gob.pe"
                      className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Paso 2: Escaneo de Código QR en el Activo (RF-03) */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    2. Escaneo de Código QR del Equipo (RF-03)
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Sticker adherido al bien</span>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    placeholder="Ingrese código o escanee QR (ej. MDC-TI-PC-0001)"
                    className="flex-1 text-xs p-2.5 border border-slate-300 rounded-lg bg-white uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleLookupAsset}
                    disabled={lookingUpAsset || !qrCodeInput.trim()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {lookingUpAsset ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {assetError && (
                  <p className="text-[11px] text-red-600 italic">{assetError}</p>
                )}

                {assetDetails && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex justify-between items-center">
                    <div>
                      <div className="font-bold font-mono">
                        ✓ {assetDetails.computerCode} ({assetDetails.categoryName})
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        {assetDetails.brandName} {assetDetails.modelName} | SBN: {assetDetails.patrimonialCode || 'N/A'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAssetDetails(null);
                        setQrCodeInput('');
                      }}
                      className="text-xs text-red-600 hover:underline font-medium ml-2"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              {/* Paso 3: Categoría Rápida (RF-04) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  3. Seleccione el Tipo de Inconveniente *:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { id: 'HARDWARE', label: 'Hardware', icon: '🖥️', desc: 'PC, Monitor, Impresora' },
                    { id: 'SOFTWARE', label: 'Software', icon: '💾', desc: 'SIGM, Windows, Office' },
                    { id: 'RED_INTERNET', label: 'Red / Internet', icon: '🌐', desc: 'Sin señal, cableado' },
                    { id: 'PERMISOS', label: 'Permisos', icon: '🔑', desc: 'Acceso a carpetas' },
                    { id: 'OTROS', label: 'Otros', icon: '⚙️', desc: 'Consultas y asesoría' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id as TicketCategory)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        category === c.id
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xl mb-1">{c.icon}</div>
                      <div className="font-bold text-xs leading-tight">{c.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nivel de Severidad / Impacto en sus labores:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'BAJA', label: 'Baja', color: 'border-slate-300 text-slate-700 hover:bg-slate-50', active: 'border-slate-600 bg-slate-100 text-slate-900 ring-2 ring-slate-400' },
                    { id: 'MEDIA', label: 'Media', color: 'border-blue-200 text-blue-700 hover:bg-blue-50', active: 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-400' },
                    { id: 'ALTA', label: 'Alta', color: 'border-amber-200 text-amber-700 hover:bg-amber-50', active: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400' },
                    { id: 'CRITICA', label: 'Crítica', color: 'border-red-200 text-red-700 hover:bg-red-50', active: 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as TicketPriority)}
                      className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                        priority === p.id ? p.active : p.color
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asunto y Detalle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asunto breve con sus propias palabras *:
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej. Mi monitor no enciende / La impresora mancha las resoluciones"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detalle del problema (¿Qué sucedió y cuándo?) *:
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describa si el equipo emite sonidos raros, si ocurrió tras un corte de luz o qué mensaje de error se muestra..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Adjuntos Multimedia (RF-04) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Foto o Captura de Pantalla:
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
                    <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Subir Foto / Tomar Captura
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {evidencePhotoUrl && (
                    <div className="flex items-center space-x-2">
                      <img
                        src={evidencePhotoUrl}
                        alt="Evidencia"
                        className="h-10 w-10 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => setEvidencePhotoUrl('')}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de Envío */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Enviando Reporte a Sistemas...' : '🚀 Enviar Ticket a Soporte Técnico'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
