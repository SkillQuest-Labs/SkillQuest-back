import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import SessionRepository from './session.repository';
import { XpCalculationService } from '../../shared/services/xp-calculation.service';
import { QuestRepository } from '../quest/quest.repository';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../../database/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [SessionController],
  providers: [
    SessionService, 
    SessionRepository, 
    XpCalculationService, 
    QuestRepository,
    UserRepository,
    PrismaService
  ],
})
export class SessionModule {}
