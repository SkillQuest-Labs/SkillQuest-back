import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Difficulty, QuestStatus } from '@prisma/client';

export class CreateQuestDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  questId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsNumber()
  @IsOptional()
  degree?: number;

  @IsNumber()
  xp: number;

  @IsEnum(QuestStatus)
  status: QuestStatus;

  @IsBoolean()
  isSubSkill: boolean;

  @IsDateString()
  completionTime: string;

  @IsObject()
  position: { x: number; y: number };

  @IsString()
  skillId: string;
}

export class QuestRelationDto {
  questRelationId: string;
  parentQuestId: string;
  childQuestId: string;
}
