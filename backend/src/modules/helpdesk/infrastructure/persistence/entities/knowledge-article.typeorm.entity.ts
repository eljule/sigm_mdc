import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'helpdesk_knowledge_articles' })
export class KnowledgeArticleTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 250 })
  title!: string;

  @Column({ type: 'varchar', length: 50, default: 'HARDWARE' })
  category!: string;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'text', nullable: true })
  symptoms!: string | null;

  @Column({ name: 'solution_steps', type: 'text' })
  solutionSteps!: string;

  @Column({ type: 'simple-array', nullable: true })
  tags!: string[];

  @Column({ name: 'source_ticket_id', type: 'uuid', nullable: true })
  sourceTicketId!: string | null;

  @Column({ name: 'source_ticket_number', type: 'varchar', length: 30, nullable: true })
  sourceTicketNumber!: string | null;

  @Column({ name: 'author_technician_id', type: 'uuid', nullable: true })
  authorTechnicianId!: string | null;

  @Column({ name: 'author_technician_name', type: 'varchar', length: 150 })
  authorTechnicianName!: string;

  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount!: number;

  @Column({ name: 'helpful_count', type: 'int', default: 0 })
  helpfulCount!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date;
}
