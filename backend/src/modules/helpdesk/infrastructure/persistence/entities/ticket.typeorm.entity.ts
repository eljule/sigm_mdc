import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TicketTechnicalDetailTypeOrmEntity } from './ticket-technical-detail.typeorm.entity';
import { TicketSupplyTypeOrmEntity } from './ticket-supply.typeorm.entity';
import { TicketLoanTypeOrmEntity } from './ticket-loan.typeorm.entity';
import { TicketAuditLogTypeOrmEntity } from './ticket-audit-log.typeorm.entity';

export enum TicketStatus {
  ABIERTO = 'ABIERTO',
  EN_ATENCION = 'EN_ATENCION',
  EN_PAUSA = 'EN_PAUSA',
  EN_LABORATORIO = 'EN_LABORATORIO',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO',
  CANCELADO = 'CANCELADO',
}

export enum TicketPriority {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum TicketCategory {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  RED_INTERNET = 'RED_INTERNET',
  PERMISOS = 'PERMISOS',
  OTROS = 'OTROS',
}

@Entity({ name: 'helpdesk_tickets' })
export class TicketTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'ticket_number', type: 'varchar', length: 30 })
  ticketNumber!: string;

  @Column({ name: 'applicant_id', type: 'uuid', nullable: true })
  applicantId!: string | null;

  @Column({ name: 'applicant_name', type: 'varchar', length: 150 })
  applicantName!: string;

  @Column({ name: 'applicant_phone', type: 'varchar', length: 50, nullable: true })
  applicantPhone!: string | null;

  @Column({ name: 'applicant_email', type: 'varchar', length: 120, nullable: true })
  applicantEmail!: string | null;

  @Column({ name: 'office_id', type: 'uuid', nullable: true })
  officeId!: string | null;

  @Column({ name: 'office_name', type: 'varchar', length: 150 })
  officeName!: string;

  @Column({ name: 'asset_id', type: 'uuid', nullable: true })
  assetId!: string | null;

  @Column({ name: 'asset_computer_code', type: 'varchar', length: 50, nullable: true })
  assetComputerCode!: string | null;

  @Column({ name: 'asset_category', type: 'varchar', length: 80, nullable: true })
  assetCategory!: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: TicketCategory.HARDWARE,
  })
  category!: TicketCategory;

  @Column({
    type: 'varchar',
    length: 30,
    default: TicketPriority.MEDIA,
  })
  priority!: TicketPriority;

  @Column({ type: 'varchar', length: 250 })
  subject!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'evidence_photo_url', type: 'text', nullable: true })
  evidencePhotoUrl!: string | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: TicketStatus.ABIERTO,
  })
  status!: TicketStatus;

  @Column({ name: 'assigned_technician_id', type: 'uuid', nullable: true })
  assignedTechnicianId!: string | null;

  @Column({ name: 'assigned_technician_name', type: 'varchar', length: 150, nullable: true })
  assignedTechnicianName!: string | null;

  @Column({ name: 'assigned_technician_phone', type: 'varchar', length: 50, nullable: true })
  assignedTechnicianPhone!: string | null;

  @Column({ name: 'started_at', type: 'timestamp with time zone', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamp with time zone', nullable: true })
  resolvedAt!: Date | null;

  @Column({ name: 'closed_at', type: 'timestamp with time zone', nullable: true })
  closedAt!: Date | null;

  @Column({ name: 'user_conformity', type: 'boolean', nullable: true })
  userConformity!: boolean | null;

  @Column({ name: 'user_rating', type: 'int', nullable: true })
  userRating!: number | null;

  @Column({ name: 'user_feedback', type: 'text', nullable: true })
  userFeedback!: string | null;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked!: boolean;

  @Column({ name: 'locked_by', type: 'varchar', length: 150, nullable: true })
  lockedBy!: string | null;

  @OneToOne(() => TicketTechnicalDetailTypeOrmEntity, (detail) => detail.ticket, {
    cascade: true,
  })
  technicalDetail!: TicketTechnicalDetailTypeOrmEntity;

  @OneToMany(() => TicketSupplyTypeOrmEntity, (supply) => supply.ticket, {
    cascade: true,
  })
  supplies!: TicketSupplyTypeOrmEntity[];

  @OneToMany(() => TicketLoanTypeOrmEntity, (loan) => loan.ticket, {
    cascade: true,
  })
  loans!: TicketLoanTypeOrmEntity[];

  @OneToMany(() => TicketAuditLogTypeOrmEntity, (log) => log.ticket, {
    cascade: true,
  })
  auditLogs!: TicketAuditLogTypeOrmEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt!: Date | null;
}
