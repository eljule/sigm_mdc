import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonEntity } from './infrastructure/persistence/entities/person.entity';
import { UserEntity } from '../auth/infrastructure/persistence/entities/user.entity';
import { AssetTypeOrmEntity } from '../../modules/itam/infrastructure/persistence/entities/asset.typeorm.entity';
import { AssetMovementTypeOrmEntity } from '../../modules/itam/infrastructure/persistence/entities/asset-movement.typeorm.entity';
import { PersonRepositoryPort } from './domain/ports/person.repository.port';
import { TypeOrmPersonRepository } from './infrastructure/adapters/typeorm-person.repository';
import { GetPeopleUseCase } from './application/use-cases/get-people.use-case';
import { CreatePersonUseCase } from './application/use-cases/create-person.use-case';
import { UpdatePersonUseCase } from './application/use-cases/update-person.use-case';
import { CeasePersonUseCase } from './application/use-cases/cease-person.use-case';
import { PersonController } from './infrastructure/controllers/person.controller';
import { PeopleSeederService } from './infrastructure/persistence/seeders/people.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonEntity,
      UserEntity,
      AssetTypeOrmEntity,
      AssetMovementTypeOrmEntity,
    ]),
  ],
  controllers: [PersonController],
  providers: [
    GetPeopleUseCase,
    CreatePersonUseCase,
    UpdatePersonUseCase,
    CeasePersonUseCase,
    {
      provide: PersonRepositoryPort,
      useClass: TypeOrmPersonRepository,
    },
    PeopleSeederService,
  ],
  exports: [PersonRepositoryPort, GetPeopleUseCase, UpdatePersonUseCase, CeasePersonUseCase],
})
export class PeopleModule {}
