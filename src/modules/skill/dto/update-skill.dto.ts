import { PartialType } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';
import { IsDate, IsInt, IsOptional, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completionTime?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}
