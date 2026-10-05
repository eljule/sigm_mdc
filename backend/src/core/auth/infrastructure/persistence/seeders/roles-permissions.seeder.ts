import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';

export const INITIAL_PERMISSIONS = [
  // central_dashboard
  {
    code: 'admin.users.view',
    name: 'Consultar Usuarios del Sistema',
    description: 'Visualizar el listado y detalle de cuentas de usuario activas en el SIGM.',
    subsystemCode: 'central_dashboard',
    category: 'USUARIOS',
  },
  {
    code: 'admin.users.manage',
    name: 'Crear y Gestionar Usuarios',
    description: 'Crear cuentas, modificar contraseñas y desactivar accesos.',
    subsystemCode: 'central_dashboard',
    category: 'USUARIOS',
  },
  {
    code: 'admin.roles.manage',
    name: 'Gestionar Roles y Asignación de Permisos',
    description: 'Crear roles institucionales y asignar permisos granulares por subsistema.',
    subsystemCode: 'central_dashboard',
    category: 'ROLES_Y_PERMISOS',
  },
  {
    code: 'admin.people.view',
    name: 'Consultar Padrón de Personas',
    description: 'Ver datos de identificación de personal municipal y ciudadanos administrados.',
    subsystemCode: 'central_dashboard',
    category: 'PERSONAS',
  },
  {
    code: 'admin.people.manage',
    name: 'Registrar y Actualizar Personas',
    description: 'Alta y edición de fichas de servidores públicos y administrados con trámite.',
    subsystemCode: 'central_dashboard',
    category: 'PERSONAS',
  },
  {
    code: 'admin.tables.maintain',
    name: 'Mantenimiento de Tablas Maestras',
    description: 'Configuración de catálogo de oficinas, modalidades laborales y subsistemas.',
    subsystemCode: 'central_dashboard',
    category: 'CONFIGURACION',
  },

  // transport_licenses
  {
    code: 'transport.licenses.view',
    name: 'Consultar Licencias de Conducir',
    description: 'Búsqueda de expedientes y estados de licencias clase B (vehículos menores).',
    subsystemCode: 'transport_licenses',
    category: 'LICENCIAS',
  },
  {
    code: 'transport.licenses.issue',
    name: 'Emisión y Revalidación de Licencias',
    description: 'Aprobación de trámites, registro de pagos y emisión física/digital de licencias.',
    subsystemCode: 'transport_licenses',
    category: 'LICENCIAS',
  },
  {
    code: 'transport.vehicles.register',
    name: 'Empadronamiento de Vehículos Menores',
    description: 'Registro de unidades de mototaxis, empresas de transporte y habilitaciones.',
    subsystemCode: 'transport_licenses',
    category: 'VEHICULOS',
  },
  {
    code: 'transport.infractions.manage',
    name: 'Gestión de Infracciones y Sanciones',
    description: 'Registro de actas de control levantadas por inspectores de tránsito.',
    subsystemCode: 'transport_licenses',
    category: 'FISCALIZACION',
  },

  // it_inventory (ITAM)
  {
    code: 'itam.assets.view',
    name: 'Consultar Inventario de Activos TI',
    description: 'Visualizar equipos de cómputo, laptops, servidores, impresoras y software.',
    subsystemCode: 'it_inventory',
    category: 'ACTIVOS',
  },
  {
    code: 'itam.assets.manage',
    name: 'Alta y Edición de Equipos Informáticos',
    description: 'Registrar nuevos activos tecnológicos, seriales, características y garantías.',
    subsystemCode: 'it_inventory',
    category: 'ACTIVOS',
  },
  {
    code: 'itam.assets.assign',
    name: 'Asignación de Activos a Servidores',
    description: 'Vincular equipos a personal y generar actas digitales de asignación.',
    subsystemCode: 'it_inventory',
    category: 'ASIGNACIONES',
  },
  {
    code: 'itam.catalogs.manage',
    name: 'Catálogos de Marcas y Modelos',
    description: 'Mantenimiento de marcas, modelos y categorías de hardware municipal.',
    subsystemCode: 'it_inventory',
    category: 'CATALOGOS',
  },

  // helpdesk_support
  {
    code: 'helpdesk.tickets.view',
    name: 'Consultar Tickets de Incidencias',
    description: 'Ver bandeja de solicitudes de soporte técnico registradas por dependencias.',
    subsystemCode: 'helpdesk_support',
    category: 'TICKETS',
  },
  {
    code: 'helpdesk.tickets.create',
    name: 'Generar Ticket de Soporte Técnico',
    description: 'Permite a cualquier trabajador reportar fallas de hardware, software o red.',
    subsystemCode: 'helpdesk_support',
    category: 'TICKETS',
  },
  {
    code: 'helpdesk.tickets.assign',
    name: 'Asignación de Tickets a Técnicos',
    description: 'Coordinación y delegación de incidencias al personal de soporte TI.',
    subsystemCode: 'helpdesk_support',
    category: 'TICKETS',
  },
  {
    code: 'helpdesk.tickets.resolve',
    name: 'Diagnóstico y Cierre de Tickets (SLA)',
    description: 'Registrar solución técnica aplicada, tiempo de atención y conformidad.',
    subsystemCode: 'helpdesk_support',
    category: 'TICKETS',
  },
  {
    code: 'helpdesk.kb.manage',
    name: 'Base de Conocimiento y Guías',
    description: 'Creación de manuales y soluciones documentadas a problemas frecuentes.',
    subsystemCode: 'helpdesk_support',
    category: 'BASE_CONOCIMIENTO',
  },
];

