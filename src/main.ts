import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { readFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);

  app.useLogger(logger);

  const packageBuffer = readFileSync('./package.json') as any;
  const packageJson = JSON.parse(packageBuffer);
  const version = packageJson.version;

  await app.listen(process.env.PORT ?? 3000);

  logger.log(`Skill Quest API v${version} started`);
}
bootstrap();
