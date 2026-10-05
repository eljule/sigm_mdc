import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TicketTypeOrmEntity } from './ticket.typeorm.entity';

export enum TicketLoanStatus {
  PRESTADO = 'PRESTADO',
  DEVUELTO = 'DEVUELTO',
}

@Entity({ name: 'helpdesk_ticket_loans' })
export class TicketLoanTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string;

  @ManyToOne(() => TicketTypeOrmEntity, (ticket) => ticket.loans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketTypeOrmEntity;

  @Column({ name: 'temporary_asset_id', type: 'uuid' })
  temporaryAssetId!: string;

  @Column({ name: 'temporary_asset_code', type: 'varchar', length: 50 })
  temporaryAssetCode!: string;

  @Column({ name: 'temporary_asset_name', type: 'varchar', length: 150 })
  temporaryAssetName!: string;

  @Column({ name: 'damaged_asset_id', type: 'uuid' })
  damagedAssetId!: string;

  @Column({ name: 'damaged_asset_code', type: 'varchar', length: 50 })
  damagedAssetCode!: string;

  @Column({ name: 'damaged_asset_name', type: 'varchar', length: 150 })
  damagedAssetName!: string;

  @Column({ name: 'delivery_date', type: 'timestamp with time zone' })
  deliveryDate!: Date;

  @Column({ name: 'return_date', type: 'timestamp with time zone', nullable: true })
  returnDate!: Date | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: TicketLoanStatus.PRESTADO,
  })
  status!: TicketLoanStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
