import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { AssetCategoryTypeOrmEntity } from './asset-category.typeorm.entity';
import { AssetBrandTypeOrmEntity } from './asset-brand.typeorm.entity';
import { AssetModelTypeOrmEntity } from './asset-model.typeorm.entity';
import { PersonEntity } from '../../../../../core/people/infrastructure/persistence/entities/person.entity';

@Entity({ name: 'itam_assets' })
export class AssetTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 60, unique: true })
  computerCode!: string; // ej. MDC-TI-PC-0001 o MDC-TI-000123

  @Index()
  @Column({ type: 'varchar', length: 60, nullable: true })
  patrimonialCode!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber!: string | null;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => AssetCategoryTypeOrmEntity, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category!: AssetCategoryTypeOrmEntity;

  @Column({ type: 'uuid' })
  brandId!: string;

  @ManyToOne(() => AssetBrandTypeOrmEntity, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'brandId' })
  brand!: AssetBrandTypeOrmEntity;

  @Column({ type: 'uuid' })
  modelId!: string;

  @ManyToOne(() => AssetModelTypeOrmEntity, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'modelId' })
  model!: AssetModelTypeOrmEntity;

  // RF-05: Relación Jerárquica Componentes (Padre - Hijo)
  @Column({ type: 'uuid', nullable: true })
  parentAssetId!: string | null;

  @ManyToOne(() => AssetTypeOrmEntity, (asset) => asset.childAssets, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentAssetId' })
  parentAsset!: AssetTypeOrmEntity | null;

  @OneToMany(() => AssetTypeOrmEntity, (asset) => asset.parentAsset)
  childAssets!: AssetTypeOrmEntity[];

  @Column({ type: 'varchar', length: 40, nullable: true })
  color!: string | null;

  @Column({ type: 'varchar', length: 30, default: 'OPERATIVO' })
  status!: string;

  @Column({ type: 'varchar', length: 30, default: 'BUENO' })
  physicalCondition!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  office!: string | null;

  @Column({ type: 'uuid', nullable: true })
  assignedPersonId!: string | null;

  @ManyToOne(() => PersonEntity, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignedPersonId' })
  assignedPerson!: PersonEntity | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  acquisitionDate!: string | null;

  // Garantías y Proveedores (Mejora 3 del SRS)
  @Column({ type: 'varchar', length: 150, nullable: true })
  supplier!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  warrantyEndDate!: string | null;

  // RF-17: Catálogo de Activos para Préstamo
  @Column({ type: 'boolean', default: false })
  isLoanable!: boolean;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  specifications!: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  // RNF-05: Integridad / Borrado lógico (Soft delete)
  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt!: Date | null;
}
