import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TicketTypeOrmEntity,
  TicketStatus,
} from '../../infrastructure/persistence/entities/ticket.typeorm.entity';
import { TicketAuditLogTypeOrmEntity } from '../../infrastructure/persistence/entities/ticket-audit-log.typeorm.entity';
import { AssetTypeOrmEntity } from '../../../itam/infrastructure/persistence/entities/asset.typeorm.entity';
import {
  CreateTicketDto,
  TakeTicketDto,
  UpdateTicketStatusDto,
  UserConformityDto,
  ReassignTechnicianDto,
} from '../dtos/helpdesk.dto';

@Injectable()
export class ManageTicketsUseCase {
  constructor(
    @InjectRepository(TicketTypeOrmEntity)
    private readonly ticketRepo: Repository<TicketTypeOrmEntity>,
    @InjectRepository(TicketAuditLogTypeOrmEntity)
    private readonly auditRepo: Repository<TicketAuditLogTypeOrmEntity>,
    @InjectRepository(AssetTypeOrmEntity)
    private readonly assetRepo: Repository<AssetTypeOrmEntity>,
  ) {}

  async createTicket(dto: CreateTicketDto): Promise<TicketTypeOrmEntity> {
    const year = new Date().getFullYear();
    const count = await this.ticketRepo.count();
    const ticketNumber = `TK-${year}-${String(count + 1).padStart(5, '0')}`;

    // Si se envió código de activo o ID, validamos y completamos datos
    let assetComputerCode = dto.assetComputerCode || null;
    let assetCategory = dto.assetCategory || null;
    let assetId = dto.assetId || null;

    if (assetComputerCode && !assetId) {
      const asset = await this.assetRepo.findOne({
        where: { computerCode: assetComputerCode },
      });
      if (asset) {
        assetId = asset.id;
        assetCategory = asset.category?.name || null;
      }
    }

    const ticket = this.ticketRepo.create({
      ticketNumber,
      applicantName: dto.applicantName,
      applicantPhone: dto.applicantPhone || null,
      applicantEmail: dto.applicantEmail || null,
      applicantId: dto.applicantId || null,
      officeId: dto.officeId || null,
      officeName: dto.officeName,
      assetId,
      assetComputerCode,
      assetCategory,
      category: dto.category,
      priority: dto.priority,
      subject: dto.subject,
      description: dto.description,
      evidencePhotoUrl: dto.evidencePhotoUrl || null,
      status: TicketStatus.ABIERTO,
      isLocked: false,
    });

    const savedTicket = await this.ticketRepo.save(ticket);

    // Registro de auditoría inicial (RNF-04)
    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId: savedTicket.id,
        previousStatus: null,
        newStatus: TicketStatus.ABIERTO,
        action: 'CREACION_TICKET',
        performedByUserName: dto.applicantName,
        notes: `Ticket registrado por ${dto.applicantName} desde ${dto.officeName}. Prioridad: ${dto.priority}`,
      }),
    );

    return this.findTicketById(savedTicket.id);
  }

  async findAllTickets(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    officeName?: string;
    technicianId?: string;
    search?: string;
  }): Promise<TicketTypeOrmEntity[]> {
    const qb = this.ticketRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.technicalDetail', 'td')
      .leftJoinAndSelect('t.supplies', 's')
      .leftJoinAndSelect('t.loans', 'l')
      .leftJoinAndSelect('t.auditLogs', 'al')
      .orderBy('t.createdAt', 'DESC');

    if (filters?.status && filters.status !== 'ALL') {
      qb.andWhere('t.status = :status', { status: filters.status });
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      qb.andWhere('t.priority = :priority', { priority: filters.priority });
    }

    if (filters?.category && filters.category !== 'ALL') {
      qb.andWhere('t.category = :category', { category: filters.category });
    }

    if (filters?.officeName) {
      qb.andWhere('LOWER(t.officeName) LIKE LOWER(:office)', {
        office: `%${filters.officeName}%`,
      });
    }

    if (filters?.technicianId) {
      qb.andWhere('t.assignedTechnicianId = :techId', {
        techId: filters.technicianId,
      });
    }

    if (filters?.search) {
      const term = `%${filters.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(t.ticketNumber) LIKE :term OR LOWER(t.subject) LIKE :term OR LOWER(t.applicantName) LIKE :term OR LOWER(t.assetComputerCode) LIKE :term OR LOWER(t.officeName) LIKE :term)',
        { term },
      );
    }

    return qb.getMany();
  }

  async findTicketById(id: string): Promise<TicketTypeOrmEntity> {
    const ticket = await this.ticketRepo.findOne({
      where: { id },
      relations: ['technicalDetail', 'supplies', 'loans', 'auditLogs'],
      order: {
        auditLogs: {
          timestamp: 'ASC',
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket con ID ${id} no encontrado`);
    }

    return ticket;
  }

  async findMyTickets(applicantName?: string, officeName?: string): Promise<TicketTypeOrmEntity[]> {
    const qb = this.ticketRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.technicalDetail', 'td')
      .leftJoinAndSelect('t.supplies', 's')
      .leftJoinAndSelect('t.loans', 'l')
      .leftJoinAndSelect('t.auditLogs', 'al')
      .orderBy('t.createdAt', 'DESC');

    if (applicantName) {
      qb.andWhere('LOWER(t.applicantName) LIKE LOWER(:applicant)', {
        applicant: `%${applicantName}%`,
      });
    } else if (officeName) {
      qb.andWhere('LOWER(t.officeName) LIKE LOWER(:office)', {
        office: `%${officeName}%`,
      });
    }

    return qb.getMany();
  }

  async takeTicket(id: string, dto: TakeTicketDto): Promise<TicketTypeOrmEntity> {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }

    // Bloqueo de concurrencia (RF-07 y RNF-02)
    if (ticket.status !== TicketStatus.ABIERTO || ticket.isLocked) {
      throw new ConflictException(
        `El ticket ${ticket.ticketNumber} ya fue tomado o está siendo atendido por: ${ticket.assignedTechnicianName || 'otro técnico'}`,
      );
    }

    const previousStatus = ticket.status;
    ticket.status = TicketStatus.EN_ATENCION;
    ticket.isLocked = true;
    ticket.lockedBy = dto.technicianName;
    ticket.assignedTechnicianId = dto.technicianId || null;
    ticket.assignedTechnicianName = dto.technicianName;
    ticket.assignedTechnicianPhone = dto.technicianPhone || 'Anexo 104 (Soporte TI)';
    ticket.startedAt = new Date();

    const saved = await this.ticketRepo.save(ticket);

    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId: ticket.id,
        previousStatus,
        newStatus: TicketStatus.EN_ATENCION,
        action: 'TOMA_TICKET',
        performedByUserId: dto.technicianId || null,
        performedByUserName: dto.technicianName,
        notes: `Ticket tomado para atención inmediata por el técnico ${dto.technicianName}`,
      }),
    );

    return this.findTicketById(saved.id);
  }

  async reassignTicket(id: string, dto: ReassignTechnicianDto): Promise<TicketTypeOrmEntity> {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }

    if (ticket.status === TicketStatus.CERRADO) {
      throw new BadRequestException('Un ticket en estado CERRADO es inmutable');
    }

    const prevTech = ticket.assignedTechnicianName || 'Sin asignar';
    ticket.assignedTechnicianId = dto.technicianId || null;
    ticket.assignedTechnicianName = dto.technicianName;
    ticket.assignedTechnicianPhone = dto.technicianPhone || 'Anexo 104';

    if (ticket.status === TicketStatus.ABIERTO) {
      ticket.status = TicketStatus.EN_ATENCION;
      ticket.startedAt = new Date();
      ticket.isLocked = true;
      ticket.lockedBy = dto.technicianName;
    }

    const saved = await this.ticketRepo.save(ticket);

    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId: ticket.id,
        previousStatus: ticket.status,
        newStatus: ticket.status,
        action: 'REASIGNACION_TECNICO',
        performedByUserName: dto.assignedBy,
        notes: `Reasignado por coordinación a ${dto.technicianName} (Anterior: ${prevTech}). Motivo: ${dto.reason || 'Balanceo de carga de trabajo'}`,
      }),
    );

    return this.findTicketById(saved.id);
  }

  async updateTicketStatus(id: string, dto: UpdateTicketStatusDto): Promise<TicketTypeOrmEntity> {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }

    if (ticket.status === TicketStatus.CERRADO) {
      throw new BadRequestException('El ticket se encuentra CERRADO y es inmutable (RNF-04)');
    }

    if (dto.status === TicketStatus.EN_PAUSA && (!dto.reason || dto.reason.trim() === '')) {
      throw new BadRequestException('Para pausar un ticket es obligatorio ingresar el motivo');
    }

    const previousStatus = ticket.status;
    ticket.status = dto.status;

    if (dto.status === TicketStatus.RESUELTO) {
      ticket.resolvedAt = new Date();
    } else if (dto.status === TicketStatus.CERRADO) {
      ticket.closedAt = new Date();
      ticket.isLocked = false;
    } else if (dto.status === TicketStatus.EN_ATENCION) {
      if (!ticket.startedAt) ticket.startedAt = new Date();
    }

    const saved = await this.ticketRepo.save(ticket);

    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId: ticket.id,
        previousStatus,
        newStatus: dto.status,
        action: `CAMBIO_ESTADO_${dto.status}`,
        performedByUserName: dto.userName,
        notes: dto.reason || dto.technicianNotes || `Transición de estado a ${dto.status}`,
      }),
    );

    return this.findTicketById(saved.id);
  }

  async userConformity(id: string, dto: UserConformityDto): Promise<TicketTypeOrmEntity> {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} no encontrado`);
    }

    if (ticket.status !== TicketStatus.RESUELTO) {
      throw new BadRequestException('La conformidad del usuario solo se puede otorgar a tickets en estado RESUELTO');
    }

    const previousStatus = ticket.status;
    ticket.userConformity = dto.userConformity;
    ticket.userRating = dto.userRating || 5;
    ticket.userFeedback = dto.userFeedback || null;

    if (dto.userConformity) {
      ticket.status = TicketStatus.CERRADO;
      ticket.closedAt = new Date();
      ticket.isLocked = false;
    } else {
      // Si el usuario rechaza la solución, vuelve a atención
      ticket.status = TicketStatus.EN_ATENCION;
    }

    const saved = await this.ticketRepo.save(ticket);

    await this.auditRepo.save(
      this.auditRepo.create({
        ticketId: ticket.id,
        previousStatus,
        newStatus: ticket.status,
        action: dto.userConformity ? 'CONFORMIDAD_CIERRE_USUARIO' : 'RECHAZO_SOLUCION_USUARIO',
        performedByUserName: dto.applicantName,
        notes: dto.userConformity
          ? `Usuario otorgó su VISTO BUENO. Calificación: ${dto.userRating || 5}/5. Feedback: ${dto.userFeedback || 'Sin comentarios'}`
          : `Usuario no conforme con la solución. Observación: ${dto.userFeedback || 'Equipo sigue presentando falla'}. Retorna a estado EN_ATENCION.`,
      }),
    );

    return this.findTicketById(saved.id);
  }

  async lookupAssetByCode(code: string): Promise<any> {
    const cleanCode = code.trim();
    const asset = await this.assetRepo.findOne({
      where: [{ computerCode: cleanCode }, { patrimonialCode: cleanCode }],
      relations: ['childAssets'],
    });

    if (!asset) {
      throw new NotFoundException(`Activo con código o QR '${cleanCode}' no fue localizado en el inventario`);
    }

    return {
      id: asset.id,
      computerCode: asset.computerCode,
      patrimonialCode: asset.patrimonialCode,
      brandName: asset.brand?.name || '',
      modelName: asset.model?.name || '',
      categoryName: asset.category?.name || '',
      status: asset.status,
      office: asset.office,
      assignedPersonName: asset.assignedPerson
        ? `${asset.assignedPerson.firstName} ${asset.assignedPerson.paternalSurname}`.trim()
        : null,
      specifications: asset.specifications,
      childAssets: asset.childAssets?.map((c) => ({
        id: c.id,
        computerCode: c.computerCode,
        categoryName: c.category?.name || '',
        modelName: c.model?.name || '',
      })),
    };
  }
}
