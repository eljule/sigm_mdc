'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  KnowledgeArticle,
  HelpdeskMetrics,
  CreateTicketPayload,
  AddTechnicalDetailPayload,
  AddSupplyToTicketPayload,
  AssignProvisionalAssetPayload,
  ReturnProvisionalAssetPayload,
  UserConformityPayload,
  CreateKnowledgeArticlePayload,
} from '@/types/helpdesk';
import { helpdeskService } from '@/services/helpdesk.service';
import { UserSummary } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { canAccessModule, isReportanteUser } from '@/utils/auth-guard';
import { getModuleByIdOrCode } from '@/services/modules.service';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Pagination } from '@/components/Pagination';

// Modales de Helpdesk
import { TicketFormModal } from '@/components/helpdesk/TicketFormModal';
import { TicketDetailModal } from '@/components/helpdesk/TicketDetailModal';
import { TicketTechnicalModal } from '@/components/helpdesk/TicketTechnicalModal';
import { TicketSuppliesModal } from '@/components/helpdesk/TicketSuppliesModal';
import { TicketProvisionalModal } from '@/components/helpdesk/TicketProvisionalModal';
import { DecommissionActModal } from '@/components/helpdesk/DecommissionActModal';
import { UserConformityModal } from '@/components/helpdesk/UserConformityModal';
import { KnowledgeModal } from '@/components/helpdesk/KnowledgeModal';
import { ReassignModal } from '@/components/helpdesk/ReassignModal';

type HelpdeskTab = 'tickets' | 'my_tickets' | 'workload' | 'knowledge' | 'qr_scanner' | 'metrics';

