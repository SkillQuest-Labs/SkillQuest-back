import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { QuestService } from './quest.service';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';

@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get('health')
  async health() {
    return { status: 'ok' };
  }

  @Post()
  async createQuest(@Body() questData: CreateQuestDto[]) {
    const createdQuests = await this.questService.createQuest(questData);
    return createdQuests;
  }

  @Get(':skillId')
  async getAllQuestsBySkillId(@Param('skillId') skillId: string) {
    const { quests, total } =
      await this.questService.getAllQuestsBySkillId(skillId);
    return { quests, total };
  }

  @Put()
  async updateQuest(@Body() questData: UpdateQuestDto[]) {
    const updatedQuest = await this.questService.updateQuest(questData);
    return updatedQuest;
  }

  @Delete(':skillId')
  async deleteAllQuestsBySkillId(@Param('skillId') skillId: string) {
    const deletedQuests = await this.questService.deleteAllQuests(skillId);
    return deletedQuests;
  }
}
