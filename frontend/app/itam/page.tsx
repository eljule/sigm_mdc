'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Asset,
  AssetCategory,
  AssetBrand,
  AssetModel,
  AssetStatistics,
  AssetMovement,
  MaintenanceOrder,
  Supply,
  AssetLoan,
  InventoryAudit,
  Software,
} from '../../src/types/itam';
import { UserSummary } from '../../src/types/auth';
import { authService } from '../../src/services/auth.service';
import { canAccessModule } from '../../src/utils/auth-guard';
import { itamService } from '../../src/services/itam.service';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import { AssetFormModal } from '../../src/components/itam/AssetFormModal';
import { CategorySchemaModal } from '../../src/components/itam/CategorySchemaModal';
import { CategoryFormModal } from '../../src/components/itam/CategoryFormModal';
import { AssetDetailModal } from '../../src/components/itam/AssetDetailModal';
import { BrandModelModal } from '../../src/components/itam/BrandModelModal';
import { ChildAssetsModal } from '../../src/components/itam/ChildAssetsModal';
import { MovementModal } from '../../src/components/itam/MovementModal';
import { MaintenanceModal } from '../../src/components/itam/MaintenanceModal';
import { SupplyModal } from '../../src/components/itam/SupplyModal';
import { LoanModal } from '../../src/components/itam/LoanModal';
import { AuditModal } from '../../src/components/itam/AuditModal';
import { SoftwareModal } from '../../src/components/itam/SoftwareModal';
import { ActaDocumentModal, ActaType } from '../../src/components/itam/ActaDocumentModal';

type ItamTab =
  | 'inventory'
  | 'movements'
  | 'maintenance'
  | 'supplies'
  | 'loans'
  | 'audits'
  | 'software'
  | 'categories'
  | 'catalogs'
  | 'metrics'
  | 'qr_lookup';

