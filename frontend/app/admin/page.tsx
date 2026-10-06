'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authService } from '../../src/services/auth.service';
import { adminService } from '../../src/services/admin.service';
import { canAccessModule } from '../../src/utils/auth-guard';
import {
  Person,
  UserDetail,
  RolePreset,
  PersonType,
  DocumentType,
  RoleItem,
  PermissionItem,
  SubsystemPermissionGroup,
  CreateRolePayload,
} from '../../src/types/admin';
import { UserSummary } from '../../src/types/auth';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import {
  ArrowRightIcon,
  UserLoginIcon,
  TicketIcon,
} from '../../src/components/Icons';
import { RolesManagementView } from '../../src/components/admin/RolesManagementView';
import { PermissionsCatalogView } from '../../src/components/admin/PermissionsCatalogView';
import { PermissionAssignmentMatrix } from '../../src/components/admin/PermissionAssignmentMatrix';
import { RoleFormModal } from '../../src/components/admin/RoleFormModal';
import { OfficesManagementView } from '../../src/components/admin/OfficesManagementView';
import { SubsystemsManagementView } from '../../src/components/admin/SubsystemsManagementView';
import { PersonCeaseModal } from '../../src/components/admin/PersonCeaseModal';
import { PersonCeaseDetailModal } from '../../src/components/admin/PersonCeaseDetailModal';
import { PersonFormModal } from '../../src/components/admin/PersonFormModal';
import { CeasePersonResult } from '../../src/types/admin';
import { officeService } from '../../src/services/office.service';
import { OfficeItem } from '../../src/types/office';
import { Pagination } from '../../src/components/Pagination';

type AdminTab =
  | 'dashboard'
  | 'people'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'assignment'
  | 'offices'
  | 'subsystems';

const AVAILABLE_MODULES = [
  {
    code: 'central_dashboard',
    name: 'Dashboard Central y Configuración',
    description: 'Gestión central de usuarios, permisos, personas y tablas maestras.',
    color: '#16a34a',
    icon: '🏢',
    route: '/admin',
  },
  {
    code: 'transport_licenses',
    name: 'Licencias de Transportes',
    description: 'Empadronamiento de mototaxis, licencias clase B y fiscalización.',
    color: '#ea580c',
    icon: '🚗',
    route: '/transportes',
  },
  {
    code: 'it_inventory',
    name: 'Inventario y Gestión TI',
    description: 'Activos de hardware/software (ITAM), dependencias y garantías.',
    color: '#2563eb',
    icon: '💻',
    route: '/itam',
  },
  {
    code: 'helpdesk_support',
    name: 'Soporte Técnico y Helpdesk',
    description: 'Mesa de ayuda informática, tickets y atención a usuarios.',
    color: '#7c3aed',
    icon: '🎧',
    route: '/soporte',
  },
];

const MUNICIPAL_OFFICES = [
  'Oficina de Desarrollo Tecnológico (ODT)',
  'Subgerencia de Transportes y Tránsito',
  'Gerencia de Administración Tributaria (Rentas)',
  'Gerencia Municipal',
  'Secretaría General y Mesa de Partes',
  'Gerencia de Servicios Públicos y Gestión Ambiental',
  'Subgerencia de Seguridad Ciudadana (Serenazgo)',
  'Subgerencia de Fiscalización y Control Municipal',
];

