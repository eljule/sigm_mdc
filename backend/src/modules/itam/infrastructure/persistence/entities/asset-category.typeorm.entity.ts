import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CustomFieldDefinition } from '../../../domain/entities/asset-category.entity';

@Entity({ name: 'itam_asset_categories' })
export class AssetCategoryTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 30, default: '💻' })
  icon!: string;

  @Column({ type: 'varchar', length: 20, default: '#2563eb' })
  color!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  customFieldsSchema!: CustomFieldDefinition[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
