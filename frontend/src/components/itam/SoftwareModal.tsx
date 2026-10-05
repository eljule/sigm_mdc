'use client';

import React, { useState } from 'react';
import { Software } from '@/types/itam';
import { itamService } from '@/services/itam.service';

interface SoftwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  software?: Software | null;
  onSuccess: (sw: Software) => void;
}

const LICENSE_TYPES = [
  { value: 'OEM', label: 'OEM (Preinstalado con el equipo)' },
  { value: 'VOLUMEN', label: 'Volumen Institucional / Campus' },
  { value: 'RETAIL', label: 'Retail / Caja' },
  { value: 'SUSCRIPCION', label: 'Suscripción Anual / Mensual' },
  { value: 'OPEN_SOURCE', label: 'Open Source / Libre (GPL, MIT, Apache)' },
  { value: 'PROPIETARIA', label: 'Licencia Perpetua Propietaria' },
];

export const SoftwareModal: React.FC<SoftwareModalProps> = ({
  isOpen,
  onClose,
  software,
  onSuccess,
}) => {
  const isEditing = Boolean(software);
  const [name, setName] = useState(software?.name || '');
  const [version, setVersion] = useState(software?.version || '');
  const [developer, setDeveloper] = useState(software?.developer || '');
  const [licenseType, setLicenseType] = useState(software?.licenseType || 'OEM');
  const [licenseKey, setLicenseKey] = useState(software?.licenseKey || '');
  const [totalLicenses, setTotalLicenses] = useState<number>(software?.totalLicenses ?? 1);
  const [expirationDate, setExpirationDate] = useState(software?.expirationDate || '');
  const [notes, setNotes] = useState(software?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del software es requerido.');
      return;
    }

    setLoading(true);
    setError(null);

    if (isEditing && software) {
      const res = await itamService.updateSoftware(software.id, {
        name: name.trim(),
        version: version.trim() || undefined,
        developer: developer.trim() || undefined,
        licenseType,
        licenseKey: licenseKey.trim() || undefined,
        totalLicenses,
        expirationDate: expirationDate || undefined,
        notes: notes.trim() || undefined,
      });
      setLoading(false);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Error al actualizar software');
      }
    } else {
      const res = await itamService.createSoftware({
        name: name.trim(),
        version: version.trim() || undefined,
        developer: developer.trim() || undefined,
        licenseType,
        licenseKey: licenseKey.trim() || undefined,
        totalLicenses,
        expirationDate: expirationDate || undefined,
        notes: notes.trim() || undefined,
      });
      setLoading(false);
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Error al registrar software');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-600 to-indigo-700 text-white">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">💿</span>
            <div>
              <h2 className="text-base font-bold">
                {isEditing ? 'Editar Software Institucional' : 'Registrar Software Institucional'}
              </h2>
              <p className="text-xs text-sky-100">
                Catálogo de Sistemas Operativos, Suites Ofimáticas y Licencias (RF-02)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="font-bold">✕</button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Software / Paquete <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Windows 11 Pro 64-bit / Microsoft Office 2021 LTSC / AutoCAD 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Versión / Edición</label>
              <input
                type="text"
                placeholder="Ej. 23H2 / Professional"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Desarrollador / Proveedor</label>
              <input
                type="text"
                placeholder="Ej. Microsoft / Autodesk / Adobe"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Licenciamiento <span className="text-rose-500">*</span>
              </label>
              <select
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {LICENSE_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cantidad de Licencias</label>
              <input
                type="number"
                min="1"
                value={totalLicenses}
                onChange={(e) => setTotalLicenses(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clave de Activación / Serial (Key)</label>
            <input
              type="text"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Expiración / Renovación</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Dejar en blanco para licencias perpetuas / OEM.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observaciones</label>
            <textarea
              rows={2}
              placeholder="Detalles del contrato de software, número de orden de compra..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Software'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
