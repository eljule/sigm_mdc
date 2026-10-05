import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TicketTypeOrmEntity,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../entities/ticket.typeorm.entity';
import { TicketTechnicalDetailTypeOrmEntity } from '../entities/ticket-technical-detail.typeorm.entity';
import { TicketSupplyTypeOrmEntity } from '../entities/ticket-supply.typeorm.entity';
import { TicketLoanTypeOrmEntity, TicketLoanStatus } from '../entities/ticket-loan.typeorm.entity';
import { TicketAuditLogTypeOrmEntity } from '../entities/ticket-audit-log.typeorm.entity';
import { KnowledgeArticleTypeOrmEntity } from '../entities/knowledge-article.typeorm.entity';
import { SupplyTypeOrmEntity } from '../../../../itam/infrastructure/persistence/entities/supply.typeorm.entity';
import { AssetTypeOrmEntity } from '../../../../itam/infrastructure/persistence/entities/asset.typeorm.entity';

@Injectable()
export class HelpdeskSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(HelpdeskSeederService.name);

  constructor(
    @InjectRepository(TicketTypeOrmEntity)
    private readonly ticketRepo: Repository<TicketTypeOrmEntity>,
    @InjectRepository(TicketTechnicalDetailTypeOrmEntity)
    private readonly detailRepo: Repository<TicketTechnicalDetailTypeOrmEntity>,
    @InjectRepository(TicketSupplyTypeOrmEntity)
    private readonly ticketSupplyRepo: Repository<TicketSupplyTypeOrmEntity>,
    @InjectRepository(TicketLoanTypeOrmEntity)
    private readonly loanRepo: Repository<TicketLoanTypeOrmEntity>,
    @InjectRepository(TicketAuditLogTypeOrmEntity)
    private readonly auditRepo: Repository<TicketAuditLogTypeOrmEntity>,
    @InjectRepository(KnowledgeArticleTypeOrmEntity)
    private readonly knowledgeRepo: Repository<KnowledgeArticleTypeOrmEntity>,
    @InjectRepository(SupplyTypeOrmEntity)
    private readonly supplyRepo: Repository<SupplyTypeOrmEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepo: Repository<AssetTypeOrmEntity>,
  ) {}

  async onApplicationBootstrap() {
    // Seeders de tickets demostrativos deshabilitados para permitir ingreso de datos reales
  }

  private async seedKnowledgeBase() {
    const count = await this.knowledgeRepo.count();
    if (count > 0) return;

    this.logger.log('Sembrando artículos iniciales en Base de Conocimientos TI...');

    const articles = [
      {
        title: 'Desatasco de papel y limpieza de rodillos en Impresoras Epson EcoTank',
        category: 'HARDWARE',
        summary: 'Guía rápida para solucionar error de atasco de papel o arrastre múltiple en bandejas ADF y frontal.',
        symptoms: 'La impresora emite alerta lumínica de papel atascado o no jala la hoja de oficio.',
        solutionSteps: `1. Apagar el equipo y desconectar el cable de poder.\n2. Abrir la compuerta trasera y retirar cualquier resto de papel trabado jalando suavemente con ambas manos.\n3. Humedecer un hisopo o paño libre de pelusa con alcohol isopropílico y limpiar los rodillos de goma de alimentación.\n4. Reconectar, encender y realizar una prueba de impresión desde el panel de control.`,
        tags: ['Impresoras', 'EcoTank', 'Atasco', 'Hardware'],
        authorTechnicianName: 'Ing. Carlos Mendoza (Soporte TI)',
        viewsCount: 42,
        helpfulCount: 18,
      },
      {
        title: 'Solución a caída de conectividad de red local (IP y DNS municipal)',
        category: 'RED_INTERNET',
        summary: 'Pasos para restablecer conexión de red cuando el ícono de red muestra "Sin acceso a Internet".',
        symptoms: 'No se puede acceder al SIGM, ni a internet ni a carpetas compartidas de la municipalidad.',
        solutionSteps: `1. Verificar conexión física: el conector RJ-45 debe hacer clic y mostrar LED verde/ámbar parpadeando en la tarjeta de red.\n2. Abrir consola cmd como Administrador y ejecutar:\n   ipconfig /release\n   ipconfig /renew\n   ipconfig /flushdns\n3. Si persiste el error, verificar que la tarjeta esté configurada en DHCP o con la IP asignada en el rango 192.168.1.X / 255.255.255.0 con puerta de enlace 192.168.1.1.`,
        tags: ['Redes', 'DHCP', 'Conectividad', 'Ethernet'],
        authorTechnicianName: 'Téc. Roberto Valdiviezo',
        viewsCount: 85,
        helpfulCount: 34,
      },
      {
        title: 'Diagnóstico de reinicios continuos o Pantalla Azul (BSOD) en PCs de Oficina',
        category: 'HARDWARE',
        summary: 'Procedimiento de descarte de memorias RAM sucias y sobrecalentamiento de procesador.',
        symptoms: 'La computadora se reinicia inesperadamente al cabo de unos minutos de uso o muestra pantalla azul con código MEMORY_MANAGEMENT.',
        solutionSteps: `1. Desconectar de la corriente y abrir la tapa lateral del gabinete.\n2. Retirar los módulos de memoria RAM DDR4/DDR3.\n3. Limpiar los contactos dorados con borrador blanco de dibujo y retirar residuos con brocha antiestática.\n4. Comprobar que el disipador del procesador no tenga acumulación de polvo; aplicar pasta térmica si está seca.\n5. Volver a colocar la RAM en los slots 1 y 3 (Dual Channel) y encender.`,
        tags: ['BSOD', 'RAM', 'Mantenimiento', 'PC'],
        authorTechnicianName: 'Ing. Carlos Mendoza (Soporte TI)',
        viewsCount: 63,
        helpfulCount: 22,
      },
      {
        title: 'Asignación de permisos de acceso a carpetas compartidas departamentales',
        category: 'PERMISOS',
        summary: 'Flujo para dar acceso de lectura/escritura a las carpetas en el servidor de archivos municipal.',
        symptoms: 'El usuario recibe el mensaje "Acceso denegado. No tiene permisos para acceder a \\SERVER_MDC\\Documentos".',
        solutionSteps: `1. Validar que la solicitud cuente con la autorización del Jefe de Área o Gerente mediante correo o papeleta.\n2. En el servidor Active Directory, agregar al usuario al grupo de seguridad correspondiente (ej. GRP_FISCALIZACION_RW).\n3. En el cliente, cerrar sesión de Windows y volver a iniciar para refrescar el ticket Kerberos.\n4. Mapear la unidad de red si es necesario: net use Z: \\\\SERVER_MDC\\\\Fiscalizacion /persistent:yes.`,
        tags: ['Permisos', 'Red', 'ActiveDirectory', 'Carpetas'],
        authorTechnicianName: 'Téc. Roberto Valdiviezo',
        viewsCount: 29,
        helpfulCount: 15,
      },
    ];

    for (const art of articles) {
      await this.knowledgeRepo.save(this.knowledgeRepo.create(art));
    }
  }

  private async seedTickets() {
    const count = await this.ticketRepo.count();
    if (count > 0) return;

    this.logger.log('Sembrando tickets de prueba en Helpdesk...');

    // Buscar activo PC y Laptop
    const pcAsset = await this.assetRepo.findOne({ where: { computerCode: 'MDC-TI-PC-0001' } });
    const lapAsset = await this.assetRepo.findOne({ where: { computerCode: 'MDC-TI-LAP-0001' } });
    const prnAsset = await this.assetRepo.findOne({ where: { computerCode: 'MDC-TI-PRN-0001' } });
    const monAsset = await this.assetRepo.findOne({ where: { computerCode: 'MDC-TI-MON-0001' } });

    // Buscar insumo cable y conector
    const tonSupply = await this.supplyRepo.findOne({ where: { code: 'INS-TON-001' } });

    // Ticket 1: Cerrado con visto bueno
    const t1 = await this.ticketRepo.save(
      this.ticketRepo.create({
        ticketNumber: 'TK-2026-00001',
        applicantName: 'Walter Sánchez Navarro',
        applicantPhone: 'Anexo 115',
        applicantEmail: 'wsanchez@castilla.gob.pe',
        officeName: 'Secretaría General y Mesa de Partes',
        assetId: prnAsset?.id || null,
        assetComputerCode: prnAsset?.computerCode || 'MDC-TI-PRN-0001',
        assetCategory: 'Impresora y Multifuncional',
        category: TicketCategory.HARDWARE,
        priority: TicketPriority.MEDIA,
        subject: 'Impresora Epson se atasca constantemente al imprimir resoluciones',
        description: 'Desde ayer en la tarde las hojas membretadas gruesas de mesa de partes no ingresan y se arrugan en el alimentador.',
        status: TicketStatus.CERRADO,
        assignedTechnicianId: null,
        assignedTechnicianName: 'Ing. Carlos Mendoza (Soporte TI)',
        assignedTechnicianPhone: 'Anexo 104',
        startedAt: new Date(Date.now() - 3600000 * 24),
        resolvedAt: new Date(Date.now() - 3600000 * 20),
        closedAt: new Date(Date.now() - 3600000 * 18),
        userConformity: true,
        userRating: 5,
        userFeedback: 'Excelente atención, el técnico limpió los rodillos y ahora jala las hojas con normalidad. Muy rápido.',
      }),
    );

    await this.detailRepo.save(
      this.detailRepo.create({
        ticketId: t1.id,
        confirmedCategory: 'HARDWARE',
        realDiagnosis: 'Acumulación de polvo y residuo de tóner en rodillos de goma de arrastre primario.',
        solutionApplied: 'Limpieza profunda con solución desengrasante isopropílica y calibración de guías laterales de bandeja.',
        isDefinitiveDecommission: false,
      }),
    );

    // Ticket 2: En Laboratorio con Préstamo Provisional de Emergencia (RF-10)
    const t2 = await this.ticketRepo.save(
      this.ticketRepo.create({
        ticketNumber: 'TK-2026-00002',
        applicantName: 'Juan Alberto Pérez Morales',
        applicantPhone: '969123456',
        officeName: 'Gerencia de Seguridad Ciudadana y Serenazgo',
        assetId: monAsset?.id || null,
        assetComputerCode: monAsset?.computerCode || 'MDC-TI-MON-0001',
        assetCategory: 'Monitor de Video',
        category: TicketCategory.HARDWARE,
        priority: TicketPriority.ALTA,
        subject: 'Monitor parpadea y muestra líneas horizontales negras',
        description: 'La pantalla del puesto de monitoreo de cámaras de serenazgo se apaga intermitentemente cada 2 minutos.',
        status: TicketStatus.EN_LABORATORIO,
        assignedTechnicianName: 'Téc. Roberto Valdiviezo',
        assignedTechnicianPhone: 'Anexo 104',
        startedAt: new Date(Date.now() - 3600000 * 4),
        isLocked: true,
        lockedBy: 'Téc. Roberto Valdiviezo',
      }),
    );

    if (monAsset && lapAsset) {
      await this.loanRepo.save(
        this.loanRepo.create({
          ticketId: t2.id,
          temporaryAssetId: lapAsset.id,
          temporaryAssetCode: lapAsset.computerCode,
          temporaryAssetName: `${lapAsset.brand?.name || 'Lenovo'} ${lapAsset.model?.name || 'ThinkPad'} (Laptop de Contingencia)`,
          damagedAssetId: monAsset.id,
          damagedAssetCode: monAsset.computerCode,
          damagedAssetName: `${monAsset.brand?.name || 'Dell'} ${monAsset.model?.name || 'UltraSharp'}`,
          deliveryDate: new Date(Date.now() - 3600000 * 3),
          status: TicketLoanStatus.PRESTADO,
          notes: 'Se prestó equipo de contingencia para no paralizar el monitoreo de serenazgo mientras se repara en laboratorio.',
        }),
      );
    }

    // Ticket 3: En Atención con Insumo Descargado de Almacén (RF-09)
    const t3 = await this.ticketRepo.save(
      this.ticketRepo.create({
        ticketNumber: 'TK-2026-00003',
        applicantName: 'María Elena Gómez Castillo',
        applicantPhone: 'Anexo 102',
        officeName: 'Gerencia Municipal',
        assetId: pcAsset?.id || null,
        assetComputerCode: pcAsset?.computerCode || 'MDC-TI-PC-0001',
        assetCategory: 'PC de Escritorio',
        category: TicketCategory.RED_INTERNET,
        priority: TicketPriority.CRITICA,
        subject: 'Sin acceso a la red de Gerencia Municipal tras remodelación de oficina',
        description: 'El cable que viene de la canaleta se rompió en la pestaña del conector al mover el escritorio.',
        status: TicketStatus.EN_ATENCION,
        assignedTechnicianName: 'Ing. Carlos Mendoza (Soporte TI)',
        assignedTechnicianPhone: 'Anexo 104',
        startedAt: new Date(Date.now() - 3600000 * 1),
        isLocked: true,
        lockedBy: 'Ing. Carlos Mendoza (Soporte TI)',
      }),
    );

    if (tonSupply) {
      await this.ticketSupplyRepo.save(
        this.ticketSupplyRepo.create({
          ticketId: t3.id,
          supplyId: tonSupply.id,
          supplyCode: tonSupply.code,
          supplyName: tonSupply.name,
          quantity: 1,
          unit: 'UND',
          unitCost: tonSupply.unitCost || 0,
          notes: 'Instalación de repuesto consumible para despacho de gerencia.',
        }),
      );
    }

    // Ticket 4: Abierto / Pendiente en cola
    await this.ticketRepo.save(
      this.ticketRepo.create({
        ticketNumber: 'TK-2026-00004',
        applicantName: 'Ana Lucía Farfán Ruiz',
        applicantPhone: 'Anexo 145',
        officeName: 'Subgerencia de Fiscalización y Control',
        category: TicketCategory.PERMISOS,
        priority: TicketPriority.MEDIA,
        subject: 'Solicitud de acceso a carpeta compartida de Resoluciones Sancionadoras',
        description: 'Requiero acceso de lectura y escritura a la ruta de red compartida para subir actas de inspección.',
        status: TicketStatus.ABIERTO,
      }),
    );

    // Ticket 5: Baja Técnica generada (RF-11)
    const t5 = await this.ticketRepo.save(
      this.ticketRepo.create({
        ticketNumber: 'TK-2026-00005',
        applicantName: 'Pedro José Almendras',
        applicantPhone: 'Anexo 130',
        officeName: 'Gerencia de Desarrollo Urbano',
        assetComputerCode: 'MDC-TI-EST-0012',
        assetCategory: 'Estabilizador de Voltaje',
        category: TicketCategory.HARDWARE,
        priority: TicketPriority.ALTA,
        subject: 'Estabilizador emitió humo y chispas con olor a quemado',
        description: 'Durante la tormenta eléctrica el estabilizador sufrió una sobrecarga y ya no entrega energía al plotter.',
        status: TicketStatus.RESUELTO,
        assignedTechnicianName: 'Téc. Roberto Valdiviezo',
        assignedTechnicianPhone: 'Anexo 104',
        startedAt: new Date(Date.now() - 3600000 * 8),
        resolvedAt: new Date(Date.now() - 3600000 * 5),
      }),
    );

    await this.detailRepo.save(
      this.detailRepo.create({
        ticketId: t5.id,
        confirmedCategory: 'HARDWARE',
        realDiagnosis: 'Transformador toroidal y varistores de supresión de picos completamente calcinados por descarga atmosférica.',
        solutionApplied: 'Equipo irreparable por costo de reemplazo superior al valor residual. Se declara inoperativo.',
        isDefinitiveDecommission: true,
        decommissionActNumber: 'ACTA-BAJA-2026-0001',
        decommissionReason: 'Daño irreversible por descarga eléctrica y calcinamiento interno de componentes.',
        decommissionDestination: 'Almacén de Control Patrimonial / Chatarreo Municipal',
      }),
    );

    this.logger.log('Tickets y casos de prueba de Helpdesk sembrados exitosamente.');
  }
}
