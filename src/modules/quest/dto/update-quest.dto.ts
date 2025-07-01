import { OmitType } from '@nestjs/swagger';
import { CreateQuestDto } from './create-quest.dto';

import { IsOptional, IsString } from 'class-validator';

export class UpdateQuestDto extends OmitType(CreateQuestDto, [
  'skillId',
] as const) {
  @IsString()
  id: string;
}
