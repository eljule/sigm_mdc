import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/persistence/entities/user.entity';
import { RoleEntity } from './infrastructure/persistence/entities/role.entity';
import { PermissionEntity } from './infrastructure/persistence/entities/permission.entity';

import { UserRepositoryPort } from './domain/ports/user.repository.port';
import { RoleRepositoryPort } from './domain/ports/role.repository.port';
import { PermissionRepositoryPort } from './domain/ports/permission.repository.port';

import { TypeOrmUserRepository } from './infrastructure/adapters/typeorm-user.repository';
import { TypeOrmRoleRepository } from './infrastructure/adapters/typeorm-role.repository';
import { TypeOrmPermissionRepository } from './infrastructure/adapters/typeorm-permission.repository';

import { LoginUseCase } from './application/use-cases/login.use-case';
import { ManageUsersUseCase } from './application/use-cases/manage-users.use-case';
import { ManageRolesUseCase } from './application/use-cases/manage-roles.use-case';
import { ManagePermissionsUseCase } from './application/use-cases/manage-permissions.use-case';

import { AuthController } from './infrastructure/controllers/auth.controller';
import { RolesPermissionsController } from './infrastructure/controllers/roles-permissions.controller';

import { UsersSeederService } from './infrastructure/persistence/seeders/users.seeder';
import { RolesAndPermissionsSeederService } from './infrastructure/persistence/seeders/roles-permissions.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, PermissionEntity])],
  controllers: [AuthController, RolesPermissionsController],
  providers: [
    LoginUseCase,
    ManageUsersUseCase,
    ManageRolesUseCase,
    ManagePermissionsUseCase,
    {
      provide: UserRepositoryPort,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: RoleRepositoryPort,
      useClass: TypeOrmRoleRepository,
    },
    {
      provide: PermissionRepositoryPort,
      useClass: TypeOrmPermissionRepository,
    },
    UsersSeederService,
    RolesAndPermissionsSeederService,
  ],
  exports: [
    UserRepositoryPort,
    RoleRepositoryPort,
    PermissionRepositoryPort,
    LoginUseCase,
    ManageUsersUseCase,
    ManageRolesUseCase,
    ManagePermissionsUseCase,
  ],
})
export class AuthModule {}
