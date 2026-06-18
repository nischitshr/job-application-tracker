import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // ── Global Validation Pipe ──────────────────────────────────────────────────
  // whitelist: strips properties not in the DTO (security)
  // forbidNonWhitelisted: throws 400 if unknown props are sent
  // transform: auto-converts plain objects to DTO class instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // allows query param type coercion
      },
    }),
  );

  // ── Global Exception Filter ─────────────────────────────────────────────────
  // Catches all unhandled exceptions and returns a consistent error shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── CORS ────────────────────────────────────────────────────────────────────
  // Enable for Next.js frontend consumption
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global API Prefix ───────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  console.log(`🚀 Job Tracker API running on: http://localhost:${port}/api`);
}

bootstrap();
