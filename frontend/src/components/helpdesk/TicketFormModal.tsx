'use client';

import React, { useState } from 'react';
import { CreateTicketPayload, TicketCategory, TicketPriority } from '@/types/helpdesk';
import { helpdeskService } from '@/services/helpdesk.service';

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTicketPayload) => Promise<void>;
  defaultApplicantName?: string;
  defaultOfficeName?: string;
}

export const TicketFormModal: React.FC<TicketFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultApplicantName = 'Walter Sánchez Navarro',
  defaultOfficeName = 'Secretaría General y Mesa de Partes',
}) => {
  // Detección automática de dependencia y responsable (RF-02)
  const [applicantName, setApplicantName] = useState<string>(defaultApplicantName);
  const [applicantPhone, setApplicantPhone] = useState<string>('Anexo 115');
  const [applicantEmail, setApplicantEmail] = useState<string>('');
  const [officeName, setOfficeName] = useState<string>(defaultOfficeName);

  // Escaneo QR o código de activo (RF-03)
  const [qrCodeInput, setQrCodeInput] = useState<string>('');
  const [assetDetails, setAssetDetails] = useState<any>(null);
  const [lookingUpAsset, setLookingUpAsset] = useState<boolean>(false);
  const [assetError, setAssetError] = useState<string | null>(null);

  // Formulario de Incidencia (RF-04)
  const [category, setCategory] = useState<TicketCategory>('HARDWARE');
  const [priority, setPriority] = useState<TicketPriority>('MEDIA');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookupAsset = async () => {
    if (!qrCodeInput.trim()) return;
    setLookingUpAsset(true);
    setAssetError(null);
    try {
      const data = await helpdeskService.lookupAsset(qrCodeInput.trim());
      setAssetDetails(data);
      if (data.office) {
        setOfficeName(data.office);
      }
      if (data.assignedPersonName) {
        setApplicantName(data.assignedPersonName);
      }
    } catch (err: any) {
      setAssetError(err.message || 'No se localizó ningún activo con este código QR');
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
      setError('Por favor ingrese el asunto y detalle de la falla.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
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
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Cabecera Móvil y Web */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-6 py-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base md:text-lg flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 mr-2 animate-ping"></span>
              Reportar Falla Técnica (Mesa de Ayuda)
            </h3>
            <p className="text-xs text-blue-200">
              Atención inmediata de la Subgerencia de Informática y Sistemas - MDC
            </p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white p-1 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Paso 1: Detección Automática de Dependencia y Responsable (RF-02) */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                1. Datos del Solicitante y Ubicación (Detección Automática)
              </span>
              <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 font-medium">
                Sesión Activa
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Nombre y Apellidos del Solicitante *:
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Oficina o Dependencia Municipal *:
                </label>
                <input
                  type="text"
                  required
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Anexo Telefónico o Celular:
                </label>
                <input
                  type="text"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="Ej. Anexo 104 o 969123456"
                  className="w-full p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Correo Institucional (Opcional):
                </label>
                <input
                  type="email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="usuario@castilla.gob.pe"
                  className="w-full p-2 border border-slate-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Paso 2: Escaneo QR o Identificación de Activo (RF-03) */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                2. Escaneo de Código QR o Código de Activo (Opcional)
              </span>
              <span className="text-[10px] text-slate-500">Sticker adherido al equipo</span>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                placeholder="Escanee con cámara o ingrese código (ej. MDC-TI-PC-0001)"
                className="flex-1 text-xs p-2 border border-slate-300 rounded-lg bg-white uppercase font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleLookupAsset}
                disabled={lookingUpAsset || !qrCodeInput.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                {lookingUpAsset ? 'Buscando...' : 'Buscar Activo'}
              </button>
            </div>

            {assetError && (
              <p className="text-[11px] text-red-600 italic">{assetError}</p>
            )}

            {assetDetails && (
              <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-900 flex justify-between items-center">
                <div>
                  <div className="font-bold text-green-950 font-mono">
                    ✓ {assetDetails.computerCode} - {assetDetails.categoryName}
                  </div>
                  <div className="text-[11px] text-green-800">
                    {assetDetails.brandName} {assetDetails.modelName} | Oficina: {assetDetails.office}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAssetDetails(null);
                    setQrCodeInput('');
                  }}
                  className="text-xs text-red-600 hover:underline ml-2"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          {/* Paso 3: Selección Rápida de Categoría (RF-04) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              3. Categoría de la Falla:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { id: 'HARDWARE', label: 'Hardware', desc: 'PC, Monitor, Impresora' },
                { id: 'SOFTWARE', label: 'Software', desc: 'SIGM, Windows, Office' },
                { id: 'RED_INTERNET', label: 'Red / Internet', desc: 'Sin conexión, cable' },
                { id: 'PERMISOS', label: 'Permisos', desc: 'Acceso a carpetas' },
                { id: 'OTROS', label: 'Otros', desc: 'Consultas y asesoría' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as TicketCategory)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    category === cat.id
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500 shadow-sm'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">{cat.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de Prioridad Auto-Clasificado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nivel de Prioridad / Impacto en sus Labores:
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

          {/* Asunto y Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Asunto / Resumen breve del problema *:
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej. Mi computadora no enciende tras corte de energía / Sin acceso a internet"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detalle del inconveniente (¿Cómo y cuándo ocurrió la falla?) *:
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el comportamiento anómalo, mensajes de error que aparezcan en pantalla o ruidos del equipo..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Adjunto Multimedia (RF-04) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adjunto Multimedia (Captura de pantalla o foto de la falla):
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors">
                <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Tomar Foto / Subir Imagen
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

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md"
            >
              {submitting ? 'Registrando Ticket...' : 'Registrar Ticket de Soporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
