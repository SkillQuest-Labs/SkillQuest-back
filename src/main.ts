import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { readFileSync } from 'fs';
import { AppConfigService } from './shared/configuration/app-config.service';
import { ValidationPipe } from './shared/pipe/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);

  app.useLogger(logger);

  app.enableCors({ maxAge: 86400 });
  app.use(helmet()); // Use Helmet for security headers

  app.useGlobalPipes(new ValidationPipe());

  // Set global prefix for all routes
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const packageBuffer = readFileSync('./package.json') as any;
  const version = JSON.parse(packageBuffer).version;

  // get port from environment variables or use default
  const configService = app.get<AppConfigService>(AppConfigService);
  const port = normalizePort(configService.port);

  await app.listen(port);
  logger.log(`Skill Quest API v${version} started`);

  const fullUrl = getAppurl(app, port, globalPrefix);
  logger.log(`Listening to ${fullUrl}`);
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

function getAppurl(
  app: INestApplication,
  port: string | number,
  globalPrefix: string,
): string {
  let baseUrl = app.getHttpServer().address().address;
  if (baseUrl === '0.0.0.0' || baseUrl === '::') {
    baseUrl = 'localhost';
  }
  return `http://${baseUrl}:${port}/${globalPrefix}`;
}
