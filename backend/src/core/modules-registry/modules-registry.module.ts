import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleEntity } from './infrastructure/persistence/entities/module.entity';
import { ModuleRepositoryPort } from './domain/ports/module.repository.port';
import { TypeOrmModuleRepository } from './infrastructure/adapters/typeorm-module.repository';
import { GetActiveModulesUseCase } from './application/use-cases/get-active-modules.use-case';
import { ManageModulesUseCase } from './application/use-cases/manage-modules.use-case';
import { ModuleController } from './infrastructure/controllers/module.controller';
import { ModulesSeederService } from './infrastructure/persistence/seeders/modules.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity])],
  controllers: [ModuleController],
  providers: [
    // Casos de uso en capa Application
    GetActiveModulesUseCase,
    ManageModulesUseCase,
    // Vinculación de Puerto y Adaptador en Arquitectura Hexagonal
    {
      provide: ModuleRepositoryPort,
      useClass: TypeOrmModuleRepository,
    },
    // Servicio de sembrado inicial
    ModulesSeederService,
  ],
  exports: [ModuleRepositoryPort, GetActiveModulesUseCase, ManageModulesUseCase],
})
export class ModulesRegistryModule {}
