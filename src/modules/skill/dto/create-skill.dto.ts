import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Difficulty, SkillStatus } from '@prisma/client';

export class CreateSkillDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  skillId: string;

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

  @IsOptional()
  @IsString()
  color?: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