export const INITIAL_ROLES = [
  {
    name: 'Administrador Central',
    code: 'admin_central',
    description: 'Control absoluto del SIGM: configuración global, personas, usuarios y mantenimiento.',
    subsystemCode: 'GLOBAL',
    isSystem: true,
    permissionCodes: INITIAL_PERMISSIONS.map((p) => p.code),
    isActive: true,
  },
  {
    name: 'Técnico de Soporte e ITAM',
    code: 'itam_tech',
    description: 'Gestión operativa de activos informáticos, marcas, modelos y atención de tickets de soporte.',
    subsystemCode: 'it_inventory',
    isSystem: false,
    permissionCodes: [
      'admin.users.view',
      'itam.assets.view',
      'itam.assets.manage',
      'itam.assets.assign',
      'itam.catalogs.manage',
      'helpdesk.tickets.view',
      'helpdesk.tickets.create',
      'helpdesk.tickets.assign',
      'helpdesk.tickets.resolve',
      'helpdesk.kb.manage',
    ],
    isActive: true,
  },
  {
    name: 'Operador de Transportes',
    code: 'transport_operator',
    description: 'Atención ciudadana para licencias de conducir clase B y empadronamiento de mototaxis.',
    subsystemCode: 'transport_licenses',
    isSystem: false,
    permissionCodes: [
      'transport.licenses.view',
      'transport.licenses.issue',
      'transport.vehicles.register',
      'transport.infractions.manage',
      'helpdesk.tickets.create',
    ],
    isActive: true,
  },
  {
    name: 'Personal General / Reportante',
    code: 'municipal_staff',
    description: 'Colaborador municipal con facultades para registrar solicitudes de soporte técnico.',
    subsystemCode: 'helpdesk_support',
    isSystem: false,
    permissionCodes: ['helpdesk.tickets.create', 'helpdesk.tickets.view'],
    isActive: true,
  },
];

@Injectable()
export class RolesAndPermissionsSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RolesAndPermissionsSeederService.name);

  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    try {
      // 1. Sembrar Permisos
      const permCount = await this.permissionRepo.count();
      if (permCount === 0) {
        this.logger.log('Inicializando catálogo de permisos granulares por subsistema...');
        for (const p of INITIAL_PERMISSIONS) {
          const entity = this.permissionRepo.create({ ...p, isActive: true });
          await this.permissionRepo.save(entity);
        }
        this.logger.log(`Permisos sembrados: ${INITIAL_PERMISSIONS.length} permisos activos.`);
      }

      // 2. Sembrar Roles
      const roleCount = await this.roleRepo.count();
      if (roleCount === 0) {
        this.logger.log('Inicializando roles y asignación inicial de permisos...');
        for (const r of INITIAL_ROLES) {
          const entity = this.roleRepo.create(r);
          await this.roleRepo.save(entity);
        }
        this.logger.log(`Roles sembrados: ${INITIAL_ROLES.length} roles configurados.`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error al ejecutar seeder de roles y permisos: ${message}`);
    }
  }
}
