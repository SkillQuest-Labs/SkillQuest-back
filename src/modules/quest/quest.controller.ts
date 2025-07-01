import { Injectable } from '@nestjs/common';
import { QuestService } from './quest.service';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';

@Injectable()
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  async createQuest(questData: CreateQuestDto[]) {
    const createdQuests = await this.questService.createQuest(questData);
    return createdQuests;
  }

  async getAllQuestsBySkillId(skillId: string) {
    const { quests, total } =
      await this.questService.getAllQuestsBySkillId(skillId);
    return { quests, total };
  }

  async updateQuest(questData: UpdateQuestDto[]) {
    const updatedQuest = await this.questService.updateQuest(questData);
    return updatedQuest;
  }
}
