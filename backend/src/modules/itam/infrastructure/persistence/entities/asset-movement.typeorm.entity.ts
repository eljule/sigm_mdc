import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AssetTypeOrmEntity } from './asset.typeorm.entity';
import { PersonEntity } from '../../../../../core/people/infrastructure/persistence/entities/person.entity';

@Entity({ name: 'itam_asset_movements' })
export class AssetMovementTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  actaNumber!: string; // ej. ACTA-MOV-2026-0001

  @Column({ type: 'uuid' })
  assetId!: string;

  @ManyToOne(() => AssetTypeOrmEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId' })
  asset!: AssetTypeOrmEntity;

  @Column({ type: 'varchar', length: 150, nullable: true })
  fromOffice!: string | null;

  @Column({ type: 'varchar', length: 150 })
  toOffice!: string;

  @Column({ type: 'uuid', nullable: true })
  fromPersonId!: string | null;

  @ManyToOne(() => PersonEntity, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fromPersonId' })
  fromPerson!: PersonEntity | null;

  @Column({ type: 'uuid', nullable: true })
  toPersonId!: string | null;

  @ManyToOne(() => PersonEntity, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'toPersonId' })
  toPerson!: PersonEntity | null;

  @Column({ type: 'varchar', length: 20 })
  movementDate!: string; // YYYY-MM-DD

  @Column({ type: 'varchar', length: 40, default: 'TRANSFERENCIA' })
  movementType!: string; // ASIGNACION_INICIAL, TRANSFERENCIA, DEVOLUCION_ALMACEN, BAJA_TECNICA

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  technicianName!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: false })
  includeChildrenInTransfer!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;
}
