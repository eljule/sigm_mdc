import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'itam_software' })
export class SoftwareTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string; // ej. Windows 11 Pro, Office 2024 LTSC, AutoCAD Civil 3D

  @Column({ type: 'varchar', length: 50, nullable: true })
  version!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  developer!: string | null; // ej. Microsoft, Autodesk, Kaspersky

  @Column({ type: 'varchar', length: 40, default: 'OEM' })
  licenseType!: string; // OEM, RETAIL, VOLUMEN, OPEN_SOURCE, SUSCRIPCION

  @Column({ type: 'varchar', length: 255, nullable: true })
  licenseKey!: string | null;

  @Column({ type: 'int', default: 1 })
  totalLicenses!: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  expirationDate!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
