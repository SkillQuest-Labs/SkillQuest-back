import { ValidationPipe as BaseValidationPipe } from '@nestjs/common';

/**
 * Global validation pipe using class-validator with sensible defaults.
 */
export class ValidationPipe extends BaseValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  }
}
