import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class QuestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.QuestCreateInput) {
    const newQuest = await this.prisma.quest.create({
      data: data,
    });
    return newQuest;
  }

  async findAllBySkillId(skillId: string) {
    const [quests, total] = await this.prisma.$transaction([
      this.prisma.quest.findMany({
        where: { skillId },
      }),
      this.prisma.quest.count({
        where: { skillId },
      }),
    ]);

    return { quests, total };
  }

  async findById(id: string) {
    const quest = await this.prisma.quest.findUnique({
      where: { id },
    });
    return quest;
  }

  async update(questId: string, quest: Prisma.QuestUpdateInput) {
    const updatedQuest = await this.prisma.quest.update({
      where: { id: questId },
      data: quest,
    });
    return updatedQuest;
  }

  async deleteAll(skillId: string) {
    const deletedQuests = await this.prisma.quest.deleteMany({
      where: { skillId },
    });
    return deletedQuests;
  }

  async deleteByFilter(where: Prisma.QuestWhereInput) {
    return this.prisma.quest.deleteMany({ where });
  }
}
