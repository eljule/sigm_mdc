import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleEntity } from '../core/modules-registry/infrastructure/persistence/entities/module.entity';

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
      entities: [ModuleEntity],
      synchronize: configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
      logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
    };
  },
};
