import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { UpperCaseColumnTransformer } from '../../../../../common/transformers/string-sanitizer.transformer';

@Entity('core_offices')
export class OfficeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 30, unique: true })
  code!: string; // ej. '01', '02.01', '03.02.05.01'

  @Index()
  @Column({ type: 'varchar', length: 30, transformer: UpperCaseColumnTransformer })
  acronym!: string; // ej. 'OR', 'ALC', 'ODT', 'OSTR'

  @Column({ type: 'varchar', length: 255, transformer: UpperCaseColumnTransformer })
  name!: string; // ej. 'OFICINA DE DESARROLLO TECNOLÓGICO'

  @Column({ name: 'parent_name', type: 'varchar', length: 255, nullable: true, transformer: UpperCaseColumnTransformer })
  parentName!: string | null;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string | null;

  @ManyToOne(() => OfficeEntity, (office) => office.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: OfficeEntity | null;

  @OneToMany(() => OfficeEntity, (office) => office.parent)
  children?: OfficeEntity[];

  @Index()
  @Column({
    type: 'varchar',
    length: 120,
    default: 'PALACIO MUNICIPAL (SEDE PRINCIPAL)',
    transformer: UpperCaseColumnTransformer,
  })
  sede!: string;

  @Column({ type: 'int', default: 1 })
  level!: number; // 1: Alta Dirección / Gerencia, 2: Subgerencia / Oficina Gral, 3: Oficina, 4: Unidad

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
