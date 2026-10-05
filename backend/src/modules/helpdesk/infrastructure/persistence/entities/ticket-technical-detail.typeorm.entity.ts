import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TicketTypeOrmEntity } from './ticket.typeorm.entity';

@Entity({ name: 'helpdesk_ticket_technical_details' })
export class TicketTechnicalDetailTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string;

  @OneToOne(() => TicketTypeOrmEntity, (ticket) => ticket.technicalDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketTypeOrmEntity;

  @Column({ name: 'confirmed_category', type: 'varchar', length: 50, nullable: true })
  confirmedCategory!: string | null;

  @Column({ name: 'real_diagnosis', type: 'text', nullable: true })
  realDiagnosis!: string | null;

  @Column({ name: 'solution_applied', type: 'text', nullable: true })
  solutionApplied!: string | null;

  @Column({ name: 'pause_reason', type: 'text', nullable: true })
  pauseReason!: string | null;

  @Column({ name: 'is_definitive_decommission', type: 'boolean', default: false })
  isDefinitiveDecommission!: boolean;

  @Column({ name: 'decommission_act_number', type: 'varchar', length: 50, nullable: true })
  decommissionActNumber!: string | null;

  @Column({ name: 'decommission_reason', type: 'text', nullable: true })
  decommissionReason!: string | null;

  @Column({ name: 'decommission_destination', type: 'varchar', length: 150, nullable: true })
  decommissionDestination!: string | null;

  @Column({ name: 'technician_observations', type: 'text', nullable: true })
  technicianObservations!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
