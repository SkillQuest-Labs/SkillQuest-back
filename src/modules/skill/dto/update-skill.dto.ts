import { PartialType } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';
import { IsInt, Min } from 'class-validator';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {
  @IsInt()
  @Min(0)
  totalXp: number;

  @IsInt()
  @Min(0)
  completedQuests: number;

  @IsInt()
  @Min(0)
  averageQuestXp: number;
}
