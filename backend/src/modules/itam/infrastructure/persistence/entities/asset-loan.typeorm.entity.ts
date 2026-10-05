import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { PersonEntity } from '../../../../../core/people/infrastructure/persistence/entities/person.entity';
import { AssetLoanItemTypeOrmEntity } from './asset-loan-item.typeorm.entity';

@Entity({ name: 'itam_asset_loans' })
export class AssetLoanTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  loanCode!: string; // ej. PREST-2026-0001

  @Column({ type: 'varchar', length: 50, nullable: true })
  loanNumber!: string;

  @Column({ type: 'varchar', length: 150 })
  requestingOffice!: string;

  @Column({ type: 'uuid', nullable: true })
  requestingPersonId!: string | null;

  @ManyToOne(() => PersonEntity, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'requestingPersonId' })
  requestingPerson!: PersonEntity | null;

  @Column({ type: 'varchar', length: 150 })
  borrowerName!: string; // Nombre del solicitante / responsable

  @Column({ type: 'varchar', length: 30 })
  startDate!: string; // YYYY-MM-DD HH:mm

  @Column({ type: 'varchar', length: 30 })
  expectedReturnDate!: string; // YYYY-MM-DD HH:mm

  @Column({ type: 'varchar', length: 30, nullable: true })
  actualReturnDate!: string | null;

  @Column({ type: 'text' })
  eventReason!: string; // Sesión de Concejo, Capacitación Municipal, etc.

  @Column({ type: 'varchar', length: 30, default: 'RESERVADO' })
  status!: string; // RESERVADO, ENTREGADO, DEVUELTO, VENCIDO

  @Column({ type: 'varchar', length: 50, nullable: true })
  returnCondition!: string | null; // BUENO, CON_OBSERVACIONES, DAÑADO

  @Column({ type: 'varchar', length: 150, nullable: true })
  technicianName!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @OneToMany(() => AssetLoanItemTypeOrmEntity, (item) => item.loan, { cascade: true, eager: true })
  items!: AssetLoanItemTypeOrmEntity[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
