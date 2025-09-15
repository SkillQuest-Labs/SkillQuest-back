import { IsString, IsArray, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestData {
  @IsString()
  id: string;

  @IsString()
  title: string;
}

export class ValidateSessionDto {
  @IsString()
  sessionId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestData)
  completedQuests: QuestData[];
}
