import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TicketTypeOrmEntity } from './ticket.typeorm.entity';

@Entity({ name: 'helpdesk_ticket_audit_logs' })
export class TicketAuditLogTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string;

  @ManyToOne(() => TicketTypeOrmEntity, (ticket) => ticket.auditLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketTypeOrmEntity;

  @Column({ name: 'previous_status', type: 'varchar', length: 50, nullable: true })
  previousStatus!: string | null;

  @Column({ name: 'new_status', type: 'varchar', length: 50 })
  newStatus!: string;

  @Column({ type: 'varchar', length: 60 })
  action!: string;

  @Column({ name: 'performed_by_user_id', type: 'uuid', nullable: true })
  performedByUserId!: string | null;

  @Column({ name: 'performed_by_user_name', type: 'varchar', length: 150 })
  performedByUserName!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp!: Date;
}
