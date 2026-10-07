import 'reflect-metadata';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

const OUTPUTS = [
  resolve(__dirname, '../openapi/openapi.json'),
  // The web app generates its typed client from this copy (pnpm --filter hamroh-web client:generate).
  resolve(__dirname, '../../web/openapi/api.json'),
];

/**
 * Writes the OpenAPI contract from controller/DTO decorators. abortOnError: false lets it run
 * without a reachable database — the contract comes from metadata alone.
 */
async function main(): Promise<void> {
  process.env.DATABASE_URL ??= 'postgresql://unused@localhost:5433/unused';
  const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Hamroh API')
    .setDescription('Verified support programs, eligibility matching and the scripted assistant.')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  for (const output of OUTPUTS) {
    mkdirSync(dirname(output), { recursive: true });
    writeFileSync(output, `${JSON.stringify(document, null, 2)}\n`, 'utf-8');
    console.log(`Wrote ${output}`);
  }
  await app.close();
}

main().catch((error: unknown) => {
  console.error('Failed to export OpenAPI contract', error);
  process.exit(1);
});
