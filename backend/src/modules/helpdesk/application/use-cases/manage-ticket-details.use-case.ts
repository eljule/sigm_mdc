import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TicketTypeOrmEntity,
  TicketStatus,
} from '../../infrastructure/persistence/entities/ticket.typeorm.entity';
import { TicketTechnicalDetailTypeOrmEntity } from '../../infrastructure/persistence/entities/ticket-technical-detail.typeorm.entity';
import { TicketSupplyTypeOrmEntity } from '../../infrastructure/persistence/entities/ticket-supply.typeorm.entity';
import { TicketAuditLogTypeOrmEntity } from '../../infrastructure/persistence/entities/ticket-audit-log.typeorm.entity';
import { KnowledgeArticleTypeOrmEntity } from '../../infrastructure/persistence/entities/knowledge-article.typeorm.entity';
import { SupplyTypeOrmEntity } from '../../../itam/infrastructure/persistence/entities/supply.typeorm.entity';
import { AssetTypeOrmEntity } from '../../../itam/infrastructure/persistence/entities/asset.typeorm.entity';
import {
  AddTechnicalDetailDto,
  AddSupplyToTicketDto,
} from '../dtos/helpdesk.dto';

@Injectable()
export class ManageTicketDetailsUseCase {
  constructor(
    @InjectRepository(TicketTypeOrmEntity)
    private readonly ticketRepo: Repository<TicketTypeOrmEntity>,
    @InjectRepository(TicketTechnicalDetailTypeOrmEntity)
    private readonly detailRepo: Repository<TicketTechnicalDetailTypeOrmEntity>,
    @InjectRepository(TicketSupplyTypeOrmEntity)
    private readonly ticketSupplyRepo: Repository<TicketSupplyTypeOrmEntity>,
    @InjectRepository(TicketAuditLogTypeOrmEntity)
    private readonly auditRepo: Repository<TicketAuditLogTypeOrmEntity>,
    @InjectRepository(KnowledgeArticleTypeOrmEntity)
    private readonly knowledgeRepo: Repository<KnowledgeArticleTypeOrmEntity>,
    @InjectRepository(SupplyTypeOrmEntity)
    private readonly supplyRepo: Repository<SupplyTypeOrmEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepo: Repository<AssetTypeOrmEntity>,
  ) {}

