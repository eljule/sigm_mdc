import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { AuditVerificationTypeOrmEntity } from './audit-verification.typeorm.entity';

@Entity({ name: 'itam_inventory_audits' })
export class InventoryAuditTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'int' })
  year!: number; // ej. 2026

  @Column({ type: 'varchar', length: 150 })
  title!: string; // ej. Inventario Físico Anual 2026

  @Column({ type: 'varchar', length: 30, default: 'EN_PROCESO' })
  status!: string; // EN_PROCESO, CERRADO

  @Column({ type: 'varchar', length: 20 })
  startDate!: string; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 20, nullable: true })
  closeDate!: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  snapshotData!: Record<string, any>; // Fotografía del inventario al momento del corte

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @OneToMany(() => AuditVerificationTypeOrmEntity, (av) => av.audit, { cascade: true })
  verifications!: AuditVerificationTypeOrmEntity[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
