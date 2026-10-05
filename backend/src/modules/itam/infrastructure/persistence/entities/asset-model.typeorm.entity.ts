import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AssetBrandTypeOrmEntity } from './asset-brand.typeorm.entity';
import { AssetCategoryTypeOrmEntity } from './asset-category.typeorm.entity';

@Entity({ name: 'itam_asset_models' })
export class AssetModelTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'uuid' })
  brandId!: string;

  @ManyToOne(() => AssetBrandTypeOrmEntity, (brand) => brand.models, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brandId' })
  brand!: AssetBrandTypeOrmEntity;

  @Column({ type: 'uuid', nullable: true })
  categoryId!: string | null;

  @ManyToOne(() => AssetCategoryTypeOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category!: AssetCategoryTypeOrmEntity | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
