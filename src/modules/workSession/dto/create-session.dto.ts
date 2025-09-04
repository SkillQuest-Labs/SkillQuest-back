import {
  IsArray,
  IsDateString,
  IsOptional,
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
  linkedSkillId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  userId: string;

  @IsArray()
  @IsString({ each: true })
  questIds: string[];
}
