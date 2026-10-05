import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AssetLoanTypeOrmEntity } from './asset-loan.typeorm.entity';
import { AssetTypeOrmEntity } from './asset.typeorm.entity';

@Entity({ name: 'itam_asset_loan_items' })
export class AssetLoanItemTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  loanId!: string;

  @ManyToOne(() => AssetLoanTypeOrmEntity, (loan) => loan.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan!: AssetLoanTypeOrmEntity;

  @Column({ type: 'uuid' })
  assetId!: string;

  @ManyToOne(() => AssetTypeOrmEntity, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'assetId' })
  asset!: AssetTypeOrmEntity;
}
