import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficeEntity } from './infrastructure/persistence/entities/office.entity';
import { OfficeRepositoryPort } from './domain/ports/office.repository.port';
import { TypeOrmOfficeRepository } from './infrastructure/adapters/typeorm-office.repository';
import { ManageOfficesUseCase } from './application/use-cases/manage-offices.use-case';
import { OfficeController } from './infrastructure/controllers/office.controller';
import { OfficesSeederService } from './infrastructure/persistence/seeders/offices.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([OfficeEntity])],
  controllers: [OfficeController],
  providers: [
    ManageOfficesUseCase,
    {
      provide: OfficeRepositoryPort,
      useClass: TypeOrmOfficeRepository,
    },
    OfficesSeederService,
  ],
  exports: [OfficeRepositoryPort, ManageOfficesUseCase],
})
export class OfficesModule {}
