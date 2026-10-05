import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleEntity } from '../core/modules-registry/infrastructure/persistence/entities/module.entity';
import { UserEntity } from '../core/auth/infrastructure/persistence/entities/user.entity';
import { RoleEntity } from '../core/auth/infrastructure/persistence/entities/role.entity';
import { PermissionEntity } from '../core/auth/infrastructure/persistence/entities/permission.entity';
import { PersonEntity } from '../core/people/infrastructure/persistence/entities/person.entity';
import { OfficeEntity } from '../core/offices/infrastructure/persistence/entities/office.entity';
import { AssetCategoryTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/asset-category.typeorm.entity';
import { AssetBrandTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/asset-brand.typeorm.entity';
import { AssetModelTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/asset-model.typeorm.entity';
import { AssetTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/asset.typeorm.entity';
import { SoftwareTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/software.typeorm.entity';
import { AssetSoftwareTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/asset-software.typeorm.entity';
import { AssetMovementTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/asset-movement.typeorm.entity';
import { SupplyTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/supply.typeorm.entity';
import { MaintenanceOrderTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/maintenance-order.typeorm.entity';
import { MaintenanceSupplyTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/maintenance-supply.typeorm.entity';
import { AssetLoanTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/asset-loan.typeorm.entity';
import { AssetLoanItemTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/asset-loan-item.typeorm.entity';
import { InventoryAuditTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/inventory-audit.typeorm.entity';
import { AuditVerificationTypeOrmEntity } from '../modules/itam/infrastructure/persistence/entities/audit-verification.typeorm.entity';

import { TicketTypeOrmEntity } from '../modules/helpdesk/infrastructure/persistence/entities/ticket.typeorm.entity';
import { TicketTechnicalDetailTypeOrmEntity } from '../modules/helpdesk/infrastructure/persistence/entities/ticket-technical-detail.typeorm.entity';
import { TicketSupplyTypeOrmEntity } from '../modules/helpdesk/infrastructure/persistence/entities/ticket-supply.typeorm.entity';
import { TicketLoanTypeOrmEntity } from '../modules/helpdesk/infrastructure/persistence/entities/ticket-loan.typeorm.entity';
import { TicketAuditLogTypeOrmEntity } from '../modules/helpdesk/infrastructure/persistence/entities/ticket-audit-log.typeorm.entity';
import { KnowledgeArticleTypeOrmEntity } from '../modules/helpdesk/infrastructure/persistence/entities/knowledge-article.typeorm.entity';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'database'),
      port: Number(configService.get<number>('DB_PORT', 5432)),
      username: configService.get<string>('DB_USERNAME', 'postgres'),
      password: configService.get<string>('DB_PASSWORD', 'postgres_castilla_secret'),
      database: configService.get<string>('DB_DATABASE', 'sigm_mdc_db'),
      entities: [
        ModuleEntity,
        UserEntity,
        RoleEntity,
        PermissionEntity,
        PersonEntity,
        OfficeEntity,
        AssetCategoryTypeOrmEntity,
        AssetBrandTypeOrmEntity,
        AssetModelTypeOrmEntity,
        AssetTypeOrmEntity,
        SoftwareTypeOrmEntity,
        AssetSoftwareTypeOrmEntity,
        AssetMovementTypeOrmEntity,
        SupplyTypeOrmEntity,
        MaintenanceOrderTypeOrmEntity,
        MaintenanceSupplyTypeOrmEntity,
        AssetLoanTypeOrmEntity,
        AssetLoanItemTypeOrmEntity,
        InventoryAuditTypeOrmEntity,
        AuditVerificationTypeOrmEntity,
        TicketTypeOrmEntity,
        TicketTechnicalDetailTypeOrmEntity,
        TicketSupplyTypeOrmEntity,
        TicketLoanTypeOrmEntity,
        TicketAuditLogTypeOrmEntity,
        KnowledgeArticleTypeOrmEntity,
      ],
      autoLoadEntities: true,
      synchronize: configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
      logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
    };
  },
};
