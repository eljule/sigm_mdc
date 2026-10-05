import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Persistence Entities
import { AssetCategoryTypeOrmEntity } from './infrastructure/persistence/entities/asset-category.typeorm.entity';
import { AssetBrandTypeOrmEntity } from './infrastructure/persistence/entities/asset-brand.typeorm.entity';
import { AssetModelTypeOrmEntity } from './infrastructure/persistence/entities/asset-model.typeorm.entity';
import { AssetTypeOrmEntity } from './infrastructure/persistence/entities/asset.typeorm.entity';
import { SoftwareTypeOrmEntity } from './infrastructure/persistence/entities/software.typeorm.entity';
import { AssetSoftwareTypeOrmEntity } from './infrastructure/persistence/entities/asset-software.typeorm.entity';
import { AssetMovementTypeOrmEntity } from './infrastructure/persistence/entities/asset-movement.typeorm.entity';
import { SupplyTypeOrmEntity } from './infrastructure/persistence/entities/supply.typeorm.entity';
import { MaintenanceOrderTypeOrmEntity } from './infrastructure/persistence/entities/maintenance-order.typeorm.entity';
import { MaintenanceSupplyTypeOrmEntity } from './infrastructure/persistence/entities/maintenance-supply.typeorm.entity';
import { AssetLoanTypeOrmEntity } from './infrastructure/persistence/entities/asset-loan.typeorm.entity';
import { AssetLoanItemTypeOrmEntity } from './infrastructure/persistence/entities/asset-loan-item.typeorm.entity';
import { InventoryAuditTypeOrmEntity } from './infrastructure/persistence/entities/inventory-audit.typeorm.entity';
import { AuditVerificationTypeOrmEntity } from './infrastructure/persistence/entities/audit-verification.typeorm.entity';
import { PersonEntity } from '../../core/people/infrastructure/persistence/entities/person.entity';

// Ports
import { AssetCategoryRepositoryPort } from './domain/ports/asset-category.repository.port';
import { AssetBrandRepositoryPort } from './domain/ports/asset-brand.repository.port';
import { AssetModelRepositoryPort } from './domain/ports/asset-model.repository.port';
import { AssetRepositoryPort } from './domain/ports/asset.repository.port';

// Repositories Adapters
import { TypeOrmAssetCategoryRepository } from './infrastructure/persistence/adapters/typeorm-asset-category.repository';
import { TypeOrmAssetBrandRepository } from './infrastructure/persistence/adapters/typeorm-asset-brand.repository';
import { TypeOrmAssetModelRepository } from './infrastructure/persistence/adapters/typeorm-asset-model.repository';
import { TypeOrmAssetRepository } from './infrastructure/persistence/adapters/typeorm-asset.repository';

// Use Cases
import { ManageCategoriesUseCase } from './application/use-cases/manage-categories.use-case';
import { ManageCatalogsUseCase } from './application/use-cases/manage-catalogs.use-case';
import { ManageAssetsUseCase } from './application/use-cases/manage-assets.use-case';
import { ManageSoftwareUseCase } from './application/use-cases/manage-software.use-case';
import { ManageMovementsUseCase } from './application/use-cases/manage-movements.use-case';
import { ManageMaintenanceUseCase } from './application/use-cases/manage-maintenance.use-case';
import { ManageLoansUseCase } from './application/use-cases/manage-loans.use-case';
import { ManageAuditsUseCase } from './application/use-cases/manage-audits.use-case';

// Controllers
import { ItamCategoriesController } from './infrastructure/controllers/itam-categories.controller';
import { ItamCatalogsController } from './infrastructure/controllers/itam-catalogs.controller';
import { ItamAssetsController } from './infrastructure/controllers/itam-assets.controller';
import { ItamSoftwareController } from './infrastructure/controllers/itam-software.controller';
import { ItamMovementsController } from './infrastructure/controllers/itam-movements.controller';
import { ItamMaintenanceController } from './infrastructure/controllers/itam-maintenance.controller';
import { ItamLoansController } from './infrastructure/controllers/itam-loans.controller';
import { ItamAuditsController } from './infrastructure/controllers/itam-audits.controller';

// Seeders
import { ItamSeederService } from './infrastructure/persistence/seeders/itam.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
      PersonEntity,
    ]),
  ],
  controllers: [
    ItamCategoriesController,
    ItamCatalogsController,
    ItamAssetsController,
    ItamSoftwareController,
    ItamMovementsController,
    ItamMaintenanceController,
    ItamLoansController,
    ItamAuditsController,
  ],
  providers: [
    {
      provide: AssetCategoryRepositoryPort,
      useClass: TypeOrmAssetCategoryRepository,
    },
    {
      provide: AssetBrandRepositoryPort,
      useClass: TypeOrmAssetBrandRepository,
    },
    {
      provide: AssetModelRepositoryPort,
      useClass: TypeOrmAssetModelRepository,
    },
    {
      provide: AssetRepositoryPort,
      useClass: TypeOrmAssetRepository,
    },
    ManageCategoriesUseCase,
    ManageCatalogsUseCase,
    ManageAssetsUseCase,
    ManageSoftwareUseCase,
    ManageMovementsUseCase,
    ManageMaintenanceUseCase,
    ManageLoansUseCase,
    ManageAuditsUseCase,
    ItamSeederService,
  ],
  exports: [
    ManageCategoriesUseCase,
    ManageCatalogsUseCase,
    ManageAssetsUseCase,
    ManageSoftwareUseCase,
    ManageMovementsUseCase,
    ManageMaintenanceUseCase,
    ManageLoansUseCase,
    ManageAuditsUseCase,
  ],
})
export class ItamModule {}