const LABOR_CONDITIONS = [
  'CAS',
  'Nombrado D.L. 276',
  'D.L. 728',
  'Locación de Servicios',
  'CAS - Confianza',
  'Practicante Pre/Profesional',
  'Sin modalidad'
];

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Estados de datos
  const [people, setPeople] = useState<Person[]>([]);
  const [peopleCounts, setPeopleCounts] = useState({ total: 0, personal: 0, administrados: 0 });
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [rolePresets, setRolePresets] = useState<RolePreset[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissionsData, setPermissionsData] = useState<{
    groups: SubsystemPermissionGroup[];
    total: number;
    items: PermissionItem[];
  }>({ groups: [], total: 0, items: [] });
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState<RoleItem | null>(null);
  const [officesList, setOfficesList] = useState<OfficeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtros de personas
  const [peopleFilterType, setPeopleFilterType] = useState<'TODOS' | 'PERSONAL' | 'ADMINISTRADO'>('TODOS');
  const [peopleSearch, setPeopleSearch] = useState<string>('');

  // Modales
  const [showPersonModal, setShowPersonModal] = useState<boolean>(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] = useState<boolean>(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserDetail | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [roleToEdit, setRoleToEdit] = useState<RoleItem | null>(null);
  const [personForCease, setPersonForCease] = useState<Person | null>(null);
  const [personForCeaseDetail, setPersonForCeaseDetail] = useState<Person | null>(null);

  // Paginación para Personas y Usuarios
  const [peoplePage, setPeoplePage] = useState<number>(1);
  const [peoplePageSize, setPeoplePageSize] = useState<number>(10);
  const [usersPage, setUsersPage] = useState<number>(1);
  const [usersPageSize, setUsersPageSize] = useState<number>(10);

  const paginatedPeople = React.useMemo(() => {
    const start = (peoplePage - 1) * peoplePageSize;
    return people.slice(start, start + peoplePageSize);
  }, [people, peoplePage, peoplePageSize]);

  const paginatedUsers = React.useMemo(() => {
    const start = (usersPage - 1) * usersPageSize;
    return users.slice(start, start + usersPageSize);
  }, [users, usersPage, usersPageSize]);



  // Formulario Nuevo Usuario
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'Técnico de Soporte e ITAM',
    allowedModules: ['central_dashboard', 'it_inventory', 'helpdesk_support'],
    personId: '',
  });

  // Notificaciones
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Verificar sesión y cargar datos iniciales con control de acceso
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.replace('/');
      return;
    }

    if (!canAccessModule(user, 'central_dashboard')) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'sigm_access_denied_message',
          'Acceso no autorizado: Su usuario no cuenta con permisos para el panel de Administración Central. Ha sido redirigido a sus módulos habilitados.',
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
      const [peopleData, usersData, presets, rolesData, permData, officesData] = await Promise.all([
        adminService.getPeople(),
        adminService.getUsers(),
        adminService.getRolePresets(),
        adminService.getRoles(),
        adminService.getPermissions(),
        officeService.getOffices(),
      ]);

      setPeople(peopleData.items);
      setPeopleCounts(peopleData.counts);
      setUsers(usersData);
      setRolePresets(presets);
      setRoles(rolesData);
      setPermissionsData(permData);
      setOfficesList(officesData);

      if (rolesData.length > 0) {
        setSelectedRoleForAssignment((prev) => prev || rolesData[0]);
      }
    } catch (e) {
      console.error('Error cargando datos del admin:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejadores de Roles y Permisos
  const handleOpenCreateRole = () => {
    setRoleToEdit(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role: RoleItem) => {
    setRoleToEdit(role);
    setShowRoleModal(true);
  };

  const handleConfigureRolePermissions = (role: RoleItem) => {
    setSelectedRoleForAssignment(role);
    setActiveTab('assignment');
  };

  const handleSaveRole = async (payload: CreateRolePayload, roleId?: string): Promise<boolean> => {
    if (roleId) {
      const res = await adminService.updateRole(roleId, payload);
      if (res.success && res.role) {
        showAlert(`Rol "${res.role.name}" actualizado exitosamente`);
        const updatedRoles = await adminService.getRoles();
        setRoles(updatedRoles);
        return true;
      }
      showAlert(res.error || 'Error al actualizar rol', 'error');
      return false;
    } else {
      const res = await adminService.createRole(payload);
      if (res.success && res.role) {
        showAlert(`Rol "${res.role.name}" creado exitosamente`);
        const updatedRoles = await adminService.getRoles();
        setRoles(updatedRoles);
        return true;
      }
      showAlert(res.error || 'Error al crear rol', 'error');
      return false;
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (role.isSystem) {
      showAlert('No se puede eliminar un rol base del sistema protegido.', 'error');
      return;
    }
    if (!window.confirm(`¿Está seguro de eliminar el rol "${role.name}"? Esta acción revocará dicho perfil.`)) {
      return;
    }
    const res = await adminService.deleteRole(role.id);
    if (res.success) {
      showAlert(`Rol "${role.name}" eliminado correctamente`);
      const updatedRoles = await adminService.getRoles();
      setRoles(updatedRoles);
      if (selectedRoleForAssignment?.id === role.id && updatedRoles.length > 0) {
        setSelectedRoleForAssignment(updatedRoles[0]);
      }
    } else {
      showAlert(res.error || 'Error al eliminar rol', 'error');
    }
  };

  const handleSaveAssignment = async (roleId: string, permissionCodes: string[]): Promise<boolean> => {
    const res = await adminService.assignPermissionsToRole(roleId, permissionCodes);
    if (res.success && res.role) {
      showAlert(`Permisos asignados al rol "${res.role.name}" correctamente`);
      const updatedRoles = await adminService.getRoles();
      setRoles(updatedRoles);
      setSelectedRoleForAssignment(res.role);
      return true;
    }
    showAlert(res.error || 'Error al guardar asignación de permisos', 'error');
    return false;
  };

  // Cargar personas con filtro
  const handleSearchPeople = async () => {
    setPeoplePage(1);
    const data = await adminService.getPeople({
      type: peopleFilterType,
      search: peopleSearch,
    });
    setPeople(data.items);
    setPeopleCounts(data.counts);
  };

  useEffect(() => {
    if (!isLoading) {
      handleSearchPeople();
    }
  }, [peopleFilterType]);

  // Apertura y gestión de formulario de personas (Crear y Modificar)
  const handleOpenCreatePerson = () => {
    setPersonToEdit(null);
    setShowPersonModal(true);
  };

  const handleOpenEditPerson = (person: Person) => {
    setPersonToEdit(person);
    setShowPersonModal(true);
  };

  const handleSavePerson = async (payload: Partial<Person>, personId?: string): Promise<boolean> => {
    try {
      if (personId) {
        const result = await adminService.updatePerson(personId, payload);
        if (result.success && result.person) {
          showAlert(`Persona "${result.person.fullName}" actualizada correctamente`);
          handleSearchPeople();
          return true;
        } else {
          showAlert(result.error || 'Error al actualizar persona', 'error');
          return false;
        }
      } else {
        const result = await adminService.createPerson(payload);
        if (result.success && result.person) {
          showAlert(`Persona "${result.person.fullName}" registrada correctamente`);
          handleSearchPeople();
          return true;
        } else {
          showAlert(result.error || 'Error al registrar persona', 'error');
          return false;
        }
      }
    } catch (e) {
      showAlert(e instanceof Error ? e.message : 'Error al guardar persona', 'error');
      return false;
    }
  };

  // Seleccionar persona para autocompletar usuario
  const handleSelectPersonForUser = (personId: string) => {
    const p = people.find((item) => item.id === personId);
    if (!p) return;

    // Sugerir nombre de usuario: primera letra del nombre + apellido paterno
    const cleanFirst = p.firstName.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = p.paternalSurname.toLowerCase().replace(/[^a-z]/g, '');
    const suggestedUsername = `${cleanFirst.charAt(0)}${cleanLast}`;

    setUserForm((prev) => ({
      ...prev,
      personId: p.id,
      fullName: p.fullName,
      email: p.email || `${suggestedUsername}@castilla.gob.pe`,
      username: suggestedUsername,
      password: 'password123',
    }));
  };

  // Aplicar Preset de Rol a usuario
  const handleApplyRolePreset = (preset: RolePreset) => {
    setUserForm((prev) => ({
      ...prev,
      role: preset.role,
      allowedModules: [...preset.allowedModules],
    }));
  };

  // Alternar módulo en la asignación de permisos
  const handleToggleModuleInUserForm = (moduleCode: string) => {
    setUserForm((prev) => {
      const exists = prev.allowedModules.includes(moduleCode);
      const updated = exists
        ? prev.allowedModules.filter((c) => c !== moduleCode)
        : [...prev.allowedModules, moduleCode];
      return { ...prev, allowedModules: updated };
    });
  };

  // Guardar nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username.trim() || !userForm.password) {
      showAlert('El usuario y contraseña son requeridos', 'error');
      return;
    }

    const payload = {
      ...userForm,
      email: userForm.email?.trim() || undefined,
      personId: userForm.personId || undefined,
    };

    const result = await adminService.createUser(payload);
    if (result.success && result.user) {
      showAlert(`Usuario "${result.user.username}" creado y permisos otorgados con éxito`);
      setShowUserModal(false);
      setUserForm({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'Técnico de Soporte e ITAM',
        allowedModules: ['central_dashboard', 'it_inventory', 'helpdesk_support'],
        personId: '',
      });
      const updatedUsers = await adminService.getUsers();
      setUsers(updatedUsers);
    } else {
      showAlert(result.error || 'Error al crear usuario', 'error');
    }
  };

  // Abrir modal de editar permisos
  const handleOpenEditPermissions = (u: UserDetail) => {
    setSelectedUserForEdit({ ...u });
    setShowEditPermissionsModal(true);
  };

  // Guardar edición de permisos
  const handleSaveEditPermissions = async () => {
    if (!selectedUserForEdit) return;
    const result = await adminService.updatePermissions(
      selectedUserForEdit.id,
      selectedUserForEdit.role,
      selectedUserForEdit.allowedModules,
    );

    if (result.success) {
      showAlert(`Permisos actualizados para ${selectedUserForEdit.username}`);
      setShowEditPermissionsModal(false);
      const updatedUsers = await adminService.getUsers();
      setUsers(updatedUsers);
    } else {
      showAlert(result.error || 'Error al actualizar permisos', 'error');
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Cargando Dashboard Central y Tablas Maestras...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* ========================================================================= */}
      {/* 1. CABECERA PRINCIPAL (HEADER)                                           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 w-full bg-[#0c3b24] dark:bg-slate-900 border-b border-emerald-800 dark:border-slate-800 text-white shadow-md">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Lado izquierdo: Botón menú móvil + Branding */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800/80 transition-colors"
              title="Colapsar / expandir menú"
              aria-label="Alternar menú lateral"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <Image
                src="/images/logo-castilla.png"
                alt="Escudo Castilla"
                width={36}
                height={48}
                priority
                className="w-8 h-auto object-contain drop-shadow"
              />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                  Municipalidad de Castilla &bull; ODT
                </span>
                <span className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none">
                  Dashboard Central y Configuración
                </span>
              </div>
            </div>
          </div>

          {/* Lado derecho: Acciones de cabecera */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Indicador de estado del backend */}
            <div className="hidden md:flex items-center space-x-2 text-[11px] bg-emerald-950/60 dark:bg-slate-800 px-3 py-1 rounded-full border border-emerald-600/30 text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PostgreSQL 16 &bull; NestJS Activo</span>
            </div>

            {/* Botón de regreso al lanzador */}
            <button
              onClick={() => router.push('/modulos')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm border border-emerald-600/50 transition-all hover:-translate-y-0.5"
              title="Ir a la cuadrícula de subsistemas"
            >
              <span>&larr;</span>
              <span className="hidden sm:inline">Lanzador</span>
            </button>

            {/* Selector de Tema */}
            <ThemeToggle />

            {/* Perfil del Usuario Activo */}
            <div className="flex items-center space-x-2 pl-2 border-l border-emerald-800 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-inner">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs">
                <span className="font-bold text-white leading-tight">{currentUser.fullName}</span>
                <span className="text-[10px] text-emerald-300">{currentUser.role}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* ALERTA DE NOTIFICACIÓN FLOTANTE                                          */}
      {/* ========================================================================= */}
      {alert && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 animate-bounce ${alert.type === 'success'
            ? 'bg-emerald-600 text-white border border-emerald-500'
            : 'bg-rose-600 text-white border border-rose-500'
            }`}
        >
          <span>{alert.type === 'success' ? '✓' : '⚠'}</span>
          <span>{alert.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CUERPO PRINCIPAL (SIDEBAR + CONTENIDO)                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ======================================================================= */}
        {/* 2.1 MENÚ LATERAL (SIDEBAR)                                              */}
        {/* ======================================================================= */}
        <aside
          className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 ${sidebarCollapsed ? 'w-16' : 'w-64'
            }`}
        >
          <div className="p-3 space-y-6">
            {/* Navegación Principal */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {!sidebarCollapsed && 'Mantenimiento y Control'}
              </div>
              <nav className="space-y-1">
                {/* 1. Dashboard */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'dashboard'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r-4 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  title="Panel General y Métricas"
                >
                  <span className="text-lg">📊</span>
                  {!sidebarCollapsed && <span>Panel General</span>}
                </button>

                {/* 2. Personas (Administrados vs Personal) */}
                <button
                  onClick={() => setActiveTab('people')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'people'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r-4 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  title="Gestión de Personas (Administrados y Personal)"
                >
                  <span className="text-lg">👥</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Personas</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                        {peopleCounts.total}
                      </span>
                    </div>
                  )}
                </button>

                {/* 3. Usuarios del Sistema */}
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'users'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r-4 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  title="Cuentas de Usuarios Municipales"
                >
                  <span className="text-lg">🔐</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Usuarios</span>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full font-bold">
                        {users.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* 4. Roles Institucionales */}
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'roles'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r-4 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  title="Mantenimiento de Roles Institucionales"
                >
                  <span className="text-lg">🎭</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Roles</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                        {roles.length}
                      </span>
                    </div>
                  )}
                </button>

                {/* 5. Catálogo de Permisos */}
                <button
                  onClick={() => setActiveTab('permissions')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'permissions'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r-4 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  title="Catálogo Maestro de Permisos por Subsistema"
                >
                  <span className="text-lg">🔑</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Permisos</span>
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded-full font-bold">
                        {permissionsData.total}
                      </span>
                    </div>
                  )}
                </button>

                {/* 6. Asignación de Permisos a Roles */}
                <button
                  onClick={() => setActiveTab('assignment')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'assignment'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r-4 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  title="Matriz de Asignación de Permisos por Rol"
                >
                  <span className="text-lg">⚡</span>
                  {!sidebarCollapsed && (
                    <div className="flex-1 flex items-center justify-between text-left">
                      <span>Asignar Permisos</span>
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-black uppercase">
                        Matriz
                      </span>
                    </div>
                  )}
                </button>

                {/* 4. Oficinas y Dependencias */}
                <button
                  onClick={() => setActiveTab('offices')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'offices'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r-4 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  title="Estructura de Oficinas Municipales"
                >
                  <span className="text-lg">🏛️</span>
                  {!sidebarCollapsed && <span>Oficinas & Áreas</span>}
                </button>

                {/* 5. Subsistemas del SIGM */}
                <button
                  onClick={() => setActiveTab('subsystems')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'subsystems'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-r-4 border-emerald-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  title="Catálogo de Subsistemas Activos"
                >
                  <span className="text-lg">⚙️</span>
                  {!sidebarCollapsed && <span>Subsistemas SIGM</span>}
                </button>
              </nav>
            </div>
          </div>

          {/* Pie del Menú Lateral */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
            {!sidebarCollapsed ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">SIGM - Castilla</p>
                <p>Módulo de Administración</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">v13.19.0 &bull; ODT</p>
              </div>
            ) : (
              <div className="text-center font-bold text-emerald-600">ODT</div>
            )}
          </div>
        </aside>

        {/* ======================================================================= */}
        {/* 2.2 ÁREA DE CONTENIDO DINÁMICO                                          */}
        {/* ======================================================================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ===================================================================== */}
          {/* VISTA 1: DASHBOARD / RESUMEN GENERAL                                 */}
          {/* ===================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Encabezado del Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Resumen del Ecosistema SIGM
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Control centralizado de identidades, servidores municipales, ciudadanos y permisos de acceso.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      setActiveTab('people');
                      handleOpenCreatePerson();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <span>+ Registrar Persona</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowUserModal(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <span>+ Nuevo Usuario & Permisos</span>
                  </button>
                </div>
              </div>

              {/* Tarjetas de Métricas Clave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Personas */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Personas en Base de Datos
                    </span>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                      {peopleCounts.total}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {peopleCounts.personal} personal &bull; {peopleCounts.administrados} administrados
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold">
                    👥
                  </div>
                </div>

                {/* Personal Municipal */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Personal Municipal
                    </span>
                    <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                      {peopleCounts.personal}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Colaboradores con modalidad laboral activa
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold">
                    💼
                  </div>
                </div>

                {/* Administrados (Ciudadanos) */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Ciudadanos Administrados
                    </span>
                    <p className="text-3xl font-black text-blue-700 dark:text-blue-400 mt-1">
                      {peopleCounts.administrados}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Vecinos con trámites (Transporte / Rentas)
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xl font-bold">
                    🏛️
                  </div>
                </div>

                {/* Usuarios del Sistema */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Cuentas de Acceso
                    </span>
                    <p className="text-3xl font-black text-purple-700 dark:text-purple-400 mt-1">
                      {users.length}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Usuarios con roles y permisos asignados
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xl font-bold">
                    🔐
                  </div>
                </div>
              </div>

              {/* Subsistemas Activos */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Subsistemas Integrados al SIGM
                    </h3>
                    <p className="text-xs text-slate-500">
                      Módulos orquestados en la plataforma con control de acceso por roles.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    4 de 4 Activos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {AVAILABLE_MODULES.map((mod) => (
                    <div
                      key={mod.code}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{mod.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {mod.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">{mod.code}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {mod.description}
                      </p>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Operativo</span>
                        <a
                          href={mod.route}
                          className="text-xs text-slate-500 hover:text-emerald-700 font-medium"
                        >
                          Abrir &rarr;
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VISTA 2: GESTIÓN DE PERSONAS (ADMINISTRADOS VS PERSONAL)              */}
          {/* ===================================================================== */}
          {activeTab === 'people' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header de Personas */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Tabla Maestra de Personas
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      {peopleCounts.total} registros
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Clasificación fundamental del SIGM: <strong>Personal</strong> (servidores municipales) y{' '}
                    <strong>Administrados</strong> (ciudadanos con trámites en línea o presenciales).
                  </p>
                </div>

                <button
                  onClick={handleOpenCreatePerson}
                  className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all hover:shadow flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Registrar Persona</span>
                </button>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {/* Pestañas de tipo */}
                <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs w-full sm:w-auto">
                  <button
                    onClick={() => setPeopleFilterType('TODOS')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex-1 sm:flex-initial ${peopleFilterType === 'TODOS'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                  >
                    Todos ({peopleCounts.total})
                  </button>
                  <button
                    onClick={() => setPeopleFilterType('PERSONAL')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex-1 sm:flex-initial ${peopleFilterType === 'PERSONAL'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                  >
                    💼 Personal Municipal ({peopleCounts.personal})
                  </button>
                  <button
                    onClick={() => setPeopleFilterType('ADMINISTRADO')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex-1 sm:flex-initial ${peopleFilterType === 'ADMINISTRADO'
                      ? 'bg-white dark:bg-slate-900 text-blue-800 dark:text-blue-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                  >
                    🏛️ Administrados / Ciudadanos ({peopleCounts.administrados})
                  </button>
                </div>

                {/* Buscador */}
                <div className="flex items-center space-x-2 w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Buscar por DNI, RUC, nombre..."
                    value={peopleSearch}
                    onChange={(e) => setPeopleSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchPeople()}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSearchPeople}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-3 font-semibold"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {/* Tabla de Personas */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Documento</th>
                        <th className="py-3 px-4">Clasificación</th>
                        <th className="py-3 px-4">Nombres / Razón Social</th>
                        <th className="py-3 px-4">Contacto</th>
                        <th className="py-3 px-4">Detalle Institucional / Trámite</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {paginatedPeople.map((p) => {
                        const isPersonal = p.type === 'PERSONAL';
                        const isCesado = p.laborStatus === 'CESADO' || (!p.isActive && isPersonal);
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            {/* Documento */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                              <span className="text-[10px] text-slate-400 font-normal mr-1">
                                {p.documentType}:
                              </span>
                              {p.documentNumber}
                            </td>

                            {/* Clasificación */}
                            <td className="py-3.5 px-4">
                              {isPersonal ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                                  <span>💼</span>
                                  <span>Personal</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300/60 dark:border-blue-800">
                                  <span>🏛️</span>
                                  <span>Administrado</span>
                                </span>
                              )}
                            </td>

                            {/* Nombre Completo */}
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                              {p.fullName}
                              {p.businessName && p.documentType === 'RUC' && (
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  Persona Jurídica
                                </span>
                              )}
                            </td>

                            {/* Contacto */}
                            <td className="py-3.5 px-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                              <div className="flex items-center space-x-1">
                                <span>📧</span>
                                <span className="truncate max-w-[160px]">{p.email || '—'}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                                <span>📞</span>
                                <span>{p.phone || '—'}</span>
                              </div>
                            </td>

                            {/* Detalle según sea Personal o Administrado */}
                            <td className="py-3.5 px-4">
                              {isPersonal ? (
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-800 dark:text-slate-200">
                                    {p.position || 'Servidor Municipal'}
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                                    {p.office || 'Municipalidad de Castilla'}
                                  </p>
                                  <span className="inline-block text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                                    {p.laborCondition || 'CAS'}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                                    Ciudadano de a pie
                                  </p>
                                  {p.allowsOnlineAccess ? (
                                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-300/40">
                                      <span>🌐</span>
                                      <span>Habilitado para Trámites en Línea</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">
                                      Trámite Presencial / Mesa de Partes
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Estado */}
                            <td className="py-3.5 px-4 text-center">
                              {isCesado ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800">
                                    <span>🛑</span>
                                    <span>Cesado</span>
                                  </span>
                                  {p.departureDate && (
                                    <span className="block text-[9px] text-slate-400 font-mono">
                                      {p.departureDate}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                                    Activo
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Acciones */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditPerson(p)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[11px] transition-colors inline-flex items-center space-x-1 shadow-xs"
                                  title="Modificar datos de la persona"
                                >
                                  <span>✏️</span>
                                  <span>Editar</span>
                                </button>

                                {isPersonal && (
                                  isCesado ? (
                                    <button
                                      onClick={() => setPersonForCeaseDetail(p)}
                                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors inline-flex items-center space-x-1"
                                      title="Ver detalle del cese laboral"
                                    >
                                      <span>📋</span>
                                      <span>Detalle Cese</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setPersonForCease(p)}
                                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-[11px] transition-colors inline-flex items-center space-x-1 shadow-xs"
                                      title="Registrar Cese Laboral y Entrega de Cargo"
                                    >
                                      <span>🛑</span>
                                      <span>Cese / Baja</span>
                                    </button>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={peoplePage}
                  totalItems={people.length}
                  pageSize={peoplePageSize}
                  onPageChange={setPeoplePage}
                  onPageSizeChange={setPeoplePageSize}
                  itemLabel="personas"
                />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VISTA 3: USUARIOS, ROLES Y PERMISOS (INTUITIVO Y FÁCIL)                */}
          {/* ===================================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Gestión Intuitiva de Usuarios y Permisos
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Cree cuentas de usuario vinculadas a servidores municipales y otorgue permisos por subsistema con un solo clic.
                  </p>
                </div>

                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-4 py-2.5 rounded-lg bg-[#0d6e3c] hover:bg-[#0b5c32] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all hover:shadow flex items-center space-x-2"
                >
                  <span>+</span>
                  <span>Nuevo Usuario con Permisos</span>
                </button>
              </div>

              {/* Plantillas de Roles Rápidos Informativas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {rolePresets.map((preset) => (
                  <div
                    key={preset.role}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: preset.color }}
                        />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {preset.role}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        {preset.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{preset.allowedModules.length} módulos habilitados</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Plantilla</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Listado de Usuarios */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cuentas de Usuario Activas ({users.length})
                  </h3>
                  <span className="text-xs text-slate-400">Haga clic en &quot;Editar Permisos&quot; para ajustar subsistemas</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase font-bold text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Usuario</th>
                        <th className="py-3 px-4">Nombre Completo</th>
                        <th className="py-3 px-4">Rol Principal</th>
                        <th className="py-3 px-4">Subsistemas Autorizados</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                        <th className="py-3 px-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {paginatedUsers.map((u) => {
                        const isRoot = u.username.toUpperCase() === 'ROOT';
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                            {/* Usuario */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                              <span className="inline-flex items-center space-x-1.5">
                                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-700 dark:text-slate-200 font-bold">
                                  {u.username.substring(0, 2).toUpperCase()}
                                </span>
                                <span>{u.username}</span>
                              </span>
                            </td>

                            {/* Nombre Completo */}
                            <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
                              {u.fullName}
                              <span className="block text-[10px] text-slate-400">{u.email}</span>
                            </td>

                            {/* Rol */}
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700">
                                {u.role}
                              </span>
                            </td>

                            {/* Subsistemas Autorizados */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1.5">
                                {isRoot ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                    👑 Todos los subsistemas (Acceso Total)
                                  </span>
                                ) : (
                                  AVAILABLE_MODULES.filter((m) => u.allowedModules.includes(m.code)).map((mod) => (
                                    <span
                                      key={mod.code}
                                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                                      style={{ backgroundColor: mod.color }}
                                      title={mod.name}
                                    >
                                      <span>{mod.icon}</span>
                                      <span className="truncate max-w-[120px]">{mod.name}</span>
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>

                            {/* Estado */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                Activo
                              </span>
                            </td>

                            {/* Acciones */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleOpenEditPermissions(u)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition-colors"
                              >
                                ⚙ Editar Permisos
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={usersPage}
                  totalItems={users.length}
                  pageSize={usersPageSize}
                  onPageChange={setUsersPage}
                  onPageSizeChange={setUsersPageSize}
                  itemLabel="usuarios"
                />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VISTA: MANTENIMIENTO DE ROLES                                        */}
          {/* ===================================================================== */}
          {activeTab === 'roles' && (
            <RolesManagementView
              roles={roles}
              totalPermissionsCount={permissionsData.total}
              onOpenCreateModal={handleOpenCreateRole}
              onEditRole={handleEditRole}
              onDeleteRole={handleDeleteRole}
              onConfigurePermissions={handleConfigureRolePermissions}
            />
          )}

          {/* ===================================================================== */}
          {/* VISTA: CATÁLOGO DE PERMISOS                                          */}
          {/* ===================================================================== */}
          {activeTab === 'permissions' && (
            <PermissionsCatalogView
              groups={permissionsData.groups}
              totalPermissions={permissionsData.total}
            />
          )}

          {/* ===================================================================== */}
          {/* VISTA: MATRIZ DE ASIGNACIÓN DE PERMISOS A ROLES                      */}
          {/* ===================================================================== */}
          {activeTab === 'assignment' && (
            <PermissionAssignmentMatrix
              roles={roles}
              subsystemGroups={permissionsData.groups}
              totalPermissionsCount={permissionsData.total}
              allPermissions={permissionsData.items}
              selectedRoleId={selectedRoleForAssignment?.id}
              onSelectRole={(r) => setSelectedRoleForAssignment(r)}
              onSaveAssignment={handleSaveAssignment}
            />
          )}

          {/* ===================================================================== */}
          {/* VISTA 4: OFICINAS Y DEPENDENCIAS MUNICIPALES                         */}
          {/* ===================================================================== */}
          {activeTab === 'offices' && <OfficesManagementView />}

          {/* ===================================================================== */}
          {/* VISTA 5: SUBSISTEMAS DEL SIGM                                        */}
          {/* ===================================================================== */}
          {activeTab === 'subsystems' && <SubsystemsManagementView />}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: REGISTRAR / MODIFICAR PERSONA (ADMINISTRADO O PERSONAL)        */}
      {/* ========================================================================= */}
      <PersonFormModal
        isOpen={showPersonModal}
        onClose={() => {
          setShowPersonModal(false);
          setPersonToEdit(null);
        }}
        onSave={handleSavePerson}
        personToEdit={personToEdit}
        officesList={officesList}
      />

      {/* ========================================================================= */}
      {/* 4. MODAL: NUEVO USUARIO Y ASIGNACIÓN INTUITIVA DE PERMISOS               */}
      {/* ========================================================================= */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
            >
              &times;
            </button>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              Crear Usuario y Otorgar Permisos
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Vincule una persona municipal y asigne los subsistemas a los que tendrá acceso de forma gráfica.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-5 text-xs">
              {/* Paso 1: Vinculación de Persona */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    1. Vincular Servidor Municipal (Personal):
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Autocompleta nombre y sugerencia de usuario
                  </span>
                </div>

                <select
                  value={userForm.personId}
                  onChange={(e) => handleSelectPersonForUser(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="">-- Seleccionar Persona de la institución (Opcional) --</option>
                  {people
                    .filter((p) => p.type === 'PERSONAL')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} (DNI: {p.documentNumber} - {p.office})
                      </option>
                    ))}
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.fullName}
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                      placeholder="Ej. Juan Alberto Pérez"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Usuario de Ingreso *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      placeholder="Ej. jperez"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contraseña Inicial *
                    </label>
                    <input
                      type="text"
                      required
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Paso 2: Plantillas de Roles Rápidos (1-Clic) */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                  2. Asignación Rápida con Plantilla de Rol:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {rolePresets.map((preset) => (
                    <button
                      key={preset.role}
                      type="button"
                      onClick={() => handleApplyRolePreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${userForm.role === preset.role
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                    >
                      <span className="block font-bold text-xs leading-tight mb-1">
                        {preset.role}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {preset.allowedModules.length} módulos
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paso 3: Selección Gráfica de Subsistemas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800 dark:text-slate-200">
                    3. Módulos Autorizados (Haga clic para encender o apagar):
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {userForm.allowedModules.length} de 4 asignados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = userForm.allowedModules.includes(mod.code);
                    return (
                      <div
                        key={mod.code}
                        onClick={() => handleToggleModuleInUserForm(mod.code)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${isChecked
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-60 hover:opacity-100'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => { }} // Manejado por el onClick del contenedor
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span>{mod.icon}</span>
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {mod.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#0d6e3c] hover:bg-[#0b5c32] text-white font-bold shadow-md flex items-center space-x-2"
                >
                  <span>✓</span>
                  <span>Guardar Usuario y Permisos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: EDITAR PERMISOS DE USUARIO EXISTENTE                            */}
      {/* ========================================================================= */}
      {showEditPermissionsModal && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowEditPermissionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
            >
              &times;
            </button>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
              Editar Permisos de {selectedUserForEdit.username}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Colaborador: <strong>{selectedUserForEdit.fullName}</strong> ({selectedUserForEdit.email})
            </p>

            <div className="space-y-4 text-xs">
              {/* Rol */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Rol Asignado:
                </label>
                <select
                  value={selectedUserForEdit.role}
                  onChange={(e) =>
                    setSelectedUserForEdit({ ...selectedUserForEdit, role: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-bold"
                >
                  {rolePresets.map((p) => (
                    <option key={p.role} value={p.role}>
                      {p.role}
                    </option>
                  ))}
                  <option value="Personalizado">Personalizado</option>
                </select>
              </div>

              {/* Toggles de Subsistemas */}
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Subsistemas Autorizados:
                </label>
                <div className="space-y-2">
                  {AVAILABLE_MODULES.map((mod) => {
                    const isChecked = selectedUserForEdit.allowedModules.includes(mod.code);
                    return (
                      <div
                        key={mod.code}
                        onClick={() => {
                          const exists = selectedUserForEdit.allowedModules.includes(mod.code);
                          const updated = exists
                            ? selectedUserForEdit.allowedModules.filter((c) => c !== mod.code)
                            : [...selectedUserForEdit.allowedModules, mod.code];
                          setSelectedUserForEdit({ ...selectedUserForEdit, allowedModules: updated });
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isChecked
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 opacity-60'
                          }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xl">{mod.icon}</span>
                          <div>
                            <span className="font-bold text-xs">{mod.name}</span>
                            <span className="block text-[10px] text-slate-400">{mod.route}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${isChecked ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                              }`}
                          />
                          <span className="font-bold text-xs">
                            {isChecked ? 'Autorizado' : 'Sin Acceso'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowEditPermissionsModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditPermissions}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Guardar Cambios de Permisos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* 6. MODAL: CREAR / EDITAR ROL INSTITUCIONAL                                */}
      {/* ========================================================================= */}
      <RoleFormModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSave={handleSaveRole}
        initialRole={roleToEdit}
      />

      {/* ========================================================================= */}
      {/* 7. MODAL: CESE LABORAL Y ENTREGA DE CARGO (PERSONAL)                      */}
      {/* ========================================================================= */}
      {personForCease && (
        <PersonCeaseModal
          person={personForCease}
          onClose={() => setPersonForCease(null)}
          onSuccess={(result: CeasePersonResult) => {
            showAlert(
              `Cese laboral registrado con éxito para ${result.fullName}. ${result.returnedAssetsCount} activos retornados a almacén.`
            );
            loadAllData();
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: DETALLE HISTÓRICO DE CESE LABORAL                               */}
      {/* ========================================================================= */}
      {personForCeaseDetail && (
        <PersonCeaseDetailModal
          person={personForCeaseDetail}
          onClose={() => setPersonForCeaseDetail(null)}
        />
      )}
    </div>
  );
}
