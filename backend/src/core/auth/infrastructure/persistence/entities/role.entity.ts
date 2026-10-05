import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('core_roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string; // ej: 'admin_central', 'itam_tech'

  @Column({ type: 'varchar', length: 150 })
  name!: string; // ej: 'Administrador Central'

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Index()
  @Column({ name: 'subsystem_code', type: 'varchar', length: 100, default: 'GLOBAL' })
  subsystemCode!: string;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem!: boolean;

  @Column({ name: 'permission_codes', type: 'text', array: true, default: '{}' })
  permissionCodes!: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
