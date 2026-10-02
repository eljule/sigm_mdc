import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('SIGM-Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: [
      frontendUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://frontend:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validación global estricta
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 SIGM Backend iniciado en el puerto ${port}`);
  logger.log(`📡 Endpoint de módulos activo en: http://localhost:${port}/api/v1/modules`);
}

bootstrap();
