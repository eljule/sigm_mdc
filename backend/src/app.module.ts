import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/database.config';
import { ModulesRegistryModule } from './core/modules-registry/modules-registry.module';
import { AuthModule } from './core/auth/auth.module';
import { PeopleModule } from './core/people/people.module';
import { OfficesModule } from './core/offices/offices.module';
import { ItamModule } from './modules/itam/itam.module';
import { HelpdeskModule } from './modules/helpdesk/helpdesk.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ModulesRegistryModule,
    AuthModule,
    PeopleModule,
    OfficesModule,
    ItamModule,
    HelpdeskModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
