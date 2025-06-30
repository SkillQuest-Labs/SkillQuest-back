import { Injectable } from '@nestjs/common';
import { QuestRepository } from './quest.repository';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import e from 'express';

@Injectable()
export class QuestService {
  constructor(private readonly questRepository: QuestRepository) {}

  async createQuest(questData: CreateQuestDto[]) {
    const createdQuests = await Promise.all(
      questData.map(({ skillId, userId, ...rest }) => {
        return this.questRepository.create({
          ...rest,
          skill: { connect: { id: skillId } }, // to link to the existing skill
          user: { connect: { id: userId } }, // to link to the existing user
        });
      }),
    );
    return createdQuests;
  }

  async getAllQuestsByUserId(userId: string) {
    const { quests, total } =
      await this.questRepository.findAllByUserId(userId);
    return { quests, total };
  }

  async updateQuest(userId: string, questData: UpdateQuestDto[]) {
    for (const quest of questData) {
      if (quest.id) {
        const existing = await this.questRepository.findById(quest.id);
        if (existing) {
          await this.questRepository.update(userId, {
            ...quest,
            skill: { connect: { id: quest.skillId } },
            user: { connect: { id: userId } },
          });
        }
      }
    }
  }

  async deleteAllQuests(userId: string) {
    const deletedQuests = await this.questRepository.deleteAll(userId);
    return deletedQuests;
  }
}
