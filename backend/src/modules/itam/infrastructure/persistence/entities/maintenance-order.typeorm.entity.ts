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
import { AssetTypeOrmEntity } from './asset.typeorm.entity';
import { MaintenanceSupplyTypeOrmEntity } from './maintenance-supply.typeorm.entity';

@Entity({ name: 'itam_maintenance_orders' })
export class MaintenanceOrderTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string; // ej. OT-MNT-2026-0001

  @Column({ type: 'varchar', length: 50, nullable: true })
  orderNumber!: string;

  @Column({ type: 'uuid' })
  assetId!: string;

  @ManyToOne(() => AssetTypeOrmEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId' })
  asset!: AssetTypeOrmEntity;

  @Column({ type: 'varchar', length: 30, default: 'PREVENTIVO' })
  type!: string; // PREVENTIVO, CORRECTIVO

  @Column({ type: 'varchar', length: 30, default: 'PROGRAMADO' })
  status!: string; // PROGRAMADO, EN_PROCESO, COMPLETADO, CANCELADO

  @Column({ type: 'varchar', length: 20, default: 'MEDIA' })
  priority!: string; // BAJA, MEDIA, ALTA, URGENTE

  @Column({ type: 'varchar', length: 20 })
  scheduledDate!: string; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 20, nullable: true })
  completedDate!: string | null;

  @Column({ type: 'text', nullable: true })
  reportedFailure!: string | null;

  @Column({ type: 'text', nullable: true })
  diagnosis!: string | null;

  @Column({ type: 'text', nullable: true })
  actionsTaken!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  technicianName!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @OneToMany(() => MaintenanceSupplyTypeOrmEntity, (ms) => ms.maintenanceOrder, { cascade: true })
  suppliesUsed!: MaintenanceSupplyTypeOrmEntity[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
