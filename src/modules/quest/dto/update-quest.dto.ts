import { OmitType } from '@nestjs/swagger';
import { CreateQuestDto } from './create-quest.dto';

import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Difficulty } from '@prisma/client';

export class UpdateQuestDto extends OmitType(CreateQuestDto, [
  'skillId',
] as const) {
  @IsString()
  id: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;

  @IsNumber()
  @IsOptional()
  xp?: number;
}
