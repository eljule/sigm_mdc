import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleEntity } from '../entities/module.entity';

export interface InitialModuleData {
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  route: string;
  accentColor: string;
  order: number;
  isActive: boolean;
  requiresAuth: boolean;
  secondaryAction: {
    label: string;
    route: string;
    variant: 'outline' | 'ghost' | 'solid';
  } | null;
}

export const INITIAL_MODULES: InitialModuleData[] = [
  {
    code: 'central_dashboard',
    name: 'Dashboard Central y Configuración',
    description: 'Núcleo y launcher del SIGM con accesos consolidados, métricas generales y administración de parámetros.',
    iconUrl: 'icons/dashboard.svg',
    route: '/admin',
    accentColor: '#16a34a', // Verde institucional
    order: 1,
    isActive: true,
    requiresAuth: true,
    secondaryAction: null,
  },
  {
    code: 'transport_licenses',
    name: 'Licencias de Transportes',
    description: 'Empadronamiento de vehículos menores, licencias de conducir y registro de mototaxis del distrito.',
    iconUrl: 'icons/transport.svg',
    route: '/transportes',
    accentColor: '#ea580c', // Naranja
    order: 2,
    isActive: true,
    requiresAuth: true,
    secondaryAction: null,
  },
  {
    code: 'it_inventory',
    name: 'Inventario y Gestión TI',
    description: 'Gestión de activos de hardware y software (ITAM), asignación por dependencias y control de garantías.',
    iconUrl: 'icons/inventory.svg',
    route: '/itam',
    accentColor: '#2563eb', // Azul
    order: 3,
    isActive: true,
    requiresAuth: true,
    secondaryAction: null,
  },
  {
    code: 'helpdesk_support',
    name: 'Soporte Técnico y Helpdesk',
    description: 'Mesa de partes y resolución de incidencias informáticas, seguimiento de tickets y atención a usuarios.',
    iconUrl: 'icons/helpdesk.svg',
    route: '/soporte',
    accentColor: '#7c3aed', // Morado
    order: 4,
    isActive: true,
    requiresAuth: true,
    secondaryAction: {
      label: 'Generar Ticket de Soporte',
      route: '/soporte/nuevo-ticket',
      variant: 'outline',
    },
  },
];

@Injectable()
export class ModulesSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ModulesSeederService.name);

  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepo: Repository<ModuleEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    try {
      const count = await this.moduleRepo.count();
      if (count === 0) {
        this.logger.log('Base de datos vacía para core_modules. Inicializando seeder de módulos...');
        for (const mod of INITIAL_MODULES) {
          const entity = this.moduleRepo.create(mod);
          await this.moduleRepo.save(entity);
        }
        this.logger.log(`Seeder completado: ${INITIAL_MODULES.length} módulos cargados con éxito.`);
      } else {
        this.logger.log(`Tabla core_modules ya contiene ${count} registros. Omitiendo seed.`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error al ejecutar el seeder de módulos: ${message}`);
    }
  }
}
