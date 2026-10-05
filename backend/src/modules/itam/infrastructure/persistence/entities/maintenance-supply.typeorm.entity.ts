import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MaintenanceOrderTypeOrmEntity } from './maintenance-order.typeorm.entity';
import { SupplyTypeOrmEntity } from './supply.typeorm.entity';

@Entity({ name: 'itam_maintenance_supplies' })
export class MaintenanceSupplyTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  maintenanceOrderId!: string;

  @ManyToOne(() => MaintenanceOrderTypeOrmEntity, (mo) => mo.suppliesUsed, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'maintenanceOrderId' })
  maintenanceOrder!: MaintenanceOrderTypeOrmEntity;

  @Column({ type: 'uuid' })
  supplyId!: string;

  @ManyToOne(() => SupplyTypeOrmEntity, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplyId' })
  supply!: SupplyTypeOrmEntity;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  unitCost!: number;
}
