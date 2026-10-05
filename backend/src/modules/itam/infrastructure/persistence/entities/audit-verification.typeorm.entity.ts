import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InventoryAuditTypeOrmEntity } from './inventory-audit.typeorm.entity';
import { AssetTypeOrmEntity } from './asset.typeorm.entity';

@Entity({ name: 'itam_audit_verifications' })
@Index(['auditId', 'assetId'], { unique: true })
export class AuditVerificationTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  auditId!: string;

  @ManyToOne(() => InventoryAuditTypeOrmEntity, (audit) => audit.verifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'auditId' })
  audit!: InventoryAuditTypeOrmEntity;

  @Column({ type: 'uuid' })
  assetId!: string;

  @ManyToOne(() => AssetTypeOrmEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId' })
  asset!: AssetTypeOrmEntity;

  @Column({ type: 'varchar', length: 150, nullable: true })
  expectedOffice!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  foundOffice!: string | null;

  @Column({ type: 'varchar', length: 40, default: 'CONCILIADO' })
  status!: string; // CONCILIADO, TRASLADADO_NO_AUTORIZADO, NO_HABIDO, FALTANTE

  @Column({ type: 'varchar', length: 150, nullable: true })
  verifiedBy!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  verifiedAt!: Date;
}
