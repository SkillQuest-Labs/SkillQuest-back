import {
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  Matches,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6})$/)
  color: string;

  @IsString()
  linkedSkillId?: string;

  @IsDateString()
  date: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  userId: string;

  @IsString()
  questId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  difficultyScore?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  focusLevel?: number;
}