export default function SoportePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [activeTab, setActiveTab] = useState<HelpdeskTab>('tickets');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Alerta flotante
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Datos principales
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [metrics, setMetrics] = useState<HelpdeskMetrics | null>(null);

  // Filtros de bandeja general
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Paginación de tickets
  const [ticketsPage, setTicketsPage] = useState<number>(1);
  const [ticketsPageSize, setTicketsPageSize] = useState<number>(10);

  // Filtros de base de conocimiento
  const [kbSearchQuery, setKbSearchQuery] = useState('');
  const [kbCategoryFilter, setKbCategoryFilter] = useState('ALL');

  // Búsqueda QR
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scannedAsset, setScannedAsset] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  // Estado de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<Ticket | null>(null);

  const [isTechnicalModalOpen, setIsTechnicalModalOpen] = useState(false);
  const [isSuppliesModalOpen, setIsSuppliesModalOpen] = useState(false);
  const [isProvisionalModalOpen, setIsProvisionalModalOpen] = useState(false);
  const [isDecommissionModalOpen, setIsDecommissionModalOpen] = useState(false);
  const [isConformityModalOpen, setIsConformityModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [selectedKbArticle, setSelectedKbArticle] = useState<KnowledgeArticle | null>(null);
  const [kbModalMode, setKbModalMode] = useState<'VIEW' | 'CREATE'>('VIEW');

  useEffect(() => {
    const checkAccessAndMaintenance = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      if (!canAccessModule(user, 'helpdesk_support')) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'sigm_access_denied_message',
            'Acceso no autorizado: Su usuario no cuenta con permisos para el subsistema de Soporte Técnico y Helpdesk.',
          );
        }
        router.replace('/modulos');
        return;
      }

      // Verificación de mantenimiento (excluye ROOT y Administrador Central)
      const isSuperAdmin =
        user.username?.toUpperCase() === 'ROOT' ||
        user.role?.toLowerCase() === 'administrador central';

      try {
        const mod = await getModuleByIdOrCode('helpdesk_support');
        if (mod?.isUnderMaintenance && !isSuperAdmin) {
          router.replace('/mantenimiento?code=helpdesk_support');
          return;
        }
      } catch (e) {
        console.warn('Error al verificar mantenimiento:', e);
      }

      setCurrentUser(user);

      // Si es personal general / solicitante, activar directamente la vista de sus tickets
      if (isReportanteUser(user)) {
        setActiveTab('my_tickets');
      }

      loadAllData(user);
    };

    checkAccessAndMaintenance();
  }, [router]);

  const loadAllData = async (userParam?: UserSummary | null) => {
    const user = userParam || currentUser || authService.getCurrentUser();
    const isReportante = isReportanteUser(user);

    setIsLoading(true);
    try {
      if (isReportante) {
        // Para solicitante, solo cargar sus tickets de seguimiento y base de conocimiento
        const [mList, kList] = await Promise.all([
          helpdeskService.getMyTickets(user?.fullName || undefined),
          helpdeskService.getKnowledgeArticles(),
        ]);
        setMyTickets(mList);
        setKnowledgeArticles(kList);
      } else {
        const [tList, mList, kList, met] = await Promise.all([
          helpdeskService.getTickets(),
          helpdeskService.getMyTickets(),
          helpdeskService.getKnowledgeArticles(),
          helpdeskService.getMetrics(),
        ]);
        setTickets(tList);
        setMyTickets(mList);
        setKnowledgeArticles(kList);
        setMetrics(met);
      }
    } catch (err: any) {
      showAlert(err.message || 'Error al cargar los datos de Helpdesk', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const reloadTickets = async () => {
    const user = currentUser || authService.getCurrentUser();
    const isReportante = isReportanteUser(user);

    try {
      if (isReportante) {
        const mList = await helpdeskService.getMyTickets(user?.fullName || undefined);
        setMyTickets(mList);
        if (selectedTicketForDetail) {
          const updated = mList.find((t) => t.id === selectedTicketForDetail.id);
          if (updated) setSelectedTicketForDetail(updated);
        }
      } else {
        const [tList, mList, met] = await Promise.all([
          helpdeskService.getTickets(),
          helpdeskService.getMyTickets(),
          helpdeskService.getMetrics(),
        ]);
        setTickets(tList);
        setMyTickets(mList);
        setMetrics(met);

        // Si hay un ticket seleccionado abierto en detalle, refrescarlo
        if (selectedTicketForDetail) {
          const updated = tList.find((t) => t.id === selectedTicketForDetail.id);
          if (updated) setSelectedTicketForDetail(updated);
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Acciones sobre tickets
  const handleCreateTicket = async (payload: CreateTicketPayload) => {
    const result = await helpdeskService.createTicket(payload);
    showAlert(`Ticket ${result.ticketNumber} registrado exitosamente.`);
    await reloadTickets();
  };

  const handleTakeTicket = async (ticketId: string) => {
    if (!currentUser) return;
    try {
      const result = await helpdeskService.takeTicket(ticketId, {
        technicianName: currentUser.fullName || currentUser.username,
        technicianPhone: 'Anexo 104 (Soporte TI)',
      });
      showAlert(`Ticket ${result.ticketNumber} tomado para atención inmediata.`);
      await reloadTickets();
      setSelectedTicketForDetail(result);
    } catch (err: any) {
      showAlert(err.message || 'No fue posible tomar el ticket', 'error');
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: TicketStatus, reason?: string) => {
    if (!currentUser) return;
    try {
      const result = await helpdeskService.updateStatus(ticketId, {
        status,
        reason,
        userName: currentUser.fullName || currentUser.username,
      });
      showAlert(`Estado de ticket actualizado a ${status}.`);
      await reloadTickets();
      setSelectedTicketForDetail(result);
    } catch (err: any) {
      showAlert(err.message || 'Error al actualizar estado', 'error');
    }
  };

  const handleTechnicalDetail = async (payload: AddTechnicalDetailPayload) => {
    if (!selectedTicketForDetail) return;
    try {
      const result = await helpdeskService.addTechnicalDetail(selectedTicketForDetail.id, payload);
      showAlert(`Diagnóstico y solución técnica registrados. Ticket resuelto.`);
      await reloadTickets();
      setSelectedTicketForDetail(result);
    } catch (err: any) {
      showAlert(err.message || 'Error al guardar diagnóstico', 'error');
      throw err;
    }
  };

  const handleAddSupply = async (payload: AddSupplyToTicketPayload) => {
    if (!selectedTicketForDetail) return;
    try {
      await helpdeskService.addSupply(selectedTicketForDetail.id, payload);
      showAlert(`Insumo descargado de almacén y asignado al ticket.`);
      await reloadTickets();
    } catch (err: any) {
      showAlert(err.message || 'Error al descargar insumo', 'error');
      throw err;
    }
  };

  const handleAssignProvisional = async (payload: AssignProvisionalAssetPayload) => {
    if (!selectedTicketForDetail) return;
    try {
      await helpdeskService.assignProvisional(selectedTicketForDetail.id, payload);
      showAlert(`Activo de reserva provisional asignado exitosamente.`);
      await reloadTickets();
    } catch (err: any) {
      showAlert(err.message || 'Error al asignar provisional', 'error');
      throw err;
    }
  };

  const handleReturnProvisional = async (loanId: string, payload: ReturnProvisionalAssetPayload) => {
    try {
      await helpdeskService.returnProvisional(loanId, payload);
      showAlert(`Componente provisional devuelto al stock de reserva.`);
      await reloadTickets();
    } catch (err: any) {
      showAlert(err.message || 'Error al devolver provisional', 'error');
      throw err;
    }
  };

  const handleUserConformity = async (payload: UserConformityPayload) => {
    if (!selectedTicketForDetail) return;
    try {
      const result = await helpdeskService.userConformity(selectedTicketForDetail.id, payload);
      showAlert(
        payload.userConformity
          ? `Ticket ${result.ticketNumber} cerrado formalmente con visto bueno.`
          : `Observación registrada. Ticket ${result.ticketNumber} retornado a atención técnica.`,
      );
      await reloadTickets();
      setSelectedTicketForDetail(result);
    } catch (err: any) {
      showAlert(err.message || 'Error al registrar conformidad', 'error');
      throw err;
    }
  };

  const handleReassign = async (payload: any) => {
    if (!selectedTicketForDetail) return;
    try {
      const result = await helpdeskService.reassignTicket(selectedTicketForDetail.id, payload);
      showAlert(`Ticket ${result.ticketNumber} reasignado a ${payload.technicianName}.`);
      await reloadTickets();
      setSelectedTicketForDetail(result);
    } catch (err: any) {
      showAlert(err.message || 'Error al reasignar ticket', 'error');
      throw err;
    }
  };

  // Base de conocimientos
  const handleCreateKbArticle = async (payload: CreateKnowledgeArticlePayload) => {
    const result = await helpdeskService.createKnowledgeArticle(payload);
    showAlert(`Guía "${result.title}" publicada en la base de conocimientos.`);
    const kList = await helpdeskService.getKnowledgeArticles();
    setKnowledgeArticles(kList);
  };

  const handleVoteKbHelpful = async (id: string) => {
    await helpdeskService.markArticleHelpful(id);
    const kList = await helpdeskService.getKnowledgeArticles();
    setKnowledgeArticles(kList);
  };

  // Búsqueda QR
  const handleLookupQrAsset = async () => {
    if (!qrCodeInput.trim()) return;
    setQrLoading(true);
    setQrError(null);
    try {
      const data = await helpdeskService.lookupAsset(qrCodeInput.trim());
      setScannedAsset(data);
    } catch (err: any) {
      setQrError(err.message || 'Activo no encontrado');
      setScannedAsset(null);
    } finally {
      setQrLoading(false);
    }
  };

  // Filtros aplicados a tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      searchQuery === '' ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.officeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.assetComputerCode && t.assetComputerCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  useEffect(() => {
    setTicketsPage(1);
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const paginatedTickets = React.useMemo(() => {
    const start = (ticketsPage - 1) * ticketsPageSize;
    return filteredTickets.slice(start, start + ticketsPageSize);
  }, [filteredTickets, ticketsPage, ticketsPageSize]);

  // Filtros aplicados a artículos KB
  const filteredKbArticles = knowledgeArticles.filter((a) => {
    const matchesSearch =
      kbSearchQuery === '' ||
      a.title.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
      a.summary.toLowerCase().includes(kbSearchQuery.toLowerCase()) ||
      a.solutionSteps.toLowerCase().includes(kbSearchQuery.toLowerCase());

    const matchesCategory = kbCategoryFilter === 'ALL' || a.category === kbCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      {/* ========================================================================= */}
      {/* 1. CABECERA INSTITUCIONAL MUNICIPAL (CASTILLA)                            */}
      {/* ========================================================================= */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Logo y Nombre del Subsistema */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-base">
                🎧
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm tracking-tight text-white">
                    MUNICIPALIDAD DISTRITAL DE CASTILLA
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest font-mono">
                    Helpdesk v1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Soporte Técnico y Mesa de Ayuda Municipal (SRS Octubre 2026)
                </p>
              </div>
            </div>
          </div>

          {/* Badges de Estado y Acciones Rápidas */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {metrics && !isReportanteUser(currentUser) && (
              <>
                {metrics.openCount > 0 && (
                  <button
                    onClick={() => {
                      setStatusFilter('ABIERTO');
                      setActiveTab('tickets');
                    }}
                    className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold animate-pulse"
                  >
                    <span>🔔</span>
                    <span>{metrics.openCount} Abiertos</span>
                  </button>
                )}

                {metrics.inLabCount > 0 && (
                  <button
                    onClick={() => {
                      setStatusFilter('EN_LABORATORIO');
                      setActiveTab('tickets');
                    }}
                    className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold"
                  >
                    <span>🔬</span>
                    <span>{metrics.inLabCount} En Taller</span>
                  </button>
                )}
              </>
            )}

            {/* Enlace Directo Municipal al Formulario Ágil */}
            <Link
              href="/soporte/nuevo-ticket"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all hover:scale-105"
            >
              <span>+</span>
              <span className="hidden sm:inline">Nuevo Ticket</span>
            </Link>

            {/* Acceso a ITAM (Solo si está autorizado) */}
            {canAccessModule(currentUser, 'it_inventory') && (
              <Link
                href="/itam"
                className="hidden lg:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-white text-xs font-semibold border border-blue-700/50 transition-colors"
              >
                <span>🖥️</span>
                <span>ITAM</span>
              </Link>
            )}

            {/* Acceso a Central (Solo si está autorizado) */}
            {canAccessModule(currentUser, 'central_dashboard') && (
              <Link
                href="/admin"
                className="hidden lg:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-white text-xs font-semibold border border-emerald-700/50 transition-colors"
              >
                <span>⚙️</span>
                <span>Central</span>
              </Link>
            )}

            <Link
              href="/modulos"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <span>🚀</span>
              <span className="hidden sm:inline">Lanzador</span>
            </Link>

            <ThemeToggle />

            {/* Perfil del Usuario Activo */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                {(currentUser.fullName || currentUser.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs">
                <span className="font-bold text-white leading-tight">
                  {currentUser.fullName || currentUser.username}
                </span>
                <span className="text-[10px] text-indigo-300">{currentUser.role}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notificación flotante */}
      {alert && (
        <div
          className={`fixed top-16 right-6 z-50 p-4 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-bounce ${
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
                {!sidebarCollapsed && (isReportanteUser(currentUser) ? 'Portal Solicitante' : 'Mesa de Ayuda (SRS)')}
              </div>
              <nav className="space-y-1">
                {isReportanteUser(currentUser) ? (
                  <>
                    {/* 1. Portal del Solicitante / Mis Tickets */}
                    <button
                      onClick={() => setActiveTab('my_tickets')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                        activeTab === 'my_tickets'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-r-4 border-indigo-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title="Seguimiento Ágil y Visto Bueno del Solicitante"
                    >
                      <span className="text-lg">📱</span>
                      {!sidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between text-left">
                          <span>Mis Tickets</span>
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full font-bold">
                            {myTickets.length}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* 2. Botón para nuevo ticket */}
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
                      title="Registrar una nueva incidencia o solicitud técnica"
                    >
                      <span className="text-lg font-bold">+</span>
                      {!sidebarCollapsed && <span>Nuevo Ticket</span>}
                    </button>

                    {/* 3. Base de Conocimientos TI */}
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                        activeTab === 'knowledge'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-r-4 border-indigo-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title="Guías de Solución Técnica Estandarizadas"
                    >
                      <span className="text-lg">📚</span>
                      {!sidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between text-left">
                          <span>Base Conocimientos</span>
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                            {knowledgeArticles.length}
                          </span>
                        </div>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    {/* 1. Bandeja General de Tickets (RF-06, RF-07, RF-12) */}
                    <button
                      onClick={() => setActiveTab('tickets')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                        activeTab === 'tickets'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-r-4 border-indigo-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title="Bandeja General de Tickets de Soporte"
                    >
                      <span className="text-lg">📋</span>
                      {!sidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between text-left">
                          <span>Bandeja de Tickets</span>
                          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded-full font-bold">
                            {tickets.length}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* 2. Portal del Solicitante / Mis Tickets (RF-01, RF-02, RF-05) */}
                    <button
                      onClick={() => setActiveTab('my_tickets')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                        activeTab === 'my_tickets'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-r-4 border-indigo-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title="Seguimiento Ágil y Visto Bueno del Solicitante"
                    >
                      <span className="text-lg">📱</span>
                      {!sidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between text-left">
                          <span>Mis Tickets (Usuario)</span>
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full font-bold">
                            {myTickets.length}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* 3. Monitoreo & Cargas de Trabajo (RF-13) */}
                    <button
                      onClick={() => setActiveTab('workload')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                        activeTab === 'workload'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-r-4 border-indigo-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title="Balanceo de Cargas de Trabajo y Tiempos de Atención"
                    >
                      <span className="text-lg">📊</span>
                      {!sidebarCollapsed && <span>Cargas de Trabajo</span>}
                    </button>

                    {/* 4. Base de Conocimientos TI (RF-14) */}
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                        activeTab === 'knowledge'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-r-4 border-indigo-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title="Guías de Solución Técnica Estandarizadas"
                    >
                      <span className="text-lg">📚</span>
                      {!sidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between text-left">
                          <span>Base Conocimientos</span>
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                            {knowledgeArticles.length}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* 5. Lector QR de Equipos (RF-03) */}
                    <button
                      onClick={() => setActiveTab('qr_scanner')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                        activeTab === 'qr_scanner'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-r-4 border-indigo-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title="Escaneo o Búsqueda de Bien por QR Adherido"
                    >
                      <span className="text-lg">🏷️</span>
                      {!sidebarCollapsed && <span>Lector QR Equipos</span>}
                    </button>

                    {/* 6. Indicadores & KPIs (RF-13, RNF-01) */}
                    <button
                      onClick={() => setActiveTab('metrics')}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                        activeTab === 'metrics'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-r-4 border-indigo-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      title="Tiempos de Respuesta, Resolución y Satisfacción"
                    >
                      <span className="text-lg">📈</span>
                      {!sidebarCollapsed && <span>Métricas & SLA</span>}
                    </button>
                  </>
                )}
              </nav>
            </div>
          </div>

          {/* Pie de Sidebar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
            {!sidebarCollapsed ? (
              <div className="space-y-1">
                <p className="font-bold text-slate-600 dark:text-slate-400">SIGM - MDC 2026</p>
                <p>Oficina de Soporte TI</p>
              </div>
            ) : (
              <div className="text-center font-bold">🎧</div>
            )}
          </div>
        </aside>

        {/* ======================================================================= */}
        {/* 2.2 CONTENIDO PRINCIPAL SEGÚN PESTAÑA SELECCIONADA                      */}
        {/* ======================================================================= */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* ===================================================================== */}
          {/* PESTAÑA 1: BANDEJA GENERAL DE TICKETS (RF-06, RF-07, RF-12)           */}
          {/* ===================================================================== */}
          {activeTab === 'tickets' && !isReportanteUser(currentUser) && (
            <div className="space-y-6 animate-fadeIn">
              {/* Tarjetas Superiores de Métricas y Contadores */}
              {metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Tickets</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics.totalTickets}</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl shadow-sm border border-blue-200 dark:border-blue-900">
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">1. Abiertos</span>
                    <span className="text-2xl font-black text-blue-700 dark:text-blue-300">{metrics.openCount}</span>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-900">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 block">2. En Atención</span>
                    <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{metrics.inProgressCount}</span>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-xl shadow-sm border border-purple-200 dark:border-purple-900">
                    <span className="text-[10px] uppercase font-bold text-purple-600 block">4. En Taller</span>
                    <span className="text-2xl font-black text-purple-700 dark:text-purple-300">{metrics.inLabCount}</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">5. Resueltos</span>
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{metrics.resolvedCount}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">6. Cerrados</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-200">{metrics.closedCount}</span>
                  </div>
                </div>
              )}

              {/* Barra de Filtros y Búsqueda */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex-1 flex flex-wrap gap-2 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Buscar por código, asunto, solicitante, dependencia o activo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">Todos los Estados</option>
                    <option value="ABIERTO">1. Abierto / Pendiente</option>
                    <option value="EN_ATENCION">2. En Atención</option>
                    <option value="EN_PAUSA">3. En Pausa</option>
                    <option value="EN_LABORATORIO">4. En Taller / Lab</option>
                    <option value="RESUELTO">5. Resuelto</option>
                    <option value="CERRADO">6. Cerrado</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">Todas las Prioridades</option>
                    <option value="CRITICA">Crítica</option>
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">Todas las Categorías</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="RED_INTERNET">Red / Internet</option>
                    <option value="PERMISOS">Permisos</option>
                    <option value="OTROS">Otros</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center space-x-1.5"
                  >
                    <span>+</span>
                    <span>Registrar Incidencia</span>
                  </button>
                </div>
              </div>

              {/* Tabla Principal de Tickets */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold text-[10px]">
                      <tr>
                        <th className="p-3">Código</th>
                        <th className="p-3">Prioridad</th>
                        <th className="p-3">Asunto & Activo</th>
                        <th className="p-3">Solicitante & Dependencia</th>
                        <th className="p-3">Estado Ciclo de Vida</th>
                        <th className="p-3">Técnico Asignado</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {paginatedTickets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                            No se encontraron tickets con los filtros seleccionados.
                          </td>
                        </tr>
                      ) : (
                        paginatedTickets.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="p-3 font-mono font-bold text-indigo-700 dark:text-indigo-400 whitespace-nowrap">
                              {t.ticketNumber}
                              <div className="text-[10px] text-slate-400 font-sans font-normal">
                                {new Date(t.createdAt).toLocaleDateString()}
                              </div>
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  t.priority === 'CRITICA'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                    : t.priority === 'ALTA'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : t.priority === 'MEDIA'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {t.priority}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">{t.category}</div>
                            </td>

                            <td className="p-3 max-w-xs">
                              <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {t.subject}
                              </div>
                              {t.assetComputerCode ? (
                                <span className="inline-block mt-0.5 text-[10px] font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-900">
                                  🏷️ {t.assetComputerCode}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Sin activo QR</span>
                              )}
                            </td>

                            <td className="p-3">
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {t.applicantName}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                                {t.officeName}
                              </div>
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  t.status === 'ABIERTO'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    : t.status === 'EN_ATENCION'
                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                    : t.status === 'EN_PAUSA'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : t.status === 'EN_LABORATORIO'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                    : t.status === 'RESUELTO'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : t.status === 'CERRADO'
                                    ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                }`}
                              >
                                {t.status === 'ABIERTO' && '1. Abierto'}
                                {t.status === 'EN_ATENCION' && '2. En Atención'}
                                {t.status === 'EN_PAUSA' && '3. En Pausa'}
                                {t.status === 'EN_LABORATORIO' && '4. En Taller'}
                                {t.status === 'RESUELTO' && '5. Resuelto'}
                                {t.status === 'CERRADO' && '6. Cerrado'}
                                {t.status === 'CANCELADO' && '7. Cancelado'}
                              </span>
                            </td>

                            <td className="p-3 whitespace-nowrap">
                              {t.assignedTechnicianName ? (
                                <div>
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    {t.assignedTechnicianName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {t.assignedTechnicianPhone || 'Anexo 104'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Sin asignar</span>
                              )}
                            </td>

                            <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                              {t.status === 'ABIERTO' && (
                                <button
                                  type="button"
                                  onClick={() => handleTakeTicket(t.id)}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold shadow-sm transition-colors"
                                  title="Tomar Ticket para atención inmediata (RF-07)"
                                >
                                  ⚡ Tomar
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTicketForDetail(t);
                                  setIsDetailModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded text-[11px] font-medium transition-colors"
                              >
                                Ver Ficha
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={ticketsPage}
                  totalItems={filteredTickets.length}
                  pageSize={ticketsPageSize}
                  onPageChange={setTicketsPage}
                  onPageSizeChange={setTicketsPageSize}
                  itemLabel="tickets"
                />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* PESTAÑA 2: PORTAL DEL SOLICITANTE / MIS TICKETS (RF-01, RF-02, RF-05) */}
          {/* ===================================================================== */}
          {activeTab === 'my_tickets' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                    Portal del Solicitante (RF-01 / RF-05)
                  </span>
                  <h2 className="text-xl font-bold mt-1">Seguimiento de Tickets y Visto Bueno</h2>
                  <p className="text-xs text-blue-100 mt-1 max-w-xl leading-relaxed">
                    Consulte en tiempo real el estado de atención de las incidencias reportadas en su área, el contacto del técnico asignado y otorgue la conformidad para el cierre definitivo.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap"
                >
                  + Reportar Falla Técnica
                </button>
              </div>

              {/* Lista de Tickets del Solicitante */}
              <div className="space-y-4">
                {myTickets.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                    <span className="text-4xl block mb-2">📋</span>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      No tiene tickets registrados actualmente.
                    </p>
                    <p className="text-xs mt-1">
                      Si experimenta problemas con su computadora, impresora o conexión de red, pulse en "Reportar Falla Técnica".
                    </p>
                  </div>
                ) : (
                  myTickets.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-400">
                            {t.ticketNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'RESUELTO'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse'
                                : t.status === 'EN_ATENCION'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : t.status === 'CERRADO'
                                ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {t.status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.subject}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{t.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Técnico: </span>
                            <span>{t.assignedTechnicianName || 'En asignación de Sistemas'}</span>
                          </div>
                          {t.assignedTechnicianPhone && (
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Contacto: </span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                                📞 {t.assignedTechnicianPhone}
                              </span>
                            </div>
                          )}
                          {t.assetComputerCode && (
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Bien: </span>
                              <span className="font-mono text-blue-600">{t.assetComputerCode}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botón de Conformidad y Acciones */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 self-stretch md:self-auto justify-end">
                        {t.status === 'RESUELTO' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicketForDetail(t);
                              setIsConformityModalOpen(true);
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center space-x-1.5"
                          >
                            <span>⭐</span>
                            <span>Dar Visto Bueno (Conformidad)</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicketForDetail(t);
                            setIsDetailModalOpen(true);
                          }}
                          className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors text-center"
                        >
                          Ver Detalle
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* PESTAÑA 3: CARGAS DE TRABAJO Y ASIGNACIÓN (RF-13)                     */}
          {/* ===================================================================== */}
          {activeTab === 'workload' && !isReportanteUser(currentUser) && metrics && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 block mb-1">
                  Panel de Supervisión y Balanceo (RF-13)
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Cargas de Trabajo del Equipo de Soporte Técnico
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Monitoreo en tiempo real de la distribución de tickets activos entre el personal operativo, evitando cuellos de botella y sobrecarga en técnicos específicos.
                </p>
              </div>

              {/* Tarjetas por Técnico */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.techniciansWorkload.map((tech, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {tech.technicianName}
                        </h3>
                        <p className="text-[11px] text-slate-400">Oficina de Informática y Sistemas</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tech.status === 'DISPONIBLE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                            : tech.status === 'OCUPADO'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {tech.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block">En Proceso</span>
                        <span className="text-lg font-black text-indigo-700 dark:text-indigo-400">
                          {tech.inProgressCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Resueltos</span>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                          {tech.resolvedCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Satisfacción</span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                          ★ {tech.averageRating}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                        Tickets Asignados Actualmente:
                      </span>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {tickets
                          .filter((t) => t.assignedTechnicianName === tech.technicianName)
                          .map((t) => (
                            <div
                              key={t.id}
                              onClick={() => {
                                setSelectedTicketForDetail(t);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex justify-between items-center"
                            >
                              <div className="truncate mr-2">
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                  {t.ticketNumber}
                                </span>{' '}
                                - {t.subject}
                              </div>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  t.status === 'RESUELTO'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* PESTAÑA 4: BASE DE CONOCIMIENTOS TI (RF-14)                           */}
          {/* ===================================================================== */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block mb-1">
                    Knowledge Base TI (RF-14)
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Guías Estandarizadas de Solución Técnica
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                    Repositorio institucional de fallas comunes y procedimientos paso a paso para agilizar la resolución de incidencias en dependencias municipales.
                  </p>
                </div>
                {!isReportanteUser(currentUser) && (
                  <button
                    type="button"
                    onClick={() => {
                      setKbModalMode('CREATE');
                      setSelectedKbArticle(null);
                      setIsKbModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors whitespace-nowrap"
                  >
                    + Publicar Nueva Guía
                  </button>
                )}
              </div>

              {/* Buscador de Base de Conocimiento */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar guías por palabra clave (atasco de papel, red, reinicios, Active Directory)..."
                    value={kbSearchQuery}
                    onChange={(e) => setKbSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={kbCategoryFilter}
                  onChange={(e) => setKbCategoryFilter(e.target.value)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ALL">Todas las Categorías</option>
                  <option value="HARDWARE">Hardware</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="RED_INTERNET">Red / Internet</option>
                  <option value="PERMISOS">Permisos / Accesos</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>

              {/* Cuadrícula de Artículos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredKbArticles.map((art) => (
                  <div
                    key={art.id}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3 hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {art.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          👁️ {art.viewsCount} vistas | 👍 {art.helpfulCount} votos
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                        {art.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Por: {art.authorTechnicianName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKbArticle(art);
                          setKbModalMode('VIEW');
                          setIsKbModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Leer Solución Completa →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* PESTAÑA 5: LECTOR QR DE EQUIPOS (RF-03)                               */}
          {/* ===================================================================== */}
          {activeTab === 'qr_scanner' && !isReportanteUser(currentUser) && (
            <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <span className="text-4xl block">🏷️</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Consulta Rápida por Código QR Adherido (RF-03)
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Ingrese el código informático municipal o escanee el sticker QR adherido a la computadora o periférico para consultar su estado y reportar fallas en un solo clic.
                </p>

                <div className="flex space-x-2 pt-2">
                  <input
                    type="text"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    placeholder="Ej. MDC-TI-PC-0001 o 740895000101"
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleLookupQrAsset}
                    disabled={qrLoading || !qrCodeInput.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-50"
                  >
                    {qrLoading ? 'Buscando...' : 'Consultar Bien'}
                  </button>
                </div>

                {qrError && (
                  <p className="text-xs text-red-600 dark:text-red-400 italic pt-1">{qrError}</p>
                )}
              </div>

              {scannedAsset && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                        {scannedAsset.computerCode}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                        {scannedAsset.categoryName} - {scannedAsset.brandName} {scannedAsset.modelName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Código Patrimonial SBN: <strong className="font-mono">{scannedAsset.patrimonialCode || 'N/A'}</strong>
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                      {scannedAsset.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Dependencia Asignada:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{scannedAsset.office || 'En Almacén'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Funcionario Custodio:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{scannedAsset.assignedPersonName || 'Sin asignar'}</span>
                    </div>
                  </div>

                  {scannedAsset.childAssets?.length > 0 && (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block mb-1.5">
                        Periféricos Vinculados (Padre-Hijo):
                      </span>
                      <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        {scannedAsset.childAssets.map((c: any) => (
                          <li key={c.id}>
                            • <strong className="font-mono">{c.computerCode}</strong>: {c.categoryName} ({c.modelName})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateModalOpen(true);
                      }}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                    >
                      🚀 Reportar Incidencia sobre este Activo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* PESTAÑA 6: MÉTRICAS Y TIEMPOS DE ATENCIÓN (RF-13, RNF-01)             */}
          {/* ===================================================================== */}
          {activeTab === 'metrics' && !isReportanteUser(currentUser) && metrics && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 block mb-1">
                  Indicadores de Rendimiento y Calidad de Servicio (RNF-01 / RF-13)
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Métricas Operativas de Soporte Técnico
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Evaluación de tiempos cronometrados de atención, tasa de resolución municipal y nivel de satisfacción de los usuarios.
                </p>
              </div>

              {/* 4 KPIs Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tiempo de Respuesta Promedio</span>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {metrics.averageResponseTimeMinutes} min
                  </div>
                  <p className="text-[11px] text-slate-500">Desde reporte hasta inicio de atención técnica</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tasa de Resolución</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {metrics.resolutionRatePercent}%
                  </div>
                  <p className="text-[11px] text-slate-500">Casos resueltos con éxito por el equipo</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Satisfacción del Usuario</span>
                  <div className="text-2xl font-black text-amber-500">
                    ★ {metrics.averageSatisfactionRating} / 5.0
                  </div>
                  <p className="text-[11px] text-slate-500">Calificación en actas de conformidad</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tiempo Promedio de Solución</span>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {Math.abs(metrics.averageResolutionTimeHours)} horas
                  </div>
                  <p className="text-[11px] text-slate-500">Resolución efectiva y cierre definitivo</p>
                </div>
              </div>

              {/* Desglose por Categoría y Prioridad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Distribución por Categoría de Falla
                  </h3>
                  <div className="space-y-2 text-xs">
                    {Object.entries(metrics.byCategory).map(([cat, count]) => (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                          <span className="text-slate-500 font-mono font-bold">{count}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{
                              width: `${metrics.totalTickets > 0 ? (count / metrics.totalTickets) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Distribución por Nivel de Severidad (Prioridad)
                  </h3>
                  <div className="space-y-2 text-xs">
                    {Object.entries(metrics.byPriority).map(([prio, count]) => (
                      <div key={prio} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{prio}</span>
                          <span className="text-slate-500 font-mono font-bold">{count}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              prio === 'CRITICA'
                                ? 'bg-red-600'
                                : prio === 'ALTA'
                                ? 'bg-amber-500'
                                : prio === 'MEDIA'
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                            style={{
                              width: `${metrics.totalTickets > 0 ? (count / metrics.totalTickets) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODALES DE OPERACIÓN                                                   */}
      {/* ========================================================================= */}
      {/* Modal 1: Crear Ticket */}
      <TicketFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicket}
        defaultApplicantName={currentUser.fullName || currentUser.username}
      />

      {/* Modal 2: Detalle de Ticket */}
      {selectedTicketForDetail && (
        <TicketDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          ticket={selectedTicketForDetail}
          onTakeTicket={() => handleTakeTicket(selectedTicketForDetail.id)}
          onOpenTechnicalModal={() => setIsTechnicalModalOpen(true)}
          onOpenSuppliesModal={() => setIsSuppliesModalOpen(true)}
          onOpenProvisionalModal={() => setIsProvisionalModalOpen(true)}
          onOpenConformityModal={() => setIsConformityModalOpen(true)}
          onOpenDecommissionModal={() => setIsDecommissionModalOpen(true)}
          onOpenReassignModal={() => setIsReassignModalOpen(true)}
          onUpdateStatus={(st, rs) => handleUpdateStatus(selectedTicketForDetail.id, st, rs)}
          currentUser={currentUser.fullName || currentUser.username}
          isTechnicianOrAdmin={!isReportanteUser(currentUser)}
        />
      )}

      {/* Modal 3: Diagnóstico y Solución Técnica (RF-08, RF-11, RF-14) */}
      {selectedTicketForDetail && (
        <TicketTechnicalModal
          isOpen={isTechnicalModalOpen}
          onClose={() => setIsTechnicalModalOpen(false)}
          ticket={selectedTicketForDetail}
          onSubmit={handleTechnicalDetail}
          currentUser={currentUser.fullName || currentUser.username}
        />
      )}

      {/* Modal 4: Descargo de Insumos de Almacén (RF-09) */}
      {selectedTicketForDetail && (
        <TicketSuppliesModal
          isOpen={isSuppliesModalOpen}
          onClose={() => setIsSuppliesModalOpen(false)}
          ticket={selectedTicketForDetail}
          onSubmit={handleAddSupply}
          currentUser={currentUser.fullName || currentUser.username}
        />
      )}

      {/* Modal 5: Préstamo Provisional de Emergencia (RF-10) */}
      {selectedTicketForDetail && (
        <TicketProvisionalModal
          isOpen={isProvisionalModalOpen}
          onClose={() => setIsProvisionalModalOpen(false)}
          ticket={selectedTicketForDetail}
          onAssign={handleAssignProvisional}
          onReturn={handleReturnProvisional}
          currentUser={currentUser.fullName || currentUser.username}
        />
      )}

      {/* Modal 6: Acta Oficial de Baja Técnica (PDF RF-11, RNF-05) */}
      {selectedTicketForDetail && (
        <DecommissionActModal
          isOpen={isDecommissionModalOpen}
          onClose={() => setIsDecommissionModalOpen(false)}
          ticket={selectedTicketForDetail}
        />
      )}

      {/* Modal 7: Conformidad de Cierre por el Usuario (RF-05) */}
      {selectedTicketForDetail && (
        <UserConformityModal
          isOpen={isConformityModalOpen}
          onClose={() => setIsConformityModalOpen(false)}
          ticket={selectedTicketForDetail}
          onSubmit={handleUserConformity}
        />
      )}

      {/* Modal 8: Reasignación Administrativa de Técnicos (RF-13) */}
      {selectedTicketForDetail && (
        <ReassignModal
          isOpen={isReassignModalOpen}
          onClose={() => setIsReassignModalOpen(false)}
          ticket={selectedTicketForDetail}
          onSubmit={handleReassign}
          currentUser={currentUser.fullName || currentUser.username}
        />
      )}

      {/* Modal 9: Base de Conocimientos (RF-14) */}
      <KnowledgeModal
        isOpen={isKbModalOpen}
        onClose={() => setIsKbModalOpen(false)}
        article={selectedKbArticle}
        mode={kbModalMode}
        onCreate={handleCreateKbArticle}
        onHelpful={handleVoteKbHelpful}
        currentUser={currentUser.fullName || currentUser.username}
      />
    </div>
  );
}
