import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export default class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WorkSessionCreateInput) {
    return this.prisma.workSession.create({
      data,
      include: {
        quests: true,
      },
    });
  }

  async update(sessionId: string, session: Prisma.WorkSessionUpdateInput) {
    return this.prisma.workSession.update({
      where: { id: sessionId },
      data: session,
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.workSession.findMany({
      where: { userId },
      include: {
        quests: {
          include: { quest: true },
        },
        linkedSkill: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.workSession.findUnique({
      where: { id },
      include: {
        quests: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.workSession.delete({
      where: { id },
    });
  }

  async findByFilters(
    filters: { userId: string; skill?: string; quest?: string; date?: string },
    limit: number,
    cursor?: string | null,
  ) {
    const where: Prisma.WorkSessionWhereInput = { userId: filters.userId };

    if (filters.skill?.trim()) {
      where.linkedSkill = {
        is: { title: { contains: filters.skill.trim(), mode: 'insensitive' } },
      };
    }

    if (filters.quest?.trim()) {
      where.quests = {
        some: {
          quest: {
            is: {
              title: { contains: filters.quest.trim(), mode: 'insensitive' },
            },
          },
        },
      };
    }

    if (filters.date) {
      const start = new Date(`${filters.date}T00:00:00.000Z`);
      const end = new Date(`${filters.date}T23:59:59.999Z`);
      where.date = { gte: start, lte: end };
    }

    const take = Math.min(Math.max(limit, 1), 50);

    const baseArgs: Prisma.WorkSessionFindManyArgs = {
      where,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: take + 1,
      include: {
        quests: { include: { quest: true } },
        linkedSkill: { select: { title: true } },
      },
    };

    const args = cursor
      ? { ...baseArgs, skip: 1, cursor: { id: cursor } }
      : baseArgs;

    const rows = await this.prisma.workSession.findMany(args);
    const hasMore = rows.length > take;
    const items = hasMore ? rows.slice(0, take) : rows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, hasMore, nextCursor };
  }
}
