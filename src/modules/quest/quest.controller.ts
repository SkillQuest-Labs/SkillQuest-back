import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Delete,
  ParseArrayPipe,
} from '@nestjs/common';
import { QuestService } from './quest.service';
import { CreateQuestDto, QuestRelationDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';

@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get('health')
  async health() {
    return { status: 'ok' };
  }

  @Post()
  async createQuest(
    @Body(new ParseArrayPipe({ items: CreateQuestDto }))
    questData: CreateQuestDto[],
  ) {
    const createdQuests = await this.questService.createQuest(questData);
    return createdQuests;
  }

  @Post('relations')
  async saveQuestConnection(
    @Body(new ParseArrayPipe({ items: QuestRelationDto }))
    relations: QuestRelationDto[],
  ) {
    const newRelations = await this.questService.saveQuestRelation(relations);
    return newRelations;
  }

  @Get(':skillId')
  async getAllQuestsBySkillId(@Param('skillId') skillId: string) {
    const { quests, questRelations, total } =
      await this.questService.getAllQuestsBySkillId(skillId);
    return { quests, questRelations, total };
  }

  @Put()
  async updateQuest(
    @Body(new ParseArrayPipe({ items: UpdateQuestDto }))
    questData: UpdateQuestDto[],
  ) {
    const updatedQuest = await this.questService.updateQuest(questData);
    return updatedQuest;
  }

  @Delete(':skillId')
  async deleteAllQuestsBySkillId(@Param('skillId') skillId: string) {
    const deletedQuests = await this.questService.deleteAllQuests(skillId);
    return deletedQuests;
  }

  @Post('delete/relations')
  async deleteAllQuests(
    @Body() questRelationData: { questRelationId: string }[],
  ) {
    return await this.questService.deleteQuestRelation(questRelationData);
  }

  @Delete()
  async deleteQuest(@Body() questData: { id: string; questId?: string }[]) {
    return await this.questService.deleteQuest(questData);
  }
}
