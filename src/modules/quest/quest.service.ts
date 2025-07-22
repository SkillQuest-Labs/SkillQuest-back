import { Injectable } from '@nestjs/common';
import { QuestRepository } from './quest.repository';
import { CreateQuestDto, QuestRelationDto } from './dto/create-quest.dto';
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

  async saveQuestRelation(relations: QuestRelationDto[]) {
    const newRelations = await Promise.all(
      relations.map(async (questRelationData) => {
        const hasParentQuest = !!questRelationData.parentQuestId;
        const hasParentSkill = !!questRelationData.parentSkillId;

        if (
          (hasParentQuest && hasParentSkill) ||
          (!hasParentQuest && !hasParentSkill)
        ) {
          throw new Error(
            'A QuestRelation must have either a parentQuestId or a parentSkillId, but not both.',
          );
        }

        return this.questRepository.createQuestRelation(questRelationData);
      }),
    );

    return newRelations;
  }

  async getAllQuestsBySkillId(skillId: string) {
    const { quests, questRelations, total } =
      await this.questRepository.findAllBySkillId(skillId);
    return { quests, questRelations, total };
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

  async deleteQuest(quest: { id: string; questId?: string }[]) {
    return await Promise.all(
      quest.map(({ id }) => {
        return this.questRepository.delete(id);
      }),
    );
  }

  async deleteQuestRelation(questRelationData: { questRelationId: string }[]) {
    return await Promise.all(
      questRelationData.map(({ questRelationId }) => {
        return this.questRepository.deleteQuestRelation(questRelationId);
      }),
    );
  }

  async deleteAllQuests(skillId: string) {
    const deletedQuests = await this.questRepository.deleteAll(skillId);
    return {
      total: deletedQuests.count,
      message: `All quests for skill "${deletedQuests.skillName}" have been successfully deleted.`,
    };
  }
}
