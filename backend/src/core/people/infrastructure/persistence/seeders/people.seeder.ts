import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonEntity } from '../entities/person.entity';

export const INITIAL_PEOPLE = [
  // PERSONAL MUNICIPAL
  {
    type: 'PERSONAL',
    documentType: 'DNI',
    documentNumber: '45821903',
    firstName: 'Juan Alberto',
    paternalSurname: 'Pérez',
    maternalSurname: 'Morales',
    email: 'jperez@sigm.gob.pe',
    phone: '969123456',
    address: 'Calle Ayacucho 450, Castilla',
    position: 'Técnico de Soporte e ITAM',
    office: 'Oficina de Desarrollo Tecnológico (ODT)',
    laborCondition: 'CAS',
    entryDate: '2023-03-01',
    businessName: null,
    allowsOnlineAccess: false,
    isActive: true,
  },
  {
    type: 'PERSONAL',
    documentType: 'DNI',
    documentNumber: '40192837',
    firstName: 'María Elena',
    paternalSurname: 'Gómez',
    maternalSurname: 'Castillo',
    email: 'mgomez@sigm.gob.pe',
    phone: '968765432',
    address: 'Av. Junín 120, El Indio, Castilla',
    position: 'Operador de Transportes y Licencias',
    office: 'Subgerencia de Transportes y Tránsito',
    laborCondition: 'Nombrado D.L. 276',
    entryDate: '2019-06-15',
    businessName: null,
    allowsOnlineAccess: false,
    isActive: true,
  },
  {
    type: 'PERSONAL',
    documentType: 'DNI',
    documentNumber: '08192844',
    firstName: 'Carlos Eduardo',
    paternalSurname: 'Mendoza',
    maternalSurname: 'Ruiz',
    email: 'admin@castilla.gob.pe',
    phone: '956098712',
    address: 'Urb. Miraflores Mz. B Lt. 14, Castilla',
    position: 'Jefe de Sistemas y Transformación Digital',
    office: 'Oficina de Desarrollo Tecnológico (ODT)',
    laborCondition: 'CAS Directivo',
    entryDate: '2022-01-10',
    businessName: null,
    allowsOnlineAccess: false,
    isActive: true,
  },
  {
    type: 'PERSONAL',
    documentType: 'DNI',
    documentNumber: '47120938',
    firstName: 'Walter',
    paternalSurname: 'Sánchez',
    maternalSurname: 'Navarro',
    email: 'wsanchez@castilla.gob.pe',
    phone: '945678123',
    address: 'Calle Tacna 310, Castilla',
    position: 'Inspector Municipal de Tránsito',
    office: 'Subgerencia de Transportes y Tránsito',
    laborCondition: 'Locación de Servicios',
    entryDate: '2024-02-01',
    businessName: null,
    allowsOnlineAccess: false,
    isActive: true,
  },

  // ADMINISTRADOS (Ciudadanos de a pie de Castilla)
  {
    type: 'ADMINISTRADO',
    documentType: 'DNI',
    documentNumber: '02849182',
    firstName: 'Rosa Luz',
    paternalSurname: 'Flores',
    maternalSurname: 'Morales',
    email: 'rosa.flores@gmail.com',
    phone: '984512390',
    address: 'Asentamiento Humano Chiclayito Mz. F Lt. 8, Castilla',
    position: null,
    office: null,
    laborCondition: null,
    entryDate: null,
    businessName: null,
    allowsOnlineAccess: true, // Trámite de empadronamiento de mototaxi
    isActive: true,
  },
  {
    type: 'ADMINISTRADO',
    documentType: 'DNI',
    documentNumber: '41920394',
    firstName: 'Roberto Carlos',
    paternalSurname: 'Sandoval',
    maternalSurname: 'Peña',
    email: 'roberto.sandoval.piura@hotmail.com',
    phone: '978123049',
    address: 'Calle Los Ángeles 215, Campo Polo, Castilla',
    position: null,
    office: null,
    laborCondition: null,
    entryDate: null,
    businessName: null,
    allowsOnlineAccess: true, // Trámite de licencia de conducir clase B
    isActive: true,
  },
  {
    type: 'ADMINISTRADO',
    documentType: 'RUC',
    documentNumber: '20601928374',
    firstName: 'Inversiones & Servicios',
    paternalSurname: 'El Chira',
    maternalSurname: 'S.A.C.',
    email: 'gerencia@elchirasac.pe',
    phone: '073345678',
    address: 'Av. Progreso 1420, Castilla',
    position: null,
    office: null,
    laborCondition: null,
    entryDate: null,
    businessName: 'Inversiones & Servicios El Chira S.A.C.',
    allowsOnlineAccess: true, // Trámites tributarios / rentas
    isActive: true,
  },
  {
    type: 'ADMINISTRADO',
    documentType: 'DNI',
    documentNumber: '03819201',
    firstName: 'Jorge Luis',
    paternalSurname: 'Zapata',
    maternalSurname: 'Seminario',
    email: 'jorge.zapata@yahoo.es',
    phone: '942109834',
    address: 'Calle Ramón Castilla 504, Cercado de Castilla',
    position: null,
    office: null,
    laborCondition: null,
    entryDate: null,
    businessName: null,
    allowsOnlineAccess: false,
    isActive: true,
  },
];

@Injectable()
export class PeopleSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PeopleSeederService.name);

  constructor(
    @InjectRepository(PersonEntity)
    private readonly personRepo: Repository<PersonEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  async seed(): Promise<void> {
    try {
      const count = await this.personRepo.count();
      this.logger.log(`Tabla core_people contiene ${count} registros. Modo producción/datos reales activo.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error al verificar tabla core_people: ${message}`);
    }
  }
}
