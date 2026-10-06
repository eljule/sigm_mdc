import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficeEntity } from '../entities/office.entity';

interface SeedOfficeItem {
  code: string;
  acronym: string;
  name: string;
  parent: string | null;
  sede?: string;
}

const SEDES = {
  PRINCIPAL: 'PALACIO MUNICIPAL (SEDE PRINCIPAL)',
  BIBLIOTECA: 'SEDE BIBLIOTECA CASTILLA',
  GDH: 'SEDE DESARROLLO HUMANO (GDH)',
  RENTAS: 'SEDE ADMINISTRACIÓN TRIBUTARIA (RENTAS)',
  MAESTRANZA: 'SEDE MAESTRANZA Y SERVICIOS PÚBLICOS',
  MERCADO: 'SEDE MERCADO DE CASTILLA',
  SOCIAL: 'SEDE PROGRAMAS SOCIAL (DEMUNA)',
  ALMACEN: 'SEDE ALMACEN CENTRAL',
  COSC: 'SEDE CENTRO DE OBSERVACION DE SEGURIDAD CIUDADANA (COSC)',
};

const SEED_OFFICES: SeedOfficeItem[] = [
  { code: '01', acronym: 'OR', name: 'OFICINA DE REGIDORES', parent: null, sede: SEDES.PRINCIPAL },
  { code: '02', acronym: 'ALC', name: 'ALCALDÍA', parent: null, sede: SEDES.PRINCIPAL },
  { code: '02.01', acronym: 'OSALC', name: 'OFICINA SECRETARIA DE ALCALDIA', parent: 'ALCALDÍA', sede: SEDES.PRINCIPAL },
  { code: '03', acronym: 'GM', name: 'GERENCIA MUNICIPAL', parent: 'ALCALDÍA', sede: SEDES.PRINCIPAL },
  { code: '03.01', acronym: 'SG', name: 'SECRETARÍA GENERAL', parent: 'GERENCIA MUNICIPAL', sede: SEDES.PRINCIPAL },
  { code: '03.01.01', acronym: 'OGDAC', name: 'OFICINA DE GESTIÓN DOCUMENTARIA Y ATENCIÓN AL CIUDADANO', parent: 'SECRETARÍA GENERAL', sede: SEDES.PRINCIPAL },
  { code: '03.01.01.01', acronym: 'OAC', name: 'OFICINA DE ARCHIVO CENTRAL', parent: 'OFICINA DE GESTIÓN DOCUMENTARIA Y ATENCIÓN AL CIUDADANO', sede: SEDES.PRINCIPAL },
  { code: '03.01.02', acronym: 'OCSRP', name: 'OFICINA DE COMUNICACIÓN SOCIAL Y RELACIONES PÚBLICAS', parent: 'SECRETARÍA GENERAL', sede: SEDES.PRINCIPAL },
  { code: '03.02', acronym: 'OGAF', name: 'OFICINA GENERAL DE ADMINISTRACIÓN Y FINANZAS', parent: 'GERENCIA MUNICIPAL', sede: SEDES.PRINCIPAL },
  { code: '03.02.01', acronym: 'ORH', name: 'OFICINA DE RECURSOS HUMANOS', parent: 'OFICINA GENERAL DE ADMINISTRACIÓN Y FINANZAS', sede: SEDES.PRINCIPAL },
  { code: '03.02.01.01', acronym: 'OCP', name: 'OFICINA DE CONTROL DE PERSONAL', parent: 'OFICINA DE RECURSOS HUMANOS', sede: SEDES.PRINCIPAL },
  { code: '03.02.01.02', acronym: 'OEA', name: 'OFICINA DE ESCALAFON Y ARCHIVO', parent: 'OFICINA DE RECURSOS HUMANOS', sede: SEDES.PRINCIPAL },
  { code: '03.02.01.03', acronym: 'OLRH', name: 'OFICINA DE LEGAL DE RECURSOS HUMANOS', parent: 'OFICINA DE RECURSOS HUMANOS', sede: SEDES.PRINCIPAL },
  { code: '03.02.02', acronym: 'OACP', name: 'OFICINA DE ABASTECIMIENTOS Y CONTROL PATRIMONIAL', parent: 'OFICINA GENERAL DE ADMINISTRACIÓN Y FINANZAS', sede: SEDES.PRINCIPAL },
  { code: '03.02.02.01', acronym: 'OACG', name: 'OFICINA DE ALMACEN CENTRAL GENERAL', parent: 'OFICINA DE ABASTECIMIENTOS Y CONTROL PATRIMONIAL', sede: SEDES.ALMACEN },
  { code: '03.02.02.02', acronym: 'OAC', name: 'OFICINA DE ALMACEN CENTRAL (G. SERVICIOS PUBLICOS)', parent: 'OFICINA DE ABASTECIMIENTOS Y CONTROL PATRIMONIAL', sede: SEDES.MAESTRANZA },
  { code: '03.02.03', acronym: 'OCC', name: 'OFICINA DE CONTABILIDAD Y COSTOS', parent: 'OFICINA GENERAL DE ADMINISTRACIÓN Y FINANZAS', sede: SEDES.PRINCIPAL },
  { code: '03.02.04', acronym: 'OT', name: 'OFICINA DE TESORERÍA', parent: 'OFICINA GENERAL DE ADMINISTRACIÓN Y FINANZAS', sede: SEDES.PRINCIPAL },
  { code: '03.02.05', acronym: 'ODT', name: 'OFICINA DE DESARROLLO TECNOLÓGICO', parent: 'OFICINA GENERAL DE ADMINISTRACIÓN Y FINANZAS', sede: SEDES.PRINCIPAL },
  { code: '03.02.05.01', acronym: 'OSTR', name: 'OFICINA DE SOPORTE TECNICO Y REDES', parent: 'OFICINA DE DESARROLLO TECNOLÓGICO', sede: SEDES.PRINCIPAL },
  { code: '03.03', acronym: 'OGAJ', name: 'OFICINA GENERAL DE ASESORÍA JURÍDICA', parent: 'GERENCIA MUNICIPAL', sede: SEDES.PRINCIPAL },
  { code: '03.04', acronym: 'OGPP', name: 'OFICINA GENERAL DE PLANEAMIENTO Y PRESUPUESTO', parent: 'GERENCIA MUNICIPAL', sede: SEDES.PRINCIPAL },
  { code: '03.04.01', acronym: 'OP', name: 'OFICINA DE PRESUPUESTO', parent: 'OFICINA GENERAL DE PLANEAMIENTO Y PRESUPUESTO', sede: SEDES.PRINCIPAL },
  { code: '03.04.02', acronym: 'OMIE', name: 'OFICINA DE MODERNIZACIÓN INSTITUCIONAL Y ESTADÍSTICA', parent: 'OFICINA GENERAL DE PLANEAMIENTO Y PRESUPUESTO', sede: SEDES.PRINCIPAL },
  { code: '03.05', acronym: 'OHC', name: 'OFICINA DE HITOS DE CONTROL', parent: 'GERENCIA MUNICIPAL', sede: SEDES.PRINCIPAL },
  { code: '04', acronym: 'GAT', name: 'GERENCIA DE ADMINISTRACIÓN TRIBUTARIA', parent: 'GERENCIA MUNICIPAL', sede: SEDES.RENTAS },
  { code: '04.01', acronym: 'SGT', name: 'SUBGERENCIA DE TRIBUTACIÓN', parent: 'GERENCIA DE ADMINISTRACIÓN TRIBUTARIA', sede: SEDES.RENTAS },
  { code: '04.02', acronym: 'SGR', name: 'SUBGERENCIA DE RECAUDACIÓN', parent: 'GERENCIA DE ADMINISTRACIÓN TRIBUTARIA', sede: SEDES.RENTAS },
  { code: '04.03', acronym: 'EC', name: 'EJECUTORÍA COACTIVA', parent: 'GERENCIA DE ADMINISTRACIÓN TRIBUTARIA', sede: SEDES.RENTAS },
  { code: '04.04', acronym: 'SGLA', name: 'SUBGERENCIA DE LICENCIAS Y AUTORIZACIONES', parent: 'GERENCIA DE ADMINISTRACIÓN TRIBUTARIA', sede: SEDES.RENTAS },
  { code: '04.05', acronym: 'SGF', name: 'SUBGERENCIA DE FISCALIZACIÓN', parent: 'GERENCIA DE ADMINISTRACIÓN TRIBUTARIA', sede: SEDES.RENTAS },
  { code: '04.05.01', acronym: 'UFAPM', name: 'UNIDAD DE FISCALIZACIÓN ADMINISTRATIVA Y POLICÍA MUNICIPAL', parent: 'SUBGERENCIA DE FISCALIZACIÓN', sede: SEDES.RENTAS },
  { code: '04.05.01.01', acronym: 'OPM', name: 'OFICINA DE POLICIA MUNICIPAL', parent: 'UNIDAD DE FISCALIZACIÓN ADMINISTRATIVA Y POLICÍA MUNICIPAL', sede: SEDES.RENTAS },
  { code: '05', acronym: 'GDURI', name: 'GERENCIA DE DESARROLLO URBANO-RURAL E INFRAESTRUCTURA', parent: 'GERENCIA MUNICIPAL', sede: SEDES.PRINCIPAL },
  { code: '05.01', acronym: 'SFPIP', name: 'SUBGERENCIA DE FORMULACIÓN DE PROYECTOS DE INVERSIÓN PÚBLICA', parent: 'GERENCIA DE DESARROLLO URBANO-RURAL E INFRAESTRUCTURA', sede: SEDES.PRINCIPAL },
  { code: '05.02', acronym: 'SEPIP', name: 'SUBGERENCIA DE ESTUDIOS Y PROYECTOS DE INVERSIÓN PÚBLICA', parent: 'GERENCIA DE DESARROLLO URBANO-RURAL E INFRAESTRUCTURA', sede: SEDES.PRINCIPAL },
  { code: '05.03', acronym: 'SGO', name: 'SUBGERENCIA DE OBRAS', parent: 'GERENCIA DE DESARROLLO URBANO-RURAL E INFRAESTRUCTURA', sede: SEDES.PRINCIPAL },
  { code: '05.04', acronym: 'SGLO', name: 'SUBGERENCIA DE LIQUIDACIÓN DE OBRAS', parent: 'GERENCIA DE DESARROLLO URBANO-RURAL E INFRAESTRUCTURA', sede: SEDES.PRINCIPAL },
  { code: '05.05', acronym: 'SGC', name: 'SUBGERENCIA DE CATASTRO', parent: 'GERENCIA DE DESARROLLO URBANO-RURAL E INFRAESTRUCTURA', sede: SEDES.PRINCIPAL },
  { code: '05.06', acronym: 'SGSFL', name: 'SUBGERENCIA DE SANEAMIENTO FÍSICO LEGAL', parent: 'GERENCIA DE DESARROLLO URBANO-RURAL E INFRAESTRUCTURA', sede: SEDES.PRINCIPAL },
  { code: '05.07', acronym: 'SGGRD', name: 'SUBGERENCIA DE GESTIÓN DEL RIESGO DE DESASTRES', parent: 'GERENCIA DE DESARROLLO URBANO-RURAL E INFRAESTRUCTURA', sede: SEDES.PRINCIPAL },
  { code: '06', acronym: 'GDEL', name: 'GERENCIA DE DESARROLLO ECONÓMICO LOCAL', parent: 'GERENCIA MUNICIPAL', sede: SEDES.MERCADO },
  { code: '06.01', acronym: 'SGC', name: 'SUBGERENCIA DE COMERCIALIZACIÓN', parent: 'GERENCIA DE DESARROLLO ECONÓMICO LOCAL', sede: SEDES.MERCADO },
  { code: '06.01.01', acronym: 'OAM', name: 'OFICINA DE ADMINISTRACION DE MERCADO', parent: 'SUBGERENCIA DE COMERCIALIZACIÓN', sede: SEDES.MERCADO },
  { code: '06.02', acronym: 'SGPTEI', name: 'SUBGERENCIA DE PROMOCIÓN TURÍSTICA, EMPRESARIAL E INVERSIONES', parent: 'GERENCIA DE DESARROLLO ECONÓMICO LOCAL', sede: SEDES.MERCADO },
  { code: '07', acronym: 'GDH', name: 'GERENCIA DE DESARROLLO HUMANO', parent: 'GERENCIA MUNICIPAL', sede: SEDES.GDH },
  { code: '07.01', acronym: 'SECDR', name: 'SUBGERENCIA DE EDUCACIÓN, CULTURA, DEPORTE Y RECREACIÓN', parent: 'GERENCIA DE DESARROLLO HUMANO', sede: SEDES.SOCIAL },
  { code: '07.02', acronym: 'SGPC', name: 'SUBGERENCIA DE PARTICIPACIÓN CIUDADANA', parent: 'GERENCIA DE DESARROLLO HUMANO', sede: SEDES.SOCIAL },
  { code: '07.03', acronym: 'SGIS', name: 'SUBGERENCIA DE INCLUSIÓN SOCIAL', parent: 'GERENCIA DE DESARROLLO HUMANO', sede: SEDES.SOCIAL },
  { code: '07.03.01', acronym: 'CIAM', name: 'CENTRO INTEGRAL DE ATENCIÓN AL ADULTO MAYOR', parent: 'SUBGERENCIA DE INCLUSIÓN SOCIAL', sede: SEDES.SOCIAL },
  { code: '07.03.02', acronym: 'DEMUNA', name: 'DEFENSORÍA MUNICIPAL DEL NIÑO Y DEL ADOLESCENTE', parent: 'SUBGERENCIA DE INCLUSIÓN SOCIAL', sede: SEDES.SOCIAL },
  { code: '07.03.03', acronym: 'OMAPED', name: 'OFICINA MUNICIPAL DE ATENCIÓN A LA PERSONA CON DISCAPACIDAD', parent: 'SUBGERENCIA DE INCLUSIÓN SOCIAL', sede: SEDES.SOCIAL },
  { code: '07.03.04', acronym: 'PVL', name: 'OFICINA DEL PROGRAMA DEL VASO DE LECHE', parent: 'SUBGERENCIA DE INCLUSIÓN SOCIAL', sede: SEDES.SOCIAL },
  { code: '07.04', acronym: 'SRCPPS', name: 'SUBGERENCIA DE REGISTRO CIVIL, POBLACIÓN Y PROMOCIÓN DE LA SALUD', parent: 'GERENCIA DE DESARROLLO HUMANO', sede: SEDES.SOCIAL },
  { code: '07.04.01', acronym: 'ULE', name: 'OFICINA DE LA UNIDAD LOCAL DE EMPADRONAMIENTO', parent: 'SUBGERENCIA DE REGISTRO CIVIL, POBLACIÓN Y PROMOCIÓN DE LA SALUD', sede: SEDES.SOCIAL },
  { code: '08', acronym: 'GSP', name: 'GERENCIA DE SERVICIOS PÚBLICOS', parent: 'GERENCIA MUNICIPAL', sede: SEDES.MAESTRANZA },
  { code: '08.01', acronym: 'SGGA', name: 'SUBGERENCIA DE GESTIÓN AMBIENTAL', parent: 'GERENCIA DE SERVICIOS PÚBLICOS', sede: SEDES.MAESTRANZA },
  { code: '08.01.01', acronym: 'ULP', name: 'UNIDAD DE LIMPIEZA PÚBLICA', parent: 'SUBGERENCIA DE GESTIÓN AMBIENTAL', sede: SEDES.MAESTRANZA },
  { code: '08.01.02', acronym: 'UPJ', name: 'UNIDAD DE PARQUES Y JARDINES', parent: 'SUBGERENCIA DE GESTIÓN AMBIENTAL', sede: SEDES.MAESTRANZA },
  { code: '08.02', acronym: 'SGSG', name: 'SUBGERENCIA DE SERVICIOS GENERALES', parent: 'GERENCIA DE SERVICIOS PÚBLICOS', sede: SEDES.MAESTRANZA },
  { code: '08.02.01', acronym: 'UTMM', name: 'UNIDAD DE TALLER DE MECÁNICA Y MAESTRANZA', parent: 'SUBGERENCIA DE SERVICIOS GENERALES', sede: SEDES.MAESTRANZA },
  { code: '08.03', acronym: 'STTV', name: 'SUBGERENCIA DE TRANSPORTE, TRÁNSITO Y VIALIDAD', parent: 'GERENCIA DE SERVICIOS PÚBLICOS', sede: SEDES.MAESTRANZA },
  { code: '09', acronym: 'GSC', name: 'GERENCIA SEGURIDAD CIUDADANA', parent: 'GERENCIA MUNICIPAL', sede: SEDES.COSC },
  { code: '09.01', acronym: 'SGS', name: 'SUBGERENCIA DE SERENAZGO', parent: 'GERENCIA SEGURIDAD CIUDADANA', sede: SEDES.COSC },
  { code: '10', acronym: 'OCI', name: 'ÓRGANO DE CONTROL INSTITUCIONAL', parent: 'ALCALDÍA', sede: SEDES.PRINCIPAL },
  { code: '11', acronym: 'PPM', name: 'PROCURADURÍA PÚBLICA MUNICIPAL', parent: 'ALCALDÍA', sede: SEDES.PRINCIPAL },
];

