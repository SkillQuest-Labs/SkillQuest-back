import { Injectable } from '@nestjs/common';
import { Prisma, QuestStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { QuestRelationDto } from './dto/create-quest.dto';

const AVAILABLE_QUEST_STATUS: QuestStatus[] = [QuestStatus.UNLOCKED, QuestStatus.IN_PROGRESS];

@Injectable()
export class QuestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.QuestCreateInput) {
    const newQuest = await this.prisma.quest.create({
      data: data,
    });
    return newQuest;
  }

  async createQuestRelation(questRelationData: QuestRelationDto) {
    const newRelation = await this.prisma.questRelation.create({
      data: questRelationData,
    });
    return newRelation;
  }

  async findAllBySkillId(skillId: string) {
    const [quests, total] = await this.prisma.$transaction([
      this.prisma.quest.findMany({
        where: { 
          skillId,
          status: {
            in: AVAILABLE_QUEST_STATUS
          }
        },
      }),
      this.prisma.quest.count({
        where: { 
          skillId,
          status: {
            in: AVAILABLE_QUEST_STATUS
          }
        },
      }),
    ]);

    const questRelations = await this.prisma.questRelation.findMany({
      where: {
        OR: [
          { parentQuestId: { in: quests.map((q) => q.id) } },
          { childQuestId: { in: quests.map((q) => q.id) } },
        ],
      },
    });

    return { quests, questRelations, total };
  }

  async findById(id: string) {
    const quest = await this.prisma.quest.findUnique({
      where: { id },
    });
    return quest;
  }

  async findByIds(ids: string[]) {
    const quests = await this.prisma.quest.findMany({
      where: { id: { in: ids } },
      select: { id: true, xp: true, status: true },
    });
    return quests;
  }

  async update(questId: string, quest: Prisma.QuestUpdateInput) {
    return this.prisma.quest.update({
      where: { id: questId },
      data: quest,
    });
  }

  async delete(questId: string) {
    const deletedQuest = await this.prisma.quest.delete({
      where: { id: questId },
    });
    return deletedQuest;
  }

  async deleteAll(skillId: string) {
    const [skill, deletedQuests] = await this.prisma.$transaction([
      this.prisma.skill.findUnique({
        where: { id: skillId },
        select: { title: true },
      }),
      this.prisma.quest.deleteMany({
        where: { skillId },
      }),
    ]);

    return {
      ...deletedQuests,
      skillName: skill?.title || null,
    };
  }

  async deleteQuestRelation(questRelationId: string) {
    return this.prisma.questRelation.delete({
      where: { questRelationId },
    });
  }

  async deleteByFilter(where: Prisma.QuestWhereInput) {
    return this.prisma.quest.deleteMany({ where });
  }

  async updateQuestStatus(questIds: string[]) {
    return this.prisma.quest.updateMany({
      where: {
        id: { in: questIds },
      },
      data: {
        status: 'COMPLETED' as QuestStatus,
        completionTime: new Date(),
      },
    });
  }

  async updateQuestStatusById(questId: string, status: 'IN_PROGRESS' | 'COMPLETED') {
    const updateData: any = {
      status: status as QuestStatus,
    };

    if (status === 'COMPLETED') {
      updateData.completionTime = new Date();
    }

    return this.prisma.quest.update({
      where: { id: questId },
      data: updateData,
    });
  }

  async incrementQuestXp(questXpData: { questId: string; xpGained: number }[]) {
    const updatePromises = questXpData.map(async ({ questId, xpGained }) => {
      const quest = await this.prisma.quest.findUnique({
        where: { id: questId },
        select: { xp: true },
      });

      const newXp = quest?.xp === null ? xpGained : (quest?.xp || 0) + xpGained;

      return this.prisma.quest.update({
        where: { id: questId },
        data: {
          xp: newXp,
        },
      });
    });
    
    return Promise.all(updatePromises);
  }
}
