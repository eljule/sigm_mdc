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
import { SoftwareTypeOrmEntity } from './software.typeorm.entity';

@Entity({ name: 'itam_asset_software' })
@Index(['assetId', 'softwareId'], { unique: true })
export class AssetSoftwareTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  assetId!: string;

  @ManyToOne(() => AssetTypeOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId' })
  asset!: AssetTypeOrmEntity;

  @Column({ type: 'uuid' })
  softwareId!: string;

  @ManyToOne(() => SoftwareTypeOrmEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'softwareId' })
  software!: SoftwareTypeOrmEntity;

  @Column({ type: 'varchar', length: 255, nullable: true })
  licenseKeyUsed!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  installedAt!: Date;
}