@Injectable()
export class OfficesSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(OfficesSeederService.name);

  constructor(
    @InjectRepository(OfficeEntity)
    private readonly officeRepo: Repository<OfficeEntity>,
  ) { }

  async onApplicationBootstrap() {
    await this.seedOffices();
  }

  async seedOffices() {
    const count = await this.officeRepo.count();
    if (count >= SEED_OFFICES.length) {
      this.logger.log(`Tabla core_offices ya contiene ${count} dependencias. Omitiendo seed.`);
      return;
    }

    this.logger.log(`Sembrando catálogo oficial de ${SEED_OFFICES.length} oficinas y dependencias de la MDC...`);

    // Primera pasada: insertar todas las entidades
    const createdMap = new Map<string, OfficeEntity>();

    for (const item of SEED_OFFICES) {
      const cleanName = item.name.trim().toUpperCase();
      let entity = await this.officeRepo.findOne({ where: { code: item.code } });

      const level = item.code.split('.').length;

      if (!entity) {
        entity = this.officeRepo.create({
          code: item.code,
          acronym: item.acronym.trim().toUpperCase(),
          name: cleanName,
          parentName: item.parent ? item.parent.trim().toUpperCase() : null,
          sede: item.sede || SEDES.PRINCIPAL,
          level,
          isActive: true,
        });
        entity = await this.officeRepo.save(entity);
      } else {
        entity.acronym = item.acronym.trim().toUpperCase();
        entity.name = cleanName;
        entity.parentName = item.parent ? item.parent.trim().toUpperCase() : null;
        entity.sede = item.sede || entity.sede || SEDES.PRINCIPAL;
        entity.level = level;
        entity = await this.officeRepo.save(entity);
      }

      createdMap.set(cleanName, entity);
      createdMap.set(item.code, entity);
    }

    // Segunda pasada: vincular parentId según parentName
    for (const item of SEED_OFFICES) {
      if (item.parent) {
        const cleanParent = item.parent.trim().toUpperCase();
        const parentOffice = createdMap.get(cleanParent);
        const currentOffice = createdMap.get(item.code);

        if (parentOffice && currentOffice && currentOffice.parentId !== parentOffice.id) {
          currentOffice.parentId = parentOffice.id;
          await this.officeRepo.save(currentOffice);
        }
      }
    }

    this.logger.log(`Catálogo de dependencias sembrado exitosamente (${SEED_OFFICES.length} dependencias vinculadas con Sede).`);
  }
}
