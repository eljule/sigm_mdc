import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../../app.module';
import { ModulesSeederService } from './modules.seeder';
import { Logger } from '@nestjs/common';

async function runSeed() {
  const logger = new Logger('ManualSeedRunner');
  logger.log('Iniciando ejecución manual del seeder...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const seeder = app.get(ModulesSeederService);

  await seeder.seed();
  logger.log('Proceso de seed finalizado.');

  await app.close();
}

runSeed().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('Error al ejecutar el runner del seeder:', message);
  process.exit(1);
});
