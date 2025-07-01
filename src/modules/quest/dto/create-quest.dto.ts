import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Difficulty } from '@prisma/client';

export class CreateQuestDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsNumber()
  degree: number;

  @IsBoolean()
  isUnlocked: boolean;

  @IsBoolean()
  isCompleted: boolean;

  @IsBoolean()
  isSubSkill: boolean;

  @IsDateString()
  completionTime: string;

  @IsNumber()
  positionX: number;

  @IsNumber()
  positionY: number;

  @IsString()
  skillId: string;
}
