import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/database.config';
import { ModulesRegistryModule } from './core/modules-registry/modules-registry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ModulesRegistryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
