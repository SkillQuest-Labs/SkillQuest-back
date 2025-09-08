import { IsInt, IsISO8601, IsOptional, IsString, Min } from 'class-validator';

export class ListSessionsQueryDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  skill?: string;

  @IsOptional()
  @IsString()
  quest?: string;

  @IsOptional()
  @IsISO8601({ strict: true })
  date?: string; // YYYY-MM-DD

  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 20;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsString()
  cursor?: string;
}