  async saveTechnicalDetail(ticketId: string, dto: AddTechnicalDetailDto): Promise<TicketTypeOrmEntity> {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId },
      relations: ['technicalDetail'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${ticketId} no encontrado`);
    }

    if (ticket.status === TicketStatus.CERRADO) {
      throw new BadRequestException('No se puede modificar un ticket que ya fue formalmente CERRADO');
    }

    let decommissionActNumber: string | null = null;
    const year = new Date().getFullYear();

    // RF-11: Declarar Inoperativo / Procede a Baja Técnica
    if (dto.isDefinitiveDecommission) {
      const countBajas = await this.detailRepo.count({
        where: { isDefinitiveDecommission: true },
      });
      decommissionActNumber = `ACTA-BAJA-${year}-${String(countBajas + 1).padStart(4, '0')}`;

      // Si el ticket tiene un activo asociado, cambiar su estado en el inventario ITAM
      if (ticket.assetId) {
        const asset = await this.assetRepo.findOne({ where: { id: ticket.assetId } });
        if (asset) {
          asset.status = 'INOPERATIVO';
          asset.notes = (asset.notes || '') + ` [Declarado Inoperativo/Baja técnica por ${dto.technicianName} en Ticket ${ticket.ticketNumber} - Acta ${decommissionActNumber}]`;
          await this.assetRepo.save(asset);
        }
      }
    }

    let detail = ticket.technicalDetail;
    if (!detail) {
      detail = this.detailRepo.create({
        ticketId: ticket.id,
      });
    }

    detail.confirmedCategory = dto.confirmedCategory || ticket.category;
    detail.realDiagnosis = dto.realDiagnosis;
    detail.solutionApplied = dto.solutionApplied;
    detail.technicianObservations = dto.technicianObservations || null;
    detail.isDefinitiveDecommission = dto.isDefinitiveDecommission || false;
    detail.decommissionActNumber = decommissionActNumber || detail.decommissionActNumber || null;
    detail.decommissionReason = dto.decommissionReason || null;
    detail.decommissionDestination = dto.decommissionDestination || 'Almacén Central / Chatarreo';

    await this.detailRepo.save(detail);

    // RF-14: ¿Desea publicar esta solución en la Base de Conocimientos?
    if (dto.publishToKnowledgeBase) {
      const article = this.knowledgeRepo.create({
        title: dto.knowledgeBaseTitle || `${ticket.category}: ${ticket.subject}`,
        category: detail.confirmedCategory || ticket.category,
        summary: `Solución técnica documentada a partir de ticket resuelto ${ticket.ticketNumber}. Diagnóstico: ${dto.realDiagnosis}`,
        symptoms: ticket.description,
        solutionSteps: dto.solutionApplied,
        sourceTicketId: ticket.id,
        sourceTicketNumber: ticket.ticketNumber,
        authorTechnicianName: dto.technicianName,
        tags: [ticket.category, 'TicketResuelto', 'GuíaSoporte'],
      });
      await this.knowledgeRepo.save(article);
    }

    // Actualizar estado del ticket a RESUELTO (RF-12 paso 5)
    ticket.status = TicketStatus.RESUELTO;
    ticket.resolvedAt = new Date();
    await this.ticketRepo.save(ticket);

    // Registrar auditoría
    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId: ticket.id,
        previousStatus: TicketStatus.EN_ATENCION,
        newStatus: TicketStatus.RESUELTO,
        action: dto.isDefinitiveDecommission ? 'SOLUCION_Y_BAJA_TECNICA' : 'SOLUCION_TECNICA_APLICADA',
        performedByUserName: dto.technicianName,
        notes: dto.isDefinitiveDecommission
          ? `Diagnóstico de falla irreparable. Generada Acta de Baja Técnica ${decommissionActNumber}. Solución: ${dto.solutionApplied}`
          : `Diagnóstico verificado: ${dto.realDiagnosis}. Solución técnica registrada: ${dto.solutionApplied}. Pasa a estado RESUELTO a la espera de la conformidad del usuario.`,
      }),
    );

    return this.ticketRepo.findOne({
      where: { id: ticket.id },
      relations: ['technicalDetail', 'supplies', 'loans', 'auditLogs'],
    }) as Promise<TicketTypeOrmEntity>;
  }

  // RF-09: Integración con Almacén de Insumos (Descargo Automático de Stock)
  async addSupply(ticketId: string, dto: AddSupplyToTicketDto): Promise<TicketSupplyTypeOrmEntity> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${ticketId} no encontrado`);
    }

    if (ticket.status === TicketStatus.CERRADO) {
      throw new BadRequestException('No se pueden descargar insumos en un ticket CERRADO');
    }

    const supply = await this.supplyRepo.findOne({ where: { id: dto.supplyId } });
    if (!supply) {
      throw new NotFoundException(`Insumo con ID ${dto.supplyId} no encontrado en almacén`);
    }

    if (supply.stock < dto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente para '${supply.name}'. Stock disponible en almacén: ${supply.stock} ${supply.unit}, Solicitado: ${dto.quantity}`,
      );
    }

    // Descargo automático de stock
    supply.stock -= dto.quantity;
    await this.supplyRepo.save(supply);

    const ticketSupply = this.ticketSupplyRepo.create({
      ticketId: ticket.id,
      supplyId: supply.id,
      supplyCode: supply.code,
      supplyName: supply.name,
      quantity: dto.quantity,
      unit: supply.unit,
      unitCost: supply.unitCost || 0,
      notes: dto.notes || null,
    });

    const savedSupply = await this.ticketSupplyRepo.save(ticketSupply);

    // Auditoría de descargo
    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId: ticket.id,
        previousStatus: ticket.status,
        newStatus: ticket.status,
        action: 'DESCARGO_INSUMO_ALMACEN',
        performedByUserName: dto.technicianName,
        notes: `Descargado de almacén: ${dto.quantity} ${supply.unit} de '${supply.name}' (${supply.code}). Stock restante: ${supply.stock}`,
      }),
    );

    return savedSupply;
  }
}
