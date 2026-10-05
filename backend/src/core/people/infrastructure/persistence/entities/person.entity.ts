import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import {
  UpperCaseColumnTransformer,
  LowerCaseColumnTransformer,
} from '../../../../../common/transformers/string-sanitizer.transformer';

@Entity('core_people')
export class PersonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 30 }) // 'ADMINISTRADO' | 'PERSONAL'
  type!: string;

  @Column({ name: 'document_type', type: 'varchar', length: 20, default: 'DNI' })
  documentType!: string;

  @Index({ unique: true })
  @Column({ name: 'document_number', type: 'varchar', length: 50, unique: true })
  documentNumber!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, transformer: UpperCaseColumnTransformer })
  firstName!: string;

  @Column({ name: 'paternal_surname', type: 'varchar', length: 100, transformer: UpperCaseColumnTransformer })
  paternalSurname!: string;

  @Column({ name: 'maternal_surname', type: 'varchar', length: 100, nullable: true, transformer: UpperCaseColumnTransformer })
  maternalSurname!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, transformer: LowerCaseColumnTransformer })
  email!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  // Atributos de PERSONAL
  @Column({ type: 'varchar', length: 150, nullable: true, transformer: UpperCaseColumnTransformer })
  position!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true, transformer: UpperCaseColumnTransformer })
  office!: string | null;

  @Column({ name: 'labor_condition', type: 'varchar', length: 100, nullable: true, transformer: UpperCaseColumnTransformer })
  laborCondition!: string | null;

  @Column({ name: 'entry_date', type: 'varchar', length: 30, nullable: true })
  entryDate!: string | null;

  // Atributos de ADMINISTRADO
  @Column({ name: 'business_name', type: 'varchar', length: 255, nullable: true, transformer: UpperCaseColumnTransformer })
  businessName!: string | null;

  @Column({ name: 'allows_online_access', type: 'boolean', default: false })
  allowsOnlineAccess!: boolean;

  // Atributos de Cese y Situación Laboral
  @Column({ name: 'labor_status', type: 'varchar', length: 30, default: 'ACTIVO', transformer: UpperCaseColumnTransformer })
  laborStatus!: string; // 'ACTIVO' | 'CESADO'

  @Column({ name: 'departure_date', type: 'varchar', length: 30, nullable: true })
  departureDate!: string | null;

  @Column({ name: 'cessation_reason', type: 'varchar', length: 255, nullable: true, transformer: UpperCaseColumnTransformer })
  cessationReason!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
