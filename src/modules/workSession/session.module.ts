import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import SessionRepository from './session.repository';

@Module({
  imports: [],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository],
})
export class SessionModule {}
