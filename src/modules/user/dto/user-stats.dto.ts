import { IsNumber } from 'class-validator';

export class UserStatsDto {
  @IsNumber()
  level: number;

  @IsNumber()
  totalXP: number;

  @IsNumber()
  xpTheshold: number;

  @IsNumber()
  xpToNextLevel: number;
}
