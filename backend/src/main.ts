import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // Validate JWT_SECRET before app creation
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET === 'CHANGE_ME_GENERATE_WITH_openssl_rand_hex_32'
  ) {
    console.error(
      'FATAL: JWT_SECRET is not configured. Generate one with: openssl rand -hex 32',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(cookieParser());

  // Enable CORS
  const corsOrigin = configService.get('CORS_ORIGIN') || 'http://localhost:3000';
  if (corsOrigin === '*') {
    console.warn('WARNING: CORS origin is set to wildcard (*). This is insecure in production.');
  }
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 3001;

  await app.listen(port);

  console.log(`Her Backend is running on: http://localhost:${port}/api`);
}

bootstrap();
