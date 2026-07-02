import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Default Express body-parser cap (100KB) is too low for base64-encoded
  // logos in settings — bump to a value that comfortably fits our 200KB
  // string limit plus JSON overhead.
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ limit: '2mb', extended: true }));

  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Comma-separated list so Vercel preview URLs (e.g. per-branch deployments)
  // can be added without redeploying. In dev we allow anything for convenience.
  const corsOrigin = process.env.FRONTEND_URL?.split(',').map((s) => s.trim());
  app.enableCors({
    origin: corsOrigin && corsOrigin.length > 0 ? corsOrigin : true,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
void bootstrap();
