import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TicketTypeOrmEntity } from './ticket.typeorm.entity';

@Entity({ name: 'helpdesk_ticket_supplies' })
export class TicketSupplyTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId!: string;

  @ManyToOne(() => TicketTypeOrmEntity, (ticket) => ticket.supplies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketTypeOrmEntity;

  @Column({ name: 'supply_id', type: 'uuid' })
  supplyId!: string;

  @Column({ name: 'supply_code', type: 'varchar', length: 50 })
  supplyCode!: string;

  @Column({ name: 'supply_name', type: 'varchar', length: 150 })
  supplyName!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'varchar', length: 30, default: 'UND' })
  unit!: string;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  unitCost!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;
}
