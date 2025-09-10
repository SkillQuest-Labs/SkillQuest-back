import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListSessionsQueryDto {
  @IsOptional()
  @IsString()
  skill?: string;

  @IsOptional()
  @IsString()
  quest?: string;

  // Format "YYYY-MM-DD"
  @IsOptional()
  @IsString()
  date?: string;

  // Taille de page (par défaut 20)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  // Numéro de page 1-based (par défaut 1)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;
}
