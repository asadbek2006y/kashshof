import 'reflect-metadata';
import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  // Explicit DTOs, not raw bodies: reject unknown fields and coerce to the declared types.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // The API has no pages of its own: someone opening its bare address is sent to the website.
  const appOrigin = process.env.APP_ORIGIN ?? 'http://localhost:3100';
  app.getHttpAdapter().get('/', (_request: unknown, response: { redirect: (status: number, url: string) => void }) =>
    response.redirect(302, appOrigin),
  );

  // The web app proxies /api/v1/* same-origin (apps/web/src/proxy.ts), so no CORS is enabled.
  const port = process.env.PORT ?? 4100;
  await app.listen(port);
  Logger.log(`Hamroh API listening on port ${port}`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  console.error('Fatal error during bootstrap', error);
  process.exit(1);
});
