'use client';

import React, { useState, useEffect } from 'react';
import { Person, PersonType, DocumentType } from '../../types/admin';
import { OfficeItem } from '../../types/office';

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<Person>, personId?: string) => Promise<boolean>;
  personToEdit?: Person | null;
  officesList: OfficeItem[];
}

export const LABOR_CONDITIONS = [
  'CAS',
  'Nombrado D.L. 276',
  'D.L. 728',
  'Locación de Servicios',
  'CAS - Confianza',
  'Practicante Pre/Profesional',
  'Sin modalidad',
];

const DEFAULT_MUNICIPAL_OFFICES = [
  'Oficina de Desarrollo Tecnológico (ODT)',
  'Subgerencia de Transportes y Tránsito',
  'Gerencia de Administración Tributaria (Rentas)',
  'Gerencia Municipal',
  'Secretaría General y Mesa de Partes',
  'Gerencia de Servicios Públicos y Gestión Ambiental',
  'Subgerencia de Seguridad Ciudadana (Serenazgo)',
  'Subgerencia de Fiscalización y Control Municipal',
];

export const PersonFormModal: React.FC<PersonFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  personToEdit,
  officesList,
}) => {
  const isEditing = Boolean(personToEdit);

  const [type, setType] = useState<PersonType>('PERSONAL');
  const [documentType, setDocumentType] = useState<DocumentType>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [paternalSurname, setPaternalSurname] = useState('');
  const [maternalSurname, setMaternalSurname] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState('');
  const [office, setOffice] = useState('');
  const [laborCondition, setLaborCondition] = useState(LABOR_CONDITIONS[0]);
  const [entryDate, setEntryDate] = useState('');
  const [allowsOnlineAccess, setAllowsOnlineAccess] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializar o resetear formulario
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    if (personToEdit) {
      setType(personToEdit.type || 'PERSONAL');
      setDocumentType(personToEdit.documentType || 'DNI');
      setDocumentNumber(personToEdit.documentNumber || '');
      setFirstName(personToEdit.firstName || '');
      setPaternalSurname(personToEdit.paternalSurname || '');
      setMaternalSurname(personToEdit.maternalSurname || '');
      setBusinessName(personToEdit.businessName || '');
      setEmail(personToEdit.email || '');
      setPhone(personToEdit.phone || '');
      setAddress(personToEdit.address || '');
      setPosition(personToEdit.position || '');
      setOffice(personToEdit.office || '');
      setLaborCondition(personToEdit.laborCondition || LABOR_CONDITIONS[0]);
      setEntryDate(personToEdit.entryDate || '');
      setAllowsOnlineAccess(personToEdit.allowsOnlineAccess ?? (personToEdit.type === 'ADMINISTRADO'));
    } else {
      setType('PERSONAL');
      setDocumentType('DNI');
      setDocumentNumber('');
      setFirstName('');
      setPaternalSurname('');
      setMaternalSurname('');
      setBusinessName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setPosition('');
      setLaborCondition(LABOR_CONDITIONS[0]);
      setEntryDate('');
      setAllowsOnlineAccess(false);

      if (officesList.length > 0) {
        setOffice(`[${officesList[0].acronym}] ${officesList[0].name}`);
      } else {
        setOffice(DEFAULT_MUNICIPAL_OFFICES[0]);
      }
    }
  }, [personToEdit, isOpen, officesList]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!documentNumber.trim()) {
      setErrorMessage('El número de documento es obligatorio.');
      return;
    }

    if (documentType === 'RUC') {
      if (!businessName.trim() && !firstName.trim()) {
        setErrorMessage('La razón social de la empresa es obligatoria para RUC.');
        return;
      }
    } else {
      if (!firstName.trim() || !paternalSurname.trim()) {
        setErrorMessage('El nombre y apellido paterno son obligatorios.');
        return;
      }
    }

    const payload: Partial<Person> = {
      type,
      documentType,
      documentNumber: documentNumber.trim(),
      firstName: documentType === 'RUC' && businessName.trim() ? businessName.trim() : firstName.trim(),
      paternalSurname: documentType === 'RUC' && !paternalSurname.trim() ? 'EMPRESA' : paternalSurname.trim(),
      maternalSurname: maternalSurname.trim() || undefined,
      businessName: businessName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      position: type === 'PERSONAL' ? position.trim() || undefined : undefined,
      office: type === 'PERSONAL' ? office.trim() || undefined : undefined,
      laborCondition: type === 'PERSONAL' ? laborCondition.trim() || undefined : undefined,
      entryDate: type === 'PERSONAL' ? entryDate || undefined : undefined,
      allowsOnlineAccess: type === 'ADMINISTRADO' ? allowsOnlineAccess : false,
    };

    setIsSubmitting(true);
    try {
      const success = await onSave(payload, personToEdit?.id);
      if (success) {
        onClose();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error inesperado al guardar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold transition-colors"
        >
          &times;
        </button>

        {/* Encabezado */}
        <div className="mb-5">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{isEditing ? '✏️' : '👤'}</span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {isEditing ? 'Modificar Datos de la Persona' : 'Registrar Nueva Persona en el SIGM'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isEditing
              ? `Actualice la información de ${personToEdit?.fullName} (${personToEdit?.documentType}: ${personToEdit?.documentNumber}).`
              : 'Clasifique si la persona es un colaborador municipal o un ciudadano administrado.'}
          </p>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Selector de Clasificación (Toggle Visual Grande) */}
        <div className="grid grid-cols-2 gap-3 mb-5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl">
          <button
            type="button"
            onClick={() => setType('PERSONAL')}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
              type === 'PERSONAL'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>💼</span>
            <span>Personal Municipal (Colaborador)</span>
          </button>

          <button
            type="button"
            onClick={() => setType('ADMINISTRADO')}
            className={`py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
              type === 'ADMINISTRADO'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🏛️</span>
            <span>Administrado (Ciudadano)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Fila 1: Documento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipo Documento *
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium"
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Número de Documento *
              </label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Ej. 45821903"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Fila 2: Nombres o Razón Social */}
          {documentType === 'RUC' ? (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Razón Social de la Empresa *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  setFirstName(e.target.value);
                  if (!paternalSurname) setPaternalSurname('EMPRESA');
                }}
                placeholder="Ej. Inversiones El Chira S.A.C."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white uppercase font-medium"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Juan Alberto"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white uppercase font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Apellido Paterno *
                </label>
                <input
                  type="text"
                  required
                  value={paternalSurname}
                  onChange={(e) => setPaternalSurname(e.target.value)}
                  placeholder="Ej. Pérez"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white uppercase font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  value={maternalSurname}
                  onChange={(e) => setMaternalSurname(e.target.value)}
                  placeholder="Ej. Morales"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white uppercase"
                />
              </div>
            </div>
          )}

          {/* Fila 3: Contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico (Opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white lowercase"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono / Celular (Opcional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 969123456"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Fila 4: Domicilio */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Dirección de Residencia / Domicilio (Opcional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej. Calle Junín N° 123 - Cercado de Castilla"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            />
          </div>

          {/* Sección condicional: PERSONAL MUNICIPAL */}
          {type === 'PERSONAL' && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-emerald-700 dark:text-emerald-400">
                  Datos del Puesto y Dependencia Municipal
                </p>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Estructura Oficial MDC (66 dependencias)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Oficina */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Oficina Asignada *
                  </label>
                  <select
                    value={office}
                    onChange={(e) => setOffice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-xs"
                  >
                    {/* Opción actual si no coincide exactamente con la lista */}
                    {office &&
                      !officesList.some(
                        (off) => `[${off.acronym}] ${off.name}` === office || off.name === office,
                      ) &&
                      !DEFAULT_MUNICIPAL_OFFICES.includes(office) && (
                        <option value={office}>{office}</option>
                      )}

                    {officesList.length > 0
                      ? officesList.map((off) => {
                          const val = `[${off.acronym}] ${off.name}`;
                          return (
                            <option key={off.id} value={val}>
                              {off.code} - [{off.acronym}] {off.name} ({off.sede})
                            </option>
                          );
                        })
                      : DEFAULT_MUNICIPAL_OFFICES.map((off) => (
                          <option key={off} value={off}>
                            {off}
                          </option>
                        ))}
                  </select>
                </div>

                {/* Cargo */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cargo Funcional *
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Ej. Técnico TI / Inspector"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Modalidad Laboral */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Modalidad Laboral *
                  </label>
                  <select
                    value={laborCondition}
                    onChange={(e) => setLaborCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  >
                    {LABOR_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha de Ingreso */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha de Ingreso (Opcional)
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sección condicional: ADMINISTRADO */}
          {type === 'ADMINISTRADO' && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowsOnlineAccess}
                  onChange={(e) => setAllowsOnlineAccess(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold">
                  Habilitar ciudadano para trámites en línea (Portal Ciudadano / Licencias / Rentas)
                </span>
              </label>
              <p className="text-[11px] text-slate-400 mt-1 pl-6">
                Esta opción preparará la ficha del administrado para crearle credenciales de acceso ciudadano en futuras fases.
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="pt-4 flex justify-end space-x-2.5 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold shadow-md transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-1">⏳</span>
                  <span>Guardando...</span>
                </>
              ) : (
                <span>{isEditing ? 'Guardar Cambios' : 'Registrar Persona'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PersonFormModal;
