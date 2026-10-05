import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Persistence Entities
import { TicketTypeOrmEntity } from './infrastructure/persistence/entities/ticket.typeorm.entity';
import { TicketTechnicalDetailTypeOrmEntity } from './infrastructure/persistence/entities/ticket-technical-detail.typeorm.entity';
import { TicketSupplyTypeOrmEntity } from './infrastructure/persistence/entities/ticket-supply.typeorm.entity';
import { TicketLoanTypeOrmEntity } from './infrastructure/persistence/entities/ticket-loan.typeorm.entity';
import { TicketAuditLogTypeOrmEntity } from './infrastructure/persistence/entities/ticket-audit-log.typeorm.entity';
import { KnowledgeArticleTypeOrmEntity } from './infrastructure/persistence/entities/knowledge-article.typeorm.entity';

// Integration with ITAM module entities
import { SupplyTypeOrmEntity } from '../itam/infrastructure/persistence/entities/supply.typeorm.entity';
import { AssetTypeOrmEntity } from '../itam/infrastructure/persistence/entities/asset.typeorm.entity';

// Controllers
import { HelpdeskTicketsController } from './infrastructure/controllers/helpdesk-tickets.controller';
import { HelpdeskKnowledgeController } from './infrastructure/controllers/helpdesk-knowledge.controller';
import { HelpdeskMetricsController } from './infrastructure/controllers/helpdesk-metrics.controller';

// Use Cases
import { ManageTicketsUseCase } from './application/use-cases/manage-tickets.use-case';
import { ManageTicketDetailsUseCase } from './application/use-cases/manage-ticket-details.use-case';
import { ManageProvisionalLoansUseCase } from './application/use-cases/manage-provisional-loans.use-case';
import { ManageKnowledgeBaseUseCase } from './application/use-cases/manage-knowledge-base.use-case';
import { HelpdeskMetricsUseCase } from './application/use-cases/helpdesk-metrics.use-case';

// Seeders
import { HelpdeskSeederService } from './infrastructure/persistence/seeders/helpdesk.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TicketTypeOrmEntity,
      TicketTechnicalDetailTypeOrmEntity,
      TicketSupplyTypeOrmEntity,
      TicketLoanTypeOrmEntity,
      TicketAuditLogTypeOrmEntity,
      KnowledgeArticleTypeOrmEntity,
      SupplyTypeOrmEntity,
      AssetTypeOrmEntity,
    ]),
  ],
  controllers: [
    HelpdeskTicketsController,
    HelpdeskKnowledgeController,
    HelpdeskMetricsController,
  ],
  providers: [
    ManageTicketsUseCase,
    ManageTicketDetailsUseCase,
    ManageProvisionalLoansUseCase,
    ManageKnowledgeBaseUseCase,
    HelpdeskMetricsUseCase,
    HelpdeskSeederService,
  ],
  exports: [
    ManageTicketsUseCase,
    ManageTicketDetailsUseCase,
    ManageProvisionalLoansUseCase,
    ManageKnowledgeBaseUseCase,
    HelpdeskMetricsUseCase,
  ],
})
export class HelpdeskModule {}
