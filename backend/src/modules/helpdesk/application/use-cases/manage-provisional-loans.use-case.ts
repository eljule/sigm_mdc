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
import {
  TicketLoanTypeOrmEntity,
  TicketLoanStatus,
} from '../../infrastructure/persistence/entities/ticket-loan.typeorm.entity';
import { TicketAuditLogTypeOrmEntity } from '../../infrastructure/persistence/entities/ticket-audit-log.typeorm.entity';
import { AssetTypeOrmEntity } from '../../../itam/infrastructure/persistence/entities/asset.typeorm.entity';
import {
  AssignProvisionalAssetDto,
  ReturnProvisionalAssetDto,
} from '../dtos/helpdesk.dto';

@Injectable()
export class ManageProvisionalLoansUseCase {
  constructor(
    @InjectRepository(TicketTypeOrmEntity)
    private readonly ticketRepo: Repository<TicketTypeOrmEntity>,
    @InjectRepository(TicketLoanTypeOrmEntity)
    private readonly loanRepo: Repository<TicketLoanTypeOrmEntity>,
    @InjectRepository(TicketAuditLogTypeOrmEntity)
    private readonly auditRepo: Repository<TicketAuditLogTypeOrmEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepo: Repository<AssetTypeOrmEntity>,
  ) {}

  async assignProvisional(ticketId: string, dto: AssignProvisionalAssetDto): Promise<TicketLoanTypeOrmEntity> {
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${ticketId} no encontrado`);
    }

    const tempAsset = await this.assetRepo.findOne({ where: { id: dto.temporaryAssetId } });
    if (!tempAsset) {
      throw new NotFoundException(`Activo provisional con ID ${dto.temporaryAssetId} no encontrado`);
    }

    const damagedAsset = await this.assetRepo.findOne({ where: { id: dto.damagedAssetId } });
    if (!damagedAsset) {
      throw new NotFoundException(`Activo averiado con ID ${dto.damagedAssetId} no encontrado`);
    }

    // El activo averiado pasa a estado EN MANTENIMIENTO o en taller
    damagedAsset.status = 'EN_MANTENIMIENTO';
    damagedAsset.notes = (damagedAsset.notes || '') + ` [En Taller/Laboratorio TI por Ticket ${ticket.ticketNumber}]`;
    await this.assetRepo.save(damagedAsset);

    // El activo temporal pasa a estar asignado temporalmente
    tempAsset.notes = (tempAsset.notes || '') + ` [Prestado provisionalmente a ${ticket.applicantName} (${ticket.officeName}) por Ticket ${ticket.ticketNumber}]`;
    await this.assetRepo.save(tempAsset);

    // El ticket puede pasar a EN_LABORATORIO
    if (ticket.status === TicketStatus.EN_ATENCION) {
      ticket.status = TicketStatus.EN_LABORATORIO;
      await this.ticketRepo.save(ticket);
    }

    const loan = this.loanRepo.create({
      ticketId: ticket.id,
      temporaryAssetId: tempAsset.id,
      temporaryAssetCode: tempAsset.computerCode,
      temporaryAssetName: `${tempAsset.category?.name || 'Activo'} - ${tempAsset.brand?.name || ''} ${tempAsset.model?.name || ''}`.trim(),
      damagedAssetId: damagedAsset.id,
      damagedAssetCode: damagedAsset.computerCode,
      damagedAssetName: `${damagedAsset.category?.name || 'Activo'} - ${damagedAsset.brand?.name || ''} ${damagedAsset.model?.name || ''}`.trim(),
      deliveryDate: new Date(),
      status: TicketLoanStatus.PRESTADO,
      notes: dto.notes || null,
    });

    const savedLoan = await this.loanRepo.save(loan);

    // Auditoría
    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId: ticket.id,
        previousStatus: TicketStatus.EN_ATENCION,
        newStatus: ticket.status,
        action: 'ASIGNACION_ACTIVO_PROVISIONAL',
        performedByUserName: dto.technicianName,
        notes: `Asignado activo de reserva provisional '${tempAsset.computerCode}' (${tempAsset.model?.name || 'Reserva'}) al usuario mientras el activo '${damagedAsset.computerCode}' pasa a reparación exhaustiva en Laboratorio TI.`,
      }),
    );

    return savedLoan;
  }

  async returnProvisional(loanId: string, dto: ReturnProvisionalAssetDto): Promise<TicketLoanTypeOrmEntity> {
    const loan = await this.loanRepo.findOne({ where: { id: loanId } });
    if (!loan) {
      throw new NotFoundException(`Registro de préstamo con ID ${loanId} no encontrado`);
    }

    if (loan.status === TicketLoanStatus.DEVUELTO) {
      throw new BadRequestException('Este componente provisional ya fue marcado como retornado');
    }

    loan.status = TicketLoanStatus.DEVUELTO;
    loan.returnDate = new Date();
    if (dto.notes) {
      loan.notes = (loan.notes || '') + ` | Retorno: ${dto.notes}`;
    }

    const savedLoan = await this.loanRepo.save(loan);

    // Restaurar estado de activo averiado a OPERATIVO
    const damagedAsset = await this.assetRepo.findOne({ where: { id: loan.damagedAssetId } });
    if (damagedAsset) {
      damagedAsset.status = 'OPERATIVO';
      await this.assetRepo.save(damagedAsset);
    }

    // Auditoría
    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId: loan.ticketId,
        previousStatus: TicketStatus.EN_LABORATORIO,
        newStatus: TicketStatus.EN_ATENCION,
        action: 'RETORNO_ACTIVO_PROVISIONAL',
        performedByUserName: dto.technicianName,
        notes: `Componente provisional '${loan.temporaryAssetCode}' devuelto al stock de reserva. Activo original reparado '${loan.damagedAssetCode}' reinstalado operativamente.`,
      }),
    );

    return savedLoan;
  }
}
