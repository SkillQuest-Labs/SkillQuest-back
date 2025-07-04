import { Injectable } from '@nestjs/common';
import { QuestRepository } from './quest.repository';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';

@Injectable()
export class QuestService {
  constructor(private readonly questRepository: QuestRepository) {}

  async createQuest(questData: CreateQuestDto[]) {
    const createdQuests = await Promise.all(
      questData.map(({ skillId, ...rest }) => {
        return this.questRepository.create({
          ...rest,
          skill: { connect: { id: skillId } }, // to link to the existing skill
        });
      }),
    );
    return {
      quests: createdQuests,
      total: createdQuests.length,
    };
  }

  async getAllQuestsBySkillId(skillId: string) {
    const { quests, total } =
      await this.questRepository.findAllBySkillId(skillId);
    return { quests, total };
  }

  async updateQuest(quest: UpdateQuestDto[]) {
    const updatedQuests = await Promise.all(
      quest.map(({ id, ...rest }) => {
        return this.questRepository.update(id, {
          ...rest,
        });
      }),
    );

    return {
      quests: updatedQuests,
      total: updatedQuests.length,
    };
  }

  async deleteAllQuests(skillId: string) {
    const deletedQuests = await this.questRepository.deleteAll(skillId);
    return {
      total: deletedQuests.count,
      message: `All quests for skill "${deletedQuests.skillName}" have been successfully deleted.`,
    };
  }
}
