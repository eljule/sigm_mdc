import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'itam_supplies' })
export class SupplyTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string; // ej. INS-TNR-001, INS-CAB-002

  @Column({ type: 'varchar', length: 150 })
  name!: string; // ej. Tóner HP LaserJet 58A Negro, Bobina Cable UTP Cat 6

  @Column({ type: 'varchar', length: 50, default: 'TONER_TINTA' })
  category!: string; // TONER_TINTA, CABLEADO_RED, CONECTORES, REPUESTOS_HARDWARE, LIMPIEZA

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'int', default: 2 })
  minStock!: number; // Umbral de alerta de stock crítico (< 2 unidades en SRS)

  @Column({ type: 'varchar', length: 30, default: 'UNIDAD' })
  unit!: string; // UNIDAD, CAJA, METRO, BOBINA, PAQUETE

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  unitCost!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location!: string | null; // ej. Almacén ODT - Estante 2

  @Column({ type: 'text', nullable: true })
  compatibleModels!: string | null; // ej. HP LaserJet Pro M404dw, M428fdw

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