export default function ItamPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [activeTab, setActiveTab] = useState<ItamTab>('inventory');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Alerta flotante
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Datos Principales
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [brands, setBrands] = useState<AssetBrand[]>([]);
  const [models, setModels] = useState<AssetModel[]>([]);
  const [stats, setStats] = useState<AssetStatistics | null>(null);

  // Submódulos SRS
  const [movements, setMovements] = useState<AssetMovement[]>([]);
  const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceOrder[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [criticalSupplies, setCriticalSupplies] = useState<Supply[]>([]);
  const [loans, setLoans] = useState<AssetLoan[]>([]);
  const [delayedLoans, setDelayedLoans] = useState<AssetLoan[]>([]);
  const [loanableAssets, setLoanableAssets] = useState<Asset[]>([]);
  const [audits, setAudits] = useState<InventoryAudit[]>([]);
  const [softwareList, setSoftwareList] = useState<Software[]>([]);

  // Filtros de inventario
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');

  // Modales
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<AssetCategory | null>(null);

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [categoryForSchema, setCategoryForSchema] = useState<AssetCategory | null>(null);

  const [isBrandModelModalOpen, setIsBrandModelModalOpen] = useState(false);
  const [catalogModalType, setCatalogModalType] = useState<'brand' | 'model'>('brand');

  // Modales de Submódulos SRS
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [parentForChildModal, setParentForChildModal] = useState<Asset | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [assetForMovement, setAssetForMovement] = useState<Asset | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [assetForMaintenance, setAssetForMaintenance] = useState<Asset | null>(null);
  const [orderToComplete, setOrderToComplete] = useState<MaintenanceOrder | null>(null);

  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [supplyToEdit, setSupplyToEdit] = useState<Supply | null>(null);

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanToReturn, setLoanToReturn] = useState<AssetLoan | null>(null);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditIdForModal, setAuditIdForModal] = useState<string | null>(null);

  const [isSoftwareModalOpen, setIsSoftwareModalOpen] = useState(false);
  const [softwareToEdit, setSoftwareToEdit] = useState<Software | null>(null);

  // Acta Oficial PDF Modal
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);
  const [actaType, setActaType] = useState<ActaType>('ASIGNACION');
  const [actaAsset, setActaAsset] = useState<Asset | null>(null);
  const [actaMovement, setActaMovement] = useState<AssetMovement | null>(null);
  const [actaMaintenance, setActaMaintenance] = useState<MaintenanceOrder | null>(null);
  const [actaLoan, setActaLoan] = useState<AssetLoan | null>(null);

  // Consulta por código / lector QR
  const [quickLookupCode, setQuickLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<Asset | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // 1. Verificación de sesión y autorización para ITAM
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!canAccessModule(user, 'it_inventory')) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'sigm_access_denied_message',
          'Acceso no autorizado: Su usuario no cuenta con permisos para el subsistema de Gestión de Activos TI (ITAM). Ha sido redirigido a sus módulos asignados.',
        );
      }
      router.replace('/modulos');
      return;
    }

    setCurrentUser(user);
    loadAllData();
  }, [router]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        catsData,
        brandsData,
        modelsData,
        assetsData,
        statsData,
        movementsData,
        maintenanceData,
        suppliesData,
        criticalSuppliesData,
        loansData,
        delayedLoansData,
        loanableData,
        auditsData,
        softwareData,
      ] = await Promise.all([
        itamService.getCategories(),
        itamService.getBrands(),
        itamService.getModels(),
        itamService.getAssets(),
        itamService.getStatistics(),
        itamService.getMovements(),
        itamService.getMaintenanceOrders(),
        itamService.getSupplies(),
        itamService.getCriticalSupplies(),
        itamService.getLoans(),
        itamService.getDelayedLoans(),
        itamService.getLoanableAssets(),
        itamService.getAudits(),
        itamService.getSoftwareList(),
      ]);

      setCategories(catsData);
      setBrands(brandsData);
      setModels(modelsData);
      setAssets(assetsData);
      setStats(statsData);
      setMovements(movementsData);
      setMaintenanceOrders(maintenanceData);
      setSupplies(suppliesData);
      setCriticalSupplies(criticalSuppliesData);
      setLoans(loansData);
      setDelayedLoans(delayedLoansData);
      setLoanableAssets(loanableData);
      setAudits(auditsData);
      setSoftwareList(softwareData);
    } catch (err) {
      console.error('Error al cargar datos de ITAM:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAssets = async () => {
    const [assetsData, statsData, loanableData] = await Promise.all([
      itamService.getAssets({
        search: searchQuery || undefined,
        categoryId: selectedCategoryFilter || undefined,
        status: selectedStatusFilter || undefined,
        brandId: selectedBrandFilter || undefined,
      }),
      itamService.getStatistics(),
      itamService.getLoanableAssets(),
    ]);
    setAssets(assetsData);
    setStats(statsData);
    setLoanableAssets(loanableData);
  };

  const handleRefreshMovements = async () => {
    const data = await itamService.getMovements();
    setMovements(data);
    await handleRefreshAssets();
  };

  const handleRefreshMaintenance = async () => {
    const [orders, supps, crit] = await Promise.all([
      itamService.getMaintenanceOrders(),
      itamService.getSupplies(),
      itamService.getCriticalSupplies(),
    ]);
    setMaintenanceOrders(orders);
    setSupplies(supps);
    setCriticalSupplies(crit);
    await handleRefreshAssets();
  };

  const handleRefreshSupplies = async () => {
    const [supps, crit] = await Promise.all([
      itamService.getSupplies(),
      itamService.getCriticalSupplies(),
    ]);
    setSupplies(supps);
    setCriticalSupplies(crit);
  };

  const handleRefreshLoans = async () => {
    const [allLoans, delayed, loanable] = await Promise.all([
      itamService.getLoans(),
      itamService.getDelayedLoans(),
      itamService.getLoanableAssets(),
    ]);
    setLoans(allLoans);
    setDelayedLoans(delayed);
    setLoanableAssets(loanable);
    await handleRefreshAssets();
  };

  const handleRefreshAudits = async () => {
    const data = await itamService.getAudits();
    setAudits(data);
  };

  const handleRefreshSoftware = async () => {
    const data = await itamService.getSoftwareList();
    setSoftwareList(data);
  };

  // Filtros reactivos con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      itamService
        .getAssets({
          search: searchQuery || undefined,
          categoryId: selectedCategoryFilter || undefined,
          status: selectedStatusFilter || undefined,
          brandId: selectedBrandFilter || undefined,
        })
        .then((res) => setAssets(res));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategoryFilter, selectedStatusFilter, selectedBrandFilter]);

  const handleDeleteAsset = async (asset: Asset) => {
    if (
      !confirm(
        `¿Está seguro de dar de baja o eliminar el activo ${asset.computerCode} (${asset.brandName} ${asset.modelName})? Se aplicará borrado suave con trazabilidad (RNF-05).`
      )
    ) {
      return;
    }
    const res = await itamService.deleteAsset(asset.id);
    if (res.success) {
      showAlert(`Activo ${asset.computerCode} eliminado exitosamente`);
      await handleRefreshAssets();
    } else {
      showAlert(res.error || 'Error al eliminar activo', 'error');
    }
  };

  const handleQuickLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLookupCode.trim()) return;
    setLookupError(null);
    setLookupResult(null);
    const asset = await itamService.getAssetByCode(quickLookupCode.trim());
    if (asset) {
      setLookupResult(asset);
      showAlert(`Ficha encontrada: ${asset.computerCode}`);
    } else {
      setLookupError(`No se encontró ningún activo con el código informático "${quickLookupCode.trim()}".`);
      showAlert('Código no encontrado en base de datos', 'error');
    }
  };

  // Helper para abrir Acta Oficial
  const openActaModal = (
    type: ActaType,
    asset?: Asset | null,
    movement?: AssetMovement | null,
    maintenance?: MaintenanceOrder | null,
    loan?: AssetLoan | null
  ) => {
    setActaType(type);
    setActaAsset(asset || null);
    setActaMovement(movement || null);
    setActaMaintenance(maintenance || null);
    setActaLoan(loan || null);
    setIsActaModalOpen(true);
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Cargando Módulo Integral de Gestión de Activos TI (ITAM)...</p>
      </div>
    );
  }

  const filteredAssets = assets;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* ========================================================================= */}
      {/* 1. CABECERA PRINCIPAL (HEADER)                                           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 w-full bg-[#0f172a] dark:bg-slate-900 border-b border-blue-900/60 dark:border-slate-800 text-white shadow-md">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Lado izquierdo: Botón menú lateral + Branding Municipal */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800/80 transition-colors"
              title="Colapsar / expandir menú"
              aria-label="Alternar menú lateral"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setActiveTab('inventory')}
            >
              <Image
                src="/images/logo-castilla.png"
                alt="Escudo Castilla"
                width={36}
                height={48}
                priority
                className="w-8 h-auto object-contain drop-shadow"
              />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-blue-400">
                  Municipalidad Distrital de Castilla &bull; Oficina de Sistemas / TI
                </span>
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none flex items-center gap-2">
                  <span>Gestión de Activos TI</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    ITAM v1.0
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Lado derecho: Indicador, Accesos, Tema y Perfil */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {criticalSupplies.length > 0 && (
              <button
                onClick={() => setActiveTab('supplies')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold animate-pulse"
                title={`${criticalSupplies.length} insumos con stock crítico (< 2)`}
              >
                <span>⚠️</span>
                <span>{criticalSupplies.length} Stock Crítico</span>
              </button>
            )}

            {delayedLoans.length > 0 && (
              <button
                onClick={() => setActiveTab('loans')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold"
                title={`${delayedLoans.length} préstamos con devolución retrasada`}
              >
                <span>⏱️</span>
                <span>{delayedLoans.length} Préstamos Demorados</span>
              </button>
            )}

            {/* Acceso a Módulos */}
            <button
              onClick={() => router.push('/modulos')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm border border-blue-700/50 transition-all hover:-translate-y-0.5"
              title="Ir a la cuadrícula de subsistemas"
            >
              <span>🚀</span>
              <span className="hidden sm:inline">Lanzador</span>
            </button>

            {/* Botón a Configuración Central (Solo si tiene permisos) */}
            {canAccessModule(currentUser, 'central_dashboard') && (
              <button
                onClick={() => router.push('/admin')}
                className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shadow-sm border border-slate-700 transition-all"
                title="Ir al Dashboard Central de Administración"
              >
                <span>⚙️</span>
                <span>Central</span>
              </button>
            )}

            {/* Selector de Tema */}
            <ThemeToggle />

            {/* Perfil del Usuario Activo */}
            <div className="flex items-center space-x-2 pl-2 border-l border-blue-900/60 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                {(currentUser.fullName || currentUser.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs">
                <span className="font-bold text-white leading-tight">
                  {currentUser.fullName || currentUser.username}
                </span>
                <span className="text-[10px] text-blue-300">{currentUser.role}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* NOTIFICACIÓN FLOTANTE                                                    */}
      {/* ========================================================================= */}
      {alert && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-bounce ${
            alert.type === 'success'
              ? 'bg-blue-600 text-white border border-blue-500'
              : 'bg-rose-600 text-white border border-rose-500'
          }`}
        >
          <span>{alert.type === 'success' ? '✓' : '⚠'}</span>
          <span>{alert.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CUERPO PRINCIPAL (SIDEBAR + MAIN CONTENT)                             */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ======================================================================= */}
        {/* 2.1 MENÚ LATERAL (SIDEBAR SRS)                                          */}
        {/* ======================================================================= */}
        <aside
          className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 overflow-y-auto ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-3 space-y-6">
            <div>
              <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {!sidebarCollapsed && 'Operaciones ITAM (SRS)'}
              </div>
              <nav className="space-y-1">
                {/* 1. Inventario de Activos (RF-04, RF-05) */}
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'inventory'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Inventario General de Activos (Padre-Hijo)"
                >
                  <span className="text-lg">🖥️</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Inventario Activos</span>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full font-bold">
                        {assets.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* 2. Movimientos y Trazabilidad (RF-07, RF-08, RF-09, RF-10) */}
                <button
                  onClick={() => setActiveTab('movements')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'movements'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Asignaciones, Traslados y Generación de Actas"
                >
                  <span className="text-lg">🔄</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Movimientos & Actas</span>
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded-full font-bold">
                        {movements.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* 3. Mantenimientos (RF-13, RF-15, RF-16) */}
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'maintenance'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Órdenes de Trabajo de Mantenimiento Preventivo y Correctivo"
                >
                  <span className="text-lg">🛠️</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Mantenimientos</span>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                        {maintenanceOrders.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* 4. Insumos y Consumibles (RF-14, RF-15) */}
                <button
                  onClick={() => setActiveTab('supplies')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'supplies'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Control de Stock de Tóners, Cables de Red y Conectores"
                >
                  <span className="text-lg">📦</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Insumos & Stock</span>
                      {criticalSupplies.length > 0 ? (
                        <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                          {criticalSupplies.length} Críticos
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">
                          {supplies.length}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* 5. Préstamos y Reservas (RF-17, RF-18, RF-19, RF-20) */}
                <button
                  onClick={() => setActiveTab('loans')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'loans'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Gestión de Cesión Temporal de Proyectores, Laptops y Parlantes"
                >
                  <span className="text-lg">⏱️</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Préstamos & Reservas</span>
                      {delayedLoans.length > 0 ? (
                        <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                          {delayedLoans.length} Demorados
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full font-bold">
                          {loans.length}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* 6. Auditoría Anual (RF-11, RF-12) */}
                <button
                  onClick={() => setActiveTab('audits')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'audits'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Cierres Anuales, Snapshots y Conciliación Física de Inventario"
                >
                  <span className="text-lg">📋</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Auditoría Anual</span>
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded-full font-bold">
                        {audits.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* 7. Catálogo de Software (RF-02, RF-06) */}
                <button
                  onClick={() => setActiveTab('software')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'software'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title="Software Institucional y Control de Licencias"
                >
                  <span className="text-lg">💿</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Software & Licencias</span>
                      <span className="text-[10px] bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 px-1.5 py-0.5 rounded-full font-bold">
                        {softwareList.length}
                      </span>
                    </div>
                  )}
                </button>
              </nav>
            </div>

            {/* Catálogos Maestros */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {!sidebarCollapsed && 'Catálogos Parametrizables'}
              </div>
              <nav className="space-y-1">
                {/* Categorías & Esquemas Dinámicos (RF-03) */}
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">⚙️</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Categorías & Esquemas</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">
                        {categories.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* Marcas & Modelos (RF-01) */}
                <button
                  onClick={() => setActiveTab('catalogs')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'catalogs'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">🏷️</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Marcas & Modelos</span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">
                        {brands.length}/{models.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dashboard Ejecutivo KPIs (Mejora 2) */}
                <button
                  onClick={() => setActiveTab('metrics')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'metrics'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">📊</span>
                  {!sidebarCollapsed && <span>Dashboard KPIs</span>}
                </button>

                {/* Lector QR / Pistola (Mejora 1) */}
                <button
                  onClick={() => setActiveTab('qr_lookup')}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    activeTab === 'qr_lookup'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">🔍</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Lector QR / Búsqueda</span>
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-black uppercase">
                        QR
                      </span>
                    </div>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Pie del Menú Lateral */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
            {!sidebarCollapsed ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">SIGM &bull; MDC</p>
                <p>Módulo de Gestión TI (ITAM)</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">SRS Oct 2026 &bull; Conforme</p>
              </div>
            ) : (
              <div className="text-center font-bold text-blue-600">TI</div>
            )}
          </div>
        </aside>

        {/* ======================================================================= */}
        {/* 2.2 ÁREA DE CONTENIDO DINÁMICO                                          */}
        {/* ======================================================================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ===================================================================== */}
          {/* TAB 1: INVENTARIO GENERAL DE ACTIVOS                                  */}
          {/* ===================================================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Parque Tecnológico Institucional</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {assets.length} Activos
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Control integral de hardware, correlativos automáticos, vinculación Padre-Hijo, actas oficiales y especificaciones adaptativas.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      setAssetToEdit(null);
                      setIsAssetModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <span>+</span>
                    <span>Registrar Activo</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-colors flex items-center space-x-1.5"
                  >
                    <span>⚙️</span>
                    <span>Esquemas Dinámicos</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Total Activos TI
                    </span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {stats?.total ?? assets.length}
                    </span>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ● Base de datos MDC
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                    💻
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Operativos
                    </span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {stats?.byStatus?.['OPERATIVO'] ?? 0}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {stats?.total
                        ? `${Math.round(((stats.byStatus['OPERATIVO'] || 0) / stats.total) * 100)}% disponibilidad`
                        : '100%'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                    🟢
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      En Mantenimiento
                    </span>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                      {stats?.byStatus?.['EN_MANTENIMIENTO'] ?? 0}
                    </span>
                    <p className="text-[10px] text-amber-600/80 mt-0.5">En taller o revisión</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                    🛠️
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Para Préstamos
                    </span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {loanableAssets.length}
                    </span>
                    <p className="text-[10px] text-indigo-600/80 mt-0.5">Equipos clasificados RF-17</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                    ⏱️
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Buscar por código (ej. MDC-TI-PC-0001), SBN, serie o custodio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="text-xs px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Todas las Categorías</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="text-xs px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Todos los Estados</option>
                    <option value="OPERATIVO">Operativo</option>
                    <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                    <option value="EN_CUSTODIA">En Custodia</option>
                    <option value="EN_PRESTAMO">En Préstamo</option>
                    <option value="EN_DESUSO">En Desuso</option>
                    <option value="PARA_BAJA">Para Baja</option>
                  </select>

                  <select
                    value={selectedBrandFilter}
                    onChange={(e) => setSelectedBrandFilter(e.target.value)}
                    className="text-xs px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Todas las Marcas</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tabla de Activos */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Código Informático / SBN</th>
                        <th className="py-3 px-4">Categoría & Equipo</th>
                        <th className="py-3 px-4">Periféricos / Hijos</th>
                        <th className="py-3 px-4">Ubicación & Custodio</th>
                        <th className="py-3 px-4">Estado / Condición</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {filteredAssets.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <span className="text-3xl block mb-2">🔍</span>
                            No se encontraron activos tecnológicos que coincidan con la búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredAssets.map((asset) => {
                          const cat = categories.find((c) => c.id === asset.categoryId);
                          const childCount = asset.childAssets?.length || 0;
                          return (
                            <tr
                              key={asset.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400">
                                    {asset.computerCode}
                                  </span>
                                  {asset.isLoanable && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                      PRESTABLE
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  SBN: {asset.patrimonialCode || 'Sin SBN'}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-sm"
                                    style={{
                                      backgroundColor: `${cat?.color || '#2563eb'}20`,
                                      color: cat?.color || '#2563eb',
                                    }}
                                  >
                                    {cat?.icon || '💻'}
                                  </span>
                                  <div>
                                    <span className="font-bold text-slate-900 dark:text-white block">
                                      {asset.brandName} {asset.modelName}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {asset.categoryName} • Serie: {asset.serialNumber || 'S/N'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                {childCount > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setParentForChildModal(asset);
                                      setIsChildModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-200 transition-colors"
                                  >
                                    <span>🔗</span>
                                    <span>{childCount} Periférico{childCount !== 1 ? 's' : ''}</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setParentForChildModal(asset);
                                      setIsChildModalOpen(true);
                                    }}
                                    className="text-[11px] text-slate-400 hover:text-blue-600 flex items-center gap-1"
                                  >
                                    <span>+ Vincular Hijos</span>
                                  </button>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <span className="block text-slate-800 dark:text-slate-200 font-semibold">
                                  {asset.office || 'Almacén TI'}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  👤 {asset.assignedPersonName || 'Sin custodio'}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                    asset.status === 'OPERATIVO'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                      : asset.status === 'EN_MANTENIMIENTO'
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                                      : asset.status === 'EN_PRESTAMO'
                                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                  }`}
                                >
                                  {asset.status.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  Condición: {asset.physicalCondition}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAssetForDetail(asset);
                                    setIsDetailModalOpen(true);
                                  }}
                                  className="px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Ver Ficha Técnica y QR"
                                >
                                  📋 Ficha
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssetForMovement(asset);
                                    setIsMovementModalOpen(true);
                                  }}
                                  className="px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors"
                                  title="Trasladar o reasignar equipo (RF-09)"
                                >
                                  🔄 Trasladar
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openActaModal('ASIGNACION', asset)}
                                  className="px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                                  title="Generar Acta Oficial PDF (RF-10)"
                                >
                                  📄 Acta
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssetForMaintenance(asset);
                                    setOrderToComplete(null);
                                    setIsMaintenanceModalOpen(true);
                                  }}
                                  className="px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 rounded-lg transition-colors"
                                  title="Programar mantenimiento (RF-13)"
                                >
                                  🛠️
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssetToEdit(asset);
                                    setIsAssetModalOpen(true);
                                  }}
                                  className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                                  title="Editar Activo"
                                >
                                  ✏️
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteAsset(asset)}
                                  className="px-2 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg transition-colors"
                                  title="Eliminar Activo (Borrado Lógico RNF-05)"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: MOVIMIENTOS Y REASIGNACIONES (RF-07, RF-08, RF-09, RF-10)       */}
          {/* ===================================================================== */}
          {activeTab === 'movements' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Trazabilidad de Movimientos & Reasignaciones</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                      {movements.length} Registros
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Historial auditable de transferencias entre dependencias, asignaciones iniciales y actas formales en PDF (RF-10).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (assets.length > 0) {
                      setAssetForMovement(assets[0]);
                      setIsMovementModalOpen(true);
                    } else {
                      showAlert('Primero registre activos en el inventario', 'error');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>Registrar Traslado / Asignación</span>
                </button>
              </div>

              {/* Tabla de Movimientos */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">N° Acta Oficial</th>
                        <th className="py-3 px-4">Activo Informático</th>
                        <th className="py-3 px-4">Tipo Movimiento</th>
                        <th className="py-3 px-4">Origen ➔ Destino</th>
                        <th className="py-3 px-4">Técnico & Custodio</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4 text-right">Documento</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {movements.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <span className="text-3xl block mb-2">🔄</span>
                            No hay movimientos registrados. Use el botón "Trasladar" en cualquier activo.
                          </td>
                        </tr>
                      ) : (
                        movements.map((mov) => (
                          <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {mov.actaNumber}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {mov.computerCode}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {mov.brandName} {mov.modelName}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {mov.movementType}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-500 line-through text-[11px] block">{mov.fromOffice || 'Almacén'}</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">➔ {mov.toOffice}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-slate-700 dark:text-slate-300 block text-xs">
                                🔧 {mov.technicianName}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                👤 {mov.newCustodianName || 'Sin asignar'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">
                              {new Date(mov.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => openActaModal('TRANSFERENCIA', null, mov)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-colors"
                              >
                                <span>📄</span>
                                <span>Ver Acta PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: MANTENIMIENTOS PREVENTIVO Y CORRECTIVO (RF-13, RF-15, RF-16)    */}
          {/* ===================================================================== */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Órdenes de Mantenimiento Preventivo & Correctivo</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      {maintenanceOrders.length} Órdenes
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Control de fallas, diagnósticos técnicos, descargo automático de insumos (RF-15) y emisión de hoja de servicio (RF-16).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAssetForMaintenance(null);
                    setOrderToComplete(null);
                    setIsMaintenanceModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>Programar Mantenimiento</span>
                </button>
              </div>

              {/* Tabla de Órdenes */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">N° Orden</th>
                        <th className="py-3 px-4">Activo</th>
                        <th className="py-3 px-4">Tipo & Prioridad</th>
                        <th className="py-3 px-4">Diagnóstico / Acciones</th>
                        <th className="py-3 px-4">Técnico</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {maintenanceOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <span className="text-3xl block mb-2">🛠️</span>
                            No hay órdenes de mantenimiento registradas.
                          </td>
                        </tr>
                      ) : (
                        maintenanceOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                              {ord.orderNumber}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {ord.computerCode}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {ord.brandName} {ord.modelName}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {ord.maintenanceType}
                              </span>
                              <span className={`text-[10px] font-bold uppercase ${
                                ord.priority === 'CRITICA' ? 'text-rose-600' : ord.priority === 'ALTA' ? 'text-amber-600' : 'text-slate-400'
                              }`}>
                                Prioridad: {ord.priority}
                              </span>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p className="text-slate-700 dark:text-slate-300 truncate font-semibold">
                                {ord.failureReported || 'Mantenimiento preventivo'}
                              </p>
                              {ord.diagnosis && (
                                <p className="text-[10px] text-slate-400 truncate">
                                  Diag: {ord.diagnosis}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                              {ord.technicianName}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                ord.status === 'COMPLETADO'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300'
                                  : ord.status === 'EN_PROCESO'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-300'
                              }`}>
                                {ord.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                              {ord.status !== 'COMPLETADO' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOrderToComplete(ord);
                                    setIsMaintenanceModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                                >
                                  ✓ Completar
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openActaModal('MANTENIMIENTO', null, null, ord)}
                                className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                📄 Hoja Servicio
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: INSUMOS Y CONSUMIBLES (RF-14, RF-15)                           */}
          {/* ===================================================================== */}
          {activeTab === 'supplies' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Stock de Insumos & Consumibles TI</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {supplies.length} Artículos
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Control de tóners por impresora, bobinas y patch cords de cable de red, conectores RJ-45 y pasta térmica (RF-14).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSupplyToEdit(null);
                    setIsSupplyModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>Nuevo Insumo</span>
                </button>
              </div>

              {/* Banner de Stock Crítico */}
              {criticalSupplies.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h4 className="text-xs font-bold text-rose-800 dark:text-rose-200 uppercase tracking-wider">
                        Alerta de Abastecimiento Crítico
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-300">
                        Hay {criticalSupplies.length} insumos con stock igual o inferior a 2 unidades (umbral mínimo SRS).
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300 px-3 py-1 bg-white dark:bg-slate-900 rounded-xl border border-rose-300">
                    Atención Inmediata
                  </span>
                </div>
              )}

              {/* Cuadrícula de Insumos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {supplies.map((sup) => {
                  const isCritical = sup.stock <= sup.minStock;
                  return (
                    <div
                      key={sup.id}
                      className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4 ${
                        isCritical
                          ? 'border-rose-300 dark:border-rose-800/80 ring-1 ring-rose-400/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {sup.category}
                          </span>
                          {isCritical && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300">
                              Stock Crítico
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {sup.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          📍 {sup.location || 'Almacén ODT'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-semibold">Stock Actual</span>
                          <span className={`text-xl font-black ${isCritical ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                            {sup.stock} <span className="text-xs font-normal text-slate-400">{sup.unit}</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSupplyToEdit(sup);
                            setIsSupplyModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-xl transition-colors"
                        >
                          Ajustar Stock
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: PRÉSTAMOS Y RESERVAS (RF-17, RF-18, RF-19, RF-20)               */}
          {/* ===================================================================== */}
          {activeTab === 'loans' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Cesión Temporal & Reservas de Equipos</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                      {loans.length} Préstamos
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Control de cañones multimedia, laptops de contingencia y parlantes prestados a dependencias municipales con alertas de retraso (RF-19).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLoanToReturn(null);
                    setIsLoanModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>Registrar Préstamo / Reserva</span>
                </button>
              </div>

              {/* Alerta de Retrasos */}
              {delayedLoans.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏰</span>
                    <div>
                      <h4 className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                        Alertas de Devolución Retrasada
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Hay {delayedLoans.length} préstamos que han sobrepasado la fecha fin estimada de retorno.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300 px-3 py-1 bg-white dark:bg-slate-900 rounded-xl border border-amber-300">
                    Notificar a Dependencia
                  </span>
                </div>
              )}

              {/* Tabla de Préstamos */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">N° Préstamo</th>
                        <th className="py-3 px-4">Dependencia & Solicitante</th>
                        <th className="py-3 px-4">Equipos Cedidos</th>
                        <th className="py-3 px-4">Período</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                      {loans.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <span className="text-3xl block mb-2">⏱️</span>
                            No hay préstamos activos o registrados en el sistema.
                          </td>
                        </tr>
                      ) : (
                        loans.map((ln) => {
                          const isDelayed =
                            ln.status === 'ACTIVO' &&
                            new Date(ln.estimatedEndDate) < new Date();
                          return (
                            <tr key={ln.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {ln.loanNumber}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {ln.department}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  👤 {ln.requestingPerson} • Motivo: {ln.reason}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  {ln.items?.map((it) => (
                                    <span key={it.id} className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono mr-1">
                                      {it.computerCode} ({it.categoryName || 'Equipo'})
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-slate-600 dark:text-slate-300 block text-[11px]">
                                  {ln.startDate} ➔ {ln.estimatedEndDate}
                                </span>
                                {isDelayed && (
                                  <span className="text-[10px] font-bold text-rose-600 animate-pulse">
                                    ¡Vencido / Con Retraso!
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                  ln.status === 'DEVUELTO'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300'
                                    : isDelayed
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300'
                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-300'
                                }`}>
                                  {isDelayed ? 'CON RETRASO' : ln.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                {ln.status === 'ACTIVO' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLoanToReturn(ln);
                                      setIsLoanModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                                  >
                                    ↩ Devolución
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => openActaModal('PRESTAMO', null, null, null, ln)}
                                  className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                  📄 Acta
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 6: AUDITORÍA ANUAL & CONCILIACIÓN FÍSICA (RF-11, RF-12)             */}
          {/* ===================================================================== */}
          {activeTab === 'audits' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Control de Inventario Anual & Auditoría Patrimonial</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      {audits.length} Procesos
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Cierre fotográfico (snapshot) por año fiscal, verificación física in-situ con pistola QR / tablet y reporte de conciliación (RF-11, RF-12).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAuditIdForModal(null);
                    setIsAuditModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>Aperturar Inventario Anual</span>
                </button>
              </div>

              {/* Lista de Auditorías */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {audits.map((aud) => (
                  <div
                    key={aud.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            {aud.title}
                          </h4>
                          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                            Año Fiscal {aud.year}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        aud.status === 'CERRADO'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300'
                      }`}>
                        {aud.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Total Activos Censados</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          {aud.totalAssetsSnapshot}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Aperturado</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(aud.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAuditIdForModal(aud.id);
                          setIsAuditModalOpen(true);
                        }}
                        className="flex-1 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-colors text-center"
                      >
                        {aud.status === 'CERRADO' ? 'Ver Reporte de Conciliación' : 'Pistola QR / Conciliación en Campo'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 7: CATÁLOGO DE SOFTWARE INSTITUCIONAL (RF-02, RF-06)               */}
          {/* ===================================================================== */}
          {activeTab === 'software' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>Catálogo de Software Institucional & Licencias</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                      {softwareList.length} Títulos
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Gestión de sistemas operativos, suites ofimáticas, antivirus y herramientas especializadas municipales (RF-02).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSoftwareToEdit(null);
                    setIsSoftwareModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>Registrar Software</span>
                </button>
              </div>

              {/* Cuadrícula de Software */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {softwareList.map((sw) => (
                  <div
                    key={sw.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200">
                          {sw.licenseType}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          v{sw.version}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {sw.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Desarrollador: <strong className="text-slate-700 dark:text-slate-300">{sw.developer || 'No especificado'}</strong>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Licencias</span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {sw.totalLicenses} adquirida{sw.totalLicenses !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSoftwareToEdit(sw);
                          setIsSoftwareModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 rounded-xl transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 8: CATEGORÍAS Y ESQUEMAS DINÁMICOS (RF-03)                         */}
          {/* ===================================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Categorías Tecnológicas & Esquemas Adaptativos
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Cada categoría cuenta con su propio esquema dinámico de parámetros técnicos (procesadores, pantallas, memorias, puertos, etc.).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCategoryToEdit(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <span>+</span>
                  <span>Nueva Categoría</span>
                </button>
              </div>

              {/* Cuadrícula de Categorías */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            {cat.icon || '💻'}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {cat.name}
                            </h4>
                            <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                              Prefijo: MDC-TI-{cat.code}-XXXX
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {cat.description || 'Sin descripción detallada.'}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Parámetros Técnicos ({cat.customFieldsSchema?.length || 0})
                          </span>
                        </div>

                        {cat.customFieldsSchema && cat.customFieldsSchema.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {cat.customFieldsSchema.map((field) => (
                              <span
                                key={field.key}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1"
                              >
                                <span>{field.label}</span>
                                {field.required && (
                                  <span className="text-rose-500 font-bold" title="Requerido">
                                    *
                                  </span>
                                )}
                                <span className="text-[9px] text-slate-400">({field.type})</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Sin parámetros específicos configurados.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryForSchema(cat);
                          setIsSchemaModalOpen(true);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-colors"
                      >
                        ⚙️ Configurar Parámetros
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCategoryToEdit(cat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar datos de categoría"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 9: MARCAS Y MODELOS HOMOLOGADOS (RF-01)                           */}
          {/* ===================================================================== */}
          {activeTab === 'catalogs' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Catálogo Homologado de Marcas y Modelos
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Estandarización de fabricantes y líneas de productos para evitar redundancias y variaciones tipográficas (RF-01).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna de Marcas */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        🏷️ Marcas Fabricantes ({brands.length})
                      </h3>
                      <p className="text-[11px] text-slate-500">Fabricantes de equipamiento</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogModalType('brand');
                        setIsBrandModelModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700"
                    >
                      + Nueva Marca
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {brands.map((b) => {
                      const modelsCount = models.filter((m) => m.brandId === b.id).length;
                      return (
                        <div
                          key={b.id}
                          className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                        >
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {b.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {modelsCount} modelo{modelsCount !== 1 ? 's' : ''} registrado{modelsCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            Activo
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Columna de Modelos */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        📦 Modelos y Líneas ({models.length})
                      </h3>
                      <p className="text-[11px] text-slate-500">Líneas de producto homologadas</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogModalType('model');
                        setIsBrandModelModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700"
                    >
                      + Nuevo Modelo
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto pr-1">
                    {models.map((m) => (
                      <div
                        key={m.id}
                        className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Marca: <strong className="text-slate-600 dark:text-slate-300">{m.brandName}</strong>{' '}
                            {m.categoryName && `• Categoría: ${m.categoryName}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 10: DASHBOARD EJECUTIVO KPIS (Mejora 2)                           */}
          {/* ===================================================================== */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Dashboard Ejecutivo de Indicadores TI (KPIs)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Semáforos operativos, alertas de inventario crítico, vencimiento de garantías y cumplimiento de retornos.
                </p>
              </div>

              {/* Tarjetas Principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Disponibilidad TI</span>
                  <div className="text-3xl font-black text-emerald-600 mt-1">
                    {stats?.total
                      ? `${Math.round(((stats.byStatus['OPERATIVO'] || 0) / stats.total) * 100)}%`
                      : '100%'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Equipos en estado operativo</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Insumos Críticos</span>
                  <div className={`text-3xl font-black mt-1 ${criticalSupplies.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {criticalSupplies.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Con stock menor a 2 unidades</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mantenimientos Pendientes</span>
                  <div className="text-3xl font-black text-amber-600 mt-1">
                    {maintenanceOrders.filter((m) => m.status !== 'COMPLETADO').length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">En taller o programados</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Préstamos Retrasados</span>
                  <div className={`text-3xl font-black mt-1 ${delayedLoans.length > 0 ? 'text-rose-600' : 'text-blue-600'}`}>
                    {delayedLoans.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Vencidos sin retorno</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Desglose por Categoría */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Distribución de Activos por Categoría
                  </h4>
                  <div className="space-y-3">
                    {categories.map((cat) => {
                      const count = assets.filter((a) => a.categoryId === cat.id).length;
                      const percent = assets.length > 0 ? Math.round((count / assets.length) * 100) : 0;
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {count} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%`, backgroundColor: cat.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Desglose por Estado */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Estado Operativo del Parque Informático
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Operativo', key: 'OPERATIVO', color: '#16a34a' },
                      { label: 'En Mantenimiento', key: 'EN_MANTENIMIENTO', color: '#d97706' },
                      { label: 'En Custodia / Almacén', key: 'EN_CUSTODIA', color: '#2563eb' },
                      { label: 'En Préstamo Temporal', key: 'EN_PRESTAMO', color: '#6366f1' },
                      { label: 'En Desuso', key: 'EN_DESUSO', color: '#64748b' },
                      { label: 'Para Baja Técnica', key: 'PARA_BAJA', color: '#e11d48' },
                    ].map((st) => {
                      const count = stats?.byStatus?.[st.key] || 0;
                      const percent = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={st.key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {st.label}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {count} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%`, backgroundColor: st.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 11: LECTOR QR / BÚSQUEDA RÁPIDA (Mejora 1)                         */}
          {/* ===================================================================== */}
          {activeTab === 'qr_lookup' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
                <div className="max-w-2xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    Búsqueda Rápida de Ficha Técnica Patrimonial
                  </span>
                  <h3 className="text-2xl font-black mt-1">
                    Consulta Inmediata por Código Informático / Pistola QR
                  </h3>
                  <p className="text-xs text-blue-200/80 mt-1">
                    Escanee con un lector de código de barras / QR la etiqueta física adherida al activo, o ingrese manualmente el código informático correlativo (ej. MDC-TI-PC-0001, MDC-TI-MON-0002).
                  </p>
                </div>

                <form onSubmit={handleQuickLookup} className="flex gap-2 max-w-md pt-2">
                  <input
                    type="text"
                    placeholder="MDC-TI-PC-0001"
                    value={quickLookupCode}
                    onChange={(e) => setQuickLookupCode(e.target.value)}
                    className="flex-1 text-xs font-mono font-bold px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300/50 outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md transition-colors"
                  >
                    Consultar Ficha
                  </button>
                </form>

                {lookupError && (
                  <p className="text-xs font-medium text-rose-300 bg-rose-950/60 p-3.5 rounded-xl border border-rose-800">
                    {lookupError}
                  </p>
                )}

                {lookupResult && (
                  <div className="p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-blue-300">
                          {lookupResult.computerCode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          {lookupResult.status}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-white block mt-0.5">
                        {lookupResult.brandName} {lookupResult.modelName} ({lookupResult.categoryName})
                      </span>
                      <span className="text-xs text-blue-200 block mt-0.5">
                        Oficina: {lookupResult.office || 'Almacén'} &bull; Custodio:{' '}
                        {lookupResult.assignedPersonName || 'Sin asignar'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssetForDetail(lookupResult);
                        setIsDetailModalOpen(true);
                      }}
                      className="px-5 py-2.5 text-xs font-bold bg-white text-blue-900 rounded-xl hover:bg-blue-50 shadow-md self-start sm:self-auto"
                    >
                      Ver Ficha Completa & QR
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALES INTEGRALES DEL SISTEMA                                        */}
      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR / EDITAR ACTIVO */}
      {isAssetModalOpen && (
        <AssetFormModal
          assetToEdit={assetToEdit}
          categories={categories}
          brands={brands}
          models={models}
          isOpen={isAssetModalOpen}
          onClose={() => setIsAssetModalOpen(false)}
          onSaved={async (savedAsset) => {
            showAlert(
              assetToEdit
                ? `Activo ${savedAsset.computerCode} actualizado correctamente`
                : `Activo ${savedAsset.computerCode} registrado exitosamente`
            );
            await handleRefreshAssets();
          }}
          onRefreshCatalogs={async () => {
            const [b, m] = await Promise.all([itamService.getBrands(), itamService.getModels()]);
            setBrands(b);
            setModels(m);
          }}
        />
      )}

      {/* MODAL 2: CONFIGURADOR DE ESQUEMA DINÁMICO */}
      {isSchemaModalOpen && categoryForSchema && (
        <CategorySchemaModal
          category={categoryForSchema}
          isOpen={isSchemaModalOpen}
          onClose={() => setIsSchemaModalOpen(false)}
          onSaved={(updatedCat) => {
            showAlert(`Esquema dinámico para "${updatedCat.name}" actualizado`);
            setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
          }}
        />
      )}

      {/* MODAL 3: CREAR / EDITAR CATEGORÍA */}
      {isCategoryModalOpen && (
        <CategoryFormModal
          categoryToEdit={categoryToEdit}
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSaved={(cat) => {
            showAlert(`Categoría "${cat.name}" guardada exitosamente`);
            if (categoryToEdit) {
              setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
            } else {
              setCategories((prev) => [...prev, cat]);
            }
          }}
        />
      )}

      {/* MODAL 4: FICHA TÉCNICA DETALLADA & QR */}
      {isDetailModalOpen && selectedAssetForDetail && (
        <AssetDetailModal
          asset={selectedAssetForDetail}
          category={categories.find((c) => c.id === selectedAssetForDetail.categoryId)}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onEdit={(asset) => {
            setAssetToEdit(asset);
            setIsAssetModalOpen(true);
          }}
          onManageChildren={(asset) => {
            setParentForChildModal(asset);
            setIsChildModalOpen(true);
          }}
          onGenerateActa={(asset) => openActaModal('ASIGNACION', asset)}
          onMoveAsset={(asset) => {
            setAssetForMovement(asset);
            setIsMovementModalOpen(true);
          }}
        />
      )}

      {/* MODAL 5: REGISTRO DE MARCA O MODELO */}
      {isBrandModelModalOpen && (
        <BrandModelModal
          type={catalogModalType}
          brands={brands}
          categories={categories}
          isOpen={isBrandModelModalOpen}
          onClose={() => setIsBrandModelModalOpen(false)}
          onSaved={async () => {
            showAlert(`Catálogo de marcas y modelos actualizado`);
            const [b, m] = await Promise.all([itamService.getBrands(), itamService.getModels()]);
            setBrands(b);
            setModels(m);
          }}
        />
      )}

      {/* MODAL 6: VINCULACIÓN PADRE - HIJO (RF-05) */}
      {isChildModalOpen && parentForChildModal && (
        <ChildAssetsModal
          isOpen={isChildModalOpen}
          onClose={() => setIsChildModalOpen(false)}
          parentAsset={parentForChildModal}
          allAssets={assets}
          onUpdated={async () => {
            showAlert('Periféricos actualizados correctamente');
            await handleRefreshAssets();
          }}
        />
      )}

      {/* MODAL 7: MOVIMIENTOS Y REASIGNACIONES (RF-09) */}
      {isMovementModalOpen && assetForMovement && (
        <MovementModal
          isOpen={isMovementModalOpen}
          onClose={() => setIsMovementModalOpen(false)}
          asset={assetForMovement}
          onSuccess={async (mov) => {
            showAlert(`Movimiento ${mov.actaNumber} registrado`);
            await handleRefreshMovements();
            openActaModal('TRANSFERENCIA', null, mov);
          }}
        />
      )}

      {/* MODAL 8: MANTENIMIENTOS (RF-13, RF-15) */}
      {isMaintenanceModalOpen && (
        <MaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          asset={assetForMaintenance}
          existingOrder={orderToComplete}
          suppliesList={supplies}
          onSuccess={async (ord) => {
            showAlert(`Orden ${ord.orderNumber} ${orderToComplete ? 'completada' : 'programada'}`);
            await handleRefreshMaintenance();
          }}
        />
      )}

      {/* MODAL 9: INSUMOS (RF-14) */}
      {isSupplyModalOpen && (
        <SupplyModal
          isOpen={isSupplyModalOpen}
          onClose={() => setIsSupplyModalOpen(false)}
          supply={supplyToEdit}
          onSuccess={async () => {
            showAlert('Stock de insumo actualizado correctamente');
            await handleRefreshSupplies();
          }}
        />
      )}

      {/* MODAL 10: PRÉSTAMOS Y RESERVAS (RF-17, RF-18, RF-20) */}
      {isLoanModalOpen && (
        <LoanModal
          isOpen={isLoanModalOpen}
          onClose={() => setIsLoanModalOpen(false)}
          loanableAssets={loanableAssets}
          existingLoan={loanToReturn}
          onSuccess={async (ln) => {
            showAlert(`Préstamo ${ln.loanNumber} ${loanToReturn ? 'devuelto' : 'registrado'}`);
            await handleRefreshLoans();
            openActaModal('PRESTAMO', null, null, null, ln);
          }}
        />
      )}

      {/* MODAL 11: AUDITORÍA ANUAL & CONCILIACIÓN FÍSICA (RF-11, RF-12) */}
      {isAuditModalOpen && (
        <AuditModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          auditId={auditIdForModal}
          onUpdated={async () => {
            showAlert('Auditoría anual actualizada');
            await handleRefreshAudits();
          }}
        />
      )}

      {/* MODAL 12: SOFTWARE INSTITUCIONAL (RF-02) */}
      {isSoftwareModalOpen && (
        <SoftwareModal
          isOpen={isSoftwareModalOpen}
          onClose={() => setIsSoftwareModalOpen(false)}
          software={softwareToEdit}
          onSuccess={async () => {
            showAlert('Catálogo de software actualizado');
            await handleRefreshSoftware();
          }}
        />
      )}

      {/* MODAL 13: ACTA OFICIAL PDF (RF-10, RF-16, RF-20) */}
      {isActaModalOpen && (
        <ActaDocumentModal
          isOpen={isActaModalOpen}
          onClose={() => setIsActaModalOpen(false)}
          type={actaType}
          asset={actaAsset}
          movement={actaMovement}
          maintenance={actaMaintenance}
          loan={actaLoan}
        />
      )}
    </div>
  );
}
