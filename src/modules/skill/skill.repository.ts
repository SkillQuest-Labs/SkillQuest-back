import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export default class SkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SkillCreateInput) {
    return this.prisma.skill.create({ data });
  }

  async findByUserId(userId: string) {
    const skills = await this.prisma.skill.findMany({
      where: { userId },
      include: {
        _count: {
          select: { quests: true },
        },
      },
    });

    return skills.map(({ _count, ...skill }) => ({
      ...skill,
      totalQuests: _count.quests,
    }));
  }

  async findById(id: string) {
    return this.prisma.skill.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.SkillUpdateInput) {
    return this.prisma.skill.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.skill.delete({
      where: { id },
    });
  }

  async updateSkillStats(skillId: string) {
    const quests = await this.prisma.quest.findMany({
      where: { skillId },
      select: { 
        xp: true, 
        status: true 
      },
    });

    const totalXp = quests.reduce((sum, quest) => sum + (quest.xp || 0), 0);
    const completedQuests = quests.filter(quest => quest.status === 'COMPLETED').length;
    
    return this.prisma.skill.update({
      where: { id: skillId },
      data: {
        totalXp,
        completedQuests,
      },
    });
  }
}
