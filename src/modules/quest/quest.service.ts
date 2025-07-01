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
    return createdQuests;
  }

  async getAllQuestsBySkillId(skillId: string) {
    const { quests, total } =
      await this.questRepository.findAllBySkillId(skillId);
    return { quests, total };
  }

  async updateQuest(skillId: string, questData: UpdateQuestDto[]) {
    if (!questData.length) {
      return;
    }

    const { quests: existingQuests } =
      await this.questRepository.findAllBySkillId(skillId);

    const existingIds = new Set(existingQuests.map((q) => q.id));

    const toUpdate = questData.filter((q) => q.id && existingIds.has(q.id)); // filter for quests that exist in the database
    const toCreate = questData.filter((q) => !q.id || !existingIds.has(q.id)); // filter for quests that do not exist in the database

    // update existing quests
    const updatePromises = toUpdate.map(({ id, ...rest }) =>
      this.questRepository.update(id, {
        ...rest,
        skill: { connect: { id: skillId } },
      }),
    );

    // create new quests
    const createPromises = toCreate.map((q) =>
      this.questRepository.create({
        ...q,
        skill: { connect: { id: skillId } },
      }),
    );

    const results = await Promise.all([...updatePromises, ...createPromises]);
    const updatedOrCreatedIds = results.map((q) => q.id);

    await this.questRepository.deleteByFilter({
      skillId,
      id: { notIn: updatedOrCreatedIds },
    });

    return await this.questRepository.findAllBySkillId(skillId);
  }

  async deleteAllQuests(skillId: string) {
    const deletedQuests = await this.questRepository.deleteAll(skillId);
    return deletedQuests;
  }
}
