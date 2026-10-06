import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export interface OrmSecondaryAction {
  label: string;
  route: string;
  variant?: 'outline' | 'ghost' | 'solid';
}

/**
 * Entidad TypeORM mapeada a la tabla física 'core_modules'.
 */
@Entity('core_modules')
export class ModuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 255 })
  iconUrl!: string;

  @Column({ type: 'varchar', length: 255 })
  route!: string;

  @Column({ name: 'accent_color', type: 'varchar', length: 50, default: '#16a34a' })
  accentColor!: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'requires_auth', type: 'boolean', default: true })
  requiresAuth!: boolean;

  @Column({ name: 'secondary_action', type: 'jsonb', nullable: true })
  secondaryAction!: OrmSecondaryAction | null;

  @Column({ name: 'is_under_maintenance', type: 'boolean', default: false })
  isUnderMaintenance!: boolean;

  @Column({ name: 'maintenance_message', type: 'text', nullable: true })
  maintenanceMessage!: string | null;

  @Column({ name: 'estimated_recovery_time', type: 'varchar', length: 255, nullable: true })
  estimatedRecoveryTime!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
