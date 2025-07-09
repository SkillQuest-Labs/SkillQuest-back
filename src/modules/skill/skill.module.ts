import { Module } from '@nestjs/common';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import SkillRepository from './skill.repository';

@Module({
  imports: [],
  controllers: [SkillController],
  providers: [SkillService, SkillRepository],
})
export class SkillModule {}
