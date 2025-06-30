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

  async findAllByUserId(userId: string) {
    const [quests, total] = await this.prisma.$transaction([
      this.prisma.quest.findMany({
        where: { userId },
      }),
      this.prisma.quest.count({
        where: { userId },
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

  async update(userId: string, quest: Prisma.QuestUpdateInput) {
    const updatedQuest = await this.prisma.quest.update({
      where: { id: userId },
      data: quest,
    });
    return updatedQuest;
  }

  async deleteAll(userId: string) {
    const deletedQuests = await this.prisma.quest.deleteMany({
      where: { userId },
    });
    return deletedQuests;
  }
}
