import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Difficulty, SkillStatus } from '@prisma/client';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsEnum(SkillStatus)
  @IsOptional()
  status: SkillStatus;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
