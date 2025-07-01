import { Module } from '@nestjs/common';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { QuestRepository } from './quest.repository';

@Module({
  imports: [],
  controllers: [QuestController],
  providers: [QuestService, QuestRepository],
})
export class QuestModule {}
