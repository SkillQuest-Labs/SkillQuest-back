import { Injectable } from '@nestjs/common';
import { QuestService } from './quest.service';
import { CreateQuestDto } from './dto/create-quest.dto';

@Injectable()
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  async createQuest(questData: CreateQuestDto[]) {
    const createdQuests = await this.questService.createQuest(questData);
    return createdQuests;
  }

  async getAllQuestsByUserId(userId: string) {
    const { quests, total } =
      await this.questService.getAllQuestsByUserId(userId);
    return { quests, total };
  }

  async updateQuest(userId: string, questData: CreateQuestDto) {
    const updatedQuest = await this.questService.updateQuest(userId, questData);
    return updatedQuest;
  }
}
