// src/modules/clerk/clerk.module.ts
import { Module } from '@nestjs/common';
import { ClerkController } from './clerk.controller';
import { ClerkService } from './clerk.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [ClerkController],
  providers: [ClerkService, PrismaService],
  exports: [ClerkService],
})
export class ClerkModule {}
