import {
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
} from 'class-validator';

export class CreateSessionDto {
  @IsDateString()
  startDate: string;

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
