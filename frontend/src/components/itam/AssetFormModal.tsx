import React, { useState, useEffect } from 'react';
import {
  Asset,
  AssetCategory,
  AssetBrand,
  AssetModel,
  AssetStatus,
  AssetPhysicalCondition,
  CreateAssetPayload,
  UpdateAssetPayload,
} from '../../types/itam';
import { Person } from '../../types/admin';
import { itamService } from '../../services/itam.service';
import { adminService } from '../../services/admin.service';
import { officeService } from '../../services/office.service';
import { OfficeItem } from '../../types/office';
import { DynamicFieldsRenderer } from './DynamicFieldsRenderer';

interface AssetFormModalProps {
  assetToEdit?: Asset | null;
  categories: AssetCategory[];
  brands: AssetBrand[];
  models: AssetModel[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: (asset: Asset) => void;
  onRefreshCatalogs?: () => void;
}

const MUNICIPAL_OFFICES = [
  'Alcaldía',
  'Gerencia Municipal',
  'Secretaría General y Mesa de Partes',
  'Oficina de Desarrollo Tecnológico (ODT)',
  'Gerencia de Administración y Finanzas',
  'Subgerencia de Recursos Humanos',
  'Subgerencia de Logística y Patrimonio',
  'Gerencia de Rentas y Administración Tributaria',
  'Subgerencia de Fiscalización y Control',
  'Subgerencia de Transportes y Tránsito',
  'Gerencia de Desarrollo Urbano e Infraestructura',
  'Gerencia de Seguridad Ciudadana y Serenazgo',
  'Subgerencia de Gestión Ambiental y Limpieza',
];

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  assetToEdit,
  categories,
  brands,
  models,
  isOpen,
  onClose,
  onSaved,
  onRefreshCatalogs,
}) => {
  const isEditing = !!assetToEdit;

  // Form State
  const [categoryId, setCategoryId] = useState<string>(
    assetToEdit?.categoryId || (categories.length > 0 ? categories[0].id : '')
  );
  const [brandId, setBrandId] = useState<string>(assetToEdit?.brandId || '');
  const [modelId, setModelId] = useState<string>(assetToEdit?.modelId || '');
  const [patrimonialCode, setPatrimonialCode] = useState<string>(assetToEdit?.patrimonialCode || '');
  const [serialNumber, setSerialNumber] = useState<string>(assetToEdit?.serialNumber || '');
  const [color, setColor] = useState<string>(assetToEdit?.color || '');
  const [status, setStatus] = useState<AssetStatus>(assetToEdit?.status || 'OPERATIVO');
  const [physicalCondition, setPhysicalCondition] = useState<AssetPhysicalCondition>(
    assetToEdit?.physicalCondition || 'BUENO'
  );
  const [office, setOffice] = useState<string>(assetToEdit?.office || MUNICIPAL_OFFICES[3]);
  const [assignedPersonId, setAssignedPersonId] = useState<string>(assetToEdit?.assignedPersonId || '');
  const [acquisitionDate, setAcquisitionDate] = useState<string>(
    assetToEdit?.acquisitionDate || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(assetToEdit?.notes || '');
  const [supplier, setSupplier] = useState<string>(assetToEdit?.supplier || '');
  const [warrantyEndDate, setWarrantyEndDate] = useState<string>(assetToEdit?.warrantyEndDate || '');
  const [isLoanable, setIsLoanable] = useState<boolean>(assetToEdit?.isLoanable || false);
  const [specifications, setSpecifications] = useState<Record<string, any>>(
    assetToEdit?.specifications ? { ...assetToEdit.specifications } : {}
  );

  // Quick Catalog Creation Inline State
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  // Auxiliary data
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [specErrors, setSpecErrors] = useState<Record<string, string>>({});

  // Active Category
  const selectedCategory = categories.find((c) => c.id === categoryId);

  // Filter models by selected brand
  const filteredModels = models.filter((m) => !brandId || m.brandId === brandId);

  // Load municipal personnel and offices for selection
  useEffect(() => {
    async function loadAuxData() {
      setIsLoadingPeople(true);
      try {
        const [resPeople, resOffices] = await Promise.all([
          adminService.getPeople({ type: 'PERSONAL' }),
          officeService.getOffices(),
        ]);
        setPersonnel(resPeople.items || []);
        setOffices(resOffices || []);
      } catch (e) {
        console.warn('Error al cargar datos auxiliares:', e);
      } finally {
        setIsLoadingPeople(false);
      }
    }
    if (isOpen) {
      loadAuxData();
    }
  }, [isOpen]);

  // When switching category on create, reset/initialize specs
  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    if (!isEditing) {
      const cat = categories.find((c) => c.id === newCatId);
      const initialSpecs: Record<string, any> = {};
      if (cat?.customFieldsSchema) {
        cat.customFieldsSchema.forEach((f) => {
          if (f.defaultValue !== undefined) {
            initialSpecs[f.key] = f.defaultValue;
          }
        });
      }
      setSpecifications(initialSpecs);
      setSpecErrors({});
    }
  };

  const handleSpecChange = (key: string, value: any) => {
    setSpecifications((prev) => ({ ...prev, [key]: value }));
    if (specErrors[key]) {
      setSpecErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const handleQuickAddBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const res = await itamService.createBrand({ name: newBrandName.trim() });
      if (res.success && res.data) {
        setBrandId(res.data.id);
        setNewBrandName('');
        setShowAddBrand(false);
        if (onRefreshCatalogs) onRefreshCatalogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickAddModel = async () => {
    if (!newModelName.trim() || !brandId) return;
    try {
      const res = await itamService.createModel({
        name: newModelName.trim(),
        brandId,
        categoryId: categoryId || undefined,
      });
      if (res.success && res.data) {
        setModelId(res.data.id);
        setNewModelName('');
        setShowAddModel(false);
        if (onRefreshCatalogs) onRefreshCatalogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSpecErrors({});

    if (!categoryId) {
      setErrorMsg('Seleccione una categoría para el activo.');
      return;
    }
    if (!brandId) {
      setErrorMsg('Seleccione la marca del activo.');
      return;
    }
    if (!modelId) {
      setErrorMsg('Seleccione el modelo del activo.');
      return;
    }

    // Validate Category Dynamic Fields Requirements
    if (selectedCategory?.customFieldsSchema) {
      const errors: Record<string, string> = {};
      selectedCategory.customFieldsSchema.forEach((field) => {
        if (field.required) {
          const val = specifications[field.key];
          if (val === undefined || val === null || val === '') {
            errors[field.key] = `El parámetro "${field.label}" es obligatorio para esta categoría`;
          }
        }
      });
      if (Object.keys(errors).length > 0) {
        setSpecErrors(errors);
        setErrorMsg('Por favor complete las especificaciones técnicas obligatorias requeridas por la categoría.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isEditing && assetToEdit) {
        const payload: UpdateAssetPayload = {
          categoryId,
          brandId,
          modelId,
          patrimonialCode: patrimonialCode.trim() || undefined,
          serialNumber: serialNumber.trim() || undefined,
          color: color.trim() || undefined,
          status,
          physicalCondition,
          office: office.trim() || undefined,
          assignedPersonId: assignedPersonId || undefined,
          acquisitionDate: acquisitionDate || undefined,
          supplier: supplier.trim() || undefined,
          warrantyEndDate: warrantyEndDate || undefined,
          isLoanable,
          specifications,
          notes: notes.trim() || undefined,
        };

        const res = await itamService.updateAsset(assetToEdit.id, payload);
        if (res.success && res.data) {
          onSaved(res.data);
          onClose();
        } else {
          setErrorMsg(res.error || 'Error al actualizar activo');
        }
      } else {
        const payload: CreateAssetPayload = {
          categoryId,
          brandId,
          modelId,
          patrimonialCode: patrimonialCode.trim() || undefined,
          serialNumber: serialNumber.trim() || undefined,
          color: color.trim() || undefined,
          status,
          physicalCondition,
          office: office.trim() || undefined,
          assignedPersonId: assignedPersonId || undefined,
          acquisitionDate: acquisitionDate || undefined,
          supplier: supplier.trim() || undefined,
          warrantyEndDate: warrantyEndDate || undefined,
          isLoanable,
          specifications,
          notes: notes.trim() || undefined,
        };

        const res = await itamService.createAsset(payload);
        if (res.success && res.data) {
          onSaved(res.data);
          onClose();
        } else {
          setErrorMsg(res.error || 'Error al crear activo');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de comunicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-xl shadow-inner">
              {selectedCategory?.icon || '💻'}
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                {isEditing ? 'Editar Activo Tecnológico' : 'Registrar Nuevo Activo Tecnológico'}
                {assetToEdit && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/30 border border-blue-400/30 text-blue-200">
                    {assetToEdit.computerCode}
                  </span>
                )}
              </h2>
              <p className="text-xs text-blue-200/80">
                Inventario TI Municipal • Formulario adaptativo de especificaciones técnicas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-rose-500 hover:text-rose-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Section 1: Clasificación del Activo (Categoría, Marca, Modelo) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <span>01</span> Clasificación y Categoría del Activo
              </h3>
              <span className="text-[11px] text-slate-500">
                * Cambiar la categoría adaptará automáticamente las especificaciones técnicas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Categoría Tecnológica *
                </label>
                <select
                  disabled={isEditing}
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Código proyectado: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">MDC-TI-{selectedCategory.code}-XXXX</span>
                  </p>
                )}
              </div>

              {/* Brand Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Marca *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddBrand(!showAddBrand)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    + Nueva Marca
                  </button>
                </div>
                {showAddBrand ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Nombre marca (ej. Asus)"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-blue-400 bg-white dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddBrand}
                      className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddBrand(false)}
                      className="px-2 py-1 text-xs text-slate-500"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <select
                    value={brandId}
                    onChange={(e) => {
                      setBrandId(e.target.value);
                      setModelId(''); // reset model
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Seleccionar Marca --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Model Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Modelo *
                  </label>
                  {brandId && (
                    <button
                      type="button"
                      onClick={() => setShowAddModel(!showAddModel)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      + Nuevo Modelo
                    </button>
                  )}
                </div>
                {showAddModel ? (
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Nombre modelo (ej. ProBook 450)"
                      value={newModelName}
                      onChange={(e) => setNewModelName(e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-blue-400 bg-white dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddModel}
                      className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModel(false)}
                      className="px-2 py-1 text-xs text-slate-500"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    disabled={!brandId}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="">
                      {!brandId ? 'Primero seleccione una marca' : '-- Seleccionar Modelo --'}
                    </option>
                    {filteredModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Identificación Patrimonial y Ubicación */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <span>02</span> Identificación Institucional, Estado y Custodia
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Código Patrimonial (SBN)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 740895000105"
                  value={patrimonialCode}
                  onChange={(e) => setPatrimonialCode(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Número de Serie
                </label>
                <input
                  type="text"
                  placeholder="Ej. S/N 8920FA4401"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Color del Equipo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Negro, Plata, Gris"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Fecha de Adquisición
                </label>
                <input
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Estado Operativo *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AssetStatus)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="OPERATIVO">🟢 Operativo</option>
                  <option value="EN_MANTENIMIENTO">🟡 En Mantenimiento</option>
                  <option value="EN_CUSTODIA">🔵 En Custodia / Almacén TI</option>
                  <option value="EN_DESUSO">⚪ En Desuso</option>
                  <option value="PARA_BAJA">🔴 Para Baja Técnica</option>
                </select>
              </div>

              {/* Physical Condition */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Condición Física *
                </label>
                <select
                  value={physicalCondition}
                  onChange={(e) => setPhysicalCondition(e.target.value as AssetPhysicalCondition)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="NUEVO">✨ Nuevo / Sellado</option>
                  <option value="BUENO">👍 Bueno</option>
                  <option value="REGULAR">⚠️ Regular</option>
                  <option value="MALO">❌ Malo / Deteriorado</option>
                </select>
              </div>

              {/* Office */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Dependencia / Oficina
                </label>
                <input
                  type="text"
                  list="municipal-offices"
                  placeholder="Seleccione o escriba oficina"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <datalist id="municipal-offices">
                  {offices.length > 0
                    ? offices.map((off) => (
                        <option
                          key={off.id}
                          value={`[${off.acronym}] ${off.name} - ${off.sede}`}
                        />
                      ))
                    : MUNICIPAL_OFFICES.map((off) => (
                        <option key={off} value={off} />
                      ))}
                </datalist>
              </div>

              {/* Assigned Person (Custodian) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Custodio Asignado (Personal)
                </label>
                <select
                  value={assignedPersonId}
                  onChange={(e) => setAssignedPersonId(e.target.value)}
                  disabled={isLoadingPeople}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Sin Custodio Asignado (Almacén TI) --</option>
                  {personnel.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.paternalSurname} {p.maternalSurname} ({p.documentNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Proveedor / Adquisición */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Proveedor / Contratista
                </label>
                <input
                  type="text"
                  placeholder="Ej. Deltron, Compured, Lenovo Perú"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Vencimiento de Garantía */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Vencimiento Garantía
                </label>
                <input
                  type="date"
                  value={warrantyEndDate}
                  onChange={(e) => setWarrantyEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Disponible para Préstamos */}
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="isLoanableCheck"
                  checked={isLoanable}
                  onChange={(e) => setIsLoanable(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="isLoanableCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  Disponible para Préstamo / Cesión Temporal (RF-17)
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: ESPECIFICACIONES TÉCNICAS DINÁMICAS (Se adapta a la Categoría) */}
          <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-950/10 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-900/40 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  03
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Especificaciones Técnicas Dinámicas
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Campos adaptados para la categoría{' '}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {selectedCategory?.name || 'Seleccionada'}
                    </span>
                  </p>
                </div>
              </div>

              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                {selectedCategory?.customFieldsSchema?.length || 0} Parámetros configurados
              </span>
            </div>

            <DynamicFieldsRenderer
              schema={selectedCategory?.customFieldsSchema || []}
              values={specifications}
              onChange={handleSpecChange}
              errors={specErrors}
            />
          </div>

          {/* Section 4: Observaciones */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Observaciones y Notas Adicionales
            </label>
            <textarea
              rows={2}
              placeholder="Detalles sobre accesorios incluidos, estado del precinto de seguridad, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando Activo...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{isEditing ? 'Actualizar Activo' : 'Guardar y Generar Código Informático'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
