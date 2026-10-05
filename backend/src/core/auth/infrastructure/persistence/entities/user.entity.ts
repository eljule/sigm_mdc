import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import {
  LowerCaseColumnTransformer,
  UpperCaseColumnTransformer,
} from '../../../../../common/transformers/string-sanitizer.transformer';

@Entity('core_users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true, transformer: LowerCaseColumnTransformer })
  username!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, transformer: UpperCaseColumnTransformer })
  fullName!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, transformer: LowerCaseColumnTransformer })
  email!: string;

  @Column({ type: 'varchar', length: 100, default: 'Operador' })
  role!: string;

  @Column({ name: 'allowed_modules', type: 'text', array: true, default: '{}' })
  allowedModules!: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'person_id', type: 'uuid', nullable: true })
  personId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
