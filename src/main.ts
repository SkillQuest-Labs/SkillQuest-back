import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { readFileSync } from 'fs';
import { AppConfigService } from './shared/configuration/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);

  app.useLogger(logger);

  app.enableCors({ maxAge: 86400 });
  app.use(helmet()); // Use Helmet for security headers

  const packageBuffer = readFileSync('./package.json') as any;
  const version = JSON.parse(packageBuffer).version;

  // get port from environment variables or use default
  const configService = app.get<AppConfigService>(AppConfigService);
  const port = normalizePort(configService.port);

  await app.listen(port);
  logger.log(`Skill Quest API v${version} started`);
  logger.log(`Listening on port ${port}`);
}
bootstrap();

/**
 * Normalize port or return an error if port is not valid
 * @param val The port to normalize
 */
function normalizePort(val: number | string): number | string {
  const port: number = typeof val === 'string' ? parseInt(val, 10) : val;

  if (Number.isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  throw new Error(`Port "${val}" is invalid.`);
}
